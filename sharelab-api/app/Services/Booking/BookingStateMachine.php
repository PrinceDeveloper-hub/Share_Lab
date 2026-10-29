<?php

namespace App\Services\Booking;

use App\Enums\BookingStatus;

class BookingStateMachine
{
    /** @var array<string, array<int, string>> */
    private const TRANSITIONS = [
        BookingStatus::Pending->value => ['approved', 'rejected', 'waitlisted', 'cancelled', 'checked_in'],
        BookingStatus::Waitlisted->value => ['pending', 'cancelled', 'rejected'],
        BookingStatus::Approved->value => ['checked_in', 'cancelled', 'returned'],
        BookingStatus::CheckedIn->value => ['returned', 'cancelled'],
        BookingStatus::Rejected->value => [],
        BookingStatus::Cancelled->value => [],
        BookingStatus::Returned->value => [],
    ];

    public function canTransition(BookingStatus|string $from, BookingStatus|string $to): bool
    {
        $fromValue = $from instanceof BookingStatus ? $from->value : $from;
        $toValue = $to instanceof BookingStatus ? $to->value : $to;

        return in_array($toValue, self::TRANSITIONS[$fromValue] ?? [], true);
    }

    public function assert(BookingStatus|string $from, BookingStatus|string $to): void
    {
        if (! $this->canTransition($from, $to)) {
            $fromValue = $from instanceof BookingStatus ? $from->value : $from;
            $toValue = $to instanceof BookingStatus ? $to->value : $to;
            abort(409, "Cannot change a booking from {$fromValue} to {$toValue}.");
        }
    }
}
