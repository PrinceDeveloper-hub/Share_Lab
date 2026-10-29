<?php

namespace App\Services;

use App\Enums\BookingStatus;
use App\Enums\CredentialStatus;
use App\Models\Booking;
use App\Models\Resource;
use App\Models\User;
use App\Models\UserCredential;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BookingService
{
    /**
     * Check user eligibility for a resource.
     * Returns {qualifies, missing, checklist} and a message.
     */
    public static function checkEligibility(User $user, Resource $resource): array
    {
        $missing = [];
        $checklist = [];

        // Check all requirements for the resource
        foreach ($resource->requirements as $requirement) {
            $credential = UserCredential::where('user_id', $user->id)
                ->where('requirement_name', $requirement->name)
                ->first();

            $status = $credential ? $credential->status : CredentialStatus::Pending;
            $checklist[] = [
                'name' => $requirement->name,
                'status' => $status,
            ];

            if ($requirement->requires_verification && ! $credential?->isVerified()) {
                $missing[] = $requirement->name;
            }
        }

        $qualifies = empty($missing);
        $message = $qualifies
            ? 'You are eligible to book this resource.'
            : 'Missing: '.implode(', ', $missing).'.';

        return [
            'qualifies' => $qualifies,
            'missing' => $missing,
            'checklist' => $checklist,
            'message' => $message,
        ];
    }

    /**
     * Check duration and weekly cap constraints.
     * Returns {hours_used, hours_cap, qualifies, message}.
     */
    public static function checkDurationAndCap(Resource $resource, User $user, $startAt, $endAt): array
    {
        $maxHoursPerBooking = $resource->max_hours_per_booking;
        $weeklyCapHours = $resource->weekly_cap_hours;

        // Check max duration per booking
        $durationHours = Carbon::parse($endAt)->diffInHours(Carbon::parse($startAt));

        if ($durationHours > $maxHoursPerBooking) {
            return [
                'hours_used' => 0,
                'hours_cap' => $maxHoursPerBooking,
                'qualifies' => false,
                'message' => "Maximum {$maxHoursPerBooking} hours per booking.",
            ];
        }

        // Calculate the ISO week of the requested start
        $startWeek = Carbon::parse($startAt)->isoWeekNumber();
        $startYear = Carbon::parse($startAt)->year;

        // Sum the user's approved/checked_in/returned hours for that resource in that ISO week
        $hoursUsed = Booking::where('resource_id', $resource->id)
            ->where('user_id', $user->id)
            ->where('status', BookingStatus::Approved)
            ->whereRaw('YEARWEEK(start_at) = ?', [$startYear.'-'.sprintf('%02d', $startWeek)])
            ->where(function ($query) {
                // Only count hours that don't overlap or are completed
                $query->where('end_at', '<=', Carbon::parse($startAt));
            })
            ->sum(function ($booking) {
                return Carbon::parse($booking->end_at)->diffInHours(Carbon::parse($booking->start_at));
            }) ?? 0;

        // Also add any checked_in or returned bookings
        $hoursUsed += Booking::where('resource_id', $resource->id)
            ->where('user_id', $user->id)
            ->whereIn('status', [BookingStatus::CheckedIn, BookingStatus::Returned])
            ->whereRaw('YEARWEEK(start_at) = ?', [$startYear.'-'.sprintf('%02d', $startWeek)])
            ->sum(function ($booking) {
                return Carbon::parse($booking->end_at)->diffInHours(Carbon::parse($booking->start_at));
            }) ?? 0;

        $hoursCap = $weeklyCapHours;
        $overCap = ($hoursUsed + $durationHours) > $hoursCap;

        $message = $overCap
            ? "You have used {$hoursUsed} of {$hoursCap} hours this week."
            : null;

        return [
            'hours_used' => $hoursUsed,
            'hours_cap' => $hoursCap,
            'qualifies' => ! $overCap,
            'message' => $message,
        ];
    }

    /**
     * Check for conflicts with existing bookings.
     * Returns {hasConflict, message}.
     * Uses lockForUpdate to prevent race conditions.
     */
    public static function checkConflict(Resource $resource, $startAt, $endAt): array
    {
        $start = Carbon::parse($startAt);
        $end = Carbon::parse($endAt);

        $conflicting = Booking::where('resource_id', $resource->id)
            ->where('status', BookingStatus::Approved)
            ->where('status', BookingStatus::CheckedIn)
            ->where(function ($query) use ($start, $end) {
                // Overlap test: existing.start_at < new.end_at AND existing.end_at > new.start_at
                $query->where('start_at', '<', $end)
                    ->where('end_at', '>', $start);
            })
            ->lockForUpdate()
            ->first();

        if ($conflicting) {
            // Check if it's just touching (end == start, which does NOT conflict)
            $existingStart = Carbon::parse($conflicting->start_at);
            $existingEnd = Carbon::parse($conflicting->end_at);

            // If the new booking exactly matches an existing one, it's a conflict
            if ($start->eq($existingStart) && $end->eq($existingEnd)) {
                return [
                    'hasConflict' => true,
                    'message' => 'Slot taken. You are waitlisted #',
                ];
            }

            // Touching slots (end == start of existing or start == end of existing) do NOT conflict
            if ($start->eq($existingEnd) || $end->eq($existingStart)) {
                return [
                    'hasConflict' => false,
                    'message' => null,
                ];
            }

            return [
                'hasConflict' => true,
                'message' => 'Slot taken. You are waitlisted #',
            ];
        }

        return [
            'hasConflict' => false,
            'message' => null,
        ];
    }

    /**
     * Calculate priority score for a booking request.
     * Lower score = higher priority. Based on hours used in last 30 days.
     */
    public static function calculatePriorityScore(User $user, Resource $resource): array
    {
        // Hours the user used in the last 30 days for this resource
        $thirtyDaysAgo = now()->subDays(30);

        $hoursUsed30Days = Booking::where('resource_id', $resource->id)
            ->where('user_id', $user->id)
            ->where('status', BookingStatus::Approved)
            ->where('start_at', '>=', $thirtyDaysAgo)
            ->sum(function ($booking) {
                return Carbon::parse($booking->end_at)->diffInHours(Carbon::parse($booking->start_at));
            }) ?? 0;

        // Priority score: lower = higher priority. Use hours used as the main factor.
        // Earlier request time breaks ties.
        $score = $hoursUsed30Days;

        return [
            'priority_score' => $score,
            'priority_explanation' => "Ranked by recent usage ({$hoursUsed30Days} hours in last 30 days), then request time.",
        ];
    }

    /**
     * Get recommendation for a pending booking.
     */
    public static function getRecommendation(Booking $booking): array
    {
        $user = $booking->user;
        $resource = $booking->resource;

        // Check eligibility
        $eligibility = self::checkEligibility($user, $resource);
        if (! $eligibility['qualifies']) {
            return [
                'action' => 'reject',
                'reason' => $eligibility['message'],
            ];
        }

        // Check duration and cap
        $durationCheck = self::checkDurationAndCap($resource, $user, $booking->start_at, $booking->end_at);
        if (! $durationCheck['qualifies']) {
            return [
                'action' => 'reject',
                'reason' => $durationCheck['message'],
            ];
        }

        // Check conflict
        $conflictCheck = self::checkConflict($resource, $booking->start_at, $booking->end_at);
        if ($conflictCheck['hasConflict']) {
            return [
                'action' => 'waitlist',
                'reason' => 'Slot taken. Another request is pending or approved for this time.',
            ];
        }

        return [
            'action' => 'approve',
            'reason' => 'Eligible, under weekly cap, and no time conflict.',
        ];
    }

    /**
     * Decide on a booking (approve, reject, or waitlist).
     * Allowed for admins, resource owners, or assigned managers.
     */
    public static function decide(Booking $booking, $decision, $reason, User $decider): Booking
    {
        DB::transaction(function () use ($booking, $decision, $reason, $decider) {
            // Re-run conflict check on approve
            if ($decision === 'approve') {
                $conflictCheck = self::checkConflict(
                    $booking->resource,
                    $booking->start_at,
                    $booking->end_at
                );

                if ($conflictCheck['hasConflict']) {
                    // Booking now conflicts - cannot approve
                    $booking->status = BookingStatus::Rejected;
                    $booking->decision_reason = 'Conflict detected after decision was made';
                    $booking->decided_by = $decider->id;
                    $booking->save();

                    // Create audit log
                    AuditLog::record(
                        $decider,
                        'booking_rejected',
                        Booking::class,
                        $booking->id,
                        'Conflict detected after decision was made'
                    );

                    // Notify the user
                    Notification::create([
                        'user_id' => $booking->user_id,
                        'type' => 'booking_rejected',
                        'message' => 'Your booking request was rejected due to a scheduling conflict.',
                        'booking_id' => $booking->id,
                    ]);

                    throw new \Exception('Booking cannot be approved due to conflict');
                }
            }

            // Set the decision
            $booking->status = $decision;
            $booking->decision_reason = $reason;
            $booking->decided_by = $decider->id;
            $booking->save();

            // Calculate and store priority score if not already set
            if (! $booking->priority_score) {
                $priority = self::calculatePriorityScore($booking->user, $booking->resource);
                $booking->priority_score = $priority['priority_score'];
                $booking->priority_explanation = $priority['priority_explanation'];
                $booking->save();
            }

            // Create audit log
            AuditLog::record(
                $decider,
                'booking_'.$decision,
                Booking::class,
                $booking->id,
                $reason
            );

            // Notify the user
            $statusText = match ($decision) {
                'approved' => 'approved',
                'rejected' => 'rejected',
                'waitlisted' => 'waitlisted',
                default => $decision,
            };

            Notification::create([
                'user_id' => $booking->user_id,
                'type' => 'booking_'.$decision,
                'message' => "Your booking request has been {$statusText}.",
                'booking_id' => $booking->id,
            ]);
        });

        return $booking;
    }

    /**
     * Cancel a booking.
     * If an approved booking is cancelled, run waitlist promotion.
     */
    public static function cancel(Booking $booking, User $canceler): Booking
    {
        DB::transaction(function () use ($booking, $canceler) {
            // Check authorization
            if ($booking->user_id !== $canceler->id && ! $canceler->role->isAdmin()) {
                throw new \Exception('Not authorized to cancel this booking');
            }

            $oldStatus = $booking->status;
            $booking->status = BookingStatus::Cancelled;
            $booking->save();

            // Create audit log
            AuditLog::record(
                $canceler,
                'booking_cancelled',
                Booking::class,
                $booking->id,
                "Booking cancelled from {$oldStatus}"
            );

            // If the cancelled booking was approved, promote waitlist
            if ($oldStatus === BookingStatus::Approved) {
                self::promoteWaitlist($booking->resource);
            }

            // Notify the user
            Notification::create([
                'user_id' => $booking->user_id,
                'type' => 'booking_cancelled',
                'message' => 'Your booking has been cancelled.',
                'booking_id' => $booking->id,
            ]);
        });

        return $booking;
    }

    /**
     * Promote waitlist - offer the freed slot to the top-ranked waitlisted request.
     */
    public static function promoteWaitlist(Resource $resource)
    {
        // Find waitlisted bookings for this resource, ordered by priority score, then by created_at
        $waitlisted = Booking::where('resource_id', $resource->id)
            ->where('status', BookingStatus::Waitlisted)
            ->orderBy('priority_score', 'asc')
            ->orderBy('created_at', 'asc')
            ->get();

        if ($waitlisted->isEmpty()) {
            return; // No waitlisted requests
        }

        // Try to offer the slot to the top-ranked waitlisted request
        foreach ($waitlisted as $waitlistBooking) {
            // Check if this request fits (duration and cap)
            $capCheck = self::checkDurationAndCap(
                $resource,
                $waitlistBooking->user,
                $waitlistBooking->start_at,
                $waitlistBooking->end_at
            );

            if (! $capCheck['qualifies']) {
                continue; // Skip this request, try the next one
            }

            // Check for conflicts
            $conflictCheck = self::checkConflict(
                $resource,
                $waitlistBooking->start_at,
                $waitlistBooking->end_at
            );

            if ($conflictCheck['hasConflict']) {
                continue; // Skip this request, try the next one
            }

            // Offer the slot - set confirm_by = now + 24h
            $now = now();
            $booking = $waitlistBooking;
            $booking->status = BookingStatus::Pending;
            $booking->confirm_by = $now->copy()->addHours(24);
            $booking->save();

            // Create audit log
            AuditLog::record(
                auth()->user() ?? null,
                'waitlist_offered',
                Booking::class,
                $booking->id,
                'Waitlist promoted - slot offered with 24h confirmation deadline'
            );

            // Notify the user
            Notification::create([
                'user_id' => $booking->user_id,
                'type' => 'waitlist_offer',
                'message' => 'A slot opened. Confirm within 24 hours.',
                'booking_id' => $booking->id,
            ]);

            // Only offer one slot at a time
            break;
        }
    }

    /**
     * Extend a booking.
     */
    public static function extend(Booking $booking, $newEndAt, User $extender): Booking
    {
        DB::transaction(function () use ($booking, $newEndAt, $extender) {
            $resource = $booking->resource;

            // Re-run cap and conflict checks
            $capCheck = self::checkDurationAndCap(
                $resource,
                $booking->user,
                $booking->start_at,
                $newEndAt
            );

            if (! $capCheck['qualifies']) {
                throw new \Exception($capCheck['message'] ?? 'Weekly cap exceeded');
            }

            $conflictCheck = self::checkConflict($resource, $booking->start_at, $newEndAt);

            if ($conflictCheck['hasConflict']) {
                throw new \Exception('New end time conflicts with existing bookings');
            }

            $oldEnd = $booking->end_at;
            $booking->end_at = $newEndAt;
            $booking->save();

            // Calculate new priority score
            $priority = self::calculatePriorityScore($booking->user, $resource);
            $booking->priority_score = $priority['priority_score'];
            $booking->priority_explanation = $priority['priority_explanation'];
            $booking->save();

            // Create audit log with old and new end times
            AuditLog::record(
                $extender,
                'booking_extended',
                Booking::class,
                $booking->id,
                "Extended from {$oldEnd} to {$newEndAt}. Hours used: {$capCheck['hours_used']}, Cap: {$capCheck['hours_cap']}"
            );

            // Notify the user
            Notification::create([
                'user_id' => $booking->user_id,
                'type' => 'booking_extended',
                'message' => "Your booking has been extended to {$newEndAt}.",
                'booking_id' => $booking->id,
            ]);
        });

        return $booking;
    }

    /**
     * Check in for a booking.
     * Only the booking owner, only on approved bookings, within a window around start time.
     */
    public static function checkIn(Booking $booking, User $checkInUser, ConditionReport $report): Booking
    {
        DB::transaction(function () use ($booking, $checkInUser, $report) {
            // Authorization: only the booking owner
            if ($booking->user_id !== $checkInUser->id) {
                throw new \Exception('Only the booking owner can check in');
            }

            // Only approved bookings
            if ($booking->status !== BookingStatus::Approved) {
                throw new \Exception('Only approved bookings can be checked into');
            }

            // Check window: configurable default 30 minutes before to end of slot
            $now = now();
            $start = Carbon::parse($booking->start_at);
            $end = Carbon::parse($booking->end_at);
            $thirtyMinBefore = $start->copy()->subMinutes(30);

            // Must be within the window: 30 minutes before start to end of slot
            if ($now->lt($thirtyMinBefore) || $now->gt($end)) {
                throw new \Exception('Check-in window has passed. Available: 30 minutes before start to end of slot.');
            }

            // Update booking status
            $booking->status = BookingStatus::CheckedIn;
            $booking->save();

            // Create the check-in condition report
            $report->booking_id = $booking->id;
            $report->type = ConditionType::CheckIn;
            $report->condition = $report->condition ?? 'good';
            $report->reported_by = $checkInUser->id;
            $report->save();

            // Create audit log
            AuditLog::record(
                $checkInUser,
                'check_in',
                Booking::class,
                $booking->id,
                'Check-in completed'
            );

            // Notify the user
            Notification::create([
                'user_id' => $checkInUser->id,
                'type' => 'check_in',
                'message' => 'You have checked in for your booking.',
                'booking_id' => $booking->id,
            ]);
        });

        return $booking;
    }

    /**
     * Return items for a booking.
     * Only on checked_in bookings. Requires a condition report.
     * Sets is_late if now > end_at.
     * If return condition is worse than check-in condition, create a damage incident.
     */
    public static function returnItems(Booking $booking, User $returnUser, ConditionReport $report): Booking
    {
        DB::transaction(function () use ($booking, $returnUser, $report) {
            // Only on checked_in bookings
            if ($booking->status !== BookingStatus::CheckedIn) {
                throw new \Exception('Only checked-in bookings can be returned');
            }

            // Authorization: only the booking owner
            if ($booking->user_id !== $returnUser->id) {
                throw new \Exception('Only the booking owner can return items');
            }

            // Set condition report
            $report->booking_id = $booking->id;
            $report->type = ConditionType::Return;
            $report->condition = $report->condition ?? 'good';
            $report->reported_by = $returnUser->id;
            $report->save();

            // Determine if late
            $now = now();
            $end = Carbon::parse($booking->end_at);
            $booking->is_late = $now->gt($end);
            $booking->save();

            // Get the check-in condition report for comparison
            $checkInReport = $booking->checkInReport()->first();

            // If return condition is worse than check-in condition, create a damage incident
            if ($checkInReport) {
                $checkInCondition = $checkInReport->condition;
                $returnCondition = $report->condition;

                // Condition severity order: excellent > good > fair > damaged
                $conditionSeverity = [
                    'excellent' => 4,
                    'good' => 3,
                    'fair' => 2,
                    'damaged' => 1,
                ];

                $checkInSeverity = $conditionSeverity[$checkInCondition] ?? 0;
                $returnSeverity = $conditionSeverity[$returnCondition] ?? 0;

                if ($returnSeverity < $checkInSeverity) {
                    // Create a "damage" incident flagged suggested_by_system
                    $incident = Incident::create([
                        'booking_id' => $booking->id,
                        'reported_by' => $returnUser->id,
                        'type' => 'damage',
                        'description' => "Return condition ({$returnCondition}) is worse than check-in condition ({$checkInCondition})",
                        'status' => IncidentStatus::Open,
                        'suggested_by_system' => true,
                    ]);

                    // Create audit log
                    AuditLog::record(
                        $returnUser,
                        'incident_created',
                        Incident::class,
                        $incident->id,
                        "Damage incident created: return condition worse than check-in. Check-in: {$checkInCondition}, Return: {$returnCondition}",
                        ['check_in_condition' => $checkInCondition, 'return_condition' => $returnCondition]
                    );

                    // Notify a manager to confirm
                    Notification::create([
                        'user_id' => null, // System notification
                        'type' => 'system_incident',
                        'message' => "Damage incident reported for booking {$booking->id}. A manager must confirm.",
                        'booking_id' => $booking->id,
                    ]);
                }
            }

            // Update booking status
            $booking->status = BookingStatus::Returned;
            $booking->save();

            // Create audit log
            AuditLog::record(
                $returnUser,
                'return',
                Booking::class,
                $booking->id,
                'Items returned'
            );

            // Promote waitlist if booking was approved
            // Note: Since this is a return, the slot is now free. Promote waitlist.
            $resource = $booking->resource;
            // Don't promote here - let the scheduled command handle it

            // Notify the user
            Notification::create([
                'user_id' => $returnUser->id,
                'type' => 'return',
                'message' => 'Items returned successfully.',
                'booking_id' => $booking->id,
            ]);
        });

        return $booking;
    }
}
