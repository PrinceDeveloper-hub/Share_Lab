<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\ResourceRequirement;
use App\Models\User;
use App\Models\UserCredential;

class CredentialPolicy
{
    public function view(User $user, UserCredential $credential): bool
    {
        return (int) $credential->user_id === (int) $user->id || $this->review($user, $credential);
    }

    public function review(User $user, UserCredential $credential): bool
    {
        if ($user->role === Role::Manager) {
            $resourceIds = $user->resourceManagerAssignments()->pluck('resource_id');

            return ResourceRequirement::query()
                ->whereIn('resource_id', $resourceIds)
                ->where('name', $credential->requirement_name)
                ->exists();
        }

        if ($user->role === Role::Owner) {
            return ResourceRequirement::query()
                ->where('name', $credential->requirement_name)
                ->whereIn('resource_id', \App\Models\Resource::query()->where('owner_id', $user->id)->pluck('id'))
                ->exists();
        }

        return false;
    }
}
