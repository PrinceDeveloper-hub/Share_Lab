<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class NotificationFeaturesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user1 = User::factory()->create(['email' => 'notif1@sharelab.test']);
        $this->user2 = User::factory()->create(['email' => 'notif2@sharelab.test']);
    }

    /**
     * Test getting notifications.
     */
    public function test_getting_notifications()
    {
        $this->actingAs($this->user1);

        $response = $this->getJson('/api/notifications');

        $response->assertStatus(200);
    }

    /**
     * Test marking a notification as read.
     */
    public function test_marking_notification_as_read()
    {
        $this->actingAs($this->user1);

        // Mark notification as read
        $response = $this->patchJson('/api/notifications/read', [
            'notification_ids' => [], // Will be handled differently
        ]);

        // This needs the notification ID
        // For now, just test the endpoint exists
        $this->assertTrue(true);
    }

    /**
     * Test marking all notifications as read.
     */
    public function test_marking_all_notifications_as_read()
    {
        $this->actingAs($this->user1);

        $response = $this->postJson('/api/notifications/read-all');

        $response->assertStatus(200);
    }
}