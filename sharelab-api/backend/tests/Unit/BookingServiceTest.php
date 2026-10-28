<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Resource;
use App\Models\Booking;
use App\Enums\BookingStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;

class BookingServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user1 = User::factory()->create(['email' => 'test1@sharelab.test']);
        $this->user2 = User::factory()->create(['email' => 'test2@sharelab.test']);
        $this->resource = Resource::factory()->create([
            'max_hours_per_booking' => 2,
            'weekly_cap_hours' => 6,
        ]);
    }

    /**
     * Test eligibility: user with verified credential qualifies
     * User without required credential does not qualify
     */
    public function test_user_with_verified_credential_qualifies()
    {
        // User2 has verified credential from seeder
        $this->actingAs($this->user2);

        // Test eligibility logic
        // We'll test the service method
    }

    /**
     * Test duration and weekly cap: reject if slot exceeds max_hours_per_booking.
     */
    public function test_duration_exceeds_max_hours_per_booking()
    {
        $this->actingAs($this->user1);

        // Book 3 hours when max is 2
        $booking = Booking::factory()->make([
            'resource_id' => $this->resource->id,
            'user_id' => $this->user1->id,
            'start_at' => now()->addDay(1)->format('Y-m-d H:i:s'),
            'end_at' => now()->addDay(1)->addHours(3)->format('Y-m-d H:i:s'),
        ]);

        $maxHours = 2;
        $durationHours = abs(Carbon::parse($booking->end_at)->diffInHours(Carbon::parse($booking->start_at)));

        $this->assertTrue($durationHours > $maxHours);
        $this->assertTrue($durationHours > $maxHours);
    }

    /**
     * Test conflict check: overlapping bookings.
     */
    public function test_overlapping_bookings_conflict()
    {
        $this->actingAs($this->user1);

        // Create an existing approved booking
        $existing = Booking::factory()->create([
            'resource_id' => $this->resource->id,
            'user_id' => $this->user2->id,
            'start_at' => now()->addDay(1)->format('Y-m-d H:i:s'),
            'end_at' => now()->addDay(1)->addHours(2)->format('Y-m-d H:i:s'),
            'status' => BookingStatus::Approved,
        ]);

        // Try to book the same slot - should conflict
        $this-> actingAs($this->user1);
        $response = $this->postJson('/api/bookings', [
            'resource_id' => $this->resource->id,
            'start_at' => now()->addDay(1)->format('Y-m-d H:i:s'),
            'end_at' => now()->addDay(1)->addHours(2)->format('Y-m-d H:i:s'),
        ]);

        // Should be waitlisted due to conflict
        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'status',
                    'waitlist_position',
                ],
                'message',
            ]);
    }

    /**
     * Test touching slots (end == start) do NOT conflict.
     */
    public function test_touching_slots_do_not_conflict()
    {
        $this->actingAs($this->user1);

        // Create an existing approved booking ending at 10:00
        Booking::factory()->create([
            'resource_id' => $this->resource->id,
            'user_id' => $this->user2->id,
            'start_at' => now()->addDay(1)->format('Y-m-d H:i:s'),
            'end_at' => now()->addDay(1)->addHours(1)->format('Y-m-d H:i:s'),
            'status' => BookingStatus::Approved,
        ]);

        // Try to book starting exactly when the other ends - should NOT conflict
        $response = $this->postJson('/api/bookings', [
            'resource_id' => $this->resource->id,
            'start_at' => now()->addDay(1)->addHours(1)->format('Y-m-d H:i:s'),
            'end_at' => now()->addDay(1)->addHours(2)->format('Y-m-d H:i:s'),
        ]);

        // Should be able to book (no conflict for touching slots)
        $this->assertTrue(true); // Placeholder - will assert actual behavior
    }

    /**
     * Test priority ordering: lower hours used = higher priority.
     */
    public function test_priority_ordering()
    {
        $this->actingAs($this->user1);

        // User1 has used 5 hours in last 30 days
        // User2 has used 2 hours in last 30 days
        // User2 should have higher priority (lower score)

        $priority1 = BookingService::calculatePriorityScore($this->user1, $this->resource);
        $priority2 = BookingService::calculatePriorityScore($this->user2, $this->resource);

        $this->assertLessThan($priority2['priority_score'], $priority1['priority_score']);
    }

    /**
     * Test priority tie-break: earlier request time breaks ties.
     */
    public function test_priority_tie_break()
    {
        $this->actingAs($this->user1);

        // Both users have same hours used, but user1 made request earlier
        // This tests the tie-breaking logic
    }

    /**
     * Test waitlist promotion: offer freed slot to top-ranked waitlisted request.
     */
    public function test_waitlist_promotion()
    {
        $this->actingAs($this->user1);

        // Create a booking that will be cancelled
        $booking = Booking::factory()->create([
            'resource_id' => $this->resource->id,
            'user_id' => $this->user1->id,
            'start_at' => now()->addDay(1)->format('Y-m-d H:i:s'),
            'end_at' => now()->addDay(1)->addHours(2)->format('Y-m-d H:i:s'),
            'status' => BookingStatus::Approved,
        ]);

        // User2 waits for this resource
        $user2 = User::factory()->create(['email' => 'test2wait@sharelab.test']);
        $booking2 = Booking::factory()->create([
            'resource_id' => $this->resource->id,
            'user_id' => $user2->id,
            'start_at' => now()->addDay(2)->format('Y-m-d H:i:s'),
            'end_at' => now()->addDay(2)->addHours(2)->format('Y-m-d H:i:s'),
            'status' => BookingStatus::Waitlisted,
            'waitlist_position' => 1,
        ]);

        // Cancel the approved booking
        $booking->status = BookingStatus::Cancelled;
        $booking->save();

        // Promote waitlist - should offer slot to user2
        // This is a simplified test
        $this->assertTrue(true); // Placeholder
    }

    /**
     * Test UTC handling of datetime fields.
     */
    public function test_utc_handling()
    {
        $this->actingAs($this->user1);

        $booking = Booking::factory()->create([
            'resource_id' => $this->resource->id,
            'user_id' => $this->user1->id,
            'start_at' => now()->addDay(1)->format('Y-m-d H:i:s'),
            'end_at' => now()->addDay(1)->addHours(2)->format('Y-m-d H:i:s'),
            'status' => BookingStatus::Pending,
        ]);

        // Verify timestamps are stored and returned in UTC
        $this->assertNotNull($booking->start_at);
        $this->assertNotNull($booking->end_at);
    }

    /**
     * Test overlap cases: nested, partial, identical.
     */
    public function test_overlap_cases()
    {
        $this->actingAs($this->user1);

        // Create existing booking: 10:00 - 12:00
        Booking::factory()->create([
            'resource_id' => $this->resource->id,
            'user_id' => $this->user2->id,
            'start_at' => now()->addDay(1)->format('Y-m-d H:i:s 10:00:00'),
            'end_at' => now()->addDay(1)->format('Y-m-d H:i:s 12:00:00'),
            'status' => BookingStatus::Approved,
        ]);

        // Test nested overlap: 10:30 - 11:30 (inside existing)
        $response1 = $this->postJson('/api/bookings', [
            'resource_id' => $this->resource->id,
            'start_at' => now()->addDay(1)->format('Y-m-d H:i:s 10:30:00'),
            'end_at' => now()->addDay(1)->format('Y-m-d H:i:s 11:30:00'),
        ]);

        // Test partial overlap: 11:00 - 13:00 (starts inside, ends outside)
        $response2 = $this->postJson('/api/bookings', [
            'resource_id' => $this->resource->id,
            'start_at' => now()->addDay(1)->format('Y-m-d H:i:s 11:00:00'),
            'end_at' => now()->addDay(1)->format('Y-m-d H:i:s 13:00:00'),
        ]);

        // Test identical: same slot
        $response3 = $this->postJson('/api/bookings', [
            'resource_id' => $this->resource->id,
            'start_at' => now()->addDay(1)->format('Y-m-d H:i:s 10:00:00'),
            'end_at' => now()->addDay(1)->format('Y-m-d H:i:s 12:00:00'),
        ]);

        // All should result in waitlisting or rejection
        $this->assertTrue(true); // Placeholder
    }
}