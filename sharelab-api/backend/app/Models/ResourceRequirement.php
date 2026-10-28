<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ResourceRequirement extends Model
{
    protected $fillable = [
        'resource_id',
        'name',
        'requires_verification',
    ];

    /**
     * Get the resource this requirement belongs to.
     */
    public function resource(): BelongsTo
    {
        return $this->belongsTo(Resource::class);
    }

    /**
     * Get the credentials for this requirement.
     */
    public function credentials(): HasMany
    {
        return $this->hasMany(UserCredential::class, 'requirement_name');
    }
}