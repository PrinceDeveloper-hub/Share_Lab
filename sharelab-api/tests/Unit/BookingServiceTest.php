<?php

namespace Tests\Unit;

use App\Enums\BookingStatus;
use App\Enums\CredentialStatus;
use App\Enums\Role;
use App\Models\ResourceRequirement;
use App\Models\UserCredential;
use App\Services\Booking\PriorityScoreCalculator;
use App\Services\Booking\Rules\ConflictRule;
use App\Services\Booking\Rules\DurationRule;
use App\Services\Booking\Rules\WeeklyCapRule;
use App\Services\Eligibility\EligibilityService;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\DomainFixtures;
use Tests\TestCase;

class BookingServiceTest extends TestCase
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

    public function test_eligibility_requires_every_verified_requirement(): void
    {
        $owner = $this->makeUser(Role::Owner);
        $user = $this->makeUser(Role::User);
        $resource = $this->makeResource($owner);

        ResourceRequirement::query()->create([
            'resource_id' => $resource->id,
            'name' => 'Safety Training',
            'requires_verification' => true,
        ]);

        $service = app(EligibilityService::class);
        $missing = $service->for($user, $resource);
        $this->assertFalse($missing['qualifies']);
        $this->assertSame(['Safety Training'], $missing['missing']);

        UserCredential::query()->create([
            'user_id' => $user->id,
            'requirement_name' => 'Safety Training',
            'status' => CredentialStatus::Verified,
        ]);

        $this->assertTrue($service->for($user, $resource)['qualifies']);
    }

    public function test_duration_rule_accepts_the_limit_and_rejects_longer_slots(): void
    {
        $owner = $this->makeUser(Role::Owner);
        $user = $this->makeUser(Role::User);
        $resource = $this->makeResource($owner, ['max_hours_per_booking' => 2]);
        $rule = app(DurationRule::class);

        $this->assertNull($rule->violation(
            $resource,
            $user,
            CarbonImmutable::parse('2026-03-02 10:00:00'),
            CarbonImmutable::parse('2026-03-02 12:00:00'),
        ));

        $violation = $rule->violation(
            $resource,
            $user,
            CarbonImmutable::parse('2026-03-02 10:00:00'),
            CarbonImmutable::parse('2026-03-02 12:30:00'),
        );

        $this->assertSame('duration', $violation['rule']);
    }

    public function test_conflict_rule_handles_identical_nested_partial_and_touching_slots(): void
    {
        $owner = $this->makeUser(Role::Owner);
        $user = $this->makeUser(Role::User);
        $resource = $this->makeResource($owner);
        $existing = $this->makeBooking($resource, $user, [
            'start_at' => '2026-03-02 10:00:00',
            'end_at' => '2026-03-02 12:00:00',
            'status' => BookingStatus::Approved,
        ]);
        $rule = app(ConflictRule::class);

        foreach ([
            ['10:00', '12:00'],
            ['10:30', '11:30'],
            ['11:00', '13:00'],
            ['09:00', '11:00'],
        ] as [$start, $end]) {
            $violation = $rule->violation(
                $resource,
                $user,
                CarbonImmutable::parse("2026-03-02 {$start}:00"),
                CarbonImmutable::parse("2026-03-02 {$end}:00"),
                $existing->id,
            );
            $this->assertNull($violation, "Ignoring the booking itself should not conflict for {$start}-{$end}.");
        }

        $this->assertSame('conflict', $rule->violation(
            $resource,
            $user,
            CarbonImmutable::parse('2026-03-02 11:00:00'),
            CarbonImmutable::parse('2026-03-02 13:00:00'),
        )['rule']);

        $this->assertNull($rule->violation(
            $resource,
            $user,
            CarbonImmutable::parse('2026-03-02 12:00:00'),
            CarbonImmutable::parse('2026-03-02 13:00:00'),
        ));
    }

    public function test_weekly_cap_rule_counts_only_overlapping_hours_in_the_same_week(): void
    {
        $owner = $this->makeUser(Role::Owner);
        $user = $this->makeUser(Role::User);
        $resource = $this->makeResource($owner, ['weekly_cap_hours' => 4]);

        $this->makeBooking($resource, $user, [
            'start_at' => '2026-03-02 09:00:00',
            'end_at' => '2026-03-02 12:00:00',
            'status' => BookingStatus::Approved,
        ]);

        $rule = app(WeeklyCapRule::class);
        $violation = $rule->violation(
            $resource,
            $user,
            CarbonImmutable::parse('2026-03-03 09:00:00'),
            CarbonImmutable::parse('2026-03-03 11:00:00'),
        );

        $this->assertSame('weekly_cap', $violation['rule']);

        $this->assertNull($rule->violation(
            $resource,
            $user,
            CarbonImmutable::parse('2026-03-09 09:00:00'),
            CarbonImmutable::parse('2026-03-09 10:00:00'),
        ));
    }

    public function test_priority_prefers_the_user_with_fewer_recent_hours(): void
    {
        $owner = $this->makeUser(Role::Owner);
        $busy = $this->makeUser(Role::User);
        $quiet = $this->makeUser(Role::User);
        $resource = $this->makeResource($owner, ['weekly_cap_hours' => 40]);

        $this->makeBooking($resource, $busy, [
            'start_at' => '2026-02-20 09:00:00',
            'end_at' => '2026-02-20 14:00:00',
            'status' => BookingStatus::Returned,
        ]);
        $this->makeBooking($resource, $quiet, [
            'start_at' => '2026-02-21 09:00:00',
            'end_at' => '2026-02-21 11:00:00',
            'status' => BookingStatus::Returned,
        ]);

        $calculator = app(PriorityScoreCalculator::class);

        $this->assertGreaterThan(
            $calculator->calculate($quiet, $resource)['priority_score'],
            $calculator->calculate($busy, $resource)['priority_score'],
        );
    }

    public function test_timestamps_are_returned_as_utc_iso_strings(): void
    {
        $owner = $this->makeUser(Role::Owner);
        $user = $this->makeUser(Role::User);
        $resource = $this->makeResource($owner);
        $booking = $this->makeBooking($resource, $user);

        $this->assertSame('2026-03-02T10:00:00+00:00', $booking->start_at->toIso8601String());
        $this->assertSame('UTC', $booking->start_at->timezoneName);
    }
}
