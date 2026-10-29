<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CredentialController;
use App\Http\Controllers\IncidentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ResourceController;
use App\Http\Controllers\WorkspaceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| ShareLab API
|--------------------------------------------------------------------------
|
| Public catalogue and auth routes are intentionally small. Every state
| change lives behind JwtCookieMiddleware and is additionally constrained by
| a policy or a role middleware. There are no /admin routes in this app.
|
*/

Route::middleware('guest:api')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:'.config('auth.login_throttle', '10,1'));
    Route::post('/register', [AuthController::class, 'register'])
        ->middleware('throttle:'.config('auth.register_throttle', '10,1'));
});

Route::post('/refresh', [AuthController::class, 'refresh'])->middleware('throttle:30,1');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('throttle:30,1');

// Public catalogue. Signed-in requests still receive eligibility details.
Route::get('/resources', [ResourceController::class, 'index']);
Route::get('/resources/{resource}/availability', [ResourceController::class, 'availability']);
Route::get('/resources/{resource}', [ResourceController::class, 'show']);

// Local credential files are private. The URL is signed and short-lived.
Route::get('/credentials/{credential}/download', [CredentialController::class, 'download'])
    ->middleware('signed')
    ->name('credentials.download');

Route::middleware('jwt.auth')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::get('/dashboard', [BookingController::class, 'dashboard']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::patch('/profile', [ProfileController::class, 'update']);
    Route::patch('/profile/password', [ProfileController::class, 'password']);

    Route::get('/credentials', [CredentialController::class, 'index']);
    Route::post('/credentials', [CredentialController::class, 'store']);
    Route::patch('/credentials/{credential}/review', [CredentialController::class, 'review']);

    Route::get('/resources/{resource}/eligibility', [ResourceController::class, 'eligibility']);

<<<<<<< HEAD
    // Bookings
    Route::get('/manager/bookings', [BookingController::class, 'queue'])
        ->middleware('role:manager,admin');
=======
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{booking}', [BookingController::class, 'show']);
    Route::patch('/bookings/{booking}/decision', [BookingController::class, 'decision']);
    Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);
    Route::patch('/bookings/{booking}/extend', [BookingController::class, 'extend']);
    Route::post('/bookings/{booking}/confirm', [BookingController::class, 'confirm']);
    Route::post('/bookings/{booking}/checkin', [BookingController::class, 'checkIn']);
    Route::post('/bookings/{booking}/return', [BookingController::class, 'returnItems']);
    Route::post('/bookings/{booking}/incidents', [BookingController::class, 'reportIncident']);
    Route::get('/bookings/{booking}/timeline', [BookingController::class, 'timeline']);

    Route::get('/incidents', [IncidentController::class, 'index']);
    Route::get('/incidents/{incident}', [IncidentController::class, 'show']);
    Route::patch('/incidents/{incident}/confirm', [IncidentController::class, 'confirm']);
    Route::patch('/incidents/{incident}/resolve', [IncidentController::class, 'resolve']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'readAll']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'read']);

    Route::middleware('role:owner')->group(function () {
        Route::post('/resources', [ResourceController::class, 'store']);
        Route::patch('/resources/{resource}', [ResourceController::class, 'update']);
        Route::delete('/resources/{resource}', [ResourceController::class, 'destroy']);
        Route::get('/owner/dashboard', [WorkspaceController::class, 'ownerDashboard']);
        Route::get('/owner/resources', [ResourceController::class, 'ownerIndex']);
        Route::get('/owner/bookings', [BookingController::class, 'ownerIndex']);
        Route::get('/owner/incidents', [IncidentController::class, 'index']);
        Route::get('/owner/credentials', [CredentialController::class, 'ownerIndex']);
        Route::get('/owner/resources/{resource}/managers', [ResourceController::class, 'managerIndex']);
        Route::post('/owner/resources/{resource}/managers', [ResourceController::class, 'managerStore']);
        Route::delete('/owner/resources/{resource}/managers/{manager}', [ResourceController::class, 'managerDestroy']);
    });

    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/dashboard', [AdminController::class, 'overview']);
        Route::get('/admin/users', [AdminController::class, 'users']);
        Route::get('/admin/audit', [AdminController::class, 'audit']);
    });

    Route::middleware('role:manager')->group(function () {
        Route::get('/manager/dashboard', [WorkspaceController::class, 'managerDashboard']);
        Route::get('/manager/resources', [WorkspaceController::class, 'managerResources']);
        Route::get('/manager/requests', [BookingController::class, 'managerIndex']);
        Route::get('/manager/credentials', [WorkspaceController::class, 'managerCredentials']);
        Route::get('/manager/incidents', [IncidentController::class, 'index']);
    });
});
