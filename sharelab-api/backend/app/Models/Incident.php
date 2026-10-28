<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Incident extends Model
{
    protected $fillable = [
        'booking_id',
        'reported_by',
        'type',
        'description',
        'status',
        'suggested_by_system',
        'confirmed_by',
        'resolved_by',
        'resolution_note',
    ];

    protected $casts = [
        'type' => 'string',
        'status' => 'string',
        'suggested_by_system' => 'boolean',
        'confirmed_by' => 'integer',
        'resolved_by' => 'integer',
    ];

    /**
     * Get the booking this incident belongs to.
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    /**
     * Get the user who reported this incident.
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    /**
     * Get the user who confirmed this incident.
     */
    public function confirmer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }

    /**
     * Get the user who resolved this incident.
     */
    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}