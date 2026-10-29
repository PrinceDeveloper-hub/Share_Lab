<?php

namespace App\Services\Incident;

use App\Enums\IncidentStatus;
use App\Enums\Role;
use App\Models\Booking;
use App\Models\Incident;
use App\Models\User;
use App\Services\Audit\AuditService;
use App\Services\Notification\NotificationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class IncidentService
{
    public function __construct(
        private readonly AuditService $audit,
        private readonly NotificationService $notifications,
    ) {}

    public function paginate(User $viewer, array $filters): LengthAwarePaginator
    {
        $query = Incident::query()->with([
            'booking.resource:id,name,owner_id',
            'reporter:id,name,email,role',
            'confirmer:id,name',
            'resolver:id,name',
        ]);

        if ($viewer->role === Role::Manager) {
            $resourceIds = $viewer->resourceManagerAssignments()->pluck('resource_id');
            $query->whereHas('booking', fn ($booking) => $booking->whereIn('resource_id', $resourceIds));
        } elseif ($viewer->role === Role::Owner) {
            $query->whereHas('booking.resource', fn ($resource) => $resource->where('owner_id', $viewer->id));
        } else {
            $query->where(function ($incident) use ($viewer): void {
                $incident->where('reported_by', $viewer->id)
                    ->orWhereHas('booking', fn ($booking) => $booking->where('user_id', $viewer->id));
            });
        }

        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['type']) && $filters['type'] !== 'all') {
            $query->where('type', $filters['type']);
        }

        if (! empty($filters['resource_id'])) {
            $query->whereHas('booking', fn ($booking) => $booking->where('resource_id', (int) $filters['resource_id']));
        }

        return $query->latest()->paginate(min(100, max(1, (int) ($filters['per_page'] ?? 15))));
    }

    public function report(User $actor, Booking $booking, array $data): Incident
    {
        return DB::transaction(function () use ($actor, $booking, $data): Incident {
            $incident = Incident::query()->create([
                'booking_id' => $booking->id,
                'reported_by' => $actor->id,
                'type' => $data['type'],
                'description' => $data['description'],
                'status' => IncidentStatus::Open,
                'suggested_by_system' => false,
            ]);

            $this->audit->record(
                $actor,
                'incident_reported',
                Incident::class,
                $incident->id,
                $booking->id,
                $data['description'],
                ['type' => $data['type']],
            );

            $this->notifications->sendToManagers(
                (int) $booking->resource_id,
                'incident_reported',
                "A {$data['type']} incident was reported for booking #{$booking->id}.",
                $booking->id,
            );

            $this->notifications->send(
                (int) $booking->user_id,
                'incident_reported',
                "Your incident report for booking #{$booking->id} was recorded.",
                $booking->id,
            );

            return $incident->load(['booking.resource', 'reporter']);
        });
    }

    public function suggested(Booking $booking, string $type, string $description): Incident
    {
        $incident = Incident::query()->create([
            'booking_id' => $booking->id,
            'reported_by' => $booking->user_id,
            'type' => $type,
            'description' => $description,
            'status' => IncidentStatus::Open,
            'suggested_by_system' => true,
        ]);

        $this->audit->record(
            null,
            'incident_suggested',
            Incident::class,
            $incident->id,
            $booking->id,
            $description,
            ['type' => $type, 'suggested_by_system' => true],
        );

        $this->notifications->sendToManagers(
            (int) $booking->resource_id,
            'incident_needs_confirmation',
            "A system-suggested {$type} incident needs confirmation for booking #{$booking->id}.",
            $booking->id,
        );

        return $incident;
    }

    public function confirm(User $actor, Incident $incident): Incident
    {
        return DB::transaction(function () use ($actor, $incident): Incident {
            if ($incident->confirmed_by !== null) {
                throw ValidationException::withMessages(['incident' => 'This incident has already been confirmed.']);
            }

            $incident->fill([
                'confirmed_by' => $actor->id,
            ])->save();

            $this->audit->record(
                $actor,
                'incident_confirmed',
                Incident::class,
                $incident->id,
                $incident->booking_id,
                null,
                ['suggested_by_system' => $incident->suggested_by_system],
            );

            $this->notifications->send(
                (int) $incident->booking->user_id,
                'incident_confirmed',
                "An incident on booking #{$incident->booking_id} was confirmed by lab staff.",
                $incident->booking_id,
            );

            return $incident->fresh(['booking.resource', 'reporter', 'confirmer']);
        });
    }

    public function resolve(User $actor, Incident $incident, string $reason): Incident
    {
        if (trim($reason) === '') {
            throw ValidationException::withMessages(['resolution_note' => 'A resolution reason is required.']);
        }

        return DB::transaction(function () use ($actor, $incident, $reason): Incident {
            $incident->fill([
                'status' => IncidentStatus::Resolved,
                'resolved_by' => $actor->id,
                'resolution_note' => $reason,
            ])->save();

            $this->audit->record(
                $actor,
                'incident_resolved',
                Incident::class,
                $incident->id,
                $incident->booking_id,
                $reason,
            );

            $this->notifications->send(
                (int) $incident->booking->user_id,
                'incident_resolved',
                "The incident on booking #{$incident->booking_id} was resolved: {$reason}",
                $incident->booking_id,
            );

            return $incident->fresh(['booking.resource', 'reporter', 'confirmer', 'resolver']);
        });
    }
}
