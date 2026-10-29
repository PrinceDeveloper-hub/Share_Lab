<?php

namespace App\Support;

use Carbon\CarbonImmutable;

/**
 * The only source of "now" for domain services. Tests can swap this binding
 * for a frozen clock without touching global Carbon state.
 */
final class Clock
{
    public function now(): CarbonImmutable
    {
        return CarbonImmutable::now('UTC');
    }

    public function today(): CarbonImmutable
    {
        return $this->now()->startOfDay();
    }
}
