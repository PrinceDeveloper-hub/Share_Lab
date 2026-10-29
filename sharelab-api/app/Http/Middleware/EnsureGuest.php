<?php

namespace App\Http\Middleware;

use App\Http\Resources\UserResource;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Keep authenticated users out of the login/register endpoints.
 *
 * The web response redirects home; API clients receive a 409 with the current
 * user so the SPA can resolve the session without treating it as an error.
 */
class EnsureGuest
{
    public function handle(Request $request, Closure $next, string $guard = 'api'): Response
    {
        if (Auth::guard($guard)->check()) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'data' => [
                        'user' => new UserResource(Auth::guard($guard)->user()),
                    ],
                    'message' => 'You are already signed in.',
                    'errors' => [],
                ], 409);
            }

            return redirect('/');
        }

        return $next($request);
    }
}
