<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ApiResponses;
use App\Http\Requests\AssignManagerRequest;
use App\Http\Requests\ResourceCreateRequest;
use App\Http\Requests\ResourceUpdateRequest;
use App\Http\Resources\ResourceResource;
use App\Http\Resources\UserResource;
use App\Models\Resource;
use App\Models\User;
use App\Services\Eligibility\EligibilityService;
use App\Services\Resource\ResourceServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResourceController extends Controller
{
    use ApiResponses;

    public function __construct(private readonly ResourceServiceInterface $resources) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->resources->paginate($request->user(), [
            'q' => $request->string('q')->toString(),
            'category' => $request->string('category')->toString(),
            'status' => $request->string('status')->toString(),
            'sort' => $request->string('sort')->toString(),
            'direction' => $request->string('direction')->toString(),
            'per_page' => $request->integer('per_page', 12),
        ]);

        return $this->paginated($paginator, ResourceResource::class, 'Resources retrieved successfully.');
    }

    public function show(Request $request, Resource $resource): JsonResponse
    {
        $resource = $this->resources->find($resource->id);
        $eligibility = null;

        if ($request->user() !== null) {
            $eligibility = app(EligibilityService::class)->for($request->user(), $resource);
        }

        return $this->resource(new ResourceResource($resource), 'Resource details retrieved successfully.', 200, [
            'eligibility' => $eligibility,
        ]);
    }

    public function store(ResourceCreateRequest $request): JsonResponse
    {
        $this->authorize('create', Resource::class);

        $data = collect($request->validated())->except('image')->all();
        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('resources', (string) config('sharelab.images_disk'));
        }

        $resource = $this->resources->create($request->user(), $data);

        return $this->resource(new ResourceResource($resource), 'Resource created successfully.', 201);
    }

    public function update(ResourceUpdateRequest $request, Resource $resource): JsonResponse
    {
        $this->authorize('update', $resource);

        $data = collect($request->validated())->except('image')->all();
        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('resources', (string) config('sharelab.images_disk'));
        }

        $resource = $this->resources->update($request->user(), $resource, $data);

        return $this->resource(new ResourceResource($resource), 'Resource updated successfully.');
    }

    public function destroy(Request $request, Resource $resource): JsonResponse
    {
        $this->authorize('delete', $resource);
        abort_if($resource->bookings()->whereIn('status', ['pending', 'approved', 'checked_in'])->exists(), 409, 'This resource still has active bookings.');

        $this->resources->delete($request->user(), $resource);

        return $this->ok(null, 'Resource deleted successfully.');
    }

    public function availability(Resource $resource, Request $request): JsonResponse
    {
        $date = $request->string('date')->toString() ?: now()->toDateString();

        return $this->ok($this->resources->availability($resource, $date), 'Availability retrieved successfully.');
    }

    public function eligibility(Request $request, Resource $resource): JsonResponse
    {
        return $this->ok(
            app(EligibilityService::class)->for($request->user(), $resource),
            'Eligibility retrieved successfully.',
        );
    }

    public function managerIndex(Request $request, Resource $resource): JsonResponse
    {
        $this->authorize('manageManagers', $resource);

        return $this->ok(
            UserResource::collection($resource->managers()->get())->resolve(),
            'Managers retrieved successfully.',
        );
    }

    public function managerStore(AssignManagerRequest $request, Resource $resource): JsonResponse
    {
        $this->authorize('manageManagers', $resource);
        $manager = User::query()->where('email', strtolower($request->string('email')->toString()))->firstOrFail();
        $this->resources->assignManager($request->user(), $resource, $manager);

        return $this->ok(UserResource::collection($resource->fresh()->managers)->resolve(), 'Manager assigned successfully.');
    }

    public function managerDestroy(Request $request, Resource $resource, User $manager): JsonResponse
    {
        $this->authorize('manageManagers', $resource);
        $this->resources->removeManager($request->user(), $resource, $manager);

        return $this->ok(UserResource::collection($resource->fresh()->managers)->resolve(), 'Manager removed successfully.');
    }

    public function ownerIndex(Request $request): JsonResponse
    {
        $paginator = $this->resources->paginate($request->user(), [
            'status' => $request->string('status')->toString(),
            'owner_id' => (int) $request->user()->id,
            'per_page' => $request->integer('per_page', 50),
        ]);

        return $this->paginated($paginator, ResourceResource::class, 'Owned resources retrieved successfully.');
    }
}
