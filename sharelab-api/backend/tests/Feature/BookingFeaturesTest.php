<?php

namespace Tests\Feature;

use App\Enums\BookingStatus;
use App\Enums\Role;
use App\Models\AuditLog;
use App\Models\Booking;
use App\Models\Notification;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\DomainFixtures;
use Tests\TestCase;

class BookingFeaturesTest extends TestCase
{
    use RefreshDatabase;
    use DomainFixtures;

    private User $user1;
    private User $user2;
    private User $manager;
    private User $owner;
    private \App\Models\Resource $resource;

    protected function setUp(): void
    {
        parent::setUp();
        CarbonImmutable::setTestNow('2026-03-02 09:00:00');

        $this->owner = $this->makeUser(Role::Owner);
        $this->manager = $this->makeUser(Role::Manager);
        $this->user1 = $this->makeUser(Role::User);
        $this->user2 = $this->makeUser(Role::User);
        $this->resource = $this->makeResource($this->owner);
        $this->assignManager($this->resource, $this->manager);
    }

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();
        parent::tearDown();
    }

    public function test_duration_over_resource_maximum_is_rejected(): void
    {
        $this->actingAs($this->user1)
            ->postJson('/api/bookings', [
                'resource_id' => $this->resource->id,
                'start_at' => '2026-03-02 10:00:00',
                'end_at' => '2026-03-02 13:00:00',
                'purpose' => 'Too long',
            ])
            ->assertStatus(422);
    }

    public function test_second_request_for_the_same_slot_is_waitlisted(): void
    {
        $first = $this->actingAs($this->user1)->postJson('/api/bookings', [
            'resource_id' => $this->resource->id,
            'start_at' => '2026-03-02 10:00:00',
            'end_at' => '2026-03-02 11:00:00',
            'purpose' => 'First',
        ]);

        $first->assertCreated()->assertJsonPath('data.status', 'pending');

        $second = $this->actingAs($this->user2)->postJson('/api/bookings', [
            'resource_id' => $this->resource->id,
            'start_at' => '2026-03-02 10:00:00',
            'end_at' => '2026-03-02 11:00:00',
            'purpose' => 'Second',
        ]);

        $second->assertCreated()
            ->assertJsonPath('data.status', 'waitlisted')
            ->assertJsonPath('data.waitlist_position', 1);
    }

    public function test_touching_slots_do_not_conflict(): void
    {
        $this->makeBooking($this->resource, $this->user2, [
            'start_at' => '2026-03-02 10:00:00',
            'end_at' => '2026-03-02 11:00:00',
            'status' => BookingStatus::Approved,
        ]);

        $this->actingAs($this->user1)
            ->postJson('/api/bookings', [
                'resource_id' => $this->resource->id,
                'start_at' => '2026-03-02 11:00:00',
                'end_at' => '2026-03-02 12:00:00',
            ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending');
    }

    public function test_decision_requires_a_reason(): void
    {
        $booking = $this->makeBooking($this->resource, $this->user1);

        $this->actingAs($this->manager)
            ->patchJson("/api/bookings/{$booking->id}/decision", ['decision' => 'approve'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('reason');
    }

    public function test_manager_cannot_decide_a_resource_they_do_not_manage(): void
    {
        $otherManager = $this->makeUser(Role::Manager);
        $booking = $this->makeBooking($this->resource, $this->user1);

        $this->actingAs($otherManager)
            ->patchJson("/api/bookings/{$booking->id}/decision", [
                'decision' => 'approve',
                'reason' => 'Looks fine.',
            ])
            ->assertStatus(403);
    }

    public function test_manager_cannot_change_a_final_decision(): void
    {
        $booking = $this->makeBooking($this->resource, $this->user1, [
            'status' => BookingStatus::Approved,
            'decided_by' => $this->manager->id,
        ]);

        $this->actingAs($this->manager)
            ->patchJson("/api/bookings/{$booking->id}/decision", [
                'decision' => 'reject',
                'reason' => 'Changed my mind.',
            ])
            ->assertStatus(422);

        $this->assertSame(BookingStatus::Approved, $booking->fresh()->status);
    }

    public function test_owner_override_is_explicitly_audited(): void
    {
        $booking = $this->makeBooking($this->resource, $this->user1);

        $this->actingAs($this->manager)
            ->patchJson("/api/bookings/{$booking->id}/decision", [
                'decision' => 'approve',
                'reason' => 'Eligible and free.',
            ])
            ->assertOk();

        $this->actingAs($this->owner)
            ->patchJson("/api/bookings/{$booking->id}/decision", [
                'decision' => 'reject',
                'reason' => 'The requester did not include the required project brief.',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected');

        $audit = AuditLog::query()
            ->where('booking_id', $booking->id)
            ->where('action', 'booking_rejected')
            ->firstOrFail();

        $this->assertTrue((bool) $audit->meta['owner_override']);
        $this->assertStringContainsString('Owner override', (string) $audit->reason);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->user1->id,
            'type' => 'booking_rejected',
        ]);
    }

    public function test_cancelling_an_approved_booking_offers_the_slot_to_the_waitlist(): void
    {
        $approved = $this->makeBooking($this->resource, $this->user1, [
            'status' => BookingStatus::Approved,
        ]);

        $this->actingAs($this->user2)->postJson('/api/bookings', [
            'resource_id' => $this->resource->id,
            'start_at' => '2026-03-02 10:00:00',
            'end_at' => '2026-03-02 11:00:00',
        ])->assertCreated()->assertJsonPath('data.status', 'waitlisted');

        $waitlisted = Booking::query()->where('user_id', $this->user2->id)->firstOrFail();

        $this->actingAs($this->user1)
            ->postJson("/api/bookings/{$approved->id}/cancel", ['reason' => 'Schedule changed.'])
            ->assertOk();

        $waitlisted->refresh();
        $this->assertSame(BookingStatus::Pending, $waitlisted->status);
        $this->assertNotNull($waitlisted->confirm_by);
        $this->assertDatabaseHas('audit_logs', [
            'booking_id' => $waitlisted->id,
            'action' => 'waitlist_offered',
        ]);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->user2->id,
            'type' => 'waitlist_offer',
        ]);

        $this->actingAs($this->user2)
            ->postJson("/api/bookings/{$waitlisted->id}/confirm")
            ->assertOk()
            ->assertJsonPath('data.status', 'approved');
    }

    public function test_extending_into_an_approved_booking_is_rejected(): void
    {
        $first = $this->makeBooking($this->resource, $this->user1, [
            'start_at' => '2026-03-02 10:00:00',
            'end_at' => '2026-03-02 11:00:00',
            'status' => BookingStatus::Approved,
        ]);

        $this->makeBooking($this->resource, $this->user2, [
            'start_at' => '2026-03-02 11:00:00',
            'end_at' => '2026-03-02 12:00:00',
            'status' => BookingStatus::Approved,
        ]);

        $this->actingAs($this->user1)
            ->patchJson("/api/bookings/{$first->id}/extend", ['end_at' => '2026-03-02 12:00:00'])
            ->assertStatus(422);
    }

    public function test_booking_timeline_is_visible_to_the_requester(): void
    {
        $created = $this->actingAs($this->user1)->postJson('/api/bookings', [
            'resource_id' => $this->resource->id,
            'start_at' => '2026-03-02 10:00:00',
            'end_at' => '2026-03-02 11:00:00',
            'purpose' => 'Timeline test',
        ])->assertCreated();

        $booking = Booking::query()->findOrFail($created->json('data.id'));

        $this->actingAs($this->manager)
            ->patchJson("/api/bookings/{$booking->id}/decision", [
                'decision' => 'approve',
                'reason' => 'Free slot and eligible.',
            ])
            ->assertOk();

        $this->actingAs($this->user1)
            ->getJson("/api/bookings/{$booking->id}/timeline")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.label', 'Request submitted')
            ->assertJsonPath('data.1.label', 'Request approved');
    }

    public function test_user_cannot_read_another_users_booking(): void
    {
        $booking = $this->makeBooking($this->resource, $this->user2);

        $this->actingAs($this->user1)
            ->getJson("/api/bookings/{$booking->id}")
            ->assertStatus(403);
    }

    public function test_manager_workspace_only_returns_assigned_bookings(): void
    {
        $otherResource = $this->makeResource($this->owner);
        $this->makeBooking($this->resource, $this->user1);
        $this->makeBooking($otherResource, $this->user2);

        $this->actingAs($this->manager)
            ->getJson('/api/manager/requests')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_dashboard_summary_is_scoped_to_the_signed_in_user(): void
    {
        $this->makeBooking($this->resource, $this->user1, ['status' => BookingStatus::Approved]);
        $this->makeBooking($this->resource, $this->user2);

        $this->actingAs($this->user1)
            ->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonPath('data.total_bookings', 1)
            ->assertJsonPath('data.upcoming_bookings', 1);
    }

    public function test_user_cannot_access_manager_or_owner_routes(): void
    {
        $this->actingAs($this->user1)->getJson('/api/manager/requests')->assertStatus(403);
        $this->actingAs($this->user1)->getJson('/api/owner/resources')->assertStatus(403);
    }
}
