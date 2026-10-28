<?php

namespace App\Enums;

/**
 * PHP backed enum for credential statuses.
 */
enum CredentialStatus: string
{
    case Pending = 'pending';
    case Verified = 'verified';
    case Rejected = 'rejected';

    public function isVerified(): bool
    {
        return $this === self::Verified;
    }

    public function isPending(): bool
    {
        return $this === self::Pending;
    }

    public function isRejected(): bool
    {
        return $this === self::Rejected;
    }
}