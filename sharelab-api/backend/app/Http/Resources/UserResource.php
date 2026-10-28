<?php

namespace App\Http\Resources;

use App\Enums\Role;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request)
    {
        $role = $this->role;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $role instanceof Role ? $role->value : $role,
        ];
    }
}