<?php

namespace App\Http\Resources;

use App\Enums\ConditionType;
use Illuminate\Http\Resources\Json\JsonResource;

class ConditionReportResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'booking_id' => $this->booking_id,
            'type' => $this->type instanceof ConditionType
                ? $this->type->value
                : $this->type,
            'condition' => $this->condition,
            'notes' => $this->notes,
            'checklist' => $this->checklist,
            'reported_by' => $this->reported_by,
            'reporter' => new UserResource($this->whenLoaded('reporter')),
            'reported_at' => $this->created_at,
        ];
    }
}
