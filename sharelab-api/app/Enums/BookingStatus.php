<?php

namespace App\Enums;

/**
 * PHP backed enum for booking statuses.
 */
enum BookingStatus: string
{
    case Pending = 'pending';
    case Waitlisted = 'waitlisted';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Cancelled = 'cancelled';
    case CheckedIn = 'checked_in';
    case Returned = 'returned';

    public function isTerminal(): bool
    {
        return $this === self::Returned || $this === self::Cancelled;
    }

    public function isApprovedOrActive(): bool
    {
        return $this === self::Approved || $this === self::CheckedIn || $this === self::Returned;
    }

    public function isWaitlisted(): bool
    {
        return $this === self::Waitlisted;
    }

    public function isCancelable(): bool
    {
        return $this === self::Approved || $this === self::CheckedIn;
    }
}
