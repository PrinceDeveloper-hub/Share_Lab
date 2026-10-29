<?php

namespace Database\Seeders;

use App\Enums\BookingStatus;
use App\Enums\ConditionType;
use App\Enums\CredentialStatus;
use App\Enums\IncidentStatus;
use App\Enums\Role;
use App\Models\AuditLog;
use App\Models\Booking;
use App\Models\ConditionReport;
use App\Models\Incident;
use App\Models\Notification;
use App\Models\Resource;
use App\Models\ResourceRequirement;
use App\Models\User;
use App\Models\UserCredential;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Demo accounts kept in the application. Every account uses the password
     * "password" for local and demo use only.
     */
    private const DEMO_PASSWORD = 'password';

    private const ACCOUNTS = [
        ['name' => 'Maya Chen', 'email' => 'user1@sharelab.test', 'role' => Role::User],
        ['name' => 'Noah Patel', 'email' => 'user2@sharelab.test', 'role' => Role::User],
        ['name' => 'Priya Raman', 'email' => 'manager@sharelab.test', 'role' => Role::Manager],
        ['name' => 'Elena Ortiz', 'email' => 'owner@sharelab.test', 'role' => Role::Owner],
        ['name' => 'Sam Okafor', 'email' => 'admin@sharelab.test', 'role' => Role::Admin],
    ];

    /** Previous demo email addresses that must not survive a reseed. */
    private const LEGACY_EMAILS = [
        'user@user.com',
        'manager@slab.com',
        'owner@admin.com',
        'admin@admin.com',
    ];

    public function run(): void
    {
        $this->purgeLegacyAccounts();

        $accounts = self::ACCOUNTS;

        $users = [];
        foreach ($accounts as $account) {
            $users[$account['email']] = User::query()->updateOrCreate(
                ['email' => $account['email']],
                [
                    'name' => $account['name'],
                    'password' => Hash::make(self::DEMO_PASSWORD),
                    'role' => $account['role'],
                ],
            );
        }

        $owner = $users['owner@sharelab.test'];
        $manager = $users['manager@sharelab.test'];
        $user1 = $users['user1@sharelab.test'];
        $user2 = $users['user2@sharelab.test'];

        $resourcesData = [
            [
                'name' => '3D Printer',
                'category' => 'Fabrication',
                'location' => 'Lab A · Fabrication',
                'description' => 'A calibrated resin printer for coursework prototypes, spare parts, and small research fixtures.',
                'rules' => 'Complete the 3D Printer Training module before booking. Bring your own resin unless a lab spool is listed.',
                'max_hours_per_booking' => 2,
                'weekly_cap_hours' => 6,
                'image_path' => '/images/resources/3d-printer.webp',
                'requirements' => [['name' => '3D Printer Training', 'requires_verification' => true]],
            ],
            [
                'name' => 'Oscilloscope',
                'category' => 'Electronics',
                'location' => 'Lab B · Electronics',
                'description' => 'Four-channel digital oscilloscope with probes, signal generator, and a quiet bench for measurements.',
                'rules' => 'Probe tips must be returned to the red case. Report damaged probes before leaving.',
                'max_hours_per_booking' => 3,
                'weekly_cap_hours' => 8,
                'image_path' => '/images/resources/oscilloscope.webp',
                'requirements' => [['name' => 'Oscilloscope Safety', 'requires_verification' => true]],
            ],
            [
                'name' => 'Camera Kit',
                'category' => 'Media',
                'location' => 'Studio A · Media',
                'description' => 'Mirrorless camera, two prime lenses, tripod, and a soft carry case for fieldwork and studio sessions.',
                'rules' => 'Lenses must be capped when moving. Do not remove the SD card without asking a manager.',
                'max_hours_per_booking' => 4,
                'weekly_cap_hours' => 10,
                'image_path' => '/images/resources/camera-kit.webp',
                'requirements' => [['name' => 'Camera Orientation', 'requires_verification' => true]],
            ],
            [
                'name' => 'Meeting Room',
                'category' => 'Study',
                'location' => 'Building 1 · Room 204',
                'description' => 'A glass-walled room for four people with a wall display, whiteboard, and room for a laptop hub.',
                'rules' => 'Maximum four people. Leave the table clear and erase the whiteboard after your session.',
                'max_hours_per_booking' => 2,
                'weekly_cap_hours' => 6,
                'image_path' => '/images/resources/meeting-room.webp',
                'requirements' => [['name' => 'Room Booking Etiquette', 'requires_verification' => false]],
            ],
            [
                'name' => 'Laser Cutter',
                'category' => 'Fabrication',
                'location' => 'Fab Lab · Bay 2',
                'description' => 'A 60W laser cutter for plywood, acrylic, and card. Manager supervision is required for first sessions.',
                'rules' => 'Only approved materials. Never leave the machine unattended while cutting.',
                'max_hours_per_booking' => 3,
                'weekly_cap_hours' => 8,
                'image_path' => '/images/resources/laser-cutter.webp',
                'requirements' => [['name' => 'Laser Cutter Certification', 'requires_verification' => true]],
            ],
            [
                'name' => 'Soldering Station',
                'category' => 'Electronics',
                'location' => 'Lab C · Electronics',
                'description' => 'Temperature-controlled soldering station with fume extraction, helping hands, and a small component drawer.',
                'rules' => 'Safety glasses are required. Let the iron cool before returning it to the stand.',
                'max_hours_per_booking' => 2,
                'weekly_cap_hours' => 6,
                'image_path' => '/images/resources/soldering-station.webp',
                'requirements' => [['name' => 'Electronics Safety', 'requires_verification' => true]],
            ],
        ];

        $resources = [];
        foreach ($resourcesData as $data) {
            $resource = Resource::query()->firstOrCreate(
                ['name' => $data['name']],
                [
                    'owner_id' => $owner->id,
                    'category' => $data['category'],
                    'location' => $data['location'],
                    'description' => $data['description'],
                    'rules' => $data['rules'],
                    'max_hours_per_booking' => $data['max_hours_per_booking'],
                    'weekly_cap_hours' => $data['weekly_cap_hours'],
                    'availability_windows' => [
                        ['weekday' => 1, 'start' => '09:00', 'end' => '17:00'],
                        ['weekday' => 2, 'start' => '09:00', 'end' => '17:00'],
                        ['weekday' => 3, 'start' => '09:00', 'end' => '17:00'],
                        ['weekday' => 4, 'start' => '09:00', 'end' => '17:00'],
                        ['weekday' => 5, 'start' => '09:00', 'end' => '17:00'],
                    ],
                    'status' => 'active',
                    'image_path' => $data['image_path'],
                ],
            );

            $resource->forceFill([
                'owner_id' => $owner->id,
                'description' => $data['description'],
                'rules' => $data['rules'],
                'availability_windows' => [
                    ['weekday' => 1, 'start' => '09:00', 'end' => '17:00'],
                    ['weekday' => 2, 'start' => '09:00', 'end' => '17:00'],
                    ['weekday' => 3, 'start' => '09:00', 'end' => '17:00'],
                    ['weekday' => 4, 'start' => '09:00', 'end' => '17:00'],
                    ['weekday' => 5, 'start' => '09:00', 'end' => '17:00'],
                ],
                'image_path' => $data['image_path'],
            ])->save();

            $resource->requirements()->delete();
            foreach ($data['requirements'] as $requirement) {
                ResourceRequirement::query()->create([
                    'resource_id' => $resource->id,
                    ...$requirement,
                ]);
            }

            $resource->managers()->syncWithoutDetaching([$manager->id]);
            $resources[$data['name']] = $resource;
        }

        $credentials = [
            [$user1, 'Laser Cutter Certification', CredentialStatus::Pending, null],
            [$user1, 'Camera Orientation', CredentialStatus::Verified, 'Orientation completed last term.'],
            [$user2, '3D Printer Training', CredentialStatus::Verified, 'Verified during lab induction.'],
            [$user2, 'Oscilloscope Safety', CredentialStatus::Verified, 'Safety check completed.'],
        ];

        foreach ($credentials as [$credentialUser, $name, $status, $note]) {
            UserCredential::query()->updateOrCreate(
                ['user_id' => $credentialUser->id, 'requirement_name' => $name],
                [
                    'status' => $status,
                    'file_path' => null,
                    'verified_by' => $status === CredentialStatus::Verified ? $owner->id : null,
                    'review_note' => $note,
                ],
            );
        }

        $now = CarbonImmutable::now()->startOfMinute();
        $tomorrow = $now->addDay()->setTime(10, 0);
        $later = $now->addDays(2)->setTime(14, 0);
        $cameraDay = $now->addDays(3)->setTime(10, 0);
        $todayStart = $now->subHour();

        $bookingSeeds = [
            [
                'resource' => $resources['3D Printer'],
                'user' => $user1,
                'start' => $tomorrow,
                'end' => $tomorrow->addHours(2),
                'purpose' => 'Print enclosure prototypes for the accessibility controller.',
                'status' => BookingStatus::Pending,
            ],
            [
                'resource' => $resources['Meeting Room'],
                'user' => $user1,
                'start' => $later,
                'end' => $later->addHours(2),
                'purpose' => 'Weekly project sync with two teammates.',
                'status' => BookingStatus::Approved,
            ],
            [
                'resource' => $resources['Camera Kit'],
                'user' => $user1,
                'start' => $cameraDay,
                'end' => $cameraDay->addHours(4),
                'purpose' => 'Document the fabrication lab for the open day page.',
                'status' => BookingStatus::Waitlisted,
                'waitlist_position' => 1,
                'decision_reason' => 'Another camera booking holds this slot. You are waitlisted #1.',
            ],
            [
                'resource' => $resources['Oscilloscope'],
                'user' => $user2,
                'start' => $todayStart,
                'end' => $now->addHours(2),
                'purpose' => 'Measure noise on the sensor board.',
                'status' => BookingStatus::CheckedIn,
            ],
            [
                'resource' => $resources['Camera Kit'],
                'user' => $user2,
                'start' => $now->subDays(2)->setTime(10, 0),
                'end' => $now->subDays(2)->setTime(14, 0),
                'purpose' => 'Portrait session for the student magazine.',
                'status' => BookingStatus::Returned,
            ],
            [
                'resource' => $resources['Laser Cutter'],
                'user' => $user2,
                'start' => $now->addDays(4)->setTime(13, 0),
                'end' => $now->addDays(4)->setTime(16, 0),
                'purpose' => 'Cut acrylic labels for the wayfinding prototype.',
                'status' => BookingStatus::Rejected,
                'decision_reason' => 'Laser Cutter Certification is still pending. Submit your certificate and request this slot again.',
            ],
        ];

        foreach ($bookingSeeds as $seed) {
            $booking = Booking::query()->firstOrCreate(
                [
                    'resource_id' => $seed['resource']->id,
                    'user_id' => $seed['user']->id,
                    'start_at' => $seed['start'],
                ],
                [
                    'end_at' => $seed['end'],
                    'purpose' => $seed['purpose'],
                    'status' => $seed['status'],
                    'waitlist_position' => $seed['waitlist_position'] ?? null,
                    'decision_reason' => $seed['decision_reason'] ?? null,
                    'priority_score' => 0,
                    'priority_explanation' => 'Ranked by recent usage: 0.0 hours in the last 30 days. Earlier requests break ties.',
                ],
            );

            $this->seedTimeline($booking, $seed['resource'], $seed['user'], $manager, $seed['status']);
        }

        $returned = Booking::query()
            ->where('resource_id', $resources['Camera Kit']->id)
            ->where('user_id', $user2->id)
            ->where('status', BookingStatus::Returned->value)
            ->first();

        if ($returned) {
            ConditionReport::query()->firstOrCreate(
                ['booking_id' => $returned->id, 'type' => ConditionType::CheckIn->value],
                [
                    'condition' => 'excellent',
                    'notes' => 'All caps present and battery charged.',
                    'checklist' => ['Body', 'Lenses', 'Battery', 'Case'],
                    'reported_by' => $user2->id,
                ],
            );

            ConditionReport::query()->firstOrCreate(
                ['booking_id' => $returned->id, 'type' => ConditionType::Return->value],
                [
                    'condition' => 'good',
                    'notes' => 'Light wear on the lens hood. Everything returned in the case.',
                    'checklist' => ['Body', 'Lenses', 'Battery', 'Case'],
                    'reported_by' => $user2->id,
                ],
            );
        }

        $checkedIn = Booking::query()
            ->where('resource_id', $resources['Oscilloscope']->id)
            ->where('user_id', $user2->id)
            ->where('status', BookingStatus::CheckedIn->value)
            ->first();

        if ($checkedIn) {
            ConditionReport::query()->firstOrCreate(
                ['booking_id' => $checkedIn->id, 'type' => ConditionType::CheckIn->value],
                [
                    'condition' => 'good',
                    'notes' => 'Bench powered on and probes accounted for.',
                    'checklist' => ['Scope', 'Probes', 'Power lead'],
                    'reported_by' => $user2->id,
                ],
            );
        }

        Notification::query()->firstOrCreate(
            ['user_id' => $user1->id, 'type' => 'credential_needs_review', 'message' => 'Your Laser Cutter Certification is waiting for manager review.'],
            ['read' => false],
        );

        Notification::query()->firstOrCreate(
            ['user_id' => $user1->id, 'type' => 'booking_requested', 'message' => 'Your 3D Printer request was submitted.'],
            ['read' => false],
        );

        echo "Database seeded successfully.\n";
    }

    /**
     * Remove the earlier demo accounts (and their dependent records) so a
     * reseed leaves exactly the four documented accounts behind. Documents,
     * audit actors and reviewer links are nulled first because those foreign
     * keys do not cascade.
     */
    private function purgeLegacyAccounts(): void
    {
        $legacyIds = User::query()
            ->whereIn('email', self::LEGACY_EMAILS)
            ->pluck('id')
            ->all();

        if ($legacyIds === []) {
            return;
        }

        DB::transaction(function () use ($legacyIds): void {
            DB::table('audit_logs')->whereIn('actor_id', $legacyIds)->update(['actor_id' => null]);
            DB::table('condition_reports')->whereIn('reported_by', $legacyIds)->update(['reported_by' => null]);
            DB::table('incidents')->whereIn('reported_by', $legacyIds)->update(['reported_by' => null]);
            DB::table('incidents')->whereIn('confirmed_by', $legacyIds)->update(['confirmed_by' => null]);
            DB::table('incidents')->whereIn('resolved_by', $legacyIds)->update(['resolved_by' => null]);
            DB::table('bookings')->whereIn('decided_by', $legacyIds)->update(['decided_by' => null]);
            DB::table('user_credentials')->whereIn('verified_by', $legacyIds)->update(['verified_by' => null]);

            // Owned resources and personal bookings cascade their children.
            Resource::query()->whereIn('owner_id', $legacyIds)->delete();
            Booking::query()->whereIn('user_id', $legacyIds)->delete();

            User::query()->whereIn('id', $legacyIds)->delete();
        });
    }

    private function seedTimeline(Booking $booking, Resource $resource, User $user, User $manager, BookingStatus $status): void
    {
        AuditLog::query()->firstOrCreate(
            ['booking_id' => $booking->id, 'action' => 'booking_requested'],
            [
                'actor_id' => $user->id,
                'subject_type' => Booking::class,
                'subject_id' => $booking->id,
                'reason' => $booking->decision_reason,
                'meta' => [
                    'resource_id' => $resource->id,
                    'start_at' => $booking->start_at->toIso8601String(),
                    'end_at' => $booking->end_at->toIso8601String(),
                    'status' => $status->value,
                    'purpose' => $booking->purpose,
                ],
                'created_at' => $booking->created_at,
            ],
        );

        if (in_array($status, [BookingStatus::Approved, BookingStatus::CheckedIn, BookingStatus::Returned], true)) {
            AuditLog::query()->firstOrCreate(
                ['booking_id' => $booking->id, 'action' => 'booking_approved'],
                [
                    'actor_id' => $manager->id,
                    'subject_type' => Booking::class,
                    'subject_id' => $booking->id,
                    'reason' => 'Eligible request and the slot was free.',
                    'meta' => ['from' => 'pending', 'to' => 'approved', 'owner_override' => false],
                ],
            );
        }

        if ($status === BookingStatus::Waitlisted) {
            AuditLog::query()->firstOrCreate(
                ['booking_id' => $booking->id, 'action' => 'booking_waitlisted'],
                [
                    'actor_id' => $manager->id,
                    'subject_type' => Booking::class,
                    'subject_id' => $booking->id,
                    'reason' => $booking->decision_reason,
                    'meta' => ['from' => 'pending', 'to' => 'waitlisted', 'owner_override' => false],
                ],
            );
        }

        if ($status === BookingStatus::Rejected) {
            AuditLog::query()->firstOrCreate(
                ['booking_id' => $booking->id, 'action' => 'booking_rejected'],
                [
                    'actor_id' => $manager->id,
                    'subject_type' => Booking::class,
                    'subject_id' => $booking->id,
                    'reason' => $booking->decision_reason,
                    'meta' => ['from' => 'pending', 'to' => 'rejected', 'owner_override' => false],
                ],
            );
        }

        if (in_array($status, [BookingStatus::CheckedIn, BookingStatus::Returned], true)) {
            AuditLog::query()->firstOrCreate(
                ['booking_id' => $booking->id, 'action' => 'checked_in'],
                [
                    'actor_id' => $user->id,
                    'subject_type' => Booking::class,
                    'subject_id' => $booking->id,
                    'reason' => 'Check-in completed.',
                    'meta' => ['condition' => 'good'],
                ],
            );
        }

        if ($status === BookingStatus::Returned) {
            AuditLog::query()->firstOrCreate(
                ['booking_id' => $booking->id, 'action' => 'returned'],
                [
                    'actor_id' => $user->id,
                    'subject_type' => Booking::class,
                    'subject_id' => $booking->id,
                    'reason' => 'Items returned.',
                    'meta' => ['condition' => 'good', 'is_late' => false],
                ],
            );
        }
    }
}
