<?php

namespace Tests\Feature;

use App\Enums\BookingStatus;
use App\Enums\Role;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\DomainFixtures;
use Tests\TestCase;

class ResourceFeaturesTest extends TestCase
{
    use DomainFixtures;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        CarbonImmutable::setTestNow('2026-03-02 09:00:00');
    }

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();
        parent::tearDown();
    }

    public function test_public_catalogue_supports_search_filter_sort_and_pagination(): void
    {
        $owner = $this->makeUser(Role::Owner);
        $this->makeResource($owner, ['name' => 'Laser Cutter', 'category' => 'Fabrication']);
        $this->makeResource($owner, ['name' => 'Camera Kit', 'category' => 'Media']);

        $this->getJson('/api/resources?q=Laser&category=Fabrication&sort=name&direction=asc&per_page=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Laser Cutter')
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('meta.per_page', 1);
    }

    public function test_owner_can_create_a_resource_with_requirements(): void
    {
        $owner = $this->makeUser(Role::Owner);

        $this->actingAs($owner)
            ->postJson('/api/resources', [
                'name' => 'Training Robot',
                'category' => 'Robotics',
                'location' => 'Lab D',
                'description' => 'A small robot for training.',
                'rules' => 'Safety glasses required.',
                'max_hours_per_booking' => 2,
                'weekly_cap_hours' => 6,
                'availability_windows' => [
                    ['weekday' => 1, 'start' => '09:00', 'end' => '17:00'],
                ],
                'requirements' => [
                    ['name' => 'Robotics Safety', 'requires_verification' => true],
                ],
            ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Training Robot')
            ->assertJsonPath('data.requirements.0.name', 'Robotics Safety');

        $this->assertDatabaseHas('resources', ['name' => 'Training Robot', 'owner_id' => $owner->id]);
        $this->assertDatabaseHas('audit_logs', ['action' => 'resource_created']);
    }

    public function test_manager_and_other_owners_cannot_create_or_edit_resources(): void
    {
        $owner = $this->makeUser(Role::Owner);
        $otherOwner = $this->makeUser(Role::Owner);
        $manager = $this->makeUser(Role::Manager);
        $resource = $this->makeResource($owner);
        $this->assignManager($resource, $manager);

        $payload = [
            'name' => 'Nope',
            'category' => 'Test',
            'location' => 'Lab',
            'max_hours_per_booking' => 2,
            'weekly_cap_hours' => 6,
        ];

        $this->actingAs($manager)->postJson('/api/resources', $payload)->assertStatus(403);
        $this->actingAs($manager)->patchJson("/api/resources/{$resource->id}", ['name' => 'Nope'])->assertStatus(403);
        $this->actingAs($otherOwner)->patchJson("/api/resources/{$resource->id}", ['name' => 'Nope'])->assertStatus(403);

        $this->actingAs($owner)
            ->patchJson("/api/resources/{$resource->id}", ['name' => 'Renamed Resource'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Renamed Resource');
    }

    public function test_owner_can_assign_and_remove_a_manager_and_the_change_is_audited(): void
    {
        $owner = $this->makeUser(Role::Owner);
        $manager = $this->makeUser(Role::Manager);
        $user = $this->makeUser(Role::User);
        $resource = $this->makeResource($owner);

        $this->actingAs($owner)
            ->postJson("/api/owner/resources/{$resource->id}/managers", ['email' => $manager->email])
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->assertDatabaseHas('resource_managers', [
            'resource_id' => $resource->id,
            'user_id' => $manager->id,
        ]);
        $this->assertDatabaseHas('audit_logs', ['action' => 'manager_assigned']);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $manager->id,
            'type' => 'manager_assigned',
        ]);

        $this->actingAs($owner)
            ->postJson("/api/owner/resources/{$resource->id}/managers", ['email' => $user->email])
            ->assertStatus(422);

        $this->actingAs($owner)
            ->deleteJson("/api/owner/resources/{$resource->id}/managers/{$manager->id}")
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->assertDatabaseMissing('resource_managers', [
            'resource_id' => $resource->id,
            'user_id' => $manager->id,
        ]);
    }

    public function test_availability_marks_booked_slots_and_leaves_touching_slots_free(): void
    {
        $owner = $this->makeUser(Role::Owner);
        $user = $this->makeUser(Role::User);
        $resource = $this->makeResource($owner);

        $this->makeBooking($resource, $user, [
            'start_at' => '2026-03-02 10:00:00',
            'end_at' => '2026-03-02 11:00:00',
            'status' => BookingStatus::Approved,
        ]);

        $response = $this->getJson("/api/resources/{$resource->id}/availability?date=2026-03-02")
            ->assertOk();

        $slots = collect($response->json('data.slots'));
        $ten = $slots->firstWhere('start_at', '2026-03-02T10:00:00+00:00');
        $eleven = $slots->firstWhere('start_at', '2026-03-02T11:00:00+00:00');

        $this->assertFalse($ten['available']);
        $this->assertTrue($eleven['available']);
        $this->assertNotNull($ten['reason']);
    }

    public function test_owner_empty_state_is_scoped_to_owned_resources(): void
    {
        $owner = $this->makeUser(Role::Owner);
        $otherOwner = $this->makeUser(Role::Owner);
        $this->makeResource($owner, ['name' => 'Mine']);
        $this->makeResource($otherOwner, ['name' => 'Not Mine']);

        $this->actingAs($owner)
            ->getJson('/api/owner/resources')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Mine')
            ->assertJsonPath('meta.total', 1);
    }
}
