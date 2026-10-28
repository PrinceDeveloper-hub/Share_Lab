<?php

namespace App\Policies;

use App\Models\Resource;
use App\Models\User;
use App\Enums\Role;
use Illuminate\Auth\Access\HandlesAuthorization;

class ResourcePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the resource.
     */
    public function view(User $user, Resource $resource): bool
    {
        return $user->role->isAdmin() ||
               $user->id === $resource->owner_id ||
               $resource->managers->contains($user->id);
    }

    /**
     * Determine whether the user can create a resource.
     */
    public function create(User $user): bool
    {
        return $user->role->isOwner() || $user->role->isManager() || $user->role->isAdmin();
    }

    /**
     * Determine whether the user can update the resource.
     */
    public function update(User $user, Resource $resource): bool
    {
        return $user->id === $resource->owner_id || $user->role->isAdmin();
    }

    /**
     * Determine whether the user can delete the resource.
     */
    public function delete(User $user, Resource $resource): bool
    {
        return $user->id === $resource->owner_id || $user->role->isAdmin();
    }
}