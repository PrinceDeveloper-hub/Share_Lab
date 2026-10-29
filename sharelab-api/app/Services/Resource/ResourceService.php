<?php

namespace App\Services\Resource;

use App\Enums\BookingStatus;
use App\Enums\Role;
use App\Models\Booking;
use App\Models\Resource;
use App\Models\ResourceRequirement;
use App\Models\User;
use App\Services\Audit\AuditService;
use App\Services\Notification\NotificationService;
use App\Support\Clock;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ResourceService implements ResourceServiceInterface
{
    public function __construct(
        private readonly AuditService $audit,
        private readonly NotificationService $notifications,
        private readonly Clock $clock,
    ) {}

    public function paginate(?User $viewer, array $filters): LengthAwarePaginator
    {
        $query = Resource::query()->with(['owner:id,name,email,role', 'requirements', 'managers:id,name']);

        if (! empty($filters['q'])) {
            $term = '%'.trim((string) $filters['q']).'%';
            $query->where(function ($builder) use ($term): void {
                $builder->where('name', 'like', $term)
                    ->orWhere('description', 'like', $term)
                    ->orWhere('location', 'like', $term);
            });
        }

        if (! empty($filters['category']) && $filters['category'] !== 'all') {
            $query->where('category', $filters['category']);
        }

        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['owner_id'])) {
            $query->where('owner_id', (int) $filters['owner_id']);
        }

        $sort = (string) ($filters['sort'] ?? 'name');
        $direction = (string) ($filters['direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';
        $sortable = ['name', 'category', 'location', 'weekly_cap_hours', 'max_hours_per_booking', 'created_at'];
        $query->orderBy(in_array($sort, $sortable, true) ? $sort : 'name', $direction);

        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 12)));

        return $query->paginate($perPage)->withQueryString();
    }

    public function find(int $id): Resource
    {
        return Resource::query()
            ->with(['owner:id,name,email,role', 'requirements', 'managers:id,name,email,role'])
            ->findOrFail($id);
    }

    public function create(User $owner, array $data): Resource
    {
        return DB::transaction(function () use ($owner, $data): Resource {
            $resource = Resource::query()->create([
                'owner_id' => $owner->id,
                'name' => $data['name'],
                'category' => $data['category'],
                'location' => $data['location'],
                'description' => $data['description'] ?? null,
                'rules' => $data['rules'] ?? null,
                'max_hours_per_booking' => $data['max_hours_per_booking'],
                'weekly_cap_hours' => $data['weekly_cap_hours'],
                'availability_windows' => $data['availability_windows'] ?? null,
                'image_path' => $data['image_path'] ?? null,
                'status' => $data['status'] ?? 'active',
            ]);

            $this->syncRequirements($resource, $data['requirements'] ?? []);

            $this->audit->record(
                $owner,
                'resource_created',
                Resource::class,
                $resource->id,
                null,
                null,
                ['name' => $resource->name],
            );

            return $resource->load(['owner', 'requirements', 'managers']);
        });
    }

    public function update(User $actor, Resource $resource, array $data): Resource
    {
        return DB::transaction(function () use ($actor, $resource, $data): Resource {
            $before = $resource->only([
                'name', 'category', 'location', 'description', 'rules',
                'max_hours_per_booking', 'weekly_cap_hours', 'status', 'availability_windows',
            ]);

            $payload = [];

            foreach (['name', 'category', 'location', 'max_hours_per_booking', 'weekly_cap_hours', 'status'] as $key) {
                if (array_key_exists($key, $data) && $data[$key] !== null) {
                    $payload[$key] = $data[$key];
                }
            }

            foreach (['description', 'rules', 'availability_windows', 'image_path'] as $key) {
                if (array_key_exists($key, $data)) {
                    $payload[$key] = $data[$key];
                }
            }

            $resource->fill($payload);

            $resource->save();

            if (array_key_exists('requirements', $data)) {
                $this->syncRequirements($resource, $data['requirements'] ?? []);
            }

            $this->audit->record(
                $actor,
                'resource_updated',
                Resource::class,
                $resource->id,
                null,
                null,
                ['before' => $before, 'after' => $resource->fresh()->only(array_keys($before))],
            );

            return $resource->fresh()->load(['owner', 'requirements', 'managers']);
        });
    }

    public function delete(User $actor, Resource $resource): void
    {
        DB::transaction(function () use ($actor, $resource): void {
            $this->audit->record(
                $actor,
                'resource_deleted',
                Resource::class,
                $resource->id,
                null,
                null,
                ['name' => $resource->name, 'category' => $resource->category],
            );

            $resource->delete();
        });
    }

    public function availability(Resource $resource, string $date): array
    {
        $day = CarbonImmutable::parse($date, 'UTC')->startOfDay();
        $windows = $resource->availability_windows ?: [['weekday' => 1, 'start' => '09:00', 'end' => '17:00']];

        if ($day->dayOfWeekIso > 5) {
            $windows = [];
        }

        $windowsForDay = array_values(array_filter($windows, fn (array $window): bool => (int) ($window['weekday'] ?? 1) === $day->dayOfWeekIso));

        if ($windowsForDay === []) {
            return [
                'date' => $day->toDateString(),
                'slots' => [],
                'message' => 'This resource has no availability on the selected day.',
            ];
        }

        $bookings = Booking::query()
            ->where('resource_id', $resource->id)
            ->whereIn('status', [
                BookingStatus::Pending->value,
                BookingStatus::Approved->value,
                BookingStatus::CheckedIn->value,
            ])
            ->where('start_at', '<', $day->addDay())
            ->where('end_at', '>', $day)
            ->get(['start_at', 'end_at']);

        $slots = [];

        foreach ($windowsForDay as $window) {
            $cursor = $day->setTimeFromTimeString($window['start'] ?? '09:00');
            $end = $day->setTimeFromTimeString($window['end'] ?? '17:00');

            while ($cursor->addHour()->lessThanOrEqualTo($end)) {
                $slotEnd = $cursor->addHour();
                $conflict = $bookings->first(fn (Booking $booking): bool => CarbonImmutable::parse($booking->start_at)->lessThan($slotEnd)
                    && CarbonImmutable::parse($booking->end_at)->greaterThan($cursor)
                );

                $slots[] = [
                    'start_at' => $cursor->toIso8601String(),
                    'end_at' => $slotEnd->toIso8601String(),
                    'available' => $conflict === null,
                    'reason' => $conflict === null ? null : 'Another request already holds this slot.',
                ];

                $cursor = $slotEnd;
            }
        }

        return ['date' => $day->toDateString(), 'slots' => $slots, 'message' => null];
    }

    public function assignManager(User $actor, Resource $resource, User $manager): void
    {
        $this->assertManagerRole($manager);

        DB::transaction(function () use ($actor, $resource, $manager): void {
            $resource->managers()->syncWithoutDetaching([$manager->id]);
            $this->audit->record($actor, 'manager_assigned', Resource::class, $resource->id, null, null, ['manager_id' => $manager->id]);
            $this->notifications->send($manager, 'manager_assigned', "You were assigned as a manager for {$resource->name}.");
        });
    }

    public function removeManager(User $actor, Resource $resource, User $manager): void
    {
        DB::transaction(function () use ($actor, $resource, $manager): void {
            $resource->managers()->detach($manager->id);
            $this->audit->record($actor, 'manager_removed', Resource::class, $resource->id, null, null, ['manager_id' => $manager->id]);
            $this->notifications->send($manager, 'manager_removed', "You were removed as a manager for {$resource->name}.");
        });
    }

    private function syncRequirements(Resource $resource, array $requirements): void
    {
        $resource->requirements()->delete();

        foreach ($requirements as $requirement) {
            $name = trim((string) ($requirement['name'] ?? ''));
            if ($name === '') {
                continue;
            }

            ResourceRequirement::query()->create([
                'resource_id' => $resource->id,
                'name' => $name,
                'requires_verification' => (bool) ($requirement['requires_verification'] ?? true),
            ]);
        }
    }

    private function assertManagerRole(User $manager): void
    {
        if ($manager->role !== Role::Manager) {
            throw ValidationException::withMessages([
                'email' => 'Only an existing user with the manager role can be assigned.',
            ]);
        }
    }
}
