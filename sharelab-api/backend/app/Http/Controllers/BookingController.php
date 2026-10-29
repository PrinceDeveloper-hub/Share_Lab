<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Resource;
use App\Models\User;
use App\Enums\BookingStatus;
use App\Services\BookingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\ResourceCreateRequest; // For validation helpers

class BookingController extends Controller
{
    /**
     * Create a new booking request.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'resource_id' => ['required', 'exists:resources,id'],
            'start_at' => ['required', 'datetime'],
            'end_at' => ['required', 'datetime', 'after:start_at'],
            'purpose' => ['nullable', 'string'],
        ]);

        $user = $request->user();
        $resource = Resource::findOrFail($validated['resource_id']);

        // 1. Check eligibility
        $eligibility = BookingService::checkEligibility($user, $resource);
        if (!$eligibility['qualifies']) {
            return response()->json([
                'data' => null,
                'message' => $eligibility['message'],
                'errors' => [],
            ], 422);
        }

        // 2. Check duration and weekly cap
        $durationCheck = BookingService::checkDurationAndCap($resource, $user, $validated['start_at'], $validated['end_at']);
        if (!$durationCheck['qualifies']) {
            return response()->json([
                'data' => null,
                'message' => $durationCheck['message'],
                'errors' => [],
                'hours_used' => $durationCheck['hours_used'],
                'hours_cap' => $durationCheck['hours_cap'],
            ], 422);
        }

        // 3. Check for conflicts
        $conflictCheck = BookingService::checkConflict($resource, $validated['start_at'], $validated['end_at']);

        if ($conflictCheck['hasConflict']) {
            // Create as waitlisted with position
            $waitlisted = Booking::create([
                'resource_id' => $resource->id,
                'user_id' => $user->id,
                'start_at' => $validated['start_at'],
                'end_at' => $validated['end_at'],
                'purpose' => $validated['purpose'],
                'status' => BookingStatus::Waitlisted,
                'waitlist_position' => 1, // Will be recalculated
                'priority_score' => BookingService::calculatePriorityScore($user, $resource)['priority_score'],
                'priority_explanation' => BookingService::calculatePriorityScore($user, $resource)['priority_explanation'],
            ]);

            // Determine the position (how many approved/checked_in bookings are ahead)
            $position = Booking::where('resource_id', $resource->id)
                ->where('status', BookingStatus::Approved)
                ->orWhere('status', BookingStatus::CheckedIn)
                ->count() + 1;

            $waitlisted->waitlist_position = $position;
            $waitlisted->save();

            // Create audit log
            AuditLog::record(
                $user,
                'booking_created',
                Booking::class,
                $waitlisted->id,
                "Booking created as waitlisted #{$position} due to slot conflict"
            );

            // Notify the user
            Notification::create([
                'user_id' => $user->id,
                'type' => 'booking_waitlisted',
                'message' => "Slot taken. You are waitlisted #{$position}.",
                'booking_id' => $waitlisted->id,
            ]);

            return response()->json([
                'data' => new \App\Http\Resources\BookingResource($waitlisted),
                'message' => "Slot taken. You are waitlisted #{$position}.",
            ], 201);
        }

        // No conflict - create as pending for decision
        $priority = BookingService::calculatePriorityScore($user, $resource);

        $booking = Booking::create([
            'resource_id' => $resource->id,
            'user_id' => $user->id,
            'start_at' => $validated['start_at'],
            'end_at' => $validated['end_at'],
            'purpose' => $validated['purpose'],
            'status' => BookingStatus::Pending,
            'priority_score' => $priority['priority_score'],
            'priority_explanation' => $priority['priority_explanation'],
        ]);

        // Create audit log
        AuditLog::record(
            $user,
            'booking_created',
            Booking::class,
            $booking->id,
            "Booking request created and pending decision"
        );

        return response()->json([
            'data' => new \App\Http\Resources\BookingResource($booking),
            'message' => 'Booking request created successfully. Awaiting approval.',
        ], 201);
    }

    /**
     * Show user's bookings.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $status = $request->input('status');

        $query = $user->bookings()
            ->with('resource');

        if ($status) {
            $query->where('status', $status);
        }

        $bookings = $query->latest('start_at')->paginate($request->input('per_page', 10));

        return response()->json([
            'data' => new \App\Http\Resources\BookingResourceCollection($bookings),
            'message' => 'Bookings retrieved successfully.',
            'meta' => [
                'page' => $bookings->currentPage(),
                'per_page' => $bookings->perPage(),
                'total' => $bookings->total(),
                'last_page' => $bookings->lastPage(),
            ],
        ], 200);
    }

    /**
     * Show a specific booking.
     */
    public function show(Booking $booking, Request $request)
    {
        // Check authorization
        $canView = $request->user()->role->isAdmin() ||
                   $request->user()->id === $booking->user_id ||
                   $booking->resource->managers->contains($request->user()->id);

        if (!$canView) {
            return response()->json([
                'data' => null,
                'message' => 'You do not have permission to view this booking.',
                'errors' => [],
            ], 403);
        }

        $bookingResource = new \App\Http\Resources\BookingResource($booking);

        // Add extra data for managers
        if ($request->user()->role->isManager() || $request->user()->id === $booking->resource->owner_id) {
            $bookingResource->additional = [
                'priority_score' => $booking->priority_score,
                'priority_explanation' => $booking->priority_explanation,
                'recommendation' => BookingService::getRecommendation($booking),
            ];
        }

        return response()->json([
            'data' => $bookingResource,
            'message' => 'Booking details retrieved successfully.',
        ], 200);
    }

    /**
     * Decide on a booking (approve, reject, waitlist).
     */
    public function decision(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'decision' => ['required', 'in:approve,reject,waitlist'],
            'reason' => ['required', 'string'],
        ]);

        // Check authorization
        if (!$request->user()->can('decide', $booking)) {
            return response()->json([
                'data' => null,
                'message' => 'You are not authorized to make decisions on this booking.',
                'errors' => [],
            ], 403);
        }

        try {
            $booking = BookingService::decide($booking, $validated['decision'], $validated['reason'], $request->user());

            return response()->json([
                'data' => new \App\Http\Resources\BookingResource($booking),
                'message' => "Booking {$validated['decision']}d successfully.",
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'data' => null,
                'message' => $e->getMessage(),
                'errors' => [],
            ], 422);
        }
    }

    /**
     * Cancel a booking.
     */
    public function cancel(Request $request, Booking $booking)
    {
        // Check authorization
        if (!$request->user()->can('cancel', $booking)) {
            return response()->json([
                'data' => null,
                'message' => 'You are not authorized to cancel this booking.',
                'errors' => [],
            ], 403);
        }

        try {
            $booking = BookingService::cancel($booking, $request->user());

            return response()->json([
                'data' => new \App\Http\Resources\BookingResource($booking),
                'message' => 'Booking cancelled successfully.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'data' => null,
                'message' => $e->getMessage(),
                'errors' => [],
            ], 422);
        }
    }

    /**
     * Extend a booking.
     */
    public function extend(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'new_end_at' => ['required', 'datetime', 'after:start_at'],
        ]);

        try {
            $booking = BookingService::extend($booking, $validated['new_end_at'], $request->user());

            return response()->json([
                'data' => new \App\Http\Resources\BookingResource($booking),
                'message' => 'Booking extended successfully.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'data' => null,
                'message' => $e->getMessage(),
                'errors' => [],
            ], 422);
        }
    }

    /**
     * Confirm a waitlist offer.
     */
    public function confirm(Request $request, Booking $booking)
    {
        DB::transaction(function () use ($booking, $request) {
            // Check that confirm_by has not expired
            if ($booking->confirm_by && now()->gt($booking->confirm_by)) {
                // Offer expired - promote to next in line
                BookingService::promoteWaitlist($booking->resource);

                return response()->json([
                    'data' => new \App\Http\Resources\BookingResource($booking),
                    'message' => 'Confirmation deadline expired. Offer has been passed to the next waitlisted request.',
                ], 200);
            }

            // Re-check conflict first
            $conflictCheck = BookingService::checkConflict(
                $booking->resource,
                $booking->start_at,
                $booking->end_at
            );

            if ($conflictCheck['hasConflict']) {
                return response()->json([
                    'data' => null,
                    'message' => 'Cannot confirm: slot now conflicts with another booking.',
                    'errors' => [],
                ], 409);
            }

            // Approve the booking
            $booking = BookingService::decide($booking, 'approved', 'Confirmed by user', $request->user());

            return response()->json([
                'data' => new \App\Http\Resources\BookingResource($booking),
                'message' => 'Booking confirmed successfully.',
            ], 200);
        });
    }

    /**
     * Check in for a booking.
     */
    public function checkIn(Request $request, Booking $booking, ConditionReport $report)
    {
        try {
            $booking = BookingService::checkIn($booking, $request->user(), $report);

            return response()->json([
                'data' => new \App\Http\Resources\BookingResource($booking),
                'message' => 'Check-in completed successfully.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'data' => null,
                'message' => $e->getMessage(),
                'errors' => [],
            ], 422);
        }
    }

    /**
     * Return items for a booking.
     */
    public function returnItems(Request $request, Booking $booking, ConditionReport $report)
    {
        try {
            $booking = BookingService::returnItems($booking, $request->user(), $report);

            return response()->json([
                'data' => new \App\Http\Resources\BookingResource($booking),
                'message' => 'Items returned successfully.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'data' => null,
                'message' => $e->getMessage(),
                'errors' => [],
            ], 422);
        }
    }

    /**
     * Get timeline for a booking.
     */
    public function timeline(Booking $booking, Request $request)
    {
        // Check authorization: booking user or managers/owners of the resource
        $canViewTimeline = $request->user()->id === $booking->user_id ||
                           $request->user()->role->isAdmin() ||
                           $booking->resource->managers->contains($request->user()->id);

        if (!$canViewTimeline) {
            return response()->json([
                'data' => null,
                'message' => 'You do not have permission to view this booking\'s timeline.',
                'errors' => [],
            ], 403);
        }

        $auditLogs = $booking->auditLogs()
            ->with('actor')
            ->latest('created_at')
            ->get();

        $timeline = $auditLogs->map(function ($log) {
            return [
                'id' => $log->id,
                'action' => $log->action,
                'actor_name' => $log->actor?->name ?? 'System',
                'timestamp' => $log->created_at->toISOString(),
                'reason' => $log->reason,
                'meta' => $log->meta,
            ];
        });

        return response()->json([
            'data' => $timeline,
            'message' => 'Timeline retrieved successfully.',
        ], 200);
    }
}