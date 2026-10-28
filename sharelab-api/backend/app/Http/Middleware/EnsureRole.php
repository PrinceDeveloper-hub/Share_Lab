<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $role = $request->user()?->role;

        if ($role === null || ! in_array($role->value, $roles, true)) {
            abort(403, 'You do not have permission to access this resource.');
        }

        return $next($request);
    }
}
