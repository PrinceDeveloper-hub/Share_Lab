<?php

namespace Tests\Feature;

use App\Enums\CredentialStatus;
use App\Enums\Role;
use App\Models\ResourceRequirement;
use App\Models\User;
use App\Models\UserCredential;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Tests\Concerns\DomainFixtures;
use Tests\TestCase;

class CredentialFeaturesTest extends TestCase
{
    use DomainFixtures;
    use RefreshDatabase;

    private User $user;

    private User $manager;

    private User $owner;

    private \App\Models\Resource $resource;

    protected function setUp(): void
    {
        parent::setUp();
        CarbonImmutable::setTestNow('2026-03-02 09:00:00');
        Storage::fake('local');

        $this->owner = $this->makeUser(Role::Owner);
        $this->manager = $this->makeUser(Role::Manager);
        $this->user = $this->makeUser(Role::User);
        $this->resource = $this->makeResource($this->owner);
        $this->assignManager($this->resource, $this->manager);

        ResourceRequirement::query()->create([
            'resource_id' => $this->resource->id,
            'name' => 'Test Requirement',
            'requires_verification' => true,
        ]);
    }

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();
        parent::tearDown();
    }

    public function test_user_can_submit_a_credential_and_see_it_in_their_list(): void
    {
        $file = UploadedFile::fake()->create('certificate.pdf', 120, 'application/pdf');

        $this->actingAs($this->user)
            ->postJson('/api/credentials', [
                'requirement_name' => 'Test Requirement',
                'file' => $file,
            ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.requirement_name', 'Test Requirement');

        $credential = UserCredential::query()->where('user_id', $this->user->id)->firstOrFail();
        $this->assertNotNull($credential->file_path);
        Storage::disk('local')->assertExists($credential->file_path);
        $this->assertDatabaseHas('audit_logs', ['action' => 'credential_submitted']);

        $this->actingAs($this->user)
            ->getJson('/api/credentials')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_pending_credential_cannot_be_submitted_twice(): void
    {
        $this->actingAs($this->user)->postJson('/api/credentials', [
            'requirement_name' => 'Test Requirement',
            'file' => UploadedFile::fake()->create('certificate.pdf', 120, 'application/pdf'),
        ])->assertCreated();

        $this->actingAs($this->user)->postJson('/api/credentials', [
            'requirement_name' => 'Test Requirement',
            'file' => UploadedFile::fake()->create('again.pdf', 120, 'application/pdf'),
        ])->assertStatus(422);
    }

    public function test_manager_can_verify_a_credential_for_an_assigned_resource(): void
    {
        $this->actingAs($this->user)->postJson('/api/credentials', [
            'requirement_name' => 'Test Requirement',
            'file' => UploadedFile::fake()->create('certificate.pdf', 120, 'application/pdf'),
        ])->assertCreated();

        $credential = UserCredential::query()->where('user_id', $this->user->id)->firstOrFail();

        $this->actingAs($this->manager)
            ->getJson('/api/manager/credentials')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->actingAs($this->manager)
            ->patchJson("/api/credentials/{$credential->id}/review", [
                'decision' => 'verify',
                'note' => 'Certificate matches the requirement.',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'verified');

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'credential_verified',
            'subject_id' => $credential->id,
        ]);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->user->id,
            'type' => 'credential_verified',
        ]);
    }

    public function test_owner_can_see_and_review_pending_credentials_for_owned_resources(): void
    {
        $this->actingAs($this->user)->postJson('/api/credentials', [
            'requirement_name' => 'Test Requirement',
            'file' => UploadedFile::fake()->create('certificate.pdf', 120, 'application/pdf'),
        ])->assertCreated();

        $credential = UserCredential::query()->where('user_id', $this->user->id)->firstOrFail();

        $this->actingAs($this->owner)
            ->getJson('/api/owner/credentials')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->actingAs($this->owner)
            ->patchJson("/api/credentials/{$credential->id}/review", [
                'decision' => 'verify',
                'note' => 'Confirmed for the owner-owned resource.',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'verified');
    }

    public function test_rejection_requires_a_reason_and_is_notified(): void
    {
        $this->actingAs($this->user)->postJson('/api/credentials', [
            'requirement_name' => 'Test Requirement',
            'file' => UploadedFile::fake()->create('certificate.pdf', 120, 'application/pdf'),
        ])->assertCreated();

        $credential = UserCredential::query()->where('user_id', $this->user->id)->firstOrFail();

        $this->actingAs($this->manager)
            ->patchJson("/api/credentials/{$credential->id}/review", [
                'decision' => 'reject',
                'note' => '',
            ])
            ->assertStatus(422);

        $this->actingAs($this->manager)
            ->patchJson("/api/credentials/{$credential->id}/review", [
                'decision' => 'reject',
                'note' => 'The expiry date is missing.',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected');

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->user->id,
            'type' => 'credential_rejected',
        ]);
    }

    public function test_manager_cannot_review_a_requirement_they_do_not_manage(): void
    {
        $otherManager = $this->makeUser(Role::Manager);
        $credential = UserCredential::query()->create([
            'user_id' => $this->user->id,
            'requirement_name' => 'Test Requirement',
            'status' => CredentialStatus::Pending,
        ]);

        $this->actingAs($otherManager)
            ->patchJson("/api/credentials/{$credential->id}/review", [
                'decision' => 'verify',
                'note' => 'Looks good.',
            ])
            ->assertStatus(403);
    }

    public function test_verified_credential_unlocks_eligibility(): void
    {
        $before = $this->actingAs($this->user)
            ->getJson("/api/resources/{$this->resource->id}/eligibility")
            ->assertOk();

        $this->assertFalse($before->json('data.qualifies'));

        UserCredential::query()->create([
            'user_id' => $this->user->id,
            'requirement_name' => 'Test Requirement',
            'status' => CredentialStatus::Verified,
        ]);

        $this->actingAs($this->user)
            ->getJson("/api/resources/{$this->resource->id}/eligibility")
            ->assertOk()
            ->assertJsonPath('data.qualifies', true);
    }

    public function test_signed_download_only_serves_the_file_with_a_valid_signature(): void
    {
        $this->actingAs($this->user)->postJson('/api/credentials', [
            'requirement_name' => 'Test Requirement',
            'file' => UploadedFile::fake()->create('certificate.pdf', 120, 'application/pdf'),
        ])->assertCreated();

        $credential = UserCredential::query()->where('user_id', $this->user->id)->firstOrFail();
        $url = URL::temporarySignedRoute('credentials.download', now()->addMinutes(10), ['credential' => $credential->id]);

        $this->get($url)->assertOk();

        $this->get("/api/credentials/{$credential->id}/download")->assertStatus(403);
    }
}
