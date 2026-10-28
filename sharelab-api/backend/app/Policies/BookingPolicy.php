<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;
use App\Enums\BookingStatus;
use Illuminate\Auth\Access\HandlesAuthorization;

class BookingPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the booking.
     */
    public function view(User $user, Booking $booking): bool
    {
        return $user->role->isAdmin() ||
               $user->id === $booking->user_id ||
               $booking->resource->managers->contains($user->id);
    }

    /**
     * Determine whether the user can create a booking.
     */
    public function create(User $user, Resource $resource): bool
    {
        return $user->role->isUser() || $user->role->isManager() || $user->role->isOwner();
    }

    /**
     * Determine whether the user can decide on a booking.
     */
    public function decide(User $user, Booking $booking): bool
    {
        return $user->role->isAdmin() ||
               $user->id === $booking->resource->owner_id ||
               $booking->resource->managers->contains($user->id);
    }

    /**
     * Determine whether the user can cancel a booking.
     */
    public function cancel(User $user, Booking $booking): bool
    {
        return $user->id === $booking->user_id ||
               $booking->resource->managers->contains($user->id);
    }

    /**
     * Determine whether the user can check in.
     */
    public function checkIn(User $user, Booking $booking): bool
    {
        return $user->id === $booking->user_id && $booking->status === BookingStatus::Approved;
    }

    /**
     * Determine whether the user can return items.
     */
    public function returnItems(User $user, Booking $booking): bool
    {
        return $user->id === $booking->user_id && $booking->status === BookingStatus::CheckedIn;
    }
}