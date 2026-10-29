<?php

namespace App\Enums;

/**
 * PHP backed enum for incident statuses.
 */
enum IncidentStatus: string
{
    case Open = 'open';
    case Resolved = 'resolved';

    public function isOpen(): bool
    {
        return $this === self::Open;
    }

    public function isResolved(): bool
    {
        return $this === self::Resolved;
    }
}
