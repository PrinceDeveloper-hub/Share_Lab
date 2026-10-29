<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ApiResponses;
use App\Http\Requests\PasswordUpdateRequest;
use App\Http\Requests\ProfileUpdateRequest;
use App\Http\Resources\UserResource;
use App\Services\Audit\AuditService;
use App\Support\Clock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    use ApiResponses;

    public function __construct(
        private readonly AuditService $audit,
        private readonly Clock $clock,
    ) {}

    public function show(Request $request): JsonResponse
    {
        return $this->resource(new UserResource($request->user()), 'Profile retrieved successfully.');
    }

    public function update(ProfileUpdateRequest $request): JsonResponse
    {
        $user = $request->user();

        $user = DB::transaction(function () use ($request, $user) {
            $before = $user->only(['name', 'email']);
            $user->fill($request->validated())->save();

            $this->audit->record(
                $user,
                'profile_updated',
                $user::class,
                $user->id,
                null,
                null,
                ['before' => $before, 'after' => $user->only(['name', 'email'])],
            );

            return $user;
        });

        return $this->resource(new UserResource($user), 'Profile updated successfully.');
    }

    public function password(PasswordUpdateRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! Hash::check((string) $request->input('current_password'), $user->password)) {
            throw ValidationException::withMessages(['current_password' => 'The current password is incorrect.']);
        }

        DB::transaction(function () use ($request, $user): void {
            $user->forceFill(['password' => (string) $request->input('password')])->save();

            $this->audit->record(
                $user,
                'password_changed',
                $user::class,
                $user->id,
                null,
                null,
                ['at' => $this->clock->now()->toIso8601String()],
            );
        });

        return $this->ok(null, 'Password updated successfully.');
    }
}
