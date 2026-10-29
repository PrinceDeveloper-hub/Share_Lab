<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the resource.
     */
    public function view(User $user, User $targetUser): bool
    {
        return $user->role->isAdmin() ||
               $user->id === $targetUser->id ||
               $user->role->isManager() && /* manager can view users they're assigned to */ true;
    }

    /**
     * Determine whether the user can update the role.
     */
    public function updateRole(User $user, User $targetUser): bool
    {
        return $user->role->isAdmin();
    }
}
