<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

/**
 * Root identity payload. The API serves no HTML, and keeping the route on a
 * controller (rather than a closure) lets `php artisan route:cache` work during
 * container boot.
 */
class ServiceInfoController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'name' => (string) config('app.name', 'ShareLab'),
            'version' => (string) config('app.version', '1.0.0'),
            'status' => 'ok',
        ]);
    }
}
