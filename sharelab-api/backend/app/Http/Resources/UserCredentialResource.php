<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\URL;

class UserCredentialResource extends JsonResource
{
    public function toArray($request): array
    {
        $status = $this->status instanceof \BackedEnum ? $this->status->value : $this->status;

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'requirement_name' => $this->requirement_name,
            'status' => $status,
            'review_note' => $this->review_note,
            'verified_by' => $this->verified_by,
            'file_url' => $this->file_path
                ? URL::temporarySignedRoute('credentials.download', now()->addMinutes(10), ['credential' => $this->id])
                : null,
            'user' => new UserResource($this->whenLoaded('user')),
            'created_at' => $this->created_at,
        ];
    }
}
