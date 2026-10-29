<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ResourceResource extends JsonResource
{
    /**
     * Nested people data. Guests only ever receive a display name, because the
     * public catalogue must not leak contact details. Staff roles additionally
     * receive the email so owner and manager screens can render it.
     */
    private function person(\App\Models\User $user, $request): array
    {
        $role = $request->user()?->role?->value;
        $canSeeContact = in_array($role, ['owner', 'manager', 'admin'], true);

        return array_filter(
            [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role?->value,
                'email' => $canSeeContact ? $user->email : null,
            ],
            static fn ($value) => $value !== null,
        );
    }

    public function toArray($request): array
    {
        $imagePath = $this->image_path;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'category' => $this->category,
            'location' => $this->location,
            'description' => $this->description,
            'rules' => $this->rules,
            'max_hours_per_booking' => $this->max_hours_per_booking,
            'weekly_cap_hours' => $this->weekly_cap_hours,
            'availability_windows' => $this->availability_windows,
            'image_url' => $imagePath
                ? (str_starts_with($imagePath, '/') || str_starts_with($imagePath, 'http')
                    ? $imagePath
                    : \Illuminate\Support\Facades\Storage::disk('public')->url($imagePath))
                : null,
            'status' => $this->status,
            'owner' => $this->whenLoaded('owner', fn () => $this->person($this->owner, $request)),
            'requirements' => ResourceRequirementResource::collection($this->whenLoaded('requirements')),
            'managers' => $this->whenLoaded('managers', fn () => $this->managers
                ->map(fn ($manager) => $this->person($manager, $request))
                ->values()),
            'can_manage' => (bool) ($request->user()?->role?->isOwner() && (int) $this->owner_id === (int) $request->user()->getKey()),
            'created_at' => $this->created_at,
        ];
    }
}
