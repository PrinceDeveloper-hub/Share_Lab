<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Resource;
use App\Models\ResourceRequirement;
use App\Models\UserCredential;
use App\Models\Booking;
use App\Enums\CredentialStatus;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application database.
     */
    public function run(): void
    {
        // Create accounts with password "password" for all
        $roles = ['user', 'user', 'manager', 'owner', 'admin'];

        foreach (['user1@sharelab.test', 'user2@sharelab.test', 'manager@sharelab.test', 'owner@sharelab.test', 'admin@sharelab.test'] as $i => $email) {
            User::create([
                'name' => str_replace(['@sharelab.test'], '', $email),
                'email' => $email,
                'password' => Hash::make('password'),
                'role' => $roles[$i],
            ]);
        }

        // Create six resources with requirements and caps
        $resourcesData = [
            [
                'name' => '3D Printer',
                'category' => '3D Printing',
                'location' => 'Lab A',
                'description' => '3D printing facility',
                'rules' => 'Must have completed 3D Printer Training',
                'max_hours_per_booking' => 2,
                'weekly_cap_hours' => 6,
            ],
            [
                'name' => 'Oscilloscope',
                'category' => 'Test Equipment',
                'location' => 'Lab B',
                'description' => 'Digital oscilloscope',
                'rules' => 'Must have completed Oscilloscope Safety Training',
                'max_hours_per_booking' => 3,
                'weekly_cap_hours' => 8,
            ],
            [
                'name' => 'Camera Kit',
                'category' => 'Photography',
                'location' => 'Studio A',
                'description' => 'Professional camera kit',
                'rules' => 'Must have completed Camera Orientation',
                'max_hours_per_booking' => 4,
                'weekly_cap_hours' => 10,
            ],
            [
                'name' => 'Meeting Room',
                'category' => 'Study',
                'location' => 'Building 1',
                'description' => 'Meeting room for group study',
                'rules' => 'Maximum 4 people',
                'max_hours_per_booking' => 2,
                'weekly_cap_hours' => 6,
            ],
            [
                'name' => 'Laser Cutter',
                'category' => 'Fabrication',
                'location' => 'Fab Lab',
                'description' => 'Industrial laser cutter',
                'rules' => 'Must have completed Laser Cutter Certification',
                'max_hours_per_booking' => 3,
                'weekly_cap_hours' => 8,
            ],
            [
                'name' => 'Soldering Station',
                'category' => 'Electronics',
                'location' => 'Lab C',
                'description' => 'Soldering equipment',
                'rules' => 'Must have completed Electronics Safety',
                'max_hours_per_booking' => 2,
                'weekly_cap_hours' => 6,
            ],
        ];

        $resources = [];
        foreach ($resourcesData as $index => $data) {
            $resource = Resource::create([
                'owner_id' => 4, // owner@sharelab.test
                'name' => $data['name'],
                'category' => $data['category'],
                'location' => $data['location'],
                'description' => $data['description'],
                'rules' => $data['rules'],
                'max_hours_per_booking' => $data['max_hours_per_booking'],
                'weekly_cap_hours' => $data['weekly_cap_hours'],
                'status' => 'active',
            ]);

            // Add requirements
            if ($index === 0) { // 3D Printer
                ResourceRequirement::create([
                    'resource_id' => $resource->id,
                    'name' => '3D Printer Training',
                    'requires_verification' => true,
                ]);
            } elseif ($index === 3) { // Meeting Room
                ResourceRequirement::create([
                    'resource_id' => $resource->id,
                    'name' => 'Room Booking Etiquette',
                    'requires_verification' => false,
                ]);
            }

            $resources[] = $resource;
        }

        // Assign manager to all resources (manager@sharelab.test = user ID 3)
        $manager = User::where('email', 'manager@sharelab.test')->first();
        foreach ($resources as $resource) {
            $resource->managers()->attach($manager->id);
        }

        // Create requirements for resources that need them
        // 3D Printer Training already created above
        // Add requirement for Oscilloscope
        $oscilloscope = Resource::where('name', 'Oscilloscope')->first();
        if ($oscilloscope) {
            ResourceRequirement::create([
                'resource_id' => $oscilloscope->id,
                'name' => 'Oscilloscope Safety',
                'requires_verification' => true,
            ]);
        }

        // Add requirement for Camera Kit
        $cameraKit = Resource::where('name', 'Camera Kit')->first();
        if ($cameraKit) {
            ResourceRequirement::create([
                'resource_id' => $cameraKit->id,
                'name' => 'Camera Orientation',
                'requires_verification' => true,
            ]);
        }

        // Add requirement for Laser Cutter
        $laserCutter = Resource::where('name', 'Laser Cutter')->first();
        if ($laserCutter) {
            ResourceRequirement::create([
                'resource_id' => $laserCutter->id,
                'name' => 'Laser Cutter Certification',
                'requires_verification' => true,
            ]);
        }

        // Add requirement for Soldering Station
        $solderingStation = Resource::where('name', 'Soldering Station')->first();
        if ($solderingStation) {
            ResourceRequirement::create([
                'resource_id' => $solderingStation->id,
                'name' => 'Electronics Safety',
                'requires_verification' => true,
            ]);
        }

        // Create sample credentials
        // User2 has one pre-verified credential
        $user2 = User::where('email', 'user2@sharelab.test')->first();
        $user1 = User::where('email', 'user1@sharelab.test')->first();

        // User2: verified credential for 3D Printer Training
        $credential2 = UserCredential::create([
            'user_id' => $user2->id,
            'requirement_name' => '3D Printer Training',
            'status' => CredentialStatus::Verified,
            'file_path' => null,
            'verified_by' => 4, // owner@sharelab.test
            'review_note' => 'Verified during onboarding',
        ]);

        // User1: no verified credentials (pending state)
        // No credential created for user1's 3D Printer Training - they need to submit one

        // Create sample bookings
        // User1 bookings: various statuses
        $user1Resource = Resource::where('name', '3D Printer')->first();

        // Pending booking for user1
        Booking::create([
            'resource_id' => $user1Resource->id,
            'user_id' => $user1->id,
            'start_at' => now()->addDay(1)->format('Y-m-d H:i:s'),
            'end_at' => now()->addDay(1)->addHours(2)->format('Y-m-d H:i:s'),
            'purpose' => 'Test printing',
            'status' => 'pending',
        ]);

        // Waitlisted booking for user1
        Booking::create([
            'resource_id' => $user1Resource->id,
            'user_id' => $user1->id,
            'start_at' => now()->addDay(2)->format('Y-m-d H:i:s'),
            'end_at' => now()->addDay(2)->addHours(2)->format('Y-m-d H:i:s'),
            'purpose' => 'Another test print',
            'status' => 'waitlisted',
            'waitlist_position' => 1,
        ]);

        // User2 bookings
        $user2Resource = Resource::where('name', 'Oscilloscope')->first();

        // Approved booking for user2
        Booking::create([
            'resource_id' => $user2Resource->id,
            'user_id' => $user2->id,
            'start_at' => now()->addDay(3)->format('Y-m-d H:i:s'),
            'end_at' => now()->addDay(3)->addHours(2)->format('Y-m-d H:i:s'),
            'purpose' => 'Oscilloscope analysis',
            'status' => 'approved',
        ]);

        // Checked-in booking for user2
        Booking::create([
            'resource_id' => $user2Resource->id,
            'user_id' => $user2->id,
            'start_at' => now()->addDay(4)->format('Y-m-d H:i:s'),
            'end_at' => now()->addDay(4)->addHours(2)->format('Y-m-d H:i:s'),
            'purpose' => 'Oscilloscope measurements',
            'status' => 'checked_in',
        ]);

        // User1 resource bookings
        $cameraResource = Resource::where('name', 'Camera Kit')->first();
        if ($cameraResource) {
            // Returned booking for user1
            Booking::create([
                'resource_id' => $cameraResource->id,
                'user_id' => $user1->id,
                'start_at' => now()->addDay(5)->format('Y-m-d H:i:s'),
                'end_at' => now()->addDay(5)->addHours(4)->format('Y-m-d H:i:s'),
                'purpose' => 'Photo shoot',
                'status' => 'returned',
            ]);
        }

        // Audit log entries will be created automatically by the service classes

        echo "Database seeded successfully.\n";
    }
}