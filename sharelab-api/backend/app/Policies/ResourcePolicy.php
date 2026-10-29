<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\Resource;
use App\Models\User;

class ResourcePolicy
{
    public function view(User $user, Resource $resource): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->role === Role::Owner;
    }

    public function update(User $user, Resource $resource): bool
    {
        return $user->role === Role::Owner && (int) $resource->owner_id === (int) $user->id;
    }

    public function delete(User $user, Resource $resource): bool
    {
        return $this->update($user, $resource);
    }

    public function manageManagers(User $user, Resource $resource): bool
    {
        return $this->update($user, $resource);
    }
}
