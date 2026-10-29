<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Resource extends Model
{
    protected $fillable = [
        'owner_id',
        'name',
        'category',
        'location',
        'description',
        'rules',
        'max_hours_per_booking',
        'weekly_cap_hours',
        'availability_windows',
        'image_path',
        'status',
    ];

    protected $casts = [
        'description' => 'string',
        'rules' => 'string',
        'availability_windows' => 'array',
        'max_hours_per_booking' => 'integer',
        'weekly_cap_hours' => 'integer',
    ];

    /**
     * Get the owner of the resource.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Get the managers assigned to this resource.
     */
    public function managers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'resource_managers');
    }

    /**
     * Get the requirements for this resource.
     */
    public function requirements(): HasMany
    {
        return $this->hasMany(ResourceRequirement::class);
    }

    /**
     * Get the bookings for this resource.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
