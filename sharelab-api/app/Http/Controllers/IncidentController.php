<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ApiResponses;
use App\Http\Requests\IncidentResolveRequest;
use App\Http\Resources\IncidentResource;
use App\Models\Incident;
use App\Services\Incident\IncidentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IncidentController extends Controller
{
    use ApiResponses;

    public function __construct(private readonly IncidentService $incidents) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->incidents->paginate($request->user(), $request->all());

        return $this->paginated($paginator, IncidentResource::class, 'Incidents retrieved successfully.');
    }

    public function show(Request $request, Incident $incident): JsonResponse
    {
        $this->authorize('view', $incident);
        $incident->load(['booking.resource', 'reporter', 'confirmer', 'resolver']);

        return $this->resource(new IncidentResource($incident), 'Incident retrieved successfully.');
    }

    public function confirm(Request $request, Incident $incident): JsonResponse
    {
        $this->authorize('confirm', $incident);
        $incident = $this->incidents->confirm($request->user(), $incident);

        return $this->resource(new IncidentResource($incident), 'Incident confirmed successfully.');
    }

    public function resolve(IncidentResolveRequest $request, Incident $incident): JsonResponse
    {
        $this->authorize('resolve', $incident);
        $incident = $this->incidents->resolve(
            $request->user(),
            $incident,
            (string) $request->input('resolution_note'),
        );

        return $this->resource(new IncidentResource($incident), 'Incident resolved successfully.');
    }
}
