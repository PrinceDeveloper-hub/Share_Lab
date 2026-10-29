<?php

namespace App\Auth;

use App\Services\Auth\JwtService;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Http\Request;
use Throwable;

/**
 * Cookie-first JWT guard.
 *
 * Browsers never see the token in JavaScript: the access and refresh tokens
 * live in HttpOnly cookies. An Authorization: Bearer header is still accepted
 * for CLI tools and tests.
 */
class JwtGuard implements Guard
{
    protected ?Authenticatable $user = null;

    protected bool $resolved = false;

    public function __construct(
        protected UserProvider $provider,
        protected Request $request,
        protected JwtService $jwt,
    ) {}

    public function check(): bool
    {
        return $this->user() !== null;
    }

    public function guest(): bool
    {
        return ! $this->check();
    }

    public function hasUser(): bool
    {
        return $this->user !== null;
    }

    public function user(): ?Authenticatable
    {
        if ($this->resolved) {
            return $this->user;
        }

        $this->resolved = true;

        $token = $this->tokenFromRequest();

        if ($token === null) {
            return null;
        }

        try {
            $payload = $this->jwt->decode($token);
        } catch (Throwable) {
            return null;
        }

        if (($payload['token_type'] ?? null) !== 'access') {
            return null;
        }

        $id = $payload['sub'] ?? null;

        if (! is_scalar($id) || ! is_numeric($id)) {
            return null;
        }

        $user = $this->provider->retrieveById((int) $id);

        if ($user instanceof Authenticatable) {
            $this->user = $user;
        }

        return $this->user;
    }

    public function id(): int|string|null
    {
        return $this->user()?->getAuthIdentifier();
    }

    public function validate(array $credentials = []): bool
    {
        $user = $this->provider->retrieveByCredentials($credentials);

        if (! $user instanceof Authenticatable) {
            return false;
        }

        return $this->provider->validateCredentials($user, $credentials);
    }

    public function setUser(Authenticatable $user): static
    {
        $this->user = $user;
        $this->resolved = true;

        return $this;
    }

    protected function tokenFromRequest(): ?string
    {
        $header = $this->request->header('Authorization');

        if (is_string($header) && preg_match('/^Bearer\s+(.+)$/i', $header, $matches) === 1) {
            return trim($matches[1]);
        }

        $cookie = $this->request->cookie((string) config('jwt.access_cookie', 'sl_access'));

        return is_string($cookie) && $cookie !== '' ? $cookie : null;
    }
}
