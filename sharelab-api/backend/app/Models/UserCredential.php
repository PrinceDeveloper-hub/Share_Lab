<?php

namespace App\Models;

use App\Enums\CredentialStatus;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UserCredential extends Model
{
    protected $fillable = [
        'user_id',
        'requirement_name',
        'status',
        'file_path',
        'verified_by',
        'review_note',
    ];

    protected $casts = [
        'status' => CredentialStatus::class,
    ];

    /**
     * Get the user this credential belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the requirement this credential is for.
     */
    public function requirement(): BelongsTo
    {
        return $this->belongsTo(ResourceRequirement::class, 'requirement_name');
    }
}