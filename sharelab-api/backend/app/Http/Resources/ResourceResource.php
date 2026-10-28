<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ResourceResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'category' => $this->category,
            'location' => $this->location,
            'description' => $this->description,
            'rules' => $this->rules,
            'max_hours_per_booking' => $this->max_hours_per_booking,
            'weekly_cap_hours' => $this->weekly_cap_hours,
            'status' => $this->status,
            'owner' => new UserResource($this->whenLoaded('owner')),
        ];
    }
}