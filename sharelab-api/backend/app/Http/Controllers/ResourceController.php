<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\ResourceCreateRequest;
use App\Models\Resource;
use App\Models\UserCredential;
use App\Enums\CredentialStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ResourceController extends Controller
{
    /**
     * List resources with pagination and filters.
     */
    public function index(Request $request)
    {
        $query = Resource::query();

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        // Search by name
        if ($request->filled('q')) {
            $query->where('name', 'like', '%' . $request->input('q') . '%');
        }

        $resources = $query->with(['owner', 'requirements'])
            ->paginate($request->input('per_page', 10));

        return response()->json([
            'data' => ResourceResource::collection($resources),
            'message' => 'Resources retrieved successfully.',
            'meta' => [
                'page' => $resources->currentPage(),
                'per_page' => $resources->perPage(),
                'total' => $resources->total(),
                'last_page' => $resources->lastPage(),
            ],
        ], 200);
    }

    /**
     * Show a specific resource with requirements and rules.
     */
    public function show(Resource $resource, Request $request)
    {
        $resource->load(['owner', 'requirements', 'managers']);

        $eligibility = null;
        if ($request->user() && $request->user()->role->isUser()) {
            $eligibility = BookingService::checkEligibility($request->user(), $resource);
        }

        return response()->json([
            'data' => new ResourceResource($resource),
            'eligibility' => $eligibility,
            'message' => 'Resource details retrieved successfully.',
        ], 200);
    }

    /**
     * Create a new resource.
     */
    public function store(ResourceCreateRequest $request)
    {
        $validated = $request->validated();

        $resource = Resource::create([
            'owner_id' => auth()->id(),
            'name' => $validated['name'],
            'category' => $validated['category'],
            'location' => $validated['location'],
            'description' => $validated['description'] ?? null,
            'rules' => $validated['rules'] ?? null,
            'max_hours_per_booking' => $validated['max_hours_per_booking'],
            'weekly_cap_hours' => $validated['weekly_cap_hours'],
            'status' => $validated['status'] ?? 'active',
        ]);

        // If manager is specified, assign them
        if ($request->filled('manager_id')) {
            $resource->managers()->attach($request->input('manager_id'));
        }

        return response()->json([
            'data' => new ResourceResource($resource),
            'message' => 'Resource created successfully.',
        ], 201);
    }

    /**
     * Update a resource.
     */
    public function update(ResourceCreateRequest $request, Resource $resource)
    {
        $this->resourcePolicy()->update(auth()->user(), $resource);

        $validated = $request->validated();

        $resource->update([
            'name' => $validated['name'] ?? $resource->name,
            'category' => $validated['category'] ?? $resource->category,
            'location' => $validated['location'] ?? $resource->location,
            'description' => $validated['description'] ?? $resource->description,
            'rules' => $validated['rules'] ?? $resource->rules,
            'max_hours_per_booking' => $validated['max_hours_per_booking'] ?? $resource->max_hours_per_booking,
            'weekly_cap_hours' => $validated['weekly_cap_hours'] ?? $resource->weekly_cap_hours,
            'status' => $validated['status'] ?? $resource->status,
        ]);

        return response()->json([
            'data' => new ResourceResource($resource),
            'message' => 'Resource updated successfully.',
        ], 200);
    }