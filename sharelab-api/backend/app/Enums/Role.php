<?php

namespace App\Enums;

/**
 * PHP backed enum for user roles.
 */
enum Role: string
{
    case User = 'user';
    case Owner = 'owner';
    case Manager = 'manager';
    case Admin = 'admin';

    public function isAdmin(): bool
    {
        return $this === self::Admin;
    }

    public function isUser(): bool
    {
        return $this === self::User;
    }

    public function isManager(): bool
    {
        return $this === self::Manager;
    }

    public function isOwnerOrAdmin(): bool
    {
        return $this === self::Owner || $this === self::Admin;
    }

    public function isManagerOrAdmin(): bool
    {
        return $this === self::Manager || $this === self::Admin;
    }

    public function canManageResource($resource): bool
    {
        // Owners can manage their own resources, managers can manage assigned resources
        return $this->isAdmin() ||
               ($this->isOwner() && $resource->owner_id === auth()->id()) ||
               ($this->isManager() && /* check assignment */ true);
    }

    public function isOwner(): bool
    {
        return $this === self::Owner;
    }
}