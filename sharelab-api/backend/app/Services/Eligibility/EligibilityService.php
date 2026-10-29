<?php

namespace App\Services\Eligibility;

use App\Enums\CredentialStatus;
use App\Models\Resource;
use App\Models\User;
use App\Models\UserCredential;

class EligibilityService
{
    /**
     * @return array{qualifies: bool, missing: array<int, string>, checklist: array<int, array{name: string, status: string, requires_verification: bool}>, message: string}
     */
    public function for(User $user, Resource $resource): array
    {
        $resource->loadMissing('requirements');
        $credentials = UserCredential::query()
            ->where('user_id', $user->id)
            ->whereIn('requirement_name', $resource->requirements->pluck('name'))
            ->get()
            ->keyBy('requirement_name');

        $missing = [];
        $pending = [];
        $checklist = [];

        foreach ($resource->requirements as $requirement) {
            $credential = $credentials->get($requirement->name);
            $status = $credential?->status instanceof CredentialStatus
                ? $credential->status->value
                : (string) ($credential?->status ?? 'missing');

            $checklist[] = [
                'name' => $requirement->name,
                'status' => $status,
                'requires_verification' => (bool) $requirement->requires_verification,
            ];

            if ($requirement->requires_verification && $status !== CredentialStatus::Verified->value) {
                if ($status === CredentialStatus::Pending->value) {
                    $pending[] = $requirement->name;
                } else {
                    $missing[] = $requirement->name;
                }
            }
        }

        $qualifies = $missing === [] && $pending === [];

        if ($qualifies) {
            $message = 'You are eligible to book this resource.';
        } elseif ($pending !== []) {
            $message = 'Credential verification pending.';
        } else {
            $message = 'Missing: '.implode(', ', $missing).'.';
        }

        return [
            'qualifies' => $qualifies,
            'missing' => $missing,
            'checklist' => $checklist,
            'message' => $message,
        ];
    }
}
