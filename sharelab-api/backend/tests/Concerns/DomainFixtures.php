<?php

namespace Tests\Concerns;

use App\Enums\BookingStatus;
use App\Enums\Role;
use App\Models\Booking;
use App\Models\Resource;
use App\Models\ResourceManager;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

trait DomainFixtures
{
    protected function makeUser(Role $role = Role::User, array $overrides = []): User
    {
        return User::query()->create(array_merge([
            'name' => ucfirst($role->value).' User',
            'email' => Str::lower($role->value).'-'.Str::random(8).'@sharelab.test',
            'password' => Hash::make('password'),
            'role' => $role,
        ], $overrides));
    }

    protected function makeResource(User $owner, array $overrides = []): Resource
    {
        return Resource::query()->create(array_merge([
            'owner_id' => $owner->id,
            'name' => 'Test Resource '.Str::random(4),
            'category' => 'Test Equipment',
            'location' => 'Lab Test',
            'description' => 'A resource created for an automated test.',
            'rules' => 'Handle with care.',
            'max_hours_per_booking' => 2,
            'weekly_cap_hours' => 20,
            'availability_windows' => [
                ['weekday' => 1, 'start' => '09:00', 'end' => '17:00'],
                ['weekday' => 2, 'start' => '09:00', 'end' => '17:00'],
                ['weekday' => 3, 'start' => '09:00', 'end' => '17:00'],
                ['weekday' => 4, 'start' => '09:00', 'end' => '17:00'],
                ['weekday' => 5, 'start' => '09:00', 'end' => '17:00'],
            ],
            'status' => 'active',
        ], $overrides));
    }

    protected function makeBooking(Resource $resource, User $user, array $overrides = []): Booking
    {
        return Booking::query()->create(array_merge([
            'resource_id' => $resource->id,
            'user_id' => $user->id,
            'start_at' => '2026-03-02 10:00:00',
            'end_at' => '2026-03-02 11:00:00',
            'status' => BookingStatus::Pending,
            'priority_score' => 0,
            'priority_explanation' => 'Test fixture.',
        ], $overrides));
    }

    protected function assignManager(Resource $resource, User $manager): void
    {
        ResourceManager::query()->create([
            'resource_id' => $resource->id,
            'user_id' => $manager->id,
        ]);
    }
}
