<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class IncidentResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'booking_id' => $this->booking_id,
            'type' => $this->type,
            'description' => $this->description,
            'status' => $this->status,
            'suggested_by_system' => $this->suggested_by_system,
            'confirmed_by' => $this->confirmed_by,
            'resolved_by' => $this->resolved_by,
            'resolution_note' => $this->resolution_note,
            'created_at' => $this->created_at,
        ];
    }
}