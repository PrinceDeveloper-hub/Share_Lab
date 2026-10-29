<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\Incident;
use App\Models\User;

class IncidentPolicy
{
    public function view(User $user, Incident $incident): bool
    {
        $incident->loadMissing('booking.resource.managers');
        $booking = $incident->booking;

        if ($booking === null) {
            return false;
        }

        return (int) $booking->user_id === (int) $user->id
            || (int) $booking->resource?->owner_id === (int) $user->id
            || ($user->role === Role::Manager && $booking->resource?->managers->contains($user->id) === true);
    }

    public function report(User $user, Incident $incident): bool
    {
        return $this->view($user, $incident);
    }

    public function confirm(User $user, Incident $incident): bool
    {
        $incident->loadMissing('booking.resource.managers');
        $booking = $incident->booking;

        return $booking !== null
            && (
                ($user->role === Role::Owner && (int) $booking->resource?->owner_id === (int) $user->id)
                || ($user->role === Role::Manager && $booking->resource?->managers->contains($user->id) === true)
            );
    }

    public function resolve(User $user, Incident $incident): bool
    {
        return $this->confirm($user, $incident);
    }
}
