<?php

namespace App\Services\Resource;

use App\Models\Resource;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ResourceServiceInterface
{
    public function paginate(?User $viewer, array $filters): LengthAwarePaginator;

    public function find(int $id): Resource;

    public function create(User $owner, array $data): Resource;

    public function update(User $actor, Resource $resource, array $data): Resource;

    public function delete(User $actor, Resource $resource): void;

    public function availability(Resource $resource, string $date): array;

    public function assignManager(User $actor, Resource $resource, User $manager): void;

    public function removeManager(User $actor, Resource $resource, User $manager): void;
}
