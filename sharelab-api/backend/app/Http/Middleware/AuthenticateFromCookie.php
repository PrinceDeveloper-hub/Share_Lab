<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Forward the HttpOnly session cookie to Sanctum as its expected bearer token.
 * This keeps browsers from ever exposing or persisting credentials in JS.
 */
class AuthenticateFromCookie
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->headers->has('Authorization')) {
            $token = $request->cookie('sharelab_token');

            if (is_string($token) && $token !== '') {
                $request->headers->set('Authorization', 'Bearer '.$token);
            }
        }

        return $next($request);
    }
}
