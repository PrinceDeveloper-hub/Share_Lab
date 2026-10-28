<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get the bookings for the user.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Get the resources owned by the user.
     */
    public function ownedResources(): HasMany
    {
        return $this->hasMany(Resource::class, 'owner_id');
    }

    /**
     * Get the resource managers assignments for resources owned by this user.
     */
    public function resourceManagerAssignments(): HasMany
    {
        return $this->hasMany(ResourceManager::class, 'user_id');
    }

    /**
     * Get the credentials for the user.
     */
    public function credentials(): HasMany
    {
        return $this->hasMany(UserCredential::class);
    }

    /**
     * Get the incidents reported by the user.
     */
    public function reportedIncidents(): HasMany
    {
        return $this->hasMany(Incident::class, 'reported_by');
    }

    /**
     * Get the notifications for the user.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }
}