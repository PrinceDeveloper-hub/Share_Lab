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
        ['name' => 'Hannah Bosch', 'email' => 'manager2@sharelab.test', 'role' => Role::Manager],
        ['name' => 'Dr. Ravi Menon', 'email' => 'owner2@sharelab.test', 'role' => Role::Owner],
        ['name' => 'Aiko Tanaka', 'email' => 'user3@sharelab.test', 'role' => Role::User],
        ['name' => 'Liam O\'Connor', 'email' => 'user4@sharelab.test', 'role' => Role::User],
        ['name' => 'Fatima Zahra', 'email' => 'user5@sharelab.test', 'role' => Role::User],
        ['name' => 'Diego Alvarez', 'email' => 'user6@sharelab.test', 'role' => Role::User],
        ['name' => 'Zanele Dlamini', 'email' => 'user7@sharelab.test', 'role' => Role::User],
        ['name' => 'Oliver Grant', 'email' => 'user8@sharelab.test', 'role' => Role::User],
        ['name' => 'Sofia Rossi', 'email' => 'user9@sharelab.test', 'role' => Role::User],
        ['name' => 'Kai Nakamura', 'email' => 'user10@sharelab.test', 'role' => Role::User],
        ['name' => 'Amara Bello', 'email' => 'user11@sharelab.test', 'role' => Role::User],
        ['name' => 'Jonas Weber', 'email' => 'user12@sharelab.test', 'role' => Role::User],
        ['name' => 'Nadia Haddad', 'email' => 'user13@sharelab.test', 'role' => Role::User],
        ['name' => 'Marcus Reed', 'email' => 'user14@sharelab.test', 'role' => Role::User],
        ['name' => 'Ingrid Larsen', 'email' => 'user15@sharelab.test', 'role' => Role::User],
        ['name' => 'Rafael Costa', 'email' => 'user16@sharelab.test', 'role' => Role::User],
        ['name' => 'Mei Lin', 'email' => 'user17@sharelab.test', 'role' => Role::User],
        ['name' => 'Tomas Novak', 'email' => 'user18@sharelab.test', 'role' => Role::User],
        ['name' => 'Grace Adeyemi', 'email' => 'user19@sharelab.test', 'role' => Role::User],
        ['name' => 'Hugo Martin', 'email' => 'user20@sharelab.test', 'role' => Role::User],
        ['name' => 'Leila Farouk', 'email' => 'user21@sharelab.test', 'role' => Role::User],
        ['name' => 'Owen Fletcher', 'email' => 'user22@sharelab.test', 'role' => Role::User],
        ['name' => 'Chloe Dubois', 'email' => 'user23@sharelab.test', 'role' => Role::User],
        ['name' => 'Ravi Kapoor', 'email' => 'user24@sharelab.test', 'role' => Role::User],
        ['name' => 'Erika Svensson', 'email' => 'user25@sharelab.test', 'role' => Role::User],
        ['name' => 'Daniel Mwangi', 'email' => 'user26@sharelab.test', 'role' => Role::User],
    ];

    /** Previous demo email addresses that must not survive a reseed. */
    private const LEGACY_EMAILS = [
        'user@user.com',
        'manager@slab.com',
        'owner@admin.com',
        'admin@admin.com',
    ];

    private const AVAILABILITY = [
        ['weekday' => 1, 'start' => '09:00', 'end' => '18:00'],
        ['weekday' => 2, 'start' => '09:00', 'end' => '18:00'],
        ['weekday' => 3, 'start' => '09:00', 'end' => '18:00'],
        ['weekday' => 4, 'start' => '09:00', 'end' => '18:00'],
        ['weekday' => 5, 'start' => '09:00', 'end' => '17:00'],
    ];

    private const PURPOSES = [
        'Print enclosure prototypes for the accessibility controller.',
        'Weekly project sync with two teammates.',
        'Measure noise on the sensor board before the design review.',
        'Document the fabrication lab for the open day page.',
        'Cut acrylic labels for the wayfinding prototype.',
        'Assemble the wearable sensor loom for the HCI module.',
        'Record voice-over takes for the documentary short.',
        'Rehearse the capstone demo with the full team.',
        'Calibrate probes ahead of the electronics practical.',
        'Repair the motor driver on the rover chassis.',
        'Photograph the archive collection for the digital catalogue.',
        'Book a quiet room for thesis writing and peer review.',
        'Prototype a bracket for the solar car telemetry rig.',
        'Laser-etch donor plaques for the alumni wall.',
        'Test the new firmware on the bench before release.',
        'Capture b-roll for the department recruitment film.',
        'Run a usability session with four participants.',
        'Prepare the lab for the undergraduate open evening.',
        'Check tolerance on the machined hinge samples.',
        'Solder the replacement headers on the breakout board.',
        'Shoot product stills for the design portfolio.',
        'Review the grant application with my supervisor.',
        'Validate the strain gauge readings against the model.',
        'Cut plywood blanks for the chair assembly.',
    ];

    public function run(): void
    {
<<<<<<< HEAD
        // Create accounts with password "password" for all
        $roles = ['user', 'user', 'manager', 'owner', 'admin', 'admin'];

        foreach (['user1@sharelab.test', 'user2@sharelab.test', 'manager@sharelab.test', 'owner@sharelab.test', 'admin@sharelab.test', 'admin@admin.com'] as $i => $email) {
            User::create([
                'name' => str_replace(['@sharelab.test', '@admin.com'], '', $email),
                'email' => $email,
                'password' => Hash::make('password'),
                'role' => $roles[$i],
            ]);
=======
        $this->purgeLegacyAccounts();

        $users = [];
        foreach (self::ACCOUNTS as $account) {
            $users[$account['email']] = User::query()->updateOrCreate(
                ['email' => $account['email']],
                [
                    'name' => $account['name'],
                    'password' => Hash::make(self::DEMO_PASSWORD),
                    'role' => $account['role'],
                    'email_verified_at' => now(),
                ],
            );
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
        }

        $owner = $users['owner@sharelab.test'];
        $owner2 = $users['owner2@sharelab.test'];
        $manager = $users['manager@sharelab.test'];
        $manager2 = $users['manager2@sharelab.test'];
        $user1 = $users['user1@sharelab.test'];
        $user2 = $users['user2@sharelab.test'];

        $students = array_values(array_filter(
            $users,
            static fn (User $user): bool => $user->role === Role::User,
        ));

        $resources = $this->seedResources([$owner, $owner2], [$manager, $manager2]);

        $this->seedCredentials($students, $manager);

        $now = CarbonImmutable::now()->startOfMinute();
        $bookings = $this->seedBookings($resources, $students, $manager, $now);

        $this->seedConditionReports($bookings);
        $this->seedIncidents($bookings, $manager, $students);
        $this->seedNotifications($bookings, $students, $manager, $user1);
        $this->seedShowcaseBookings($resources, $user1, $user2, $manager, $now);

        echo 'Database seeded successfully: '
            .User::query()->count().' users, '
            .Resource::query()->count().' resources, '
            .Booking::query()->count().' bookings, '
            .Notification::query()->count()." notifications.\n";
    }

    /**
     * @param  array<int, User>  $owners
     * @param  array<int, User>  $managers
     * @return array<string, resource>
     */
    private function seedResources(array $owners, array $managers): array
    {
        $catalogue = [
            [
                'name' => '3D Printer',
                'category' => 'Fabrication',
                'location' => 'Lab A · Fabrication',
                'image' => '/images/resources/3d-printer.webp',
                'max_hours_per_booking' => 2,
                'weekly_cap_hours' => 6,
                'description' => 'A calibrated resin printer for coursework prototypes, spare parts, and small research fixtures.',
                'rules' => 'Complete the 3D Printer Training module before booking. Bring your own resin unless a lab spool is listed.',
                'requirements' => [['name' => '3D Printer Training', 'requires_verification' => true]],
            ],
            [
                'name' => 'Laser Cutter',
                'category' => 'Fabrication',
                'location' => 'Fab Lab · Bay 2',
                'image' => '/images/resources/laser-cutter.webp',
                'max_hours_per_booking' => 3,
                'weekly_cap_hours' => 8,
                'description' => 'A 60W laser cutter for plywood, acrylic, and card. Manager supervision is required for first sessions.',
                'rules' => 'Only approved materials. Never leave the machine unattended while cutting.',
                'requirements' => [['name' => 'Laser Cutter Certification', 'requires_verification' => true]],
            ],
            [
                'name' => 'Oscilloscope',
                'category' => 'Electronics',
                'location' => 'Lab B · Electronics',
                'image' => '/images/resources/oscilloscope.webp',
                'max_hours_per_booking' => 3,
                'weekly_cap_hours' => 8,
                'description' => 'Four-channel digital oscilloscope with probes, signal generator, and a quiet bench for measurements.',
                'rules' => 'Probe tips must be returned to the red case. Report damaged probes before leaving.',
                'requirements' => [['name' => 'Oscilloscope Safety', 'requires_verification' => true]],
            ],
            [
                'name' => 'Soldering Station',
                'category' => 'Electronics',
                'location' => 'Lab C · Electronics',
                'image' => '/images/resources/soldering-station.webp',
                'max_hours_per_booking' => 2,
                'weekly_cap_hours' => 6,
                'description' => 'Temperature-controlled soldering station with fume extraction, helping hands, and a small component drawer.',
                'rules' => 'Safety glasses are required. Let the iron cool before returning it to the stand.',
                'requirements' => [['name' => 'Electronics Safety', 'requires_verification' => true]],
            ],
            [
                'name' => 'Camera Kit',
                'category' => 'Media',
                'location' => 'Studio A · Media',
                'image' => '/images/resources/camera-kit.webp',
                'max_hours_per_booking' => 4,
                'weekly_cap_hours' => 10,
                'description' => 'Mirrorless camera, two prime lenses, tripod, and a soft carry case for fieldwork and studio sessions.',
                'rules' => 'Lenses must be capped when moving. Do not remove the SD card without asking a manager.',
                'requirements' => [['name' => 'Camera Orientation', 'requires_verification' => true]],
            ],
            [
                'name' => 'Meeting Room 204',
                'category' => 'Study',
                'location' => 'Building 1 · Room 204',
                'image' => '/images/resources/meeting-room.webp',
                'max_hours_per_booking' => 2,
                'weekly_cap_hours' => 6,
                'description' => 'A glass-walled room for four people with a wall display, whiteboard, and room for a laptop hub.',
                'rules' => 'Maximum four people. Leave the table clear and erase the whiteboard after your session.',
                'requirements' => [['name' => 'Room Booking Etiquette', 'requires_verification' => false]],
            ],
            [
                'name' => 'Research Lab Bench',
                'category' => 'Research',
                'location' => 'Research Wing · Bench 3',
                'image' => '/images/hero/research-lab.webp',
                'max_hours_per_booking' => 5,
                'weekly_cap_hours' => 14,
                'description' => 'A supervised wet-lab bench with pipettes, a vortex mixer, and space for two researchers.',
                'rules' => 'A research induction is required. Log every sample before leaving the bench.',
                'requirements' => [['name' => 'Research Lab Induction', 'requires_verification' => true]],
            ],
            [
                'name' => 'Collaborative Studio',
                'category' => 'Study',
                'location' => 'Innovation Hub · Studio 2',
                'image' => '/images/hero/collaborative-workspace.webp',
                'max_hours_per_booking' => 3,
                'weekly_cap_hours' => 9,
                'description' => 'A flexible studio with writable walls, movable tables, and room for a six-person working session.',
                'rules' => 'Return the room to the layout board. Remove all tape and notes from the walls.',
                'requirements' => [['name' => 'Room Booking Etiquette', 'requires_verification' => false]],
            ],
            [
                'name' => 'Scientific Equipment Bay',
                'category' => 'Research',
                'location' => 'Research Wing · Equipment Bay',
                'image' => '/images/hero/scientific-equipment.webp',
                'max_hours_per_booking' => 4,
                'weekly_cap_hours' => 10,
                'description' => 'A shared bay for calibrated instruments, sample prep, and supervised measurement sessions.',
                'rules' => 'Calibration logs must be completed after every session. Do not move instruments between bays.',
                'requirements' => [['name' => 'Research Lab Induction', 'requires_verification' => true]],
            ],
            [
                'name' => 'Shared Laboratory',
                'category' => 'Research',
                'location' => 'Science Building · Lab 1',
                'image' => '/images/hero/shared-laboratory.jpg',
                'max_hours_per_booking' => 6,
                'weekly_cap_hours' => 16,
                'description' => 'A bookable teaching laboratory for group practicals, demonstrations, and equipment training.',
                'rules' => 'A demonstrator must be present. Complete the safety checklist before the session starts.',
                'requirements' => [['name' => 'Laboratory Safety', 'requires_verification' => true]],
            ],
            [
                'name' => 'Campus Research Studio',
                'category' => 'Media',
                'location' => 'Media Centre · Studio C',
                'image' => '/images/hero/campus-research.jpg',
                'max_hours_per_booking' => 5,
                'weekly_cap_hours' => 12,
                'description' => 'A research studio for interviews, recordings, and fieldwork preparation with a small editing desk.',
                'rules' => 'Charge batteries before returning the kit. Stored recordings stay on the lab drive.',
                'requirements' => [['name' => 'Camera Orientation', 'requires_verification' => true]],
            ],
        ];

        $created = [];

        foreach ($catalogue as $index => $entry) {
            $owner = $owners[$index % count($owners)];

            $resource = Resource::query()->updateOrCreate(
                ['name' => $entry['name']],
                [
                    'owner_id' => $owner->id,
                    'category' => $entry['category'],
                    'location' => $entry['location'],
                    'description' => $entry['description'],
                    'rules' => $entry['rules'],
                    'max_hours_per_booking' => $entry['max_hours_per_booking'],
                    'weekly_cap_hours' => $entry['weekly_cap_hours'],
                    'availability_windows' => self::AVAILABILITY,
                    'status' => 'active',
                    'image_path' => $entry['image'],
                ],
            );

            $resource->requirements()->delete();
            foreach ($entry['requirements'] as $requirement) {
                ResourceRequirement::query()->create([
                    'resource_id' => $resource->id,
                    ...$requirement,
                ]);
            }

            $resource->managers()->syncWithoutDetaching([$managers[$index % count($managers)]->id]);
            $created[$entry['name']] = $resource;
        }

        // Remove stale resource rows from earlier demo datasets so the
        // catalogue keeps exactly one listing (and one image) per asset.
        Resource::query()->whereNotIn('name', array_keys($created))->delete();

        return $created;
    }

    /**
     * @param  array<int, User>  $students
     */
    private function seedCredentials(array $students, User $manager): void
    {
        $requirements = [
            '3D Printer Training',
            'Laser Cutter Certification',
            'Oscilloscope Safety',
            'Electronics Safety',
            'Camera Orientation',
            'Room Booking Etiquette',
        ];

        $notes = [
            CredentialStatus::Verified->value => [
                'Verified during the lab induction.',
                'Assessment completed with the safety officer.',
                'Renewed this term after the refresher session.',
            ],
            CredentialStatus::Pending->value => [
                'Certificate uploaded, waiting for a manager review.',
                'Practical assessment booked for next week.',
                'Awaiting countersignature from the lab supervisor.',
            ],
            CredentialStatus::Rejected->value => [
                'Uploaded document was unreadable. Please submit a clearer scan.',
                'The training record has expired. Book a refresher session.',
            ],
        ];

        foreach ($students as $index => $student) {
            $count = 2 + ($index % 4);

            for ($i = 0; $i < $count; $i++) {
                $name = $requirements[($index + $i) % count($requirements)];

                // Most students are verified; a realistic minority still pending.
                $roll = ($index * 7 + $i * 3) % 10;
                $status = $roll < 6
                    ? CredentialStatus::Verified
                    : ($roll < 9 ? CredentialStatus::Pending : CredentialStatus::Rejected);

                $optionNotes = $notes[$status->value];

                UserCredential::query()->updateOrCreate(
                    ['user_id' => $student->id, 'requirement_name' => $name],
                    [
                        'status' => $status,
                        'file_path' => null,
                        'verified_by' => $status === CredentialStatus::Verified ? $manager->id : null,
                        'review_note' => $optionNotes[($index + $i) % count($optionNotes)],
                    ],
                );
            }
        }
    }

    /**
     * @param  array<string, resource>  $resources
     * @param  array<int, User>  $students
     * @return array<int, array{booking: Booking, user: User, resource: resource}>
     */
    private function seedBookings(array $resources, array $students, User $manager, CarbonImmutable $now): array
    {
        $resourceList = array_values($resources);
        $created = [];

        // Deterministic pseudo-randomness keeps a same-day reseed stable.
        mt_srand(20261029);

        $today = $now->startOfDay();

        for ($i = 0; $i < 700; $i++) {
            $resource = $resourceList[mt_rand(0, count($resourceList) - 1)];
            $student = $students[mt_rand(0, count($students) - 1)];

            $offset = mt_rand(-45, 35);
            $date = $today->addDays($offset);
            while ($date->isWeekend()) {
                $date = $date->addDay();
            }

            $hour = mt_rand(9, 15);
            $minute = [0, 15, 30, 45][mt_rand(0, 3)];
            $start = $date->setTime($hour, $minute);
            $duration = min(mt_rand(1, $resource->max_hours_per_booking), 4);
            $end = $start->addHours($duration);

            $isPast = $end->lessThan($now);
            $isLive = $start->lessThanOrEqualTo($now) && $end->greaterThan($now);

            if ($isLive) {
                $status = BookingStatus::CheckedIn;
            } elseif ($isPast) {
                $roll = mt_rand(1, 100);
                $status = match (true) {
                    $roll <= 68 => BookingStatus::Returned,
                    $roll <= 82 => BookingStatus::Rejected,
                    $roll <= 93 => BookingStatus::Cancelled,
                    default => BookingStatus::Returned,
                };
            } else {
                $roll = mt_rand(1, 100);
                $status = match (true) {
                    $roll <= 42 => BookingStatus::Pending,
                    $roll <= 84 => BookingStatus::Approved,
                    $roll <= 94 => BookingStatus::Waitlisted,
                    default => BookingStatus::Rejected,
                };
            }

            if ($resource->status === 'inactive' && in_array($status, [BookingStatus::Pending, BookingStatus::Approved, BookingStatus::Waitlisted], true)) {
                $status = BookingStatus::Cancelled;
            }

            $decisionReason = match ($status) {
                BookingStatus::Rejected => 'Eligibility requirements were not met at the time of review.',
                BookingStatus::Waitlisted => 'This slot is already held. You are on the waitlist for the next release.',
                BookingStatus::Cancelled => 'Cancelled by the requester before the session.',
                default => null,
            };

            $booking = Booking::query()->firstOrCreate(
                [
                    'resource_id' => $resource->id,
                    'user_id' => $student->id,
                    'start_at' => $start,
                ],
                [
                    'end_at' => $end,
                    'purpose' => self::PURPOSES[($i * 5) % count(self::PURPOSES)],
                    'status' => $status,
                    'decision_reason' => $decisionReason,
                    'decided_by' => in_array($status, [BookingStatus::Pending, BookingStatus::Cancelled], true) ? null : $manager->id,
                    'priority_score' => round(mt_rand(0, 400) / 100, 2),
                    'priority_explanation' => 'Ranked by recent usage and request time.',
                    'waitlist_position' => $status === BookingStatus::Waitlisted ? mt_rand(1, 4) : null,
                    'confirm_by' => $status === BookingStatus::Waitlisted ? $start->subDay() : null,
                    'is_late' => $status === BookingStatus::Returned && mt_rand(1, 100) <= 12,
                    'created_at' => $start->subDays(mt_rand(2, 9)),
                    'updated_at' => $start->subDays(1),
                ],
            );

            if ($booking->wasRecentlyCreated) {
                $this->seedTimeline($booking, $resource, $student, $manager, $status);
            }

            // Existing bookings still feed notifications and reports so a
            // reseed repairs partially seeded databases instead of skipping.
            $created[] = ['booking' => $booking, 'user' => $student, 'resource' => $resource];
        }

        return $created;
    }

    /**
     * @param  array<int, array{booking: Booking, user: User, resource: resource}>  $bookings
     */
    private function seedConditionReports(array $bookings): void
    {
        $checklists = [
            '3D Printer' => ['Printer', 'Bed', 'Filament', 'Tools'],
            'Laser' => ['Machine', 'Bed', 'Extraction', 'Materials'],
            'Oscilloscope' => ['Scope', 'Probes', 'Power lead'],
            'Soldering' => ['Iron', 'Tips', 'Extraction', 'Mat'],
            'Camera' => ['Body', 'Lenses', 'Battery', 'Case'],
            'Meeting' => ['Room', 'Display', 'Whiteboard', 'Chairs'],
        ];

        foreach ($bookings as ['booking' => $booking, 'user' => $user, 'resource' => $resource]) {
            if (! in_array($booking->status, [BookingStatus::Returned, BookingStatus::CheckedIn], true)) {
                continue;
            }

            $prefix = str_starts_with($resource->name, '3D Printer')
                ? '3D Printer'
                : (str_starts_with($resource->name, 'Laser') ? 'Laser'
                : (str_starts_with($resource->name, 'Oscilloscope') ? 'Oscilloscope'
                : (str_starts_with($resource->name, 'Soldering') ? 'Soldering'
                : (str_starts_with($resource->name, 'Camera') ? 'Camera' : 'Meeting'))));

            ConditionReport::query()->firstOrCreate(
                ['booking_id' => $booking->id, 'type' => ConditionType::CheckIn->value],
                [
                    'condition' => 'good',
                    'notes' => 'Checked in at the bench with the manager on duty.',
                    'checklist' => $checklists[$prefix],
                    'reported_by' => $user->id,
                ],
            );

            if ($booking->status === BookingStatus::Returned) {
                ConditionReport::query()->firstOrCreate(
                    ['booking_id' => $booking->id, 'type' => ConditionType::Return->value],
                    [
                        'condition' => mt_rand(1, 10) === 1 ? 'fair' : 'excellent',
                        'notes' => 'Items returned to the correct bay. Everything accounted for.',
                        'checklist' => $checklists[$prefix],
                        'reported_by' => $user->id,
                    ],
                );
            }
        }
    }

    /**
     * @param  array<int, array{booking: Booking, user: User, resource: resource}>  $bookings
     * @param  array<int, User>  $students
     */
    private function seedIncidents(array $bookings, User $manager, array $students): void
    {
        $descriptions = [
            'damage' => [
                'Lens hood arrived with a hairline crack along the thread.',
                'A probe tip was bent on return and needs replacing.',
                'The acrylic guard on the laser bed has a deep score mark.',
            ],
            'delay' => [
                'The previous session overran by twenty minutes, delaying handover.',
                'Return was late because the lab technician was unavailable.',
            ],
            'other' => [
                'The room display would not wake from standby during the session.',
                'Filament spool was nearly empty and not flagged in the log.',
                'Fume extraction was noticeably weaker than usual.',
            ],
        ];

        $typeKeys = array_keys($descriptions);
        $index = 0;

        foreach ($bookings as ['booking' => $booking, 'user' => $user]) {
            if ($booking->status !== BookingStatus::Returned || $index >= 22) {
                continue;
            }

            if (($index * 3) % 4 !== 0) {
                $index++;

                continue;
            }

            $type = $typeKeys[$index % count($typeKeys)];
            $options = $descriptions[$type];
            $status = $index % 3 === 0 ? IncidentStatus::Open : IncidentStatus::Resolved;

            Incident::query()->firstOrCreate(
                ['booking_id' => $booking->id, 'description' => $options[$index % count($options)]],
                [
                    'reported_by' => $user->id,
                    'type' => $type,
                    'status' => $status,
                    'suggested_by_system' => $index % 5 === 0,
                    'confirmed_by' => $status === IncidentStatus::Resolved ? $manager->id : null,
                    'resolved_by' => $status === IncidentStatus::Resolved ? $manager->id : null,
                    'resolution_note' => $status === IncidentStatus::Resolved
                        ? 'Reviewed with the lab technician and a replacement was ordered.'
                        : null,
                ],
            );

            $index++;
        }
    }

    /**
     * @param  array<int, array{booking: Booking, user: User, resource: resource}>  $bookings
     * @param  array<int, User>  $students
     */
    private function seedNotifications(array $bookings, array $students, User $manager, User $fallbackUser): void
    {
        $byUser = [];

        foreach ($bookings as $entry) {
            $byUser[$entry['user']->id][] = $entry;
        }

        $messages = [
            BookingStatus::Pending->value => ['Booking requested', 'Your request for %s is waiting for a manager decision.'],
            BookingStatus::Approved->value => ['Booking approved', 'Your booking for %s is confirmed. Check-in opens 15 minutes before the start.'],
            BookingStatus::Waitlisted->value => ['Added to waitlist', 'Your request for %s is waitlisted. We will notify you if the slot opens.'],
            BookingStatus::Rejected->value => ['Booking declined', 'Your request for %s was declined. Review the reason and your eligibility.'],
            BookingStatus::CheckedIn->value => ['Checked in', 'You are checked in to %s. Remember to complete the return checklist.'],
            BookingStatus::Returned->value => ['Return recorded', 'Your session with %s is complete and the return report is on file.'],
            BookingStatus::Cancelled->value => ['Booking cancelled', 'Your request for %s was cancelled. No further action is needed.'],
        ];

        foreach ($students as $student) {
            $entries = $byUser[$student->id] ?? [];

            if ($entries === []) {
                Notification::query()->firstOrCreate(
                    ['user_id' => $student->id, 'type' => 'welcome', 'message' => 'Welcome to ShareLab. Browse the catalogue to request your first resource.'],
                    ['read' => true],
                );

                continue;
            }

            // Three most recent records per student keeps inboxes realistic.
            usort($entries, static fn (array $a, array $b): int => $b['booking']->created_at <=> $a['booking']->created_at);

            foreach (array_slice($entries, 0, 5) as $position => $entry) {
                $status = $entry['booking']->status->value;
                [$type, $template] = $messages[$status] ?? ['Update', 'There is an update on your booking for %s.'];

                Notification::query()->firstOrCreate(
                    [
                        'user_id' => $student->id,
                        'type' => strtolower(str_replace(' ', '_', $type)),
                        'message' => sprintf($template, $entry['resource']->name),
                    ],
                    [
                        'booking_id' => $entry['booking']->id,
                        'read' => $position > 0,
                    ],
                );
            }
        }

        // A few manager-facing notices so the manager inbox is not empty.
        Notification::query()->firstOrCreate(
            ['user_id' => $manager->id, 'type' => 'credential_needs_review', 'message' => 'New safety certificates are waiting for review in the credential queue.'],
            ['read' => false],
        );

        // Keep the documented primary demo account rich even if it drew few bookings.
        Notification::query()->firstOrCreate(
            ['user_id' => $fallbackUser->id, 'type' => 'credential_reminder', 'message' => 'Your Laser Cutter Certification is still pending manager review.'],
            ['read' => false],
        );
    }

    /**
     * The documented accounts always receive a predictable showcase of states
     * so a fresh login to user1 shows pending, approved, waitlisted and history.
     *
     * @param  array<string, resource>  $resources
     */
    private function seedShowcaseBookings(array $resources, User $user1, User $user2, User $manager, CarbonImmutable $now): void
    {
        $showcase = [
            [
                'resource' => $resources['3D Printer'] ?? null,
                'user' => $user1,
                'start' => $now->addDay()->setTime(10, 0),
                'hours' => 2,
                'purpose' => 'Print enclosure prototypes for the accessibility controller.',
                'status' => BookingStatus::Pending,
            ],
            [
                'resource' => $resources['Meeting Room 204'] ?? null,
                'user' => $user1,
                'start' => $now->addDays(2)->setTime(14, 0),
                'hours' => 2,
                'purpose' => 'Weekly project sync with two teammates.',
                'status' => BookingStatus::Approved,
            ],
            [
                'resource' => $resources['Camera Kit'] ?? null,
                'user' => $user1,
                'start' => $now->addDays(3)->setTime(10, 0),
                'hours' => 4,
                'purpose' => 'Document the fabrication lab for the open day page.',
                'status' => BookingStatus::Waitlisted,
                'waitlist_position' => 1,
                'decision_reason' => 'Another camera booking holds this slot. You are waitlisted #1.',
            ],
            [
                'resource' => $resources['Oscilloscope'] ?? null,
                'user' => $user2,
                'start' => $now->subHour(),
                'hours' => 3,
                'purpose' => 'Measure noise on the sensor board.',
                'status' => BookingStatus::CheckedIn,
            ],
            [
                'resource' => $resources['Camera Kit'] ?? null,
                'user' => $user2,
                'start' => $now->subDays(2)->setTime(10, 0),
                'hours' => 4,
                'purpose' => 'Portrait session for the student magazine.',
                'status' => BookingStatus::Returned,
            ],
            [
                'resource' => $resources['Laser Cutter'] ?? null,
                'user' => $user2,
                'start' => $now->addDays(4)->setTime(13, 0),
                'hours' => 3,
                'purpose' => 'Cut acrylic labels for the wayfinding prototype.',
                'status' => BookingStatus::Rejected,
                'decision_reason' => 'Laser Cutter Certification is still pending. Submit your certificate and request this slot again.',
            ],
        ];

        foreach ($showcase as $seed) {
            $resource = $seed['resource'];

            if (! $resource) {
                continue;
            }

            $start = $seed['start'];
            $end = $start->addHours($seed['hours']);

            $booking = Booking::query()->firstOrCreate(
                [
                    'resource_id' => $resource->id,
                    'user_id' => $seed['user']->id,
                    'start_at' => $start,
                ],
                [
                    'end_at' => $end,
                    'purpose' => $seed['purpose'],
                    'status' => $seed['status'],
                    'waitlist_position' => $seed['waitlist_position'] ?? null,
                    'decision_reason' => $seed['decision_reason'] ?? null,
                    'decided_by' => in_array($seed['status'], [BookingStatus::Pending], true) ? null : $manager->id,
                    'priority_score' => 0,
                    'priority_explanation' => 'Ranked by recent usage: 0.0 hours in the last 30 days. Earlier requests break ties.',
                ],
            );

            $this->seedTimeline($booking, $resource, $seed['user'], $manager, $seed['status']);
        }
    }

    /**
     * Remove the earlier demo accounts (and their dependent records) so a
     * reseed leaves exactly the documented accounts behind. Documents,
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

        if (in_array($status, [BookingStatus::Rejected, BookingStatus::Cancelled], true)) {
            AuditLog::query()->firstOrCreate(
                ['booking_id' => $booking->id, 'action' => $status === BookingStatus::Cancelled ? 'booking_cancelled' : 'booking_rejected'],
                [
                    'actor_id' => $status === BookingStatus::Cancelled ? $user->id : $manager->id,
                    'subject_type' => Booking::class,
                    'subject_id' => $booking->id,
                    'reason' => $booking->decision_reason,
                    'meta' => ['from' => 'pending', 'to' => $status->value, 'owner_override' => false],
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
                    'meta' => ['condition' => 'good', 'is_late' => $booking->is_late],
                ],
            );
        }
    }
}
