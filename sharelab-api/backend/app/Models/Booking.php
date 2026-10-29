<?php

namespace App\Models;

use App\Enums\BookingStatus;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    protected $fillable = [
        'resource_id',
        'user_id',
        'start_at',
        'end_at',
        'purpose',
        'status',
        'decision_reason',
        'decided_by',
        'priority_score',
        'priority_explanation',
        'waitlist_position',
        'confirm_by',
        'is_late',
    ];

    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'status' => BookingStatus::class,
        'priority_score' => 'decimal:2',
        'waitlist_position' => 'integer',
        'confirm_by' => 'datetime',
        'is_late' => 'boolean',
    ];

    /**
     * Get the resource for this booking.
     */
    public function resource(): BelongsTo
    {
        return $this->belongsTo(Resource::class);
    }

    /**
     * Get the user who made this booking.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the check-in condition report for this booking.
     */
    public function checkInReport(): HasMany
    {
        return $this->hasMany(ConditionReport::class)->where('type', 'checkin');
    }

    /**
     * Get the return condition report for this booking.
     */
    public function returnReport(): HasMany
    {
        return $this->hasMany(ConditionReport::class)->where('type', 'return');
    }

    /**
     * Get the incidents for this booking.
     */
    public function incidents(): HasMany
    {
        return $this->hasMany(Incident::class);
    }

    /**
     * Get the audit logs for this booking.
     */
    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class, 'booking_id')->oldest();
    }

    public function conditionReports(): HasMany
    {
        return $this->hasMany(ConditionReport::class);
    }

    public function isOffer(): bool
    {
        return $this->status === BookingStatus::Pending && $this->confirm_by !== null;
    }
}