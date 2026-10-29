<?php

namespace App\Services\Resource;

use App\Http\Resources\CampusResourceResource;
use App\Http\Resources\ResourceRequirementResource;
use App\Models\Resource;

interface ResourceServiceInterface
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
    public function getAllResources(string $query = null, string $category = null, string $status = null, string $sort = 'name', bool $paginate = true);

    /**
     * Get a single resource by ID.
     *
     * @param int $id
     * @param string $relations Eager-loaded relations
     * @return Resource|null
     */
    public function getResourceById(int $id, string $relations = '');

    /**
     * Create a new resource.
     *
     * @param array $data Resource data (name, description, category, status)
     * @return Resource
     */
    public function createResource(array $data): Resource;

    /**
     * Update a resource.
     *
     * @param int $id
     * @param array $data Resource data
     * @return Resource
     */
    public function updateResource(int $id, array $data): Resource;

    /**
     * Check user eligibility for a resource.
     *
     * @param int $resourceId
     * @param int $userId
     * @return bool
     */
    public function checkEligibility(int $resourceId, int $userId): bool;

    /**
     * Get resource availability for a date.
     *
     * @param int $resourceId
     * @param string $date
     * @return bool
     */
    public function checkAvailability(int $resourceId, string $date): bool;
}