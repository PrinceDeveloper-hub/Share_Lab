<?php

namespace App\Services\Booking;

use App\Enums\BookingStatus;
use App\Enums\Role;
use App\Models\Booking;
use App\Models\Incident;
use App\Models\Resource;
use App\Models\User;
use App\Services\Audit\AuditService;
use App\Services\Booking\Rules\BookingRuleEngine;
use App\Services\Notification\NotificationService;
use App\Support\Clock;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingService
{
    public function __construct(
        private readonly Clock $clock,
        private readonly BookingRuleEngine $rules,
        private readonly PriorityScoreCalculator $priority,
        private readonly BookingStateMachine $stateMachine,
        private readonly WaitlistService $waitlist,
        private readonly AuditService $audit,
        private readonly NotificationService $notifications,
    ) {
    }

    public function paginateForUser(User $user, array $filters): LengthAwarePaginator
    {
        $query = Booking::query()
            ->with(['resource.owner:id,name', 'resource.requirements', 'user:id,name,email,role'])
            ->where('user_id', $user->id);

        $this->applyFilters($query, $filters);

        return $query->latest('start_at')->paginate($this->perPage($filters));
    }

    public function paginateForManager(User $manager, array $filters): LengthAwarePaginator
    {
        $resourceIds = $manager->resourceManagerAssignments()->pluck('resource_id');
        $query = Booking::query()
            ->with(['resource.owner:id,name', 'resource.requirements', 'user:id,name,email,role'])
            ->whereIn('resource_id', $resourceIds);

        $this->applyFilters($query, $filters);

        return $query->latest('created_at')->paginate($this->perPage($filters));
    }

    public function paginateForOwner(User $owner, array $filters): LengthAwarePaginator
    {
        $query = Booking::query()
            ->with(['resource.owner:id,name', 'resource.requirements', 'user:id,name,email,role'])
            ->whereHas('resource', fn ($resource) => $resource->where('owner_id', $owner->id));

        $this->applyFilters($query, $filters);

        return $query->latest('created_at')->paginate($this->perPage($filters));
    }

    public function request(User $user, array $data): Booking
    {
        $resource = Resource::query()->with('requirements')->findOrFail((int) $data['resource_id']);
        abort_unless($resource->status === 'active', 422, 'This resource is not currently available.');

        $start = CarbonImmutable::parse($data['start_at'], 'UTC');
        $end = CarbonImmutable::parse($data['end_at'], 'UTC');

        if ($end->lessThanOrEqualTo($start)) {
            throw ValidationException::withMessages(['end_at' => 'The end time must be after the start time.']);
        }

        $baseViolations = $this->rules->violations($resource, $user, $start, $end, null, false);
        if ($baseViolations !== []) {
            throw ValidationException::withMessages(['booking' => $baseViolations[0]['message']]);
        }

        return DB::transaction(function () use ($user, $resource, $start, $end, $data): Booking {
            // Serialise creation for this resource before checking the slot.
            $resource = Resource::query()->lockForUpdate()->findOrFail($resource->id);

            $violations = $this->rules->violations($resource, $user, $start, $end, null, true);
            $conflict = collect($violations)->firstWhere('rule', 'conflict');
            $otherViolation = collect($violations)->first(fn (array $violation): bool => $violation['rule'] !== 'conflict');

            if ($otherViolation !== null) {
                throw ValidationException::withMessages(['booking' => $otherViolation['message']]);
            }

            $priority = $this->priority->calculate($user, $resource);
            $status = $conflict === null ? BookingStatus::Pending : BookingStatus::Waitlisted;
            $position = null;

            if ($status === BookingStatus::Waitlisted) {
                $position = $this->nextWaitlistPosition($resource->id);
            }

            $booking = Booking::query()->create([
                'resource_id' => $resource->id,
                'user_id' => $user->id,
                'start_at' => $start,
                'end_at' => $end,
                'purpose' => $data['purpose'] ?? null,
                'status' => $status,
                'priority_score' => $priority['priority_score'],
                'priority_explanation' => $priority['priority_explanation'],
                'waitlist_position' => $position,
                'decision_reason' => $status === BookingStatus::Waitlisted
                    ? "Slot taken. You are waitlisted #{$position}."
                    : null,
            ]);

            $reason = $status === BookingStatus::Waitlisted
                ? "Slot taken. You are waitlisted #{$position}."
                : null;

            $this->audit->record(
                $user,
                'booking_requested',
                Booking::class,
                $booking->id,
                $booking->id,
                $reason,
                [
                    'resource_id' => $resource->id,
                    'start_at' => $start->toIso8601String(),
                    'end_at' => $end->toIso8601String(),
                    'status' => $status->value,
                    'purpose' => $booking->purpose,
                ],
            );

            $this->notifications->send(
                $user,
                'booking_requested',
                $status === BookingStatus::Waitlisted
                    ? "Slot taken. You are waitlisted #{$position}."
                    : "Your request for {$resource->name} was submitted.",
                $booking->id,
            );

            $this->notifications->sendToManagers(
                $resource->id,
                'booking_needs_review',
                "{$user->name} requested {$resource->name}.",
                $booking->id,
            );

            return $booking->load(['resource.owner', 'resource.requirements', 'user']);
        });
    }

    public function decide(User $decider, Booking $booking, string $decision, string $reason): Booking
    {
        if (trim($reason) === '') {
            throw ValidationException::withMessages(['reason' => 'A reason is required for every decision.']);
        }

        $newStatus = match ($decision) {
            'approve' => BookingStatus::Approved,
            'reject' => BookingStatus::Rejected,
            'waitlist' => BookingStatus::Waitlisted,
            default => throw ValidationException::withMessages(['decision' => 'Choose approve, reject, or waitlist.']),
        };

        return DB::transaction(function () use ($decider, $booking, $newStatus, $reason, $decision): Booking {
            $booking = Booking::query()->with(['resource.owner', 'resource.managers', 'user'])->lockForUpdate()->findOrFail($booking->id);
            $previousStatus = $booking->status;
            $previousDecider = $booking->decided_by;

            $decidableFrom = $decider->role === Role::Owner
                ? [BookingStatus::Pending, BookingStatus::Waitlisted, BookingStatus::Approved]
                : [BookingStatus::Pending, BookingStatus::Waitlisted];

            if (!in_array($previousStatus, $decidableFrom, true)) {
                throw ValidationException::withMessages([
                    'booking' => 'This request has already reached a final decision.',
                ]);
            }

            if ($newStatus === BookingStatus::Approved && $this->hasBlockingConflict($booking)) {
                abort(409, 'This slot is now occupied by another approved booking.');
            }

            if ($newStatus === BookingStatus::Waitlisted) {
                $position = $this->nextWaitlistPosition((int) $booking->resource_id);
                $booking->waitlist_position = $position;
                $booking->decision_reason = "{$reason} (waitlisted #{$position})";
            } else {
                $booking->waitlist_position = null;
                $booking->decision_reason = $reason;
            }

            $isOwnerOverride = $decider->role === Role::Owner
                && $previousDecider !== null
                && (int) $previousDecider !== (int) $decider->id
                && $booking->resource?->owner_id === $decider->id;

            $booking->forceFill([
                'status' => $newStatus,
                'decided_by' => $decider->id,
                'confirm_by' => null,
            ])->save();

            $action = match ($decision) {
                'approve' => 'booking_approved',
                'reject' => 'booking_rejected',
                'waitlist' => 'booking_waitlisted',
            };
            $meta = [
                'from' => $previousStatus->value,
                'to' => $newStatus->value,
                'owner_override' => $isOwnerOverride,
            ];

            $auditReason = $isOwnerOverride
                ? "Owner override of the previous manager decision. {$reason}"
                : $reason;

            $this->audit->record($decider, $action, Booking::class, $booking->id, $booking->id, $auditReason, $meta);

            $this->notifications->send(
                (int) $booking->user_id,
                $action,
                "Your booking request was {$newStatus->value}. Reason: {$reason}",
                $booking->id,
            );

            return $booking->fresh(['resource.owner', 'resource.requirements', 'user']);
        });
    }

    public function cancel(User $actor, Booking $booking, ?string $reason = null): Booking
    {
        return DB::transaction(function () use ($actor, $booking, $reason): Booking {
            $booking = Booking::query()->with('resource')->lockForUpdate()->findOrFail($booking->id);
            $oldStatus = $booking->status;

            if (!in_array($oldStatus, [
                BookingStatus::Pending,
                BookingStatus::Waitlisted,
                BookingStatus::Approved,
                BookingStatus::CheckedIn,
            ], true)) {
                throw ValidationException::withMessages(['booking' => 'This booking can no longer be cancelled.']);
            }

            $booking->forceFill([
                'status' => BookingStatus::Cancelled,
                'waitlist_position' => null,
                'confirm_by' => null,
            ])->save();

            $this->audit->record(
                $actor,
                'booking_cancelled',
                Booking::class,
                $booking->id,
                $booking->id,
                $reason ?? "Cancelled while {$oldStatus->value}.",
                ['from' => $oldStatus->value],
            );

            $this->notifications->send(
                (int) $booking->user_id,
                'booking_cancelled',
                "Booking #{$booking->id} was cancelled.",
                $booking->id,
            );

            if (in_array($oldStatus, [BookingStatus::Approved, BookingStatus::CheckedIn], true)) {
                $this->waitlist->offerFreedSlot($booking->resource);
            }

            return $booking->fresh(['resource', 'user']);
        });
    }

    public function extend(User $actor, Booking $booking, string $newEndAt): Booking
    {
        $newEnd = CarbonImmutable::parse($newEndAt, 'UTC');

        return DB::transaction(function () use ($actor, $booking, $newEnd): Booking {
            $booking = Booking::query()->with(['resource.requirements', 'user'])->lockForUpdate()->findOrFail($booking->id);

            if (!in_array($booking->status, [BookingStatus::Approved, BookingStatus::CheckedIn], true)) {
                throw ValidationException::withMessages(['booking' => 'Only approved or checked-in bookings can be extended.']);
            }

            if ($newEnd->lessThanOrEqualTo(CarbonImmutable::parse($booking->end_at))) {
                throw ValidationException::withMessages(['end_at' => 'The new end time must be later than the current end time.']);
            }

            $violations = $this->rules->violations(
                $booking->resource,
                $booking->user,
                CarbonImmutable::parse($booking->start_at),
                $newEnd,
                $booking->id,
                true,
            );

            $violation = collect($violations)->first(fn (array $item): bool => $item['rule'] !== 'conflict')
                ?? collect($violations)->firstWhere('rule', 'conflict');

            if ($violation !== null) {
                throw ValidationException::withMessages(['end_at' => $violation['message']]);
            }

            $oldEnd = $booking->end_at;
            $booking->forceFill(['end_at' => $newEnd])->save();

            $this->audit->record(
                $actor,
                'booking_extended',
                Booking::class,
                $booking->id,
                $booking->id,
                'Extended the booked end time.',
                ['from' => CarbonImmutable::parse($oldEnd)->toIso8601String(), 'to' => $newEnd->toIso8601String()],
            );

            $this->notifications->send(
                (int) $booking->user_id,
                'booking_extended',
                "Booking #{$booking->id} was extended.",
                $booking->id,
            );

            return $booking->fresh(['resource', 'user']);
        });
    }

    public function confirmOffer(User $user, Booking $booking): Booking
    {
        if ((int) $booking->user_id !== (int) $user->id) {
            abort(403, 'Only the booking owner can confirm this offer.');
        }

        return DB::transaction(function () use ($user, $booking): Booking {
            $booking = Booking::query()->with(['resource', 'user'])->lockForUpdate()->findOrFail($booking->id);

            if ($booking->status !== BookingStatus::Pending || $booking->confirm_by === null) {
                throw ValidationException::withMessages(['booking' => 'This booking has no active waitlist offer.']);
            }

            if ($booking->confirm_by->isPast()) {
                throw ValidationException::withMessages(['booking' => 'This offer has expired.']);
            }

            if ($this->hasBlockingConflict($booking)) {
                throw ValidationException::withMessages(['booking' => 'The slot is no longer available.']);
            }

            $booking->forceFill([
                'status' => BookingStatus::Approved,
                'confirm_by' => null,
                'decision_reason' => 'Waitlist offer confirmed.',
            ])->save();

            $this->audit->record(
                $user,
                'waitlist_offer_confirmed',
                Booking::class,
                $booking->id,
                $booking->id,
                'Confirmed the waitlist offer.',
            );

            $this->notifications->send(
                $user,
                'waitlist_offer_confirmed',
                "Your waitlist offer for booking #{$booking->id} is confirmed.",
                $booking->id,
            );

            return $booking->fresh(['resource', 'user']);
        });
    }

    public function pendingCountForManager(User $manager): int
    {
        $resourceIds = $manager->resourceManagerAssignments()->pluck('resource_id');

        return Booking::query()
            ->whereIn('resource_id', $resourceIds)
            ->where('status', BookingStatus::Pending->value)
            ->count();
    }

    public function dashboard(User $user): array
    {
        $bookings = Booking::query()->where('user_id', $user->id);

        $weekStart = $this->clock->now()->startOfWeek(CarbonImmutable::MONDAY)->startOfDay();
        $weekEnd = $weekStart->addWeek();

        $weeklyMinutes = (clone $bookings)
            ->whereIn('status', [BookingStatus::Approved->value, BookingStatus::CheckedIn->value, BookingStatus::Returned->value])
            ->where('start_at', '<', $weekEnd)
            ->where('end_at', '>', $weekStart)
            ->get(['start_at', 'end_at'])
            ->sum(function (Booking $booking) use ($weekStart, $weekEnd): float {
                $start = CarbonImmutable::parse($booking->start_at);
                $end = CarbonImmutable::parse($booking->end_at);
                return max(0, $start->max($weekStart)->diffInMinutes($end->min($weekEnd)) / 60);
            });

        $incidentQuery = Incident::query()->where('status', 'open');
        if ($user->role === Role::Manager) {
            $resourceIds = $user->resourceManagerAssignments()->pluck('resource_id');
            $incidentQuery->whereHas('booking', fn ($booking) => $booking->whereIn('resource_id', $resourceIds));
        } elseif ($user->role === Role::Owner) {
            $incidentQuery->whereHas('booking.resource', fn ($resource) => $resource->where('owner_id', $user->id));
        } else {
            $incidentQuery->whereHas('booking', fn ($booking) => $booking->where('user_id', $user->id));
        }

        return [
            'upcoming_bookings' => (clone $bookings)
                ->whereIn('status', [BookingStatus::Pending->value, BookingStatus::Waitlisted->value, BookingStatus::Approved->value, BookingStatus::CheckedIn->value])
                ->where('end_at', '>=', $this->clock->now())
                ->count(),
            'total_bookings' => (clone $bookings)->count(),
            'active_incidents' => $incidentQuery->count(),
            'weekly_hours_used' => round((float) $weeklyMinutes, 2),
        ];
    }

    private function hasBlockingConflict(Booking $booking): bool
    {
        return Booking::query()
            ->where('resource_id', $booking->resource_id)
            ->whereKeyNot($booking->id)
            ->whereIn('status', [BookingStatus::Approved->value, BookingStatus::CheckedIn->value])
            ->where('start_at', '<', $booking->end_at)
            ->where('end_at', '>', $booking->start_at)
            ->exists();
    }

    private function nextWaitlistPosition(int $resourceId): int
    {
        return Booking::query()
            ->where('resource_id', $resourceId)
            ->where('status', BookingStatus::Waitlisted->value)
            ->count() + 1;
    }

    private function applyFilters($query, array $filters): void
    {
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['resource_id'])) {
            $query->where('resource_id', (int) $filters['resource_id']);
        }

        if (!empty($filters['from'])) {
            $query->where('end_at', '>=', $filters['from']);
        }

        if (!empty($filters['to'])) {
            $query->where('start_at', '<=', $filters['to']);
        }
    }

    private function perPage(array $filters): int
    {
        return min(100, max(1, (int) ($filters['per_page'] ?? 15)));
    }
}
