<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Resource extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'owner_id',
        'name',
        'category',
        'location',
        'description',
        'rules',
        'max_hours_per_booking',
        'weekly_cap_hours',
        'status',
    ];

    protected $casts = [
        'description' => 'string',
        'rules' => 'string',
    ];

    /**
     * Get the owner of the resource.
     */
    public function owner(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Get the managers assigned to this resource.
     */
    public function managers(): HasMany
    {
        return $this->hasMany(ResourceManager::class, 'resource_id');
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