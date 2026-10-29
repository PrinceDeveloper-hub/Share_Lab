<?php

namespace App\Services\Booking\Rules;

use App\Models\Resource;
use App\Models\User;
use Carbon\CarbonImmutable;

class BookingRuleEngine
{
    /** @param iterable<BookingRuleInterface> $rules */
    public function __construct(private readonly iterable $rules)
    {
    }

    /**
     * @return array<int, array{rule: string, message: string, meta?: array<string, mixed>}>
     */
    public function violations(Resource $resource, User $user, CarbonImmutable $start, CarbonImmutable $end, ?int $ignoreBookingId = null, bool $includeConflict = true): array
    {
        $violations = [];

        foreach ($this->rules as $rule) {
            if (!$includeConflict && $rule instanceof ConflictRule) {
                continue;
            }

            $violation = $rule->violation($resource, $user, $start, $end, $ignoreBookingId);
            if ($violation !== null) {
                $violations[] = $violation;
            }
        }

        return $violations;
    }
}
