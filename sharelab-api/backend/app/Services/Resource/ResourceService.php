<?php

namespace App\Services\Resource;

use App\Models\Resource;
use App\Models\ResourceRequirement;
use App\Models\User;
use App\Models\UserCredential;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Resources\CampusResourceResource;
use App\Http\Resources\ResourceRequirementResource;

class ResourceService implements ResourceServiceInterface
{
    /**
     * Get all resources with optional filters.
     *
     * @param string|null $query Search query for name/description
     * @param string|null $category Filter by category
     * @param string|null $status Filter by status
     * @param string|null $sort Sort field
     * @param bool $paginate Whether to paginate results
     * @return \Illuminate\Pagination\LengthAwarePaginator|Collection
     */
    public function getAllResources(string $query = null, string $category = null, string $status = null, string $sort = 'name', bool $paginate = true)
    {
        $query = Resource::query();

        // Apply search query filter
        if ($query) {
            $query->where('name', 'like', "%{$query}%")
                ->orWhere('description', 'like', "%{$query}%");
        }

        // Apply category filter
        if ($category) {
            $query->where('category', $category);
        }

        // Apply status filter
        if ($status) {
            $query->where('status', $status);
        }

        // Apply sorting
        $query->orderBy($sort, 'asc');

        if ($paginate) {
            return $query->paginate(12);
        }

        return $query->get();
    }

    /**
     * Get a single resource by ID.
     *
     * @param int $id
     * @param string $relations Eager-loaded relations
     * @return Resource|null
     */
    public function getResourceById(int $id, string $relations = '')
    {
        $query = Resource::find($id);

        if ($relations) {
            $query->with($relations);
        }

        return $query?->load($relations);
    }

    /**
     * Create a new resource.
     *
     * @param array $data Resource data (name, description, category, status)
     * @return Resource
     */
    public function createResource(array $data): Resource
    {
        return DB::transaction(function () use ($data) {
            $resource = Resource::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'category' => $data['category'],
                'status' => $data['status'] ?? 'available',
            ]);

            // Create default resource requirements based on resource type
            $this->createDefaultRequirements($resource);

            return $resource;
        });
    }

    /**
     * Update a resource.
     *
     * @param int $id
     * @param array $data Resource data
     * @return Resource
     */
    public function updateResource(int $id, array $data): Resource
    {
        return DB::transaction(function () use ($id, $data) {
            $resource = Resource::findOrFail($id);

            $resource->update([
                'name' => $data['name'],
                'description' => $data['description'] ?? $resource->description,
                'category' => $data['category'],
                'status' => $data['status'] ?? $resource->status,
            ]);

            return $resource;
        });
    }

    /**
     * Create default resource requirements based on resource type.
     *
     * @param Resource $resource
     */
    protected function createDefaultRequirements(Resource $resource)
    {
        // Define requirements based on resource category
        $requirements = match ($resource->category) {
            '3d-printer' => ['3D Printer Training'],
            'oscilloscope' => ['Oscilloscope Certification'],
            'camera-kit' => ['Camera Kit Training'],
            'pcr-cycler' => ['PCR Cycler Certification'],
            'laser-cutter' => ['Laser Cutter Certification'],
            'meeting-room' => ['Safety Orientation'],
            default => ['General Safety'],
        };

        foreach ($requirements as $credentialType) {
            ResourceRequirement::firstOrCreate(
                ['resource_id' => $resource->id, 'credential_type' => $credentialType],
                ['status' => 'pending']
            );
        }
    }

    /**
     * Check user eligibility for a resource.
     *
     * @param int $resourceId
     * @param int $userId
     * @return bool
     */
    public function checkEligibility(int $resourceId, int $userId): bool
    {
        $resource = Resource::find($resourceId);
        if (!$resource || $resource->status !== 'available') {
            return false;
        }

        // Check all resource requirements
        $requirements = $resource->resourceRequirements;

        foreach ($requirements as $requirement) {
            // Check if user has a verified credential for this requirement
            $hasVerifiedCredential = UserCredential::where('user_id', $userId)
                ->where('credential_type', $requirement->credential_type)
                ->where('status', 'verified')
                ->exists();

            if (!$hasVerifiedCredential) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check resource availability for a date.
     *
     * @param int $resourceId
     * @param string $date
     * @return bool
     */
    public function checkAvailability(int $resourceId, string $date): bool
    {
        $resource = Resource::find($resourceId);
        if (!$resource) {
            return false;
        }

        // Check for conflicting bookings/availability
        $conflicts = ResourceAvailability::where('resource_id', $resourceId)
            ->where('date', $date)
            ->where('is_available', true)
            ->exists();

        return $conflicts ? true : false;
    }
}