<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Authenticate a user and issue an HttpOnly session cookie.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::query()->where('email', $request->input('email'))->first();

        if (! $user || ! Hash::check((string) $request->input('password'), $user->password)) {
            return response()->json([
                'data' => null,
                'message' => 'The email or password is incorrect.',
                'errors' => [],
            ], 401);
        }

        return $this->authenticatedResponse($user, 'Logged in successfully.');
    }

    /**
     * Create a standard user account. Privileged roles can never be supplied
     * by the public registration form.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::query()->create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => $request->input('password'),
            'role' => Role::User,
        ]);

        return $this->authenticatedResponse($user, 'Account created successfully.', 201);
    }

    /**
     * End the current API token session and clear the HttpOnly cookie.
     */
    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()?->currentAccessToken();

        if ($token && method_exists($token, 'delete')) {
            $token->delete();
        }

        return response()
            ->json([
                'data' => null,
                'message' => 'Logged out successfully.',
            ])
            ->withoutCookie('sharelab_token');
    }

    /**
     * Return the currently authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => new UserResource($request->user()),
            'message' => 'User info retrieved successfully.',
        ]);
    }

    private function authenticatedResponse(User $user, string $message, int $status = 200): JsonResponse
    {
        $token = $user->createToken('sharelab-web')->plainTextToken;

        return response()
            ->json([
                'data' => [
                    'user' => new UserResource($user),
                ],
                'message' => $message,
            ], $status)
            ->cookie(
                'sharelab_token',
                $token,
                60 * 24 * 7,
                '/',
                null,
                request()->isSecure(),
                true,
                false,
                'lax',
            );
    }
}
