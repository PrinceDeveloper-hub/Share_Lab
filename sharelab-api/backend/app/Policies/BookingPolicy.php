<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\Booking;
use App\Models\Resource;
use App\Models\User;

class BookingPolicy
{
    public function view(User $user, Booking $booking): bool
    {
        $booking->loadMissing('resource.managers');

        return (int) $booking->user_id === (int) $user->id
            || (int) $booking->resource?->owner_id === (int) $user->id
            || $booking->resource?->managers->contains($user->id) === true;
    }

    public function create(User $user, Resource $resource): bool
    {
        return in_array($user->role, [Role::User, Role::Manager, Role::Owner], true);
    }

    public function decide(User $user, Booking $booking): bool
    {
        $booking->loadMissing('resource.managers');

        if ($booking->resource === null) {
            return false;
        }

        return ($user->role === Role::Owner && (int) $booking->resource->owner_id === (int) $user->id)
            || ($user->role === Role::Manager && $booking->resource->managers->contains($user->id));
    }

    public function cancel(User $user, Booking $booking): bool
    {
        $booking->loadMissing('resource.managers');

        return (int) $booking->user_id === (int) $user->id
            || ($booking->resource && (int) $booking->resource->owner_id === (int) $user->id)
            || ($user->role === Role::Manager && $booking->resource?->managers->contains($user->id) === true);
    }

    public function checkIn(User $user, Booking $booking): bool
    {
        return (int) $booking->user_id === (int) $user->id;
    }

    public function returnItems(User $user, Booking $booking): bool
    {
        return (int) $booking->user_id === (int) $user->id;
    }

    public function extend(User $user, Booking $booking): bool
    {
        return (int) $booking->user_id === (int) $user->id;
    }
}
