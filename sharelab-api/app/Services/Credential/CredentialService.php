<?php

namespace App\Services\Credential;

use App\Enums\CredentialStatus;
use App\Models\Resource;
use App\Models\ResourceManager;
use App\Models\ResourceRequirement;
use App\Models\User;
use App\Models\UserCredential;
use App\Services\Audit\AuditService;
use App\Services\Notification\NotificationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CredentialService
{
    public function __construct(
        private readonly AuditService $audit,
        private readonly NotificationService $notifications,
    ) {}

    public function paginateForUser(User $user, int $perPage = 12): LengthAwarePaginator
    {
        return UserCredential::query()
            ->with('user:id,name,email,role')
            ->where('user_id', $user->id)
            ->latest()
            ->paginate($perPage);
    }

    public function pendingForManager(User $manager, int $perPage = 12): LengthAwarePaginator
    {
        $resourceIds = $manager->resourceManagerAssignments()->pluck('resource_id');
        $requirementNames = ResourceRequirement::query()
            ->whereIn('resource_id', $resourceIds)
            ->pluck('name')
            ->unique()
            ->values();

        return UserCredential::query()
            ->with(['user:id,name,email,role'])
            ->whereIn('requirement_name', $requirementNames)
            ->where('status', CredentialStatus::Pending->value)
            ->latest()
            ->paginate($perPage);
    }

    public function pendingForOwner(User $owner, int $perPage = 12): LengthAwarePaginator
    {
        $resourceIds = Resource::query()->where('owner_id', $owner->id)->pluck('id');
        $requirementNames = ResourceRequirement::query()
            ->whereIn('resource_id', $resourceIds)
            ->pluck('name')
            ->unique()
            ->values();

        return UserCredential::query()
            ->with(['user:id,name,email,role'])
            ->whereIn('requirement_name', $requirementNames)
            ->where('status', CredentialStatus::Pending->value)
            ->latest()
            ->paginate($perPage);
    }

    public function submit(User $user, string $requirementName, ?string $filePath): UserCredential
    {
        $requirementExists = ResourceRequirement::query()
            ->where('name', $requirementName)
            ->exists();

        if (! $requirementExists) {
            throw ValidationException::withMessages(['requirement_name' => 'That requirement does not exist.']);
        }

        return DB::transaction(function () use ($user, $requirementName, $filePath): UserCredential {
            $existing = UserCredential::query()
                ->where('user_id', $user->id)
                ->where('requirement_name', $requirementName)
                ->first();

            if ($existing && $existing->status !== CredentialStatus::Rejected) {
                throw ValidationException::withMessages([
                    'requirement_name' => $existing->status === CredentialStatus::Verified
                        ? 'This credential is already verified.'
                        : 'You already have a pending submission for this requirement.',
                ]);
            }

            $credential = $existing ?? new UserCredential([
                'user_id' => $user->id,
                'requirement_name' => $requirementName,
            ]);

            $credential->fill([
                'status' => CredentialStatus::Pending,
                'file_path' => $filePath ?? $credential->file_path,
                'verified_by' => null,
                'review_note' => null,
            ])->save();

            $this->audit->record(
                $user,
                'credential_submitted',
                UserCredential::class,
                $credential->id,
                null,
                null,
                ['requirement_name' => $requirementName],
            );

            $this->notifyManagersForRequirement($requirementName, $user, $credential);

            return $credential->fresh('user');
        });
    }

    public function review(User $reviewer, UserCredential $credential, bool $verify, string $reason): UserCredential
    {
        if (! $verify && trim($reason) === '') {
            throw ValidationException::withMessages(['note' => 'A reason is required when rejecting a credential.']);
        }

        return DB::transaction(function () use ($reviewer, $credential, $verify, $reason): UserCredential {
            $credential->fill([
                'status' => $verify ? CredentialStatus::Verified : CredentialStatus::Rejected,
                'verified_by' => $reviewer->id,
                'review_note' => $reason,
            ])->save();

            $action = $verify ? 'credential_verified' : 'credential_rejected';
            $this->audit->record(
                $reviewer,
                $action,
                UserCredential::class,
                $credential->id,
                null,
                $reason,
                ['requirement_name' => $credential->requirement_name, 'user_id' => $credential->user_id],
            );

            $this->notifications->send(
                (int) $credential->user_id,
                $action,
                $verify
                    ? "Your {$credential->requirement_name} credential was verified."
                    : "Your {$credential->requirement_name} credential was rejected: {$reason}",
            );

            return $credential->fresh(['user']);
        });
    }

    public function authorizeReview(User $reviewer, UserCredential $credential): bool
    {
        if ($reviewer->role?->isManager()) {
            $resourceIds = $reviewer->resourceManagerAssignments()->pluck('resource_id');

            return ResourceRequirement::query()
                ->whereIn('resource_id', $resourceIds)
                ->where('name', $credential->requirement_name)
                ->exists();
        }

        if ($reviewer->role?->isOwner()) {
            return ResourceRequirement::query()
                ->where('name', $credential->requirement_name)
                ->whereIn('resource_id', Resource::query()->where('owner_id', $reviewer->id)->pluck('id'))
                ->exists();
        }

        return false;
    }

    private function notifyManagersForRequirement(string $requirementName, User $user, UserCredential $credential): void
    {
        $resourceIds = ResourceRequirement::query()
            ->where('name', $requirementName)
            ->pluck('resource_id');

        $managerIds = ResourceManager::query()
            ->whereIn('resource_id', $resourceIds)
            ->pluck('user_id')
            ->unique();

        foreach ($managerIds as $managerId) {
            $this->notifications->send(
                (int) $managerId,
                'credential_needs_review',
                "{$user->name} submitted a credential for {$requirementName}.",
            );
        }
    }
}
