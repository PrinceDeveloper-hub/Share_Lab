<?php

namespace App\Services\Booking\Rules;

use App\Models\Resource;
use App\Models\User;
use Carbon\CarbonImmutable;

class DurationRule implements BookingRuleInterface
{
    public const MIN_MINUTES = 30;

    public function violation(Resource $resource, User $user, CarbonImmutable $start, CarbonImmutable $end, ?int $ignoreBookingId = null): ?array
    {
        $minutes = $start->diffInMinutes($end);

        if ($minutes < self::MIN_MINUTES) {
            return ['rule' => 'duration', 'message' => 'Bookings must be at least 30 minutes.'];
        }

        if ($minutes > ((int) $resource->max_hours_per_booking * 60)) {
            return [
                'rule' => 'duration',
                'message' => "Maximum {$resource->max_hours_per_booking} hours per booking.",
                'meta' => ['max_hours' => (int) $resource->max_hours_per_booking],
            ];
        }

        return null;
    }
}
