<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Signing secret
    |--------------------------------------------------------------------------
    |
    | Access and refresh tokens are signed with HS256. Set JWT_SECRET in the
    | environment for production; the application key is a safe local fallback
    | so a fresh clone still boots without extra setup.
    |
    */

    'secret' => env('JWT_SECRET') ?: env('APP_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Token lifetimes (minutes)
    |--------------------------------------------------------------------------
    */

    'access_ttl' => (int) env('JWT_ACCESS_TTL', 15),

    'refresh_ttl' => (int) env('JWT_REFRESH_TTL', 60 * 24 * 7),

    /*
    |--------------------------------------------------------------------------
    | HttpOnly cookie names and paths
    |--------------------------------------------------------------------------
    |
    | The refresh cookie is scoped to the auth endpoints, so it is never sent
    | with ordinary API requests. The access cookie is sent with every request.
    |
    */

    'access_cookie' => env('JWT_ACCESS_COOKIE', 'sl_access'),

    'refresh_cookie' => env('JWT_REFRESH_COOKIE', 'sl_refresh'),

    'access_cookie_path' => '/',

    'refresh_cookie_path' => '/api',

];
