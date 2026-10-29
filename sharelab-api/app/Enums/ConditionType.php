<?php

namespace App\Enums;

/**
 * PHP backed enum for condition report types.
 */
enum ConditionType: string
{
    case CheckIn = 'checkin';
    case Return = 'return';

    public function isCheckIn(): bool
    {
        return $this === self::CheckIn;
    }

    public function isReturn(): bool
    {
        return $this === self::Return;
    }
}
