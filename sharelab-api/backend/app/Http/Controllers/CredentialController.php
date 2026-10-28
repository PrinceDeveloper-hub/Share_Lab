<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\ResourceCreateRequest; // Reusing for now, will create specific requests
use App\Models\UserCredential;
use App\Models\ResourceRequirement;
use App\Enums\CredentialStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CredentialController extends Controller
{
    /**
     * Submit a new credential.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'requirement_name' => ['required', 'string', 'max:255'],
            'file' => ['required', 'file', 'mimes:pdf,jpg,png,webp', 'max:5120'], // 5 MB
        ]);

        $user = auth()->user();

        // Check if user already has a credential for this requirement
        $existing = UserCredential::where('user_id', $user->id)
            ->where('requirement_name', $validated['requirement_name'])
            ->first();

        if ($existing) {
            return response()->json([
                'data' => null,
                'message' => 'You already have a credential submission for this requirement.',
                'errors' => ['requirement_name' => ['Already submitted.']],
            ], 422);
        }

        // Handle file upload to private disk
        $filePath = null;
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filePath = 'credentials/' . $user->id . '/' . $validated['requirement_name'] . '/' . time() . '.' . $file->getClientOriginalExtension();
            $file->storeAs('private', $filePath); // Store on private disk
        }

        $credential = UserCredential::create([
            'user_id' => $user->id,
            'requirement_name' => $validated['requirement_name'],
            'status' => CredentialStatus::Pending,
            'file_path' => $filePath,
        ]);

        // Create audit log
        AuditLog::record(
            $user,
            'credential_submitted',
            UserCredential::class,
            $credential->id,
            'Credential submitted for ' . $validated['requirement_name']
        );

        return response()->json([
            'data' => [
                'id' => $credential->id,
                'requirement_name' => $credential->requirement_name,
                'status' => $credential->status,
                'file_path' => $credential->file_path,
            ],
            'message' => 'Credential submitted successfully. Pending verification.',
        ], 201);
    }

    /**
     * List credentials (own or pending for managers).
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role->isAdmin()) {
            // Admin sees all credentials
            $credentials = UserCredential::with(['user', 'requirement'])
                ->paginate($request->input('per_page', 10));
        } elseif ($user->role->isManager()) {
            // Managers see pending credentials for their resources
            $resourceIds = $user->resourceManagerAssignments()->pluck('resource_id');
            $credentials = UserCredential::whereHas('user', function ($query) use ($resourceIds) {
                $query->whereIn('id', function ($q) use ($resourceIds) {
                    $q->select('user_id')->from('bookings')->whereIn('resource_id', $resourceIds);
                });
            })->where('status', CredentialStatus::Pending)
                ->with(['user', 'requirement'])
                ->paginate($request->input('per_page', 10));
        } else {
            // Regular users see only their own credentials
            $credentials = $user->credentials()
                ->with('requirement')
                ->paginate($request->input('per_page', 10));
        }

        return response()->json([
            'data' => $credentials,
            'message' => 'Credentials retrieved successfully.',
        ], 200);
    }

    /**
     * Verify a credential (manager/admin).
     */
    public function update(Request $request, UserCredential $credential)
    {
        $validated = $request->validate([
            'decision' => ['required', 'in:verify,reject'],
            'note' => ['nullable', 'string'],
        ]);

        $decider = $request->user();

        DB::transaction(function () use ($credential, $decider, $validated) {
            // Update credential status
            $credential->status = $validated['decision'] === 'verify' ? CredentialStatus::Verified : CredentialStatus::Rejected;
            $credential->verified_by = $decider->id;
            $credential->review_note = $validated['note'];
            $credential->save();

            // Create audit log
            AuditLog::record(
                $decider,
                'credential_' . $validated['decision'],
                UserCredential::class,
                $credential->id,
                "Credential " . $validated['decision'] . ': ' . $credential->requirement_name
            );

            // Notify the user
            $status = $validated['decision'] === 'verify' ? 'verified' : 'rejected';
            Notification::create([
                'user_id' => $credential->user_id,
                'type' => 'credential_' . $validated['decision'],
                'message' => "Your credential for {$credential->requirement_name} has been {$status}.",
                'booking_id' => null,
            ]);
        });

        return response()->json([
            'data' => [
                'id' => $credential->id,
                'requirement_name' => $credential->requirement_name,
                'status' => $credential->status,
                'verified_by' => $credential->verified_by,
                'review_note' => $credential->review_note,
            ],
            'message' => "Credential {$validated['decision']}d successfully.",
        ], 200);
    }
}