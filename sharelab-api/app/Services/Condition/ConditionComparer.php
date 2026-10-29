<?php

namespace App\Services\Condition;

use Carbon\CarbonImmutable;

/**
 * Compares check-in and return reports. It only suggests discrepancies; it
 * never assigns blame or mutates a report.
 */
class ConditionComparer
{
    private const SEVERITY = [
        'excellent' => 4,
        'good' => 3,
        'fair' => 2,
        'damaged' => 1,
    ];

    /**
     * @return array{suggested: bool, type: string|null, description: string|null}
     */
    public function compare(?string $checkIn, ?string $returned, ?CarbonImmutable $expectedEnd = null, ?CarbonImmutable $returnedAt = null): array
    {
        if ($checkIn !== null && $returned !== null && (self::SEVERITY[$returned] ?? 0) < (self::SEVERITY[$checkIn] ?? 0)) {
            return [
                'suggested' => true,
                'type' => 'damage',
                'description' => "Return condition ({$returned}) is worse than check-in condition ({$checkIn}). Please confirm the discrepancy.",
            ];
        }

        if ($expectedEnd !== null && $returnedAt !== null && $returnedAt->greaterThan($expectedEnd)) {
            return [
                'suggested' => true,
                'type' => 'delay',
                'description' => 'The item was returned after the booked end time. Please confirm whether this was a late return.',
            ];
        }

        return ['suggested' => false, 'type' => null, 'description' => null];
    }
}
