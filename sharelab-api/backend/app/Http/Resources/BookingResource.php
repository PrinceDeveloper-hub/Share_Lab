<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray($request)
    {
        $base = [
            'id' => $this->id,
            'resource_id' => $this->resource_id,
            'user_id' => $this->user_id,
            'start_at' => $this->start_at,
            'end_at' => $this->end_at,
            'purpose' => $this->purpose,
            'status' => $this->status,
            'decision_reason' => $this->decision_reason,
            'priority_score' => $this->priority_score,
            'priority_explanation' => $this->priority_explanation,
            'waitlist_position' => $this->waitlist_position,
            'confirm_by' => $this->confirm_by,
            'is_late' => $this->is_late,
        ];

        // Add timeline and recommendation only for certain users
        if ($request->user() && $request->user()->can('decide', $this->resource)) {
            $base['recommendation'] = $this->when(
                $this->status === 'pending',
                fn() => $this->recommendation()
            );
        }

        return $base;
    }

    /**
     * Get the recommendation for this booking.
     */
    protected function recommendation()
    {
        // This would normally use the BookingService
        // For now, return basic eligibility check
        return null;
    }
}