<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\Notification;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\DomainFixtures;
use Tests\TestCase;

class NotificationFeaturesTest extends TestCase
{
    use RefreshDatabase;
    use DomainFixtures;

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

    public function test_user_sees_only_their_own_notifications(): void
    {
        $user = $this->makeUser(Role::User);
        $other = $this->makeUser(Role::User);

        Notification::query()->create([
            'user_id' => $user->id,
            'type' => 'booking_approved',
            'message' => 'Your request was approved.',
        ]);
        Notification::query()->create([
            'user_id' => $other->id,
            'type' => 'booking_rejected',
            'message' => 'Private message.',
        ]);

        $this->actingAs($user)
            ->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.message', 'Your request was approved.');
    }

    public function test_user_can_mark_one_notification_as_read(): void
    {
        $user = $this->makeUser(Role::User);
        $notification = Notification::query()->create([
            'user_id' => $user->id,
            'type' => 'booking_approved',
            'message' => 'Approved.',
        ]);

        $this->actingAs($user)
            ->patchJson("/api/notifications/{$notification->id}/read")
            ->assertOk()
            ->assertJsonPath('data.read', true);

        $this->assertTrue($notification->fresh()->read);
    }

    public function test_user_cannot_mark_someone_elses_notification_as_read(): void
    {
        $user = $this->makeUser(Role::User);
        $other = $this->makeUser(Role::User);
        $notification = Notification::query()->create([
            'user_id' => $other->id,
            'type' => 'booking_approved',
            'message' => 'Approved.',
        ]);

        $this->actingAs($user)
            ->patchJson("/api/notifications/{$notification->id}/read")
            ->assertStatus(403);
    }

    public function test_unread_count_and_read_all_are_scoped_to_the_user(): void
    {
        $user = $this->makeUser(Role::User);
        $other = $this->makeUser(Role::User);

        Notification::query()->create(['user_id' => $user->id, 'type' => 'a', 'message' => 'One']);
        Notification::query()->create(['user_id' => $user->id, 'type' => 'b', 'message' => 'Two']);
        $otherNotification = Notification::query()->create(['user_id' => $other->id, 'type' => 'c', 'message' => 'Three']);

        $this->actingAs($user)
            ->getJson('/api/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('data.unread', 2);

        $this->actingAs($user)
            ->patchJson('/api/notifications/read-all')
            ->assertOk()
            ->assertJsonPath('data.updated', 2);

        $this->assertFalse($otherNotification->fresh()->read);
    }
}
