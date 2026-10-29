<?php

namespace App\Services\Booking\Rules;

use App\Models\Resource;
use App\Models\User;
use Carbon\CarbonImmutable;

interface BookingRuleInterface
{
    /**
     * @return array{rule: string, message: string, meta?: array<string, mixed>}|null
     */
    public function violation(Resource $resource, User $user, CarbonImmutable $start, CarbonImmutable $end, ?int $ignoreBookingId = null): ?array;
}
