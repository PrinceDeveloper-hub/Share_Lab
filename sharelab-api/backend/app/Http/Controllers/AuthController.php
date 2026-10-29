<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\Auth\JwtService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Throwable;

class AuthController extends Controller
{
    public function __construct(private readonly JwtService $jwt)
    {
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $email = (string) $request->string('email')->lower()->trim();
        $user = User::query()->where('email', $email)->first();

        if (! $user || ! Hash::check((string) $request->input('password'), $user->password)) {
            return response()->json([
                'data' => null,
                'message' => 'The email or password is incorrect.',
                'errors' => [],
            ], 401);
        }

        return $this->authenticatedResponse($user, 'Signed in successfully.');
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::query()->create([
            'name' => (string) $request->string('name')->trim(),
            'email' => (string) $request->string('email')->lower()->trim(),
            'password' => (string) $request->input('password'),
            'role' => Role::User,
        ]);

        return $this->authenticatedResponse($user, 'Account created successfully.', 201);
    }

    /**
     * Rotate an expired access token using the HttpOnly refresh cookie.
     */
    public function refresh(Request $request): JsonResponse
    {
        $token = $request->cookie((string) config('jwt.refresh_cookie', 'sharelab_refresh'));

        if (! is_string($token) || $token === '') {
            return $this->unauthenticatedResponse();
        }

        try {
            $payload = $this->jwt->decode($token);
        } catch (Throwable) {
            return $this->unauthenticatedResponse();
        }

        if (($payload['token_type'] ?? null) !== 'refresh') {
            return $this->unauthenticatedResponse();
        }

        $user = User::query()->find($payload['sub'] ?? null);

        if (! $user) {
            return $this->unauthenticatedResponse();
        }

        return $this->authenticatedResponse($user, 'Session refreshed.');
    }

    public function logout(): JsonResponse
    {
        return response()
            ->json([
                'data' => null,
                'message' => 'Signed out successfully.',
                'errors' => [],
            ])
            ->withCookie($this->jwt->forgetAccessCookie())
            ->withCookie($this->jwt->forgetRefreshCookie());
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => new UserResource($request->user()),
            'message' => 'User retrieved successfully.',
            'errors' => [],
        ]);
    }

    private function authenticatedResponse(User $user, string $message, int $status = 200): JsonResponse
    {
        $access = $this->jwt->issueAccessToken($user);
        $refresh = $this->jwt->issueRefreshToken($user);

        return response()
            ->json([
                'data' => [
                    'user' => new UserResource($user),
                ],
                'message' => $message,
                'errors' => [],
            ], $status)
            ->withCookie($this->jwt->accessCookie($access))
            ->withCookie($this->jwt->refreshCookie($refresh));
    }

    private function unauthenticatedResponse(): JsonResponse
    {
        return response()
            ->json([
                'data' => null,
                'message' => 'Your session has expired. Please sign in again.',
                'errors' => [],
            ], 401)
            ->withCookie($this->jwt->forgetAccessCookie())
            ->withCookie($this->jwt->forgetRefreshCookie());
    }
}
