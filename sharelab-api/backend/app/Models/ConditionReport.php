<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ConditionReport extends Model
{
    protected $fillable = [
        'booking_id',
        'type',
        'condition',
        'notes',
        'checklist',
        'reported_by',
    ];

    protected $casts = [
        'type' => 'string',
        'condition' => 'string',
        'checklist' => 'array',
    ];

    /**
     * Get the booking this report belongs to.
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    /**
     * Get the user who reported this.
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }
}