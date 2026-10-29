<?php

namespace Tests\Feature;

use App\Enums\BookingStatus;
use App\Enums\IncidentStatus;
use App\Enums\Role;
use App\Models\Booking;
use App\Models\Incident;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\DomainFixtures;
use Tests\TestCase;

class IncidentConditionFeaturesTest extends TestCase
{
    use RefreshDatabase;
    use DomainFixtures;

    private \App\Models\Resource $resource;
    private \App\Models\User $user;
    private \App\Models\User $manager;
    private \App\Models\User $owner;

    protected function setUp(): void
    {
        parent::setUp();
        CarbonImmutable::setTestNow('2026-03-02 09:00:00');

        $this->owner = $this->makeUser(Role::Owner);
        $this->manager = $this->makeUser(Role::Manager);
        $this->user = $this->makeUser(Role::User);
        $this->resource = $this->makeResource($this->owner);
        $this->assignManager($this->resource, $this->manager);
    }

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();
        parent::tearDown();
    }

    public function test_check_in_is_rejected_before_the_window_and_accepted_inside_it(): void
    {
        $booking = $this->makeBooking($this->resource, $this->user, [
            'start_at' => '2026-03-02 10:00:00',
            'end_at' => '2026-03-02 11:00:00',
            'status' => BookingStatus::Approved,
        ]);

        $this->actingAs($this->user)
            ->postJson("/api/bookings/{$booking->id}/checkin", ['condition' => 'good'])
            ->assertStatus(422);

        CarbonImmutable::setTestNow('2026-03-02 09:40:00');

        $this->actingAs($this->user)
            ->postJson("/api/bookings/{$booking->id}/checkin", [
                'condition' => 'good',
                'notes' => 'Bench is clean.',
                'checklist' => ['Power', 'Cable'],
            ])
            ->assertOk()
            ->assertJsonPath('data.booking.status', 'checked_in');

        $this->assertSame(BookingStatus::CheckedIn, $booking->fresh()->status);
        $this->assertDatabaseHas('condition_reports', [
            'booking_id' => $booking->id,
            'type' => 'checkin',
            'condition' => 'good',
        ]);
        $this->assertDatabaseHas('audit_logs', ['booking_id' => $booking->id, 'action' => 'checked_in']);
    }

    public function test_late_return_records_the_flag_and_creates_unconfirmed_suggestions(): void
    {
        $booking = $this->makeBooking($this->resource, $this->user, [
            'start_at' => '2026-03-02 09:00:00',
            'end_at' => '2026-03-02 10:00:00',
            'status' => BookingStatus::Approved,
        ]);

        $this->actingAs($this->user)->postJson("/api/bookings/{$booking->id}/checkin", [
            'condition' => 'good',
        ])->assertOk();

        CarbonImmutable::setTestNow('2026-03-02 10:30:00');

        $this->actingAs($this->user)->postJson("/api/bookings/{$booking->id}/return", [
            'condition' => 'damaged',
            'notes' => 'A crack appeared on the housing.',
        ])->assertOk();

        $booking->refresh();
        $this->assertTrue($booking->is_late);
        $this->assertSame(BookingStatus::Returned, $booking->status);

        $incidents = Incident::query()->where('booking_id', $booking->id)->get();
        $this->assertCount(2, $incidents);
        $this->assertTrue($incidents->every(fn (Incident $incident): bool => $incident->suggested_by_system));
        $this->assertEqualsCanonicalizing(['delay', 'damage'], $incidents->pluck('type')->all());
        $this->assertNull($incidents->first()->confirmed_by);
    }

    public function test_manager_confirms_and_resolves_a_suggested_incident_with_a_reason(): void
    {
        $booking = $this->makeBooking($this->resource, $this->user, [
            'start_at' => '2026-03-02 09:00:00',
            'end_at' => '2026-03-02 10:00:00',
            'status' => BookingStatus::CheckedIn,
        ]);

        $incident = Incident::query()->create([
            'booking_id' => $booking->id,
            'reported_by' => $this->user->id,
            'type' => 'delay',
            'description' => 'Returned late.',
            'status' => IncidentStatus::Open,
            'suggested_by_system' => true,
        ]);

        $this->actingAs($this->manager)
            ->patchJson("/api/incidents/{$incident->id}/confirm")
            ->assertOk()
            ->assertJsonPath('data.confirmed_by', $this->manager->id);

        $this->actingAs($this->manager)
            ->patchJson("/api/incidents/{$incident->id}/resolve", ['resolution_note' => 'Late return accepted with a warning.'])
            ->assertOk()
            ->assertJsonPath('data.status', 'resolved');

        $this->assertDatabaseHas('audit_logs', ['action' => 'incident_confirmed', 'subject_id' => $incident->id]);
        $this->assertDatabaseHas('audit_logs', ['action' => 'incident_resolved', 'subject_id' => $incident->id]);
        $this->assertDatabaseHas('notifications', ['user_id' => $this->user->id, 'type' => 'incident_resolved']);
    }

    public function test_users_cannot_confirm_incidents_or_manage_unassigned_ones(): void
    {
        $otherManager = $this->makeUser(Role::Manager);
        $booking = $this->makeBooking($this->resource, $this->user, [
            'status' => BookingStatus::CheckedIn,
        ]);
        $incident = Incident::query()->create([
            'booking_id' => $booking->id,
            'reported_by' => $this->user->id,
            'type' => 'other',
            'description' => 'Something happened.',
            'status' => IncidentStatus::Open,
            'suggested_by_system' => false,
        ]);

        $this->actingAs($this->user)
            ->patchJson("/api/incidents/{$incident->id}/confirm")
            ->assertStatus(403);

        $this->actingAs($otherManager)
            ->patchJson("/api/incidents/{$incident->id}/resolve", ['resolution_note' => 'Not mine.'])
            ->assertStatus(403);
    }

    public function test_user_incident_list_is_scoped_to_their_bookings(): void
    {
        $otherUser = $this->makeUser(Role::User);
        $ownBooking = $this->makeBooking($this->resource, $this->user);
        $otherBooking = $this->makeBooking($this->resource, $otherUser);

        Incident::query()->create([
            'booking_id' => $ownBooking->id,
            'reported_by' => $this->user->id,
            'type' => 'other',
            'description' => 'Mine.',
            'status' => IncidentStatus::Open,
        ]);
        Incident::query()->create([
            'booking_id' => $otherBooking->id,
            'reported_by' => $otherUser->id,
            'type' => 'other',
            'description' => 'Not mine.',
            'status' => IncidentStatus::Open,
        ]);

        $this->actingAs($this->user)
            ->getJson('/api/incidents')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.description', 'Mine.');
    }
}
