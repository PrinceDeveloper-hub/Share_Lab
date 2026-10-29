<?php

namespace App\Services\Booking;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Resource;
use App\Services\Audit\AuditService;
use App\Services\Booking\Rules\BookingRuleEngine;
use App\Services\Notification\NotificationService;
use App\Support\Clock;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class WaitlistService
{
    public function __construct(
        private readonly Clock $clock,
        private readonly BookingRuleEngine $rules,
        private readonly AuditService $audit,
        private readonly NotificationService $notifications,
    ) {}

    public function offerFreedSlot(Resource $resource): ?Booking
    {
        $candidates = Booking::query()
            ->with(['user', 'resource.requirements'])
            ->where('resource_id', $resource->id)
            ->where('status', BookingStatus::Waitlisted->value)
            ->orderBy('priority_score')
            ->orderBy('created_at')
            ->lockForUpdate()
            ->get();

        foreach ($candidates as $candidate) {
            $violations = $this->rules->violations(
                $resource,
                $candidate->user,
                CarbonImmutable::parse($candidate->start_at),
                CarbonImmutable::parse($candidate->end_at),
                $candidate->id,
                true,
            );

            if ($violations !== []) {
                continue;
            }

            $candidate->forceFill([
                'status' => BookingStatus::Pending,
                'confirm_by' => $this->clock->now()->addHours(24),
                'waitlist_position' => null,
                'decision_reason' => 'A slot opened. Confirm within 24 hours.',
            ])->save();

            $this->audit->record(
                null,
                'waitlist_offered',
                Booking::class,
                $candidate->id,
                $candidate->id,
                'A slot opened. Confirm within 24 hours.',
                ['confirm_by' => $candidate->confirm_by?->toIso8601String()],
            );

            $this->notifications->send(
                (int) $candidate->user_id,
                'waitlist_offer',
                'A slot opened. Confirm within 24 hours.',
                $candidate->id,
            );

            $this->recomputePositions($resource);

            return $candidate->fresh(['resource', 'user']);
        }

        $this->recomputePositions($resource);

        return null;
    }

    public function expireOffers(): int
    {
        $expired = 0;
        $now = $this->clock->now();

        $bookings = Booking::query()
            ->with('resource')
            ->where('status', BookingStatus::Pending->value)
            ->whereNotNull('confirm_by')
            ->where('confirm_by', '<=', $now)
            ->lockForUpdate()
            ->get();

        foreach ($bookings as $booking) {
            DB::transaction(function () use ($booking): void {
                $booking->forceFill([
                    'status' => BookingStatus::Waitlisted,
                    'confirm_by' => null,
                    'decision_reason' => 'The 24-hour confirmation window expired.',
                ])->save();

                $this->recomputePositions($booking->resource);
                $position = $booking->fresh()->waitlist_position;

                $this->audit->record(
                    null,
                    'waitlist_offer_expired',
                    Booking::class,
                    $booking->id,
                    $booking->id,
                    'The 24-hour confirmation window expired.',
                    ['waitlist_position' => $position],
                );

                $this->notifications->send(
                    (int) $booking->user_id,
                    'waitlist_offer_expired',
                    'Your waitlist offer expired. You are back in the queue.',
                    $booking->id,
                );
            });

            $this->offerFreedSlot($booking->resource);
            $expired++;
        }

        return $expired;
    }

    public function recomputePositions(Resource $resource): void
    {
        $waitlisted = Booking::query()
            ->where('resource_id', $resource->id)
            ->where('status', BookingStatus::Waitlisted->value)
            ->orderBy('priority_score')
            ->orderBy('created_at')
            ->get();

        foreach ($waitlisted as $index => $booking) {
            $booking->forceFill(['waitlist_position' => $index + 1])->save();
        }
    }
}
