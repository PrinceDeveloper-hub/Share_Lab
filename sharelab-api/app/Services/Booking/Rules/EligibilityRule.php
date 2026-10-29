<?php

namespace App\Services\Booking\Rules;

use App\Models\Resource;
use App\Models\User;
use App\Services\Eligibility\EligibilityService;
use Carbon\CarbonImmutable;

class EligibilityRule implements BookingRuleInterface
{
    public function __construct(private readonly EligibilityService $eligibility) {}

    public function violation(Resource $resource, User $user, CarbonImmutable $start, CarbonImmutable $end, ?int $ignoreBookingId = null): ?array
    {
        $result = $this->eligibility->for($user, $resource);

        return $result['qualifies'] ? null : [
            'rule' => 'eligibility',
            'message' => $result['message'],
            'meta' => ['missing' => $result['missing'], 'checklist' => $result['checklist']],
        ];
    }
}
