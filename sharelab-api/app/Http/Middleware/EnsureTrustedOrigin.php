<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Rejects state-changing requests that come from a browser origin we do not
 * trust.
 *
 * Authentication is cookie based, so without an origin check any site could
 * drive the API with the visitor's cookies. Browsers always attach `Origin` to
 * cross-origin POST/PUT/PATCH/DELETE requests, and Laravel's CORS middleware
 * only answers preflights, so this middleware is the actual write-side guard.
 *
 * Requests without an `Origin` header (curl, server-to-server, same-origin
 * navigations in very old browsers) are allowed and are not authenticated by
 * accident: the JWT cookie still has to be valid.
 */
class EnsureTrustedOrigin
{
    private const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

    public function handle(Request $request, Closure $next): Response
    {
        if (in_array($request->getMethod(), self::SAFE_METHODS, true)) {
            return $next($request);
        }

        $origin = $request->headers->get('Origin');

        if ($origin === null || $origin === '') {
            return $next($request);
        }

        if (in_array(rtrim($origin, '/'), $this->trustedOrigins(), true)) {
            return $next($request);
        }

        return response()->json([
            'data' => null,
            'message' => 'Origin not allowed.',
            'errors' => [],
            'meta' => ['success' => false],
        ], 403);
    }

    /**
     * @return list<string>
     */
    private function trustedOrigins(): array
    {
        $origins = (array) config('sharelab.allowed_origins', []);

        return array_values(array_map(
            static fn ($origin): string => rtrim((string) $origin, '/'),
            array_filter($origins, static fn ($origin): bool => is_string($origin) && $origin !== ''),
        ));
    }
}
