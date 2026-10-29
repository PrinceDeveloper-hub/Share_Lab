<?php

namespace App\Services\Booking\Rules;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Resource;
use App\Models\User;
use Carbon\CarbonImmutable;

/**
 * Uses the half-open overlap test: existing.start < new.end AND existing.end > new.start.
 * Touching slots (one ends exactly when the other starts) do not conflict.
 */
class ConflictRule implements BookingRuleInterface
{
    public function violation(Resource $resource, User $user, CarbonImmutable $start, CarbonImmutable $end, ?int $ignoreBookingId = null): ?array
    {
        $query = Booking::query()
            ->where('resource_id', $resource->id)
            ->whereIn('status', [
                BookingStatus::Pending->value,
                BookingStatus::Approved->value,
                BookingStatus::CheckedIn->value,
            ])
            ->where('start_at', '<', $end)
            ->where('end_at', '>', $start)
            ->lockForUpdate();

        if ($ignoreBookingId !== null) {
            $query->whereKeyNot($ignoreBookingId);
        }

        $conflict = $query->first();

        if ($conflict === null) {
            return null;
        }

        return [
            'rule' => 'conflict',
            'message' => 'Slot taken. You are waitlisted.',
            'meta' => ['conflicting_booking_id' => $conflict->id],
        ];
    }
}
