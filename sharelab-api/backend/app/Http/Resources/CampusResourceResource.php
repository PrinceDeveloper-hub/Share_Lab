<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CampusResourceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param \Illuminate\Http\Request $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        // Check if user has eligibility data passed via $request whenLoaded
        $userEligible = $request->whenLoaded('userEligible');

        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'category' => $this->category,
            'status' => $this->status,
            'requires_verification' => $this->resourceRequirements->contains(function ($req) {
                return $req->status === 'pending';
            }),
            'user_eligible' => $userEligible,
            'requirements' => ResourceRequirementResource::collection($this->resourceRequirements->load('credentialType')),
            'created_at' => $this->created_at,
        ];
    }
}