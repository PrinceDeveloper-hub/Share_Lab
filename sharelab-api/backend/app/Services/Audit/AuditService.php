<?php

namespace App\Services\Audit;

use App\Models\AuditLog;
use App\Models\User;

/**
 * Audit rows are always written by the service that owns the surrounding
 * transaction. This class deliberately does not open its own transaction.
 */
class AuditService
{
    public function record(
        ?User $actor,
        string $action,
        string $subjectType,
        int|string|null $subjectId = null,
        ?int $bookingId = null,
        ?string $reason = null,
        array $meta = [],
    ): AuditLog {
        return AuditLog::query()->create([
            'actor_id' => $actor?->getKey(),
            'action' => $action,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'booking_id' => $bookingId,
            'reason' => $reason,
            'meta' => $meta,
        ]);
    }
}
