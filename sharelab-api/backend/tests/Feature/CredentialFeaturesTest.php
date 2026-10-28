<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Resource;
use App\Models\ResourceRequirement;
use App\Models\UserCredential;
use App\Enums\CredentialStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CredentialFeaturesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user1 = User::factory()->create(['email' => 'cred1@sharelab.test']);
        $this->user2 = User::factory()->create(['email' => 'cred2@sharelab.test']);
        $this->resource = Resource::factory()->create([
            'max_hours_per_booking' => 2,
            'weekly_cap_hours' => 6,
        ]);

        // Create a requirement for the resource
        ResourceRequirement::create([
            'resource_id' => $this->resource->id,
            'name' => 'Test Requirement',
            'requires_verification' => true,
        ]);
    }

    /**
     * Test submitting a credential.
     */
    public function test_submitting_credential()
    {
        $this->actingAs($this->user1);

        $response = $this->postJson('/api/credentials', [
            'requirement_name' => 'Test Requirement',
            'file' => '/path/to/test.pdf',
        ]);

        // Should accept the submission
        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'requirement_name',
                    'status',
                    'file_path',
                ],
                'message',
            ]);
    }

    /**
     * Test user sees own credentials.
     */
    public function test_user_sees_own_credentials()
    {
        $this->actingAs($this->user1);

        // Submit a credential first
        $this->postJson('/api/credentials', [
            'requirement_name' => 'Test Requirement',
            'file' => '/path/to/test.pdf',
        ]);

        $response = $this->getJson('/api/credentials');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    /**
     * Test manager sees pending credentials for their resources.
     */
    public function test_manager_sees_pending_credentials()
    {
        $this->actingAs($this->user2);

        // User1 submits a credential
        $this->actingAs($this->user1)->postJson('/api/credentials', [
            'requirement_name' => 'Test Requirement',
            'file' => '/path/to/test.pdf',
        ]);

        // Now as manager, see pending credentials
        $response = $this->getJson('/api/credentials');

        $response->assertStatus(200);
    }

    /**
     * Test verifying a credential (manager/admin).
     */
    public function test_verify_credential()
    {
        $this->actingAs($this->user2);

        // User1 submits a credential
        $this->actingAs($this->user1)->postJson('/api/credentials', [
            'requirement_name' => 'Test Requirement',
            'file' => '/path/to/test.pdf',
        ]);

        $credential = UserCredential::where('user_id', $this->user1->id)->first();

        // Manager verifies it
        $response = $this->patchJson("/api/credentials/{$credential->id}", [
            'decision' => 'verify',
            'note' => 'Verified OK',
        ]);

        $response->assertStatus(200)
            ->assertJson(['data.status' => 'verified']);
    }

    /**
     * Test rejecting a credential.
     */
    public function test_reject_credential()
    {
        $this->actingAs($this->user2);

        // User1 submits a credential
        $this->actingAs($this->user1)->postJson('/api/credentials', [
            'requirement_name' => 'Test Requirement',
            'file' => '/path/to/test.pdf',
        ]);

        $credential = UserCredential::where('user_id', $this->user1->id)->first();

        // Manager rejects it
        $response = $this->patchJson("/api/credentials/{$credential->id}", [
            'decision' => 'reject',
            'note' => 'Insufficient documentation',
        ]);

        $response->assertStatus(200)
            ->assertJson(['data.status' => 'rejected']);
    }
}