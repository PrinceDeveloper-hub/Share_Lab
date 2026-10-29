<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'message' => $this->message,
            'booking_id' => $this->booking_id,
            'read' => (bool) $this->read,
            'created_at' => $this->created_at,
        ];
    }
}
