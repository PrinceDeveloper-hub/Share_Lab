<?php

namespace App\Services\Booking;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Resource;
use App\Models\User;
use App\Services\Eligibility\EligibilityService;
use App\Support\Clock;
use Carbon\CarbonImmutable;

class PriorityScoreCalculator
{
    public function __construct(private readonly Clock $clock) {}

    /**
     * Lower scores are better. Hours used in the last 30 days are the main
     * factor; the request time breaks ties.
     *
     * @return array{priority_score: float, priority_explanation: string}
     */
    public function calculate(User $user, Resource $resource): array
    {
        $from = $this->clock->now()->subDays(30);
        $bookings = Booking::query()
            ->where('user_id', $user->id)
            ->where('resource_id', $resource->id)
            ->whereIn('status', [
                BookingStatus::Approved->value,
                BookingStatus::CheckedIn->value,
                BookingStatus::Returned->value,
            ])
            ->where('start_at', '>=', $from)
            ->get(['start_at', 'end_at']);

        $hours = $bookings->sum(function (Booking $booking): float {
            return max(0, CarbonImmutable::parse($booking->start_at)->diffInMinutes(CarbonImmutable::parse($booking->end_at)) / 60);
        });

        return [
            'priority_score' => round((float) $hours, 2),
            'priority_explanation' => sprintf(
                'Ranked by recent usage: %.1f hours in the last 30 days. Earlier requests break ties.',
                $hours,
            ),
        ];
    }

    /**
     * @return array{action: string, reason: string}
     */
    public function recommendation(Booking $booking): array
    {
        $resource = $booking->resource;

        if ($booking->status !== BookingStatus::Pending || $resource === null) {
            return ['action' => 'reject', 'reason' => 'This request is not waiting for a decision.'];
        }

        $eligibility = app(EligibilityService::class)->for($booking->user, $resource);
        if (! $eligibility['qualifies']) {
            return ['action' => 'reject', 'reason' => $eligibility['message']];
        }

        $conflict = Booking::query()
            ->where('resource_id', $resource->id)
            ->whereKeyNot($booking->id)
            ->whereIn('status', [BookingStatus::Approved->value, BookingStatus::CheckedIn->value])
            ->where('start_at', '<', $booking->end_at)
            ->where('end_at', '>', $booking->start_at)
            ->exists();

        if ($conflict) {
            return ['action' => 'waitlist', 'reason' => 'Another approved request occupies this slot.'];
        }

        return ['action' => 'approve', 'reason' => 'Eligible, within the weekly cap, and the slot is free.'];
    }
}
