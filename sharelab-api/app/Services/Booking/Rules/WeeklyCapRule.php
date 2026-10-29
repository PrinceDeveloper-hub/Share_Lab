<?php

namespace App\Services\Booking\Rules;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Resource;
use App\Models\User;
use App\Support\Clock;
use Carbon\CarbonImmutable;

class WeeklyCapRule implements BookingRuleInterface
{
    public function __construct(private readonly Clock $clock) {}

    public function violation(Resource $resource, User $user, CarbonImmutable $start, CarbonImmutable $end, ?int $ignoreBookingId = null): ?array
    {
        $weekStart = $start->startOfWeek(CarbonImmutable::MONDAY)->startOfDay();
        $weekEnd = $weekStart->addWeek();

        $query = Booking::query()
            ->where('resource_id', $resource->id)
            ->where('user_id', $user->id)
            ->whereIn('status', [
                BookingStatus::Pending->value,
                BookingStatus::Waitlisted->value,
                BookingStatus::Approved->value,
                BookingStatus::CheckedIn->value,
                BookingStatus::Returned->value,
            ])
            ->where('start_at', '<', $weekEnd)
            ->where('end_at', '>', $weekStart);

        if ($ignoreBookingId !== null) {
            $query->whereKeyNot($ignoreBookingId);
        }

        $hours = $query->get(['start_at', 'end_at'])->sum(function (Booking $booking) use ($weekStart, $weekEnd): float {
            $bookingStart = CarbonImmutable::parse($booking->start_at)->max($weekStart);
            $bookingEnd = CarbonImmutable::parse($booking->end_at)->min($weekEnd);

            return max(0, $bookingStart->diffInMinutes($bookingEnd) / 60);
        });

        $requested = $start->diffInMinutes($end) / 60;
        $cap = (int) $resource->weekly_cap_hours;

        if (($hours + $requested) > $cap) {
            return [
                'rule' => 'weekly_cap',
                'message' => sprintf(
                    'Weekly cap reached. %.1f of %d hours already booked; this request needs %.1f hours.',
                    $hours,
                    $cap,
                    $requested,
                ),
                'meta' => ['hours_used' => round($hours, 2), 'hours_cap' => $cap, 'requested' => round($requested, 2)],
            ];
        }

        return null;
    }
}
