<?php

use App\Http\Controllers\ServiceInfoController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web routes
|--------------------------------------------------------------------------
|
| This application is an API-only service: the React SPA is deployed
| separately (Vercel) and talks to /api. Nothing here may render HTML, so the
| root path answers with a small JSON identity payload instead of a Blade view.
| All product routes live in routes/api.php.
|
*/

Route::get('/', ServiceInfoController::class);
