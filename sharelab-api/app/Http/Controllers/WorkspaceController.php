<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ApiResponses;
use App\Http\Resources\ResourceResource;
use App\Http\Resources\UserCredentialResource;
use App\Models\Booking;
use App\Models\Incident;
use App\Models\Resource;
use App\Services\Booking\BookingService;
use App\Services\Credential\CredentialService;
use App\Services\Resource\ResourceServiceInterface;
use App\Support\Clock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkspaceController extends Controller
{
    use ApiResponses;

    public function __construct(
        private readonly ResourceServiceInterface $resources,
        private readonly BookingService $bookings,
        private readonly CredentialService $credentials,
        private readonly Clock $clock,
    ) {}

    public function managerDashboard(Request $request): JsonResponse
    {
        $manager = $request->user();
        $resourceIds = $manager->resourceManagerAssignments()->pluck('resource_id');
        $today = $this->clock->now()->startOfDay();

        return $this->ok([
            'assigned_resources' => Resource::query()->whereIn('id', $resourceIds)->count(),
            'pending_requests' => $this->bookings->pendingCountForManager($manager),
            'pending_credentials' => $this->credentials->pendingForManager($manager, 1)->total(),
            'open_incidents' => Incident::query()
                ->where('status', 'open')
                ->whereHas('booking', fn ($booking) => $booking->whereIn('resource_id', $resourceIds))
                ->count(),
            'bookings_today' => Booking::query()
                ->whereIn('resource_id', $resourceIds)
                ->whereIn('status', ['approved', 'checked_in'])
                ->where('start_at', '<', $today->copy()->addDay())
                ->where('end_at', '>', $today)
                ->count(),
        ], 'Manager dashboard retrieved successfully.');
    }

    public function managerResources(Request $request): JsonResponse
    {
        $ids = $request->user()->resourceManagerAssignments()->pluck('resource_id');
        $paginator = Resource::query()
            ->with(['owner:id,name,email,role', 'requirements', 'managers:id,name'])
            ->whereIn('id', $ids)
            ->paginate(min(100, max(1, $request->integer('per_page', 15))));

        return $this->paginated($paginator, ResourceResource::class, 'Assigned resources retrieved successfully.');
    }

    public function managerCredentials(Request $request): JsonResponse
    {
        $paginator = $this->credentials->pendingForManager($request->user(), $request->integer('per_page', 15));

        return $this->paginated($paginator, UserCredentialResource::class, 'Credential queue retrieved successfully.');
    }

    public function ownerDashboard(Request $request): JsonResponse
    {
        $owner = $request->user();
        $resourceIds = Resource::query()->where('owner_id', $owner->id)->pluck('id');

        return $this->ok([
            'resources' => $resourceIds->count(),
            'pending_requests' => Booking::query()
                ->whereIn('resource_id', $resourceIds)
                ->where('status', 'pending')
                ->count(),
            'upcoming_bookings' => Booking::query()
                ->whereIn('resource_id', $resourceIds)
                ->whereIn('status', ['approved', 'checked_in'])
                ->where('end_at', '>=', $this->clock->now())
                ->count(),
            'pending_credentials' => $this->credentials->pendingForOwner($owner, 1)->total(),
            'open_incidents' => Incident::query()
                ->where('status', 'open')
                ->whereHas('booking', fn ($booking) => $booking->whereIn('resource_id', $resourceIds))
                ->count(),
        ], 'Owner dashboard retrieved successfully.');
    }
}
