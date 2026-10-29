<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    /**
     * Return a successful JSON response with the envelope format.
     *
     * @param  mixed  $data  The response data
     * @param  string  $message  A success message
     * @param  array  $errors  Additional errors
     * @param  array  $meta  Additional metadata
     * @param  int  $statusCode  HTTP status code (default 200)
     */
    public function successResponse($data = null, string $message = 'Success', array $errors = [], array $meta = [], int $statusCode = 200): JsonResponse
    {
        return response()->json([
            'data' => $data,
            'message' => $message,
            'errors' => $errors,
            'meta' => array_merge(['success' => true], $meta),
        ], $statusCode);
    }

    /**
     * Return an error JSON response with the envelope format.
     *
     * @param  string|array  $message  Error message or messages
     * @param  array  $errors  Detailed validation errors
     * @param  array  $meta  Additional metadata
     * @param  int  $statusCode  HTTP status code (default 422)
     */
    public function errorResponse($message, array $errors = [], array $meta = [], int $statusCode = 422): JsonResponse
    {
        return response()->json([
            'data' => null,
            'message' => $message,
            'errors' => $errors,
            'meta' => array_merge(['success' => false], $meta),
        ], $statusCode);
    }

    /**
     * Return a not found JSON response.
     *
     * @param  string  $message  Error message
     * @param  array  $meta  Additional metadata
     * @param  int  $statusCode  HTTP status code (default 404)
     */
    public function notFoundResponse(string $message = 'Not found', array $meta = [], int $statusCode = 404): JsonResponse
    {
        return response()->json([
            'data' => null,
            'message' => $message,
            'errors' => [],
            'meta' => array_merge(['success' => false], $meta),
        ], $statusCode);
    }

    /**
     * Return a conflict JSON response.
     *
     * @param  string  $message  Error message
     * @param  array  $meta  Additional metadata
     * @param  int  $statusCode  HTTP status code (default 409)
     */
    public function conflictResponse(string $message, array $meta = [], int $statusCode = 409): JsonResponse
    {
        return response()->json([
            'data' => null,
            'message' => $message,
            'errors' => [],
            'meta' => array_merge(['success' => false], $meta),
        ], $statusCode);
    }

    /**
     * Return an unauthorized JSON response.
     *
     * @param  string  $message  Error message
     * @param  array  $meta  Additional metadata
     * @param  int  $statusCode  HTTP status code (default 401)
     */
    public function unauthorizedResponse(string $message = 'Unauthorized', array $meta = [], int $statusCode = 401): JsonResponse
    {
        return response()->json([
            'data' => null,
            'message' => $message,
            'errors' => [],
            'meta' => array_merge(['success' => false], $meta),
        ], $statusCode);
    }

    /**
     * Return a forbidden JSON response.
     *
     * @param  string  $message  Error message
     * @param  array  $meta  Additional metadata
     * @param  int  $statusCode  HTTP status code (default 403)
     */
    public function forbiddenResponse(string $message = 'Forbidden', array $meta = [], int $statusCode = 403): JsonResponse
    {
        return response()->json([
            'data' => null,
            'message' => $message,
            'errors' => [],
            'meta' => array_merge(['success' => false], $meta),
        ], $statusCode);
    }
}
