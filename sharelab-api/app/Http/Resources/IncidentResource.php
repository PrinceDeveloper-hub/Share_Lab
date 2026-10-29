<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class IncidentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'booking_id' => $this->booking_id,
            'reported_by' => $this->reported_by,
            'type' => $this->type,
            'description' => $this->description,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : $this->status,
            'suggested_by_system' => (bool) $this->suggested_by_system,
            'confirmed_by' => $this->confirmed_by,
            'resolved_by' => $this->resolved_by,
            'resolution_note' => $this->resolution_note,
            'booking' => new BookingResource($this->whenLoaded('booking')),
            'resource' => $this->whenLoaded('booking', fn () => new ResourceResource($this->booking->resource)),
            'reporter' => new UserResource($this->whenLoaded('reporter')),
            'confirmer' => new UserResource($this->whenLoaded('confirmer')),
            'resolver' => new UserResource($this->whenLoaded('resolver')),
            'created_at' => $this->created_at,
        ];
    }
}
