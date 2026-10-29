<?php

namespace App\Http\Controllers;

use App\Enums\BookingStatus;
use App\Enums\IncidentStatus;
use App\Http\Controllers\Concerns\ApiResponses;
use App\Http\Resources\BookingResource;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\Booking;
use App\Models\Incident;
use App\Models\Resource;
use App\Models\User;
use App\Models\UserCredential;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Read-only platform oversight for administrators. Counts are aggregated from
 * the live tables; nothing here is hard-coded demo data.
 */
class AdminController extends Controller
{
    use ApiResponses;

    public function overview(): JsonResponse
    {
        $roleCounts = User::query()
            ->selectRaw('role, count(*) as aggregate')
            ->groupBy('role')
            ->pluck('aggregate', 'role');

        $statusCounts = Booking::query()
            ->selectRaw('status, count(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $categoryCounts = Resource::query()
            ->selectRaw('category, count(*) as aggregate')
            ->groupBy('category')
            ->orderByDesc('aggregate')
            ->pluck('aggregate', 'category');

        $topResources = Resource::query()
            ->withCount('bookings')
            ->orderByDesc('bookings_count')
            ->limit(5)
            ->get(['id', 'name', 'category', 'location', 'weekly_cap_hours'])
            ->map(fn (Resource $resource): array => [
                'id' => $resource->id,
                'name' => $resource->name,
                'category' => $resource->category,
                'location' => $resource->location,
                'bookings_count' => (int) $resource->bookings_count,
            ]);

        $recentBookings = Booking::query()
            ->with(['resource:id,name,category,location', 'user:id,name,email,role'])
            ->latest('created_at')
            ->limit(8)
            ->get();

        $recentActivity = AuditLog::query()
            ->with(['actor:id,name,role'])
            ->latest('created_at')
            ->limit(10)
            ->get()
            ->map(fn (AuditLog $entry): array => [
                'id' => $entry->id,
                'action' => $entry->action,
                'reason' => $entry->reason,
                'actor' => $entry->actor?->name,
                'booking_id' => $entry->booking_id,
                'created_at' => $entry->created_at?->toIso8601String(),
            ]);

        return $this->ok([
            'users' => [
                'total' => (int) $roleCounts->sum(),
                'by_role' => [
                    'user' => (int) ($roleCounts['user'] ?? 0),
                    'owner' => (int) ($roleCounts['owner'] ?? 0),
                    'manager' => (int) ($roleCounts['manager'] ?? 0),
                    'admin' => (int) ($roleCounts['admin'] ?? 0),
                ],
                'new_last_7_days' => User::query()->where('created_at', '>=', now()->subDays(7))->count(),
            ],
            'resources' => [
                'total' => Resource::query()->count(),
                'active' => Resource::query()->where('status', 'active')->count(),
                'inactive' => Resource::query()->where('status', 'inactive')->count(),
                'by_category' => $categoryCounts,
            ],
            'bookings' => [
                'total' => (int) $statusCounts->sum(),
                'by_status' => collect(BookingStatus::cases())
                    ->mapWithKeys(fn (BookingStatus $status): array => [
                        $status->value => (int) ($statusCounts[$status->value] ?? 0),
                    ])
                    ->all(),
                'today' => Booking::query()->whereDate('start_at', today())->count(),
                'this_week' => Booking::query()
                    ->whereBetween('start_at', [now()->startOfWeek(), now()->endOfWeek()])
                    ->count(),
            ],
            'credentials' => [
                'pending' => UserCredential::query()->where('status', 'pending')->count(),
                'verified' => UserCredential::query()->where('status', 'verified')->count(),
            ],
            'incidents' => [
                'open' => Incident::query()->where('status', IncidentStatus::Open->value)->count(),
                'resolved' => Incident::query()->where('status', IncidentStatus::Resolved->value)->count(),
            ],
            'top_resources' => $topResources,
            'recent_bookings' => BookingResource::collection($recentBookings)->resolve(),
            'recent_activity' => $recentActivity,
        ], 'Platform overview retrieved successfully.');
    }

    public function users(Request $request): JsonResponse
    {
        $query = User::query()
            ->withCount('bookings')
            ->when($request->string('q')->trim()->toString(), function ($builder, string $term): void {
                $like = '%'.$term.'%';
                $builder->where(fn ($inner) => $inner
                    ->where('name', 'like', $like)
                    ->orWhere('email', 'like', $like));
            })
            ->when($request->string('role')->toString(), function ($builder, string $role): void {
                if (in_array($role, ['user', 'owner', 'manager', 'admin'], true)) {
                    $builder->where('role', $role);
                }
            })
            ->orderBy('name');

        $paginator = $query->paginate(min(50, max(1, $request->integer('per_page', 10))));

        $roles = User::query()
            ->selectRaw('role, count(*) as aggregate')
            ->groupBy('role')
            ->pluck('aggregate', 'role');

        return $this->paginated(
            $paginator,
            UserResource::class,
            'Users retrieved successfully.',
            ['role_counts' => $roles],
        );
    }

    public function audit(Request $request): JsonResponse
    {
        $query = AuditLog::query()
            ->with(['actor:id,name,role', 'booking:id,resource_id'])
            ->when($request->string('action')->toString(), function ($builder, string $action): void {
                $builder->where('action', $action);
            })
            ->latest('created_at');

        $paginator = $query->paginate(min(50, max(1, $request->integer('per_page', 12))));

        $entries = collect($paginator->items())->map(fn (AuditLog $entry): array => [
            'id' => $entry->id,
            'action' => $entry->action,
            'reason' => $entry->reason,
            'actor' => $entry->actor?->name,
            'actor_role' => $entry->actor?->role?->value,
            'booking_id' => $entry->booking_id,
            'resource_id' => $entry->booking?->resource_id,
            'created_at' => $entry->created_at?->toIso8601String(),
        ]);

        $actions = AuditLog::query()
            ->select('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action');

        return $this->ok($entries->all(), 'Audit log retrieved successfully.', 200, [
            'page' => $paginator->currentPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'last_page' => $paginator->lastPage(),
            'actions' => $actions,
        ]);
    }
}
