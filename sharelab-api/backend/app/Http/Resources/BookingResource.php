<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray($request): array
    {
        $viewer = $request->user();
        $status = $this->status instanceof \BackedEnum ? $this->status->value : $this->status;
        $decidable = $viewer?->role === \App\Enums\Role::Owner
            ? in_array($status, ['pending', 'waitlisted', 'approved'], true)
            : in_array($status, ['pending', 'waitlisted'], true);

        return [
            'id' => $this->id,
            'resource_id' => $this->resource_id,
            'user_id' => $this->user_id,
            'start_at' => $this->start_at?->toIso8601String(),
            'end_at' => $this->end_at?->toIso8601String(),
            'purpose' => $this->purpose,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : $this->status,
            'decision_reason' => $this->decision_reason,
            'decided_by' => $this->decided_by,
            'priority_score' => $this->priority_score,
            'priority_explanation' => $this->priority_explanation,
            'waitlist_position' => $this->waitlist_position,
            'confirm_by' => $this->confirm_by?->toIso8601String(),
            'is_late' => (bool) $this->is_late,
            'is_offer' => $this->isOffer(),
            'resource' => new ResourceResource($this->whenLoaded('resource')),
            'user' => new UserResource($this->whenLoaded('user')),
            'recommendation' => $this->when(isset($this->recommendation), fn () => $this->recommendation),
            'reports' => [
                'check_in' => $this->whenLoaded(
                    'checkInReport',
                    fn () => $this->reportPayload($this->checkInReport->first()),
                ),
                'return' => $this->whenLoaded(
                    'returnReport',
                    fn () => $this->reportPayload($this->returnReport->first()),
                ),
            ],
            'incidents' => IncidentResource::collection($this->whenLoaded('incidents')),
            'permissions' => [
                'decide' => $viewer !== null && $decidable && $viewer->can('decide', $this->resource),
                'cancel' => $viewer !== null && in_array($status, ['pending', 'waitlisted', 'approved', 'checked_in'], true) && $viewer->can('cancel', $this->resource),
                'check_in' => $viewer !== null && $status === 'approved' && $viewer->can('checkIn', $this->resource),
                'return' => $viewer !== null && $status === 'checked_in' && $viewer->can('returnItems', $this->resource),
                'extend' => $viewer !== null && in_array($status, ['approved', 'checked_in'], true) && $viewer->can('extend', $this->resource),
            ],
            'created_at' => $this->created_at,
        ];
    }

    private function reportPayload(?\App\Models\ConditionReport $report): ?array
    {
        if ($report === null) {
            return null;
        }

        return [
            'id' => $report->id,
            'condition' => $report->condition,
            'notes' => $report->notes,
            'checklist' => $report->checklist,
            'reported_by' => $report->reported_by,
            'at' => $report->created_at?->toIso8601String(),
        ];
    }
}
