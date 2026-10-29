<?php

use App\Enums\IncidentStatus;
use App\Enums\Role;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CredentialController;
use App\Http\Controllers\ResourceController;
use App\Http\Resources\IncidentResource;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\Booking;
use App\Models\Incident;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\Rule;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public authentication
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');

// Public catalogue
Route::get('/resources', [ResourceController::class, 'index']);
Route::get('/resources/{resource}', [ResourceController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', fn (Request $request) => new UserResource($request->user()));

    // Resource management
    Route::middleware('role:owner,manager,admin')->group(function () {
        Route::post('/resources', [ResourceController::class, 'store']);
        Route::patch('/resources/{resource}', [ResourceController::class, 'update']);
    });

    // Credentials
    Route::post('/credentials', [CredentialController::class, 'store']);
    Route::get('/credentials', [CredentialController::class, 'index']);
    Route::patch('/credentials/{credential}', [CredentialController::class, 'update']);
    Route::patch('/credentials/{credential}/verify', [CredentialController::class, 'update']);

    // Bookings
    Route::get('/manager/bookings', [BookingController::class, 'queue'])
        ->middleware('role:manager,admin');
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{booking}', [BookingController::class, 'show']);
    Route::patch('/bookings/{booking}/decision', [BookingController::class, 'decision']);
    Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);
    Route::patch('/bookings/{booking}/extend', [BookingController::class, 'extend']);
    Route::post('/bookings/{booking}/confirm', [BookingController::class, 'confirm']);
    Route::post('/bookings/{booking}/checkin', [BookingController::class, 'checkIn']);
    Route::post('/bookings/{booking}/return', [BookingController::class, 'returnItems']);
    Route::get('/bookings/{booking}/timeline', [BookingController::class, 'timeline']);

    // Incidents
    Route::post('/bookings/{booking}/incidents', function (Request $request, Booking $booking) {
        $validated = $request->validate([
            'type' => ['required', Rule::in(['damage', 'delay', 'other'])],
            'description' => ['required', 'string'],
        ]);

        abort_unless(
            $request->user()->isAdmin() || $booking->user_id === $request->user()->id,
            403,
            'You do not have permission to report an incident for this booking.'
        );

        $incident = Incident::create([
            'booking_id' => $booking->id,
            'reported_by' => $request->user()->id,
            'type' => $validated['type'],
            'description' => $validated['description'],
            'status' => IncidentStatus::Open,
        ]);

        return response()->json([
            'data' => new IncidentResource($incident),
            'message' => 'Incident reported successfully.',
        ], 201);
    });

    Route::get('/incidents', function (Request $request) {
        $user = $request->user();

        $query = Incident::with(['booking', 'reporter', 'confirmer', 'resolver']);

        if (! $user->isAdmin()) {
            $resourceIds = $user->resourceManagerAssignments()->pluck('resource_id');
            $query->whereHas('booking', fn ($booking) => $booking->whereIn('resource_id', $resourceIds));
        }

        $incidents = $query->latest()->paginate($request->input('per_page', 10));

        return response()->json([
            'data' => IncidentResource::collection($incidents),
            'meta' => [
                'page' => $incidents->currentPage(),
                'per_page' => $incidents->perPage(),
                'total' => $incidents->total(),
                'last_page' => $incidents->lastPage(),
            ],
            'message' => 'Incidents retrieved successfully.',
        ]);
    });

    Route::patch('/incidents/{incident}/confirm', function (Request $request, Incident $incident) {
        abort_unless($request->user()->isAdmin(), 403);

        $incident->confirmed_by = $request->user()->id;
        $incident->status = IncidentStatus::Resolved;
        $incident->save();

        return response()->json([
            'data' => new IncidentResource($incident),
            'message' => 'Incident confirmed successfully.',
        ]);
    });

    Route::patch('/incidents/{incident}/resolve', function (Request $request, Incident $incident) {
        abort_unless($request->user()->isAdmin(), 403);

        $validated = $request->validate([
            'resolution_note' => ['nullable', 'string'],
        ]);

        $incident->status = IncidentStatus::Resolved;
        $incident->resolved_by = $request->user()->id;
        $incident->resolution_note = $validated['resolution_note'] ?? null;
        $incident->save();

        return response()->json([
            'data' => new IncidentResource($incident),
            'message' => 'Incident resolved successfully.',
        ]);
    });

    // Notifications
    Route::get('/notifications', function (Request $request) {
        $notifications = $request->user()->notifications()
            ->latest('created_at')
            ->paginate($request->input('per_page', 10));

        return response()->json([
            'data' => $notifications,
            'message' => 'Notifications retrieved successfully.',
        ]);
    });

    Route::patch('/notifications/{notification}/read', function (Request $request, Notification $notification) {
        abort_unless($notification->user_id === $request->user()->id, 403);

        $notification->read = true;
        $notification->save();

        return response()->json([
            'data' => $notification,
            'message' => 'Notification marked as read.',
        ]);
    });

    Route::post('/notifications/read-all', function (Request $request) {
        $request->user()->notifications()->where('read', false)->update(['read' => true]);

        return response()->json([
            'message' => 'All notifications marked as read.',
        ]);
    });

    // Admin
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/audit', function (Request $request) {
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

            $auditLogs = $query->latest()->paginate($request->input('per_page', 20));

            return response()->json([
                'data' => $auditLogs,
                'message' => 'Audit logs retrieved successfully.',
                'meta' => [
                    'page' => $auditLogs->currentPage(),
                    'per_page' => $auditLogs->perPage(),
                    'total' => $auditLogs->total(),
                    'last_page' => $auditLogs->lastPage(),
                ],
            ]);
        });

        Route::get('/users', function (Request $request) {
            $users = User::query()->latest()->paginate($request->input('per_page', 20));

            return response()->json([
                'data' => UserResource::collection($users->getCollection()),
                'message' => 'Users retrieved successfully.',
                'meta' => [
                    'page' => $users->currentPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                    'last_page' => $users->lastPage(),
                ],
            ]);
        });

        Route::patch('/users/{user}/role', function (Request $request, User $user) {
            $validated = $request->validate([
                'role' => ['required', Rule::in(['user', 'owner', 'manager', 'admin'])],
            ]);

            $user->role = Role::from($validated['role']);
            $user->save();

            return response()->json([
                'data' => new UserResource($user),
                'message' => "User role updated to {$validated['role']}.",
            ]);
        });
    });
});
