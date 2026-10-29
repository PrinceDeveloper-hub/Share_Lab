<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\Auth\JwtService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

/**
 * Resolves the access JWT from the HttpOnly cookie (or a Bearer header for
 * tooling) and sets it on the API guard before the request reaches a
 * controller.
 */
class JwtCookieMiddleware
{
    public function __construct(private readonly JwtService $jwt)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        // Tests and other in-process callers may already have resolved the
        // user on the API guard (for example through actingAs()).
        if (Auth::guard('api')->check()) {
            $request->setUserResolver(fn () => Auth::guard('api')->user());

            return $next($request);
        }

        $token = $this->token($request);

        if ($token === null) {
            return $this->unauthenticated();
        }

        try {
            $payload = $this->jwt->decode($token);
        } catch (Throwable) {
            return $this->unauthenticated();
        }

        if (($payload['token_type'] ?? null) !== 'access') {
            return $this->unauthenticated();
        }

        $user = User::query()->find($payload['sub'] ?? null);

        if (!$user instanceof User) {
            return $this->unauthenticated();
        }

        Auth::guard('api')->setUser($user);
        $request->setUserResolver(fn () => $user);

        return $next($request);
    }

    private function token(Request $request): ?string
    {
        $header = $request->header('Authorization');

        if (is_string($header) && preg_match('/^Bearer\s+(.+)$/i', $header, $matches) === 1) {
            return trim($matches[1]);
        }

        $cookie = $request->cookie((string) config('jwt.access_cookie', 'sl_access'));

        return is_string($cookie) && $cookie !== '' ? $cookie : null;
    }

    private function unauthenticated(): Response
    {
        return response()->json([
            'data' => null,
            'message' => 'Authentication required.',
            'errors' => [],
            'meta' => ['success' => false],
        ], 401);
    }
}
