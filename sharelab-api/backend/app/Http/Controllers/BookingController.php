<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ApiResponses;
use App\Http\Requests\BookingRequest;
use App\Http\Requests\ConditionReportRequest;
use App\Http\Requests\DecisionRequest;
use App\Http\Requests\ExtendBookingRequest;
use App\Http\Requests\IncidentRequest;
use App\Http\Resources\BookingResource;
use App\Http\Resources\IncidentResource;
use App\Http\Resources\TimelineEntryResource;
use App\Models\AuditLog;
use App\Models\Booking;
use App\Models\ConditionReport;
use App\Models\Resource;
use App\Services\Booking\BookingService;
use App\Services\Booking\PriorityScoreCalculator;
use App\Services\Condition\ConditionReportService;
use App\Services\Incident\IncidentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    use ApiResponses;

    public function __construct(
        private readonly BookingService $bookings,
        private readonly ConditionReportService $conditions,
        private readonly IncidentService $incidents,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->bookings->paginateForUser($request->user(), $request->all());

        return $this->paginated($paginator, BookingResource::class, 'Bookings retrieved successfully.', [
            'counts' => $this->bookings->statusCounts($request->user()),
        ]);
    }

    public function managerIndex(Request $request): JsonResponse
    {
        $paginator = $this->bookings->paginateForManager($request->user(), $request->all());
        $calculator = app(PriorityScoreCalculator::class);

        $paginator->getCollection()->each(function (Booking $booking) use ($calculator): void {
            if ($booking->status->value === 'pending') {
                $booking->recommendation = $calculator->recommendation($booking);
            }
        });

        return $this->paginated($paginator, BookingResource::class, 'Request queue retrieved successfully.');
    }

    public function ownerIndex(Request $request): JsonResponse
    {
        $paginator = $this->bookings->paginateForOwner($request->user(), $request->all());

        return $this->paginated($paginator, BookingResource::class, 'Owned resource bookings retrieved successfully.');
    }

    public function store(BookingRequest $request): JsonResponse
    {
        $resource = Resource::query()->findOrFail($request->integer('resource_id'));
        $this->authorize('create', [Booking::class, $resource]);

        $booking = $this->bookings->request($request->user(), $request->validated());

        return $this->resource(new BookingResource($booking), 'Booking request submitted successfully.', 201);
    }

    public function show(Request $request, Booking $booking): JsonResponse
    {
        $this->authorize('view', $booking);
        $booking = $booking->fresh([
            'resource.owner', 'resource.requirements', 'resource.managers', 'user',
            'checkInReport', 'returnReport', 'incidents',
        ]);

        $extra = [];
        if ($request->user()->can('decide', $booking) && $booking->status->value === 'pending') {
            $extra['recommendation'] = app(PriorityScoreCalculator::class)->recommendation($booking);
        }

        return $this->resource(new BookingResource($booking), 'Booking retrieved successfully.', 200, $extra);
    }

    public function decision(DecisionRequest $request, Booking $booking): JsonResponse
    {
        $this->authorize('decide', $booking);

        $booking = $this->bookings->decide(
            $request->user(),
            $booking,
            (string) $request->input('decision'),
            (string) $request->input('reason'),
        );

        return $this->resource(new BookingResource($booking), 'Decision recorded successfully.');
    }

    public function cancel(Request $request, Booking $booking): JsonResponse
    {
        $this->authorize('cancel', $booking);

        $validated = $request->validate(['reason' => ['nullable', 'string', 'max:1000']]);
        $booking = $this->bookings->cancel($request->user(), $booking, $validated['reason'] ?? null);

<<<<<<< HEAD
        $query = $user->bookings()
            ->with(['resource', 'checkInReport.reporter', 'returnReport.reporter']);
=======
        return $this->resource(new BookingResource($booking), 'Booking cancelled successfully.');
    }
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec

    public function extend(ExtendBookingRequest $request, Booking $booking): JsonResponse
    {
        $this->authorize('extend', $booking);

        $booking = $this->bookings->extend($request->user(), $booking, (string) $request->input('end_at'));

        return $this->resource(new BookingResource($booking), 'Booking extended successfully.');
    }

    public function confirm(Request $request, Booking $booking): JsonResponse
    {
        $this->authorize('view', $booking);
        $booking = $this->bookings->confirmOffer($request->user(), $booking);

        return $this->resource(new BookingResource($booking), 'Waitlist offer confirmed.');
    }

    public function checkIn(ConditionReportRequest $request, Booking $booking): JsonResponse
    {
        $this->authorize('checkIn', $booking);

        $data = $request->validated();
        if ($request->hasFile('photo')) {
            $data['file_path'] = $request->file('photo')->store('condition-reports/'.$booking->id, 'local');
        }

        $report = $this->conditions->checkIn($request->user(), $booking, $data);

        return $this->ok([
            'report' => [
                'id' => $report->id,
                'condition' => $report->condition,
                'notes' => $report->notes,
                'at' => $report->created_at?->toIso8601String(),
            ],
            'booking' => (new BookingResource($booking->fresh(['resource', 'user'])))->resolve(),
        ], 'Checked in successfully.');
    }

<<<<<<< HEAD
    /**
     * List booking requests across the resources a manager is assigned to, or
     * every booking for an administrator. Used by the manager decision queue.
     */
    public function queue(Request $request)
    {
        $user = $request->user();

        $query = Booking::query()->with([
            'resource.owner',
            'user',
            'checkInReport.reporter',
            'returnReport.reporter',
        ]);

        if (! $user->role->isAdmin()) {
            $resourceIds = $user->resourceManagerAssignments()->pluck('resource_id');
            $query->whereIn('resource_id', $resourceIds);
        }

        if ($request->filled('status')) {
            $validated = $request->validate([
                'status' => ['required', 'in:pending,waitlisted,approved,rejected,cancelled,checked_in,returned'],
            ]);
            $query->where('status', $validated['status']);
        }

        if ($request->filled('resource_id')) {
            $request->validate(['resource_id' => ['integer']]);
            $query->where('resource_id', $request->integer('resource_id'));
        }

        if ($request->filled('q')) {
            $term = $request->input('q');
            $query->where(function ($inner) use ($term) {
                $inner->where('purpose', 'like', "%{$term}%")
                    ->orWhereHas('resource', fn ($resource) => $resource->where('name', 'like', "%{$term}%"))
                    ->orWhereHas('user', fn ($requester) => $requester->where('name', 'like', "%{$term}%"));
            });
        }

        if ($request->input('sort') === 'priority') {
            $query->orderByRaw('CASE WHEN priority_score IS NULL THEN 1 ELSE 0 END')
                ->orderBy('priority_score')
                ->orderBy('created_at');
        } else {
            $query->latest('start_at');
        }

        $bookings = $query->paginate($request->input('per_page', 20));

        return response()->json([
            'data' => new \App\Http\Resources\BookingResourceCollection($bookings),
            'message' => 'Booking queue retrieved successfully.',
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
=======
    public function returnItems(ConditionReportRequest $request, Booking $booking): JsonResponse
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
    {
        $this->authorize('returnItems', $booking);

        $data = $request->validated();
        if ($request->hasFile('photo')) {
            $data['file_path'] = $request->file('photo')->store('condition-reports/'.$booking->id, 'local');
        }

<<<<<<< HEAD
        $booking->load(['resource', 'user', 'checkInReport.reporter', 'returnReport.reporter']);

        $bookingResource = new \App\Http\Resources\BookingResource($booking);
=======
        $report = $this->conditions->return($request->user(), $booking, $data);
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec

        return $this->ok([
            'report' => [
                'id' => $report->id,
                'condition' => $report->condition,
                'notes' => $report->notes,
                'at' => $report->created_at?->toIso8601String(),
            ],
            'booking' => (new BookingResource($booking->fresh(['resource', 'user'])))->resolve(),
        ], 'Return recorded successfully.');
    }

    public function reportIncident(IncidentRequest $request, Booking $booking): JsonResponse
    {
        $this->authorize('view', $booking);
        $incident = $this->incidents->report($request->user(), $booking, $request->validated());

        return $this->resource(new IncidentResource($incident), 'Incident reported successfully.', 201);
    }

    public function timeline(Request $request, Booking $booking): JsonResponse
    {
        $this->authorize('view', $booking);

<<<<<<< HEAD
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
    public function checkIn(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'condition' => ['required', 'in:excellent,good,fair,damaged'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'checklist' => ['nullable', 'array'],
        ]);

        abort_unless(
            $request->user()->can('checkIn', $booking),
            403,
            'You do not have permission to check in for this booking.'
        );

        try {
            $report = new ConditionReport($validated);
            $booking = BookingService::checkIn($booking, $request->user(), $report);
            $booking->load(['checkInReport.reporter', 'returnReport.reporter']);

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
    public function returnItems(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'condition' => ['required', 'in:excellent,good,fair,damaged'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'checklist' => ['nullable', 'array'],
        ]);

        abort_unless(
            $request->user()->can('returnItems', $booking),
            403,
            'You do not have permission to return this booking.'
        );

        try {
            $report = new ConditionReport($validated);
            $booking = BookingService::returnItems($booking, $request->user(), $report);
            $booking->load(['checkInReport.reporter', 'returnReport.reporter']);

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
=======
        $entries = AuditLog::query()
            ->with('actor:id,name,email,role')
            ->where('booking_id', $booking->id)
            ->oldest()
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
            ->get();

        return $this->ok(
            TimelineEntryResource::collection($entries)->resolve(),
            'Booking timeline retrieved successfully.',
        );
    }

    public function dashboard(Request $request): JsonResponse
    {
        return $this->ok($this->bookings->dashboard($request->user()), 'Dashboard summary retrieved successfully.');
    }
}
