<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;

trait ApiResponses
{
    protected function ok(mixed $data = null, string $message = 'OK', int $status = 200, array $meta = []): JsonResponse
    {
        return response()->json([
            'data' => $data,
            'message' => $message,
            'errors' => [],
            'meta' => array_merge(['success' => $status < 400], $meta),
        ], $status);
    }

    protected function fail(string $message, int $status = 422, array $errors = [], array $meta = []): JsonResponse
    {
        return response()->json([
            'data' => null,
            'message' => $message,
            'errors' => $errors,
            'meta' => array_merge(['success' => false], $meta),
        ], $status);
    }

    protected function paginated(
        LengthAwarePaginator $paginator,
        string $resourceClass,
        string $message,
        array $meta = [],
    ): JsonResponse {
        return $this->ok(
            $resourceClass::collection($paginator->getCollection())->resolve(),
            $message,
            200,
            array_merge([
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ], $meta),
        );
    }

    protected function resource(JsonResource $resource, string $message, int $status = 200, array $extra = []): JsonResponse
    {
        return $this->ok(array_merge($resource->resolve(), $extra), $message, $status);
    }
}
