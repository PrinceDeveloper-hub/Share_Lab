<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS)
    |--------------------------------------------------------------------------
    |
    | Here you may configure your CORS options. You can allow various origins
    | or middleware. This makes cross-origin AJAX possible.
    |
    | Supported: '*' and array of origins
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    /*
    | Exact origins only: the cookies make every request credentialed, and
    | `Access-Control-Allow-Origin: *` is rejected by browsers for those.
    | ALLOWED_ORIGINS is the documented name; CORS_ALLOWED_ORIGINS is kept as a
    | fallback for existing deployments.
    */

    'allowed_origins' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env(
            'ALLOWED_ORIGINS',
            env(
                'CORS_ALLOWED_ORIGINS',
                'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173',
            ),
        )),
    ))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => false,

    'supports_credentials' => true,

];
