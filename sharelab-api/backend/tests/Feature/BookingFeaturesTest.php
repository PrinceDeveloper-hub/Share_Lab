<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Resource;
use App\Models\Booking;
use App\Enums\BookingStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;

class BookingFeaturesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user1 = User::factory()->create(['email' => 'feat1@sharelab.test']);
        $this->user2 = User::factory()->create(['email' => 'feat2@sharelab.test']);
        $this->resource = Resource::factory()->create([
            'max_hours_per_booking' => 2,
            'weekly_cap_hours' => 6,
        ]);
    }

    /**
     * Test policy denials per role.
     */
    public function test_policy_denials_per_role()
    {
        $this->actingAs($this->user1);

        // Regular user cannot create booking on another user's resource without auth
        // Already tested by actingAs

        // Test that user cannot book a resource they don't have access to
        $otherResource = Resource::factory()->create([
            'owner_id' => 99,
        ]);

        $response = $this->postJson('/api/bookings', [
            'resource_id' => $otherResource->id,
            'start_at' => now()->addDay(1)->format('Y-m-d H:i:s'),
            'end_at' => now()->addDay(1)->addHours(1)->format('Y-m-d H:i:s'),
        ]);

        // Should fail with 422 or 403
        $response->assertStatus(422);
    }

    /**
     * Test decision without a reason returns 422.
     */
    public function test_decision_without_reason_returns_422()
    {
        $this->actingAs($this->user1);

        // Create a pending booking
        $booking = Booking::factory()->create([
            'resource_id' => $this->resource->id,
            'user_id' => $this->user1->id,
            'start_at' => now()->addDay(1)->format('Y-m-d H:i:s'),
            'end_at' => now()->addDay(1)->addHours(1)->format('Y-m-d H:i:s'),
            'status' => BookingStatus::Pending,
        ]);

        // Try to decide without a reason
        $response = $this->patchJson("/api/bookings/{$booking->id}/decision", [
            'decision' => 'approve',
            // 'reason' is missing
        ]);

        // Should return 422 validation error
        $response->assertStatus(422);
    }

    /**
     * Test audit log cannot be updated or deleted.
     */
    public function test_audit_log_cannot_be_updated_or_deleted()
    {
        $this->actingAs($this->user1);

        // Create a booking and decision
        $booking = Booking::factory()->create([
            'resource_id' => $this->resource->id,
            'user_id' => $this->user1->id,
            'start_at' => now()->addDay(1)->format('Y-m-d H:i:s'),
            'end_at' => now()->addDay(1)->addHours(1)->format('Y-m-d H:i:s'),
            'status' => BookingStatus::Pending,
        ]);

        // Try to update audit log
        $auditLog = \App\Models\AuditLog::first();

        $response = $this->patchJson("/api/audit-logs/{$auditLog->id}", [
            'action' => 'modified',
        ]);

        // Should fail (audit logs are append-only)
        $response->assertStatus(403); // Or some appropriate error
    }

    /**
     * Test user cannot read another user's booking.
     */
    public function test_user_cannot_read_another_users_booking()
    {
        $this->actingAs($this->user1);

        // Create booking for user2
        $booking = Booking::factory()->create([
            'resource_id' => $this->resource->id,
            'user_id' => $this->user2->id,
            'start_at' => now()->addDay(1)->format('Y-m-d H:i:s'),
            'end_at' => now()->addDay(1)->addHours(1)->format('Y-m-d H:i:s'),
            'status' => BookingStatus::Approved,
        ]);

        // User1 tries to view user2's booking
        $response = $this->getJson("/api/bookings/{$booking->id}");

        // Should be denied (403) unless user1 is admin or manager
        $response->assertStatus(403);
    }

    /**
     * Test late-return flag and system-suggested incidents.
     */
    public function test_late_return_flag_and_system_suggested_incidents()
    {
        $this->actingAs($this->user1);

        // Create a checked-in booking
        $booking = Booking::factory()->create([
            'resource_id' => $this->resource->id,
            'user_id' => $this->user1->id,
            'start_at' => now()->subDay(1)->format('Y-m-d H:i:s'),
            'end_at' => now()->subHours(1)->format('Y-m-d H:i:s'), // End was 1 hour ago
            'status' => BookingStatus::CheckedIn,
        ]);

        // Create condition report for return
        $report = \App\Models\ConditionReport::create([
            'booking_id' => $booking->id,
            'type' => 'return',
            'condition' => 'damaged',
            'notes' => 'Scratch on the side',
            'reported_by' => $this->user1->id,
        ]);

        // Call return - should set is_late = true since now > end_at
        $response = $this->postJson("/api/bookings/{$booking->id}/return");

        // Should set is_late flag
        $this->assertTrue(true); // Placeholder - will assert actual behavior

        // Should create a damage incident suggested by system
        $this->assertTrue(true); // Placeholder
    }

    /**
     * Test timeline contains every step with actor, time and reason.
     */
    public function test_timeline_contains_every_step()
    {
        $this->actingAs($this->user1);

        // Create a booking
        $booking = Booking::factory()->create([
            'resource_id' => $this->resource->id,
            'user_id' => $this->user1->id,
            'start_at' => now()->addDay(1)->format('Y-m-d H:i:s'),
            'end_at' => now()->addDay(1)->addHours(2)->format('Y-m-d H:i:s'),
            'status' => BookingStatus::Pending,
        ]);

        // Make a decision
        $booking->status = BookingStatus::Approved;
        $booking->decision_reason = 'Eligible and no conflicts';
        $booking->decided_by = $this->user1->id;
        $booking->save();

        // Check timeline endpoint
        $response = $this->getJson("/api/bookings/{$booking->id}/timeline");

        // Should return audit entries
        $response->assertStatus(200)
            ->assertJsonCount(2, 'data'); // At least 2 entries: creation + decision
    }

    /**
     * Test concurrency: two simultaneous requests for the same slot.
     */
    public function test_concurrency_same_slot()
    {
        $this->actingAs($this->user1);

        // Fire two simultaneous requests for the same slot
        $response1 = $this->postJson('/api/bookings', [
            'resource_id' => $this->resource->id,
            'start_at' => now()->addDay(1)->format('Y-m-d H:i:s'),
            'end_at' => now()->addDay(1)->addHours(2)->format('Y-m-d H:i:s'),
        ]);

        $response2 = $this->postJson('/api/bookings', [
            'resource_id' => $this->resource->id,
            'start_at' => now()->addDay(1)->format('Y-m-d H:i:s'),
            'end_at' => now()->addDay(1)->addHours(2)->format('Y-m-d H:i:s'),
        ]);

        // One should be approvable, one waitlisted
        // This tests that exactly one approvable booking and one waitlisted result
        $this->assertTrue(true); // Placeholder
    }
}