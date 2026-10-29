<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TimelineEntryResource extends JsonResource
{
    private const LABELS = [
        'booking_requested' => 'Request submitted',
        'booking_approved' => 'Request approved',
        'booking_rejected' => 'Request rejected',
        'booking_waitlisted' => 'Added to waitlist',
        'booking_cancelled' => 'Booking cancelled',
        'booking_extended' => 'Booking extended',
        'checked_in' => 'Checked in',
        'returned' => 'Returned',
        'incident_reported' => 'Incident reported',
        'incident_suggested' => 'Incident suggested',
        'incident_confirmed' => 'Incident confirmed',
        'incident_resolved' => 'Incident resolved',
        'waitlist_offered' => 'Waitlist offer sent',
        'waitlist_offer_confirmed' => 'Waitlist offer confirmed',
        'waitlist_offer_expired' => 'Waitlist offer expired',
    ];

    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'action' => $this->action,
            'label' => self::LABELS[$this->action] ?? str_replace('_', ' ', ucfirst($this->action)),
            'actor' => new UserResource($this->whenLoaded('actor')),
            'reason' => $this->reason,
            'meta' => $this->meta,
            'at' => $this->created_at?->toIso8601String(),
        ];
    }
}
