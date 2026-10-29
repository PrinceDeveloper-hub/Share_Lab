<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Liveness/readiness probe for container hosts and uptime checks.
 *
 * The payload deliberately contains no connection strings, credentials or
 * stack traces: it is reachable without authentication.
 */
class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $database = 'ok';

        try {
            DB::connection()->getPdo();
            DB::connection()->select('select 1');
        } catch (Throwable $exception) {
            $database = 'unavailable';
            Log::error('Health check: database not reachable.', [
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
            ]);
        }

        $healthy = $database === 'ok';

        return response()->json([
            'status' => $healthy ? 'ok' : 'degraded',
            'name' => (string) config('app.name', 'ShareLab'),
            'version' => (string) config('app.version', '1.0.0'),
            'environment' => app()->environment(),
            'database' => $database,
            'timestamp' => now()->toIso8601String(),
        ], $healthy ? 200 : 503);
    }
}
