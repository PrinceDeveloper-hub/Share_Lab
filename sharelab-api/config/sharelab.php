<?php

/*
|--------------------------------------------------------------------------
| ShareLab application settings
|--------------------------------------------------------------------------
|
| Values that are specific to this product rather than to the framework live
| here so they can be overridden per environment and reused by the API, the
| FormRequests and the deployment tooling.
|
*/

$origins = static fn (?string $value): array => array_values(array_filter(array_map(
    'trim',
    explode(',', (string) $value),
)));

return [

    /*
    | Private uploads (credentials, condition photos) are streamed through the
    | API with authorization checks, so any disk works. Point FILESYSTEM_DISK at
    | `s3` on hosts with ephemeral disks; `local` uses the persistent volume.
    */

    'uploads_disk' => env('FILESYSTEM_DISK', 'local'),

    /*
    | Resource images are public files referenced by URL. They stay on the
    | `public` disk (nginx serves /storage) unless PUBLIC_FILESYSTEM_DISK moves
    | them to object storage.
    */

    'images_disk' => env('PUBLIC_FILESYSTEM_DISK', 'public'),

    /*
    | Upload ceiling in kilobytes, kept in one place because the same number is
    | enforced by the FormRequests, advertised by the SPA and allowed through
    | nginx (`client_max_body_size`) and PHP (`upload_max_filesize`). 4 MB stays
    | below the 4.5 MB request body limit of hosted proxies such as Vercel's.
    */

    'max_upload_kb' => (int) env('MAX_UPLOAD_KB', 4096),

    /*
    | Exact browser origins allowed to call the API with cookies. Used by CORS
    | and by the trusted-origin middleware that guards state-changing requests.
    | Wildcards are not allowed: credentialed requests require exact origins.
    */

    'allowed_origins' => $origins(env('ALLOWED_ORIGINS', env(
        'CORS_ALLOWED_ORIGINS',
        'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173',
    ))),

];
