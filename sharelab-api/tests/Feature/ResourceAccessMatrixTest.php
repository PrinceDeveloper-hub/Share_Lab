<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\Resource;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ResourceAccessMatrixTest extends TestCase
{
    use RefreshDatabase;

    private Resource $resource;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
        $this->resource = Resource::query()->where('name', '3D Printer')->firstOrFail();
    }

    public function test_guests_can_read_the_catalogue_detail_and_availability(): void
    {
        $this->getJson('/api/resources')->assertOk();
        $this->getJson("/api/resources/{$this->resource->id}")->assertOk();
        $this->getJson("/api/resources/{$this->resource->id}/availability?date=".now()->toDateString())
            ->assertOk();
    }

    public function test_every_role_can_read_the_catalogue(): void
    {
        foreach (['user1@sharelab.test', 'owner@sharelab.test', 'manager@sharelab.test', 'admin@sharelab.test'] as $email) {
            $user = User::query()->where('email', $email)->firstOrFail();

            $this->actingAs($user)->getJson('/api/resources')->assertOk();
            $this->actingAs($user)->getJson("/api/resources/{$this->resource->id}")->assertOk();
            $this->actingAs($user)
                ->getJson("/api/resources/{$this->resource->id}/availability?date=".now()->toDateString())
                ->assertOk();
        }
    }

    public function test_guests_receive_no_contact_details_and_no_eligibility(): void
    {
        $response = $this->getJson("/api/resources/{$this->resource->id}")->assertOk();

        $response->assertJsonPath('data.owner.name', 'Elena Ortiz');
        $this->assertArrayNotHasKey('email', $response->json('data.owner'));
        $this->assertArrayNotHasKey('email', $response->json('data.managers.0'));
        $this->assertNull($response->json('data.eligibility'));
    }

    public function test_staff_roles_receive_contact_details_but_students_do_not(): void
    {
        $manager = User::query()->where('email', 'manager@sharelab.test')->firstOrFail();
        $student = User::query()->where('email', 'user1@sharelab.test')->firstOrFail();

        $this->actingAs($manager)
            ->getJson("/api/resources/{$this->resource->id}")
            ->assertOk()
            ->assertJsonPath('data.owner.email', 'owner@sharelab.test');

        $studentResponse = $this->actingAs($student)->getJson("/api/resources/{$this->resource->id}")->assertOk();
        $this->assertArrayNotHasKey('email', $studentResponse->json('data.owner'));
    }

    public function test_guest_only_actions_require_authentication(): void
    {
        $this->getJson("/api/resources/{$this->resource->id}/eligibility")->assertStatus(401);
        $this->postJson('/api/bookings', [])->assertStatus(401);
        $this->getJson('/api/credentials')->assertStatus(401);
        $this->getJson('/api/notifications')->assertStatus(401);
    }

    public function test_only_owner_can_create_a_resource(): void
    {
        $payload = [
            'name' => 'New Lathe',
            'category' => 'Fabrication',
            'location' => 'Lab D',
            'max_hours_per_booking' => 2,
            'weekly_cap_hours' => 6,
        ];

        $this->postJson('/api/resources', $payload)->assertStatus(401);

        foreach (['user1@sharelab.test', 'manager@sharelab.test', 'admin@sharelab.test'] as $email) {
            $user = User::query()->where('email', $email)->firstOrFail();
            $this->actingAs($user)->postJson('/api/resources', $payload)->assertStatus(403);
        }

        $owner = User::query()->where('email', 'owner@sharelab.test')->firstOrFail();
        $this->actingAs($owner)->postJson('/api/resources', $payload)->assertStatus(201);

        $this->assertDatabaseHas('resources', ['name' => 'New Lathe']);
    }

    public function test_missing_resource_returns_a_safe_404_payload(): void
    {
        $response = $this->getJson('/api/resources/999999')->assertStatus(404);

        $this->assertStringNotContainsString('App\\Models', (string) $response->json('message'));
        $response->assertJsonPath('data', null);
    }

    public function test_seeded_demo_accounts_cover_every_role(): void
    {
        // The demo dataset is intentionally large, but these five documented
        // accounts must always exist and between them cover every role.
        $documented = [
            'user1@sharelab.test' => Role::User,
            'user2@sharelab.test' => Role::User,
            'manager@sharelab.test' => Role::Manager,
            'owner@sharelab.test' => Role::Owner,
            'admin@sharelab.test' => Role::Admin,
        ];

        foreach ($documented as $email => $role) {
            $user = User::query()->where('email', $email)->first();

            $this->assertNotNull($user, "Missing documented demo account {$email}.");
            $this->assertSame($role, $user->role, "{$email} has the wrong role.");
        }

        foreach (Role::cases() as $role) {
            $this->assertGreaterThanOrEqual(
                1,
                User::query()->where('role', $role)->count(),
                "No demo account covers the {$role->value} role.",
            );
        }
    }
}
