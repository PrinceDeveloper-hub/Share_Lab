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
            // Relative on purpose: the browser must request the file through
            // the origin the SPA is served from (Vite proxy locally, `/api`
            // rewrite in production), otherwise APP_URL pins a host the
            // browser may not be able to reach or trust.
            'file_url' => $this->file_path
                ? URL::temporarySignedRoute(
                    'credentials.download',
                    now()->addMinutes(10),
                    ['credential' => $this->id],
                    absolute: false,
                )
                : null,
            'user' => new UserResource($this->whenLoaded('user')),
            'created_at' => $this->created_at,
        ];
    }
}
