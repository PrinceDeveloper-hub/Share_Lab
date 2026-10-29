<?php

namespace App\Http\Middleware;

use App\Enums\Role;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Role checks use the role stored on the authenticated User row, never a
 * role supplied by the client or embedded in a JWT claim.
 */
class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user() ?? Auth::guard('api')->user();
        $role = $user?->role;
        $value = $role instanceof Role ? $role->value : (string) $role;

        if ($user === null || !in_array($value, $roles, true)) {
            return response()->json([
                'data' => null,
                'message' => 'Your role does not permit this action.',
                'errors' => [],
                'meta' => ['success' => false],
            ], 403);
        }

        return $next($request);
    }
}
