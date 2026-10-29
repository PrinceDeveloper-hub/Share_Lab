<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    protected $fillable = [
        'actor_id',
        'action',
        'subject_type',
        'subject_id',
        'booking_id',
        'reason',
        'meta',
        'created_at',
    ];

    protected $casts = [
        'actor_id' => 'integer',
        'booking_id' => 'integer',
        'meta' => 'array',
    ];

    /**
     * Get the actor who performed this action.
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    /**
     * Get the booking associated with this audit entry.
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    /**
     * Boot the model to prevent updates and deletes.
     */
    protected static function booted()
    {
        static::deleting(function ($model) {
            throw new \Exception('AuditLog rows cannot be deleted.');
        });

        static::updating(function ($model) {
            throw new \Exception('AuditLog rows cannot be updated.');
        });
    }

    /**
     * Record a new audit entry.
     */
    public static function record($actor, $action, $subjectType, $subjectId, $bookingId = null, $reason = null, $meta = [])
    {
        return self::create([
            'actor_id' => $actor?->id,
            'action' => $action,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'booking_id' => $bookingId,
            'reason' => $reason,
            'meta' => $meta,
        ]);
    }
}