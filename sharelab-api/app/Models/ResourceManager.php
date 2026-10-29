<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResourceManager extends Model
{
    protected $table = 'resource_managers';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'resource_id',
        'user_id',
    ];

    public function resource(): BelongsTo
    {
        return $this->belongsTo(Resource::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
