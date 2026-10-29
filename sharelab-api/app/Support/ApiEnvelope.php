<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

class ApiEnvelope
{
    /**
     * Return a successful response envelope.
     *
     * @param  mixed  $data  The data to include in the response
     * @param  string  $message  A success message
     * @param  array  $errors  Additional errors (optional)
     * @param  array  $meta  Additional metadata (optional)
     */
    public static function success($data = null, string $message = 'Success', array $errors = [], array $meta = []): JsonResponse
    {
        return new JsonResponse([
            'data' => $data,
            'message' => $message,
            'errors' => $errors,
            'meta' => array_merge(['success' => true], $meta),
        ]);
    }

    /**
     * Return an error response envelope.
     *
     * @param  string|array  $message  Error message or messages
     * @param  array  $errors  Detailed validation errors
     * @param  array  $meta  Additional metadata
     */
    public static function error($message, array $errors = [], array $meta = []): JsonResponse
    {
        return new JsonResponse([
            'data' => null,
            'message' => $message,
            'errors' => $errors,
            'meta' => array_merge(['success' => false], $meta),
        ], 422);
    }

    /**
     * Return a not found response envelope.
     *
     * @param  string  $message  Error message
     * @param  array  $meta  Additional metadata
     */
    public static function notFound(string $message = 'Not found', array $meta = []): JsonResponse
    {
        return new JsonResponse([
            'data' => null,
            'message' => $message,
            'errors' => [],
            'meta' => array_merge(['success' => false], $meta),
        ], 404);
    }

    /**
     * Return a conflict response envelope.
     *
     * @param  string  $message  Error message
     * @param  array  $meta  Additional metadata
     */
    public static function conflict(string $message, array $meta = []): JsonResponse
    {
        return new JsonResponse([
            'data' => null,
            'message' => $message,
            'errors' => [],
            'meta' => array_merge(['success' => false], $meta),
        ], 409);
    }

    /**
     * Return an unauthorized response envelope.
     *
     * @param  string  $message  Error message
     * @param  array  $meta  Additional metadata
     */
    public static function unauthorized(string $message = 'Unauthorized', array $meta = []): JsonResponse
    {
        return new JsonResponse([
            'data' => null,
            'message' => $message,
            'errors' => [],
            'meta' => array_merge(['success' => false], $meta),
        ], 401);
    }

    /**
     * Return a forbidden response envelope.
     *
     * @param  string  $message  Error message
     * @param  array  $meta  Additional metadata
     */
    public static function forbidden(string $message = 'Forbidden', array $meta = []): JsonResponse
    {
        return new JsonResponse([
            'data' => null,
            'message' => $message,
            'errors' => [],
            'meta' => array_merge(['success' => false], $meta),
        ], 403);
    }
}
