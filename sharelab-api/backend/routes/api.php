<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ResourceController;
use App\Http\Controllers\CredentialController;
use App\Http\Controllers\BookingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Auth routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/me', [AuthController::class, 'me']);

// Resource routes
Route::get('/resources', [ResourceController::class, 'index']);
Route::get('/resources/{resource}', [ResourceController::class, 'show']);
Route::post('/resources', [ResourceController::class, 'store']);
Route::patch('/resources/{resource}', [ResourceController::class, 'update']);

// Credential routes
Route::middleware('auth:sanctum')->post('/credentials', [CredentialController::class, 'store']);
Route::middleware('auth:sanctum')->get('/credentials', [CredentialController::class, 'index']);
Route::middleware('auth:sanctum')->patch('/credentials/{credential}', [CredentialController::class, 'update']);

// Booking routes
Route::middleware('auth:sanctum')->post('/bookings', [BookingController::class, 'store']);
Route::middleware('auth:sanctum')->get('/bookings', [BookingController::class, 'index']);
Route::middleware('auth:sanctum')->get('/bookings/{booking}', [BookingController::class, 'show']);
Route::middleware('auth:sanctum')->patch('/bookings/{booking}/decision', [BookingController::class, 'decision']);
Route::middleware('auth:sanctum')->post('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);
Route::middleware('auth:sanctum')->patch('/bookings/{booking}/extend', [BookingController::class, 'extend']);
Route::middleware('auth:sanctum')->post('/bookings/{booking}/confirm', [BookingController::class, 'confirm']);
Route::middleware('auth:sanctum')->post('/bookings/{booking}/checkin', [BookingController::class, 'checkIn']);
Route::middleware('auth:sanctum')->post('/bookings/{booking}/return', [BookingController::class, 'returnItems']);
Route::middleware('auth:sanctum')->get('/bookings/{booking}/timeline', [BookingController::class, 'timeline']);

// Incident routes
Route::middleware('auth:sanctum')->post('/bookings/{booking}/incidents', function (Request $request, Booking $booking) {
    $validated = $request->validate([
        'type' => ['required', 'in:damage|delay|other'],
        'description' => ['required', 'string'],
    ]);

    $incident = Incident::create([
        'booking_id' => $booking->id,
        'reported_by' => $request->user()->id,
        'type' => $validated['type'],
        'description' => $validated['description'],
        'status' => \App\Enums\IncidentStatus::Open,
    ]);

    return response()->json([
        'data' => [
            'id' => $incident->id,
            'type' => $incident->type,
            'description' => $incident->description,
            'status' => $incident->status,
        ],
        'message' => 'Incident reported successfully.',
    ], 201);
});

Route::middleware('auth:sanctum')->get('/incidents', function (Request $request) {
    $user = $request->user();

    $query = Incident::whereHas('booking', function ($q) use ($user) {
        $q->where('resource_id', function ($qq) {
            $qq->whereIn('id', $user->resourceManagerAssignments->pluck('resource_id'));
        });
    });

    if ($user->role->isAdmin()) {
        $query = Incident::all();
    }

    $incidents = $query->with(['booking', 'reporter', 'confirmer', 'resolver'])
        ->paginate($request->input('per_page', 10));

    return response()->json([
        'data' => $incidents,
        'message' => 'Incidents retrieved successfully.',
    ], 200);
});

Route::middleware('auth:sanctum')->patch('/incidents/{incident}/confirm', function (Request $request, Incident $incident) {
    $validated = $request->validate([
        'confirmed' => ['boolean'],
    ]);

    if ($incident->status !== \App\Enums\IncidentStatus::Open) {
        return response()->json([
            'data' => null,
            'message' => 'Incident is not open for confirmation.',
        ], 422);
    }

    $incident->confirmed_by = $request->user()->id;
    $incident->status = $confirmed ? \App\Enums\IncidentStatus::Resolved : \App\Enums\IncidentStatus::Resolved;
    $incident->save();

    return response()->json([
        'data' => new \App\Http\Resources\IncidentResource($incident),
        'message' => 'Incident ' . ($confirmed ? 'confirmed' : 'resolved') . ' successfully.',
    ], 200);
});

Route::middleware('auth:sanctum')->patch('/incidents/{incident}/resolve', function (Request $request, Incident $incident) {
    $validated = $request->validate([
        'resolution_note' => ['nullable', 'string'],
    ]);

    $incident->status = \App\Enums\IncidentStatus::Resolved;
    $incident->resolved_by = $request->user()->id;
    $incident->resolution_note = $validated['resolution_note'];
    $incident->save();

    return response()->json([
        'data' => new \App\Http\Resources\IncidentResource($incident),
        'message' => 'Incident resolved successfully.',
    ], 200);
});

// Notification routes
Route::middleware('auth:sanctum')->get('/notifications', [function (Request $request) {
    $user = $request->user();
    $notifications = $user->notifications()
        ->latest('created_at')
        ->paginate($request->input('per_page', 10));

    return response()->json([
        'data' => $notifications,
        'message' => 'Notifications retrieved successfully.',
    ], 200);
}]);

Route::middleware('auth:sanctum')->patch('/notifications/{notification}/read', function (Request $request, Notification $notification) {
    $notification->read = true;
    $notification->read_at = now();
    $notification->save();

    return response()->json([
        'data' => new \App\Http\Resources\NotificationResource($notification),
        'message' => 'Notification marked as read.',
    ], 200);
});

Route::middleware('auth:sanctum')->post('/notifications/read-all', function (Request $request) {
    $request->user()->notifications()
        ->whereNull('read_at')
        ->update(['read_at' => now()]);

    return response()->json([
        'message' => 'All notifications marked as read.',
    ], 200);
});

// Admin routes
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::get('/audit', [function (Request $request) {
        $query = AuditLog::with('actor');

        if ($request->filled('actor')) {
            $query->where('actor_id', $request->input('actor'));
        }

        if ($request->filled('action')) {
            $query->where('action', $request->input('action'));
        }

        if ($request->filled('booking_id')) {
            $query->where('booking_id', $request->input('booking_id'));
        }

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->input('date_to'));
        }

        $auditLogs = $query->paginate($request->input('per_page', 20));

        return response()->json([
            'data' => $auditLogs,
            'message' => 'Audit logs retrieved successfully.',
            'meta' => [
                'page' => $auditLogs->currentPage(),
                'per_page' => $auditLogs->perPage(),
                'total' => $auditLogs->total(),
                'last_page' => $auditLogs->lastPage(),
            ],
        ], 200);
    }]);

    Route::get('/users', [function (Request $request) {
        $users = User::with('role')->paginate($request->input('per_page', 20));

        return response()->json([
            'data' => UserResource::collection($users),
            'message' => 'Users retrieved successfully.',
            'meta' => [
                'page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage(),
            ],
        ], 200);
    }]);

    Route::patch('/users/{user}/role', [function (Request $request, User $user) {
        $validated = $request->validate([
            'role' => ['required', 'in:user|owner|manager|admin'],
        ]);

        $user->role = $validated['role'];
        $user->save();

        return response()->json([
            'data' => new UserResource($user),
            'message' => "User role updated to {$validated['role']}.",
        ], 200);
    }]);
});