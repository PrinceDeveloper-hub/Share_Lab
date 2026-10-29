<?php

namespace App\Services\Auth;

use App\Models\User;
use Symfony\Component\HttpFoundation\Cookie;
use UnexpectedValueException;

/**
 * Small, dependency-free HS256 JWT issuer/verifier.
 *
 * Access tokens are short lived and sent as an HttpOnly cookie. Refresh tokens
 * carry a distinct `token_type` claim and are only accepted by the refresh
 * endpoint, which rotates both cookies.
 */
class JwtService
{
    public function issueAccessToken(User $user): string
    {
        return $this->encode($this->claims($user, 'access', (int) config('jwt.access_ttl', 15)));
    }

    public function issueRefreshToken(User $user): string
    {
        return $this->encode($this->claims($user, 'refresh', (int) config('jwt.refresh_ttl', 10080)));
    }

    /**
     * @return array<string, mixed>
     */
    public function decode(string $token): array
    {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            throw new UnexpectedValueException('Malformed token.');
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;

        $expected = $this->sign("{$encodedHeader}.{$encodedPayload}");

        if (! hash_equals($expected, $encodedSignature)) {
            throw new UnexpectedValueException('Invalid token signature.');
        }

        $payload = json_decode($this->base64UrlDecode($encodedPayload), true);

        if (! is_array($payload)) {
            throw new UnexpectedValueException('Invalid token payload.');
        }

        $now = time();

        if (isset($payload['nbf']) && (int) $payload['nbf'] > $now + 30) {
            throw new UnexpectedValueException('Token is not valid yet.');
        }

        if (! isset($payload['exp']) || (int) $payload['exp'] <= $now) {
            throw new UnexpectedValueException('Token has expired.');
        }

        return $payload;
    }

    public function accessCookie(string $token): Cookie
    {
        return $this->cookie(
            (string) config('jwt.access_cookie', 'sl_access'),
            $token,
            (int) config('jwt.access_ttl', 15),
            (string) config('jwt.access_cookie_path', '/'),
        );
    }

    public function refreshCookie(string $token): Cookie
    {
        return $this->cookie(
            (string) config('jwt.refresh_cookie', 'sl_refresh'),
            $token,
            (int) config('jwt.refresh_ttl', 10080),
            (string) config('jwt.refresh_cookie_path', '/api'),
        );
    }

    public function forgetAccessCookie(): Cookie
    {
        return $this->expiredCookie(
            (string) config('jwt.access_cookie', 'sl_access'),
            (string) config('jwt.access_cookie_path', '/'),
        );
    }

    public function forgetRefreshCookie(): Cookie
    {
        return $this->expiredCookie(
            (string) config('jwt.refresh_cookie', 'sl_refresh'),
            (string) config('jwt.refresh_cookie_path', '/api'),
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function claims(User $user, string $type, int $ttlMinutes): array
    {
        $now = time();

        return [
            'iss' => config('app.url'),
            'sub' => (string) $user->getKey(),
            'role' => $user->role instanceof \BackedEnum ? $user->role->value : (string) $user->role,
            'token_type' => $type,
            'iat' => $now,
            'nbf' => $now,
            'exp' => $now + ($ttlMinutes * 60),
            'jti' => bin2hex(random_bytes(16)),
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function encode(array $payload): string
    {
        $header = $this->base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT'], JSON_THROW_ON_ERROR));
        $body = $this->base64UrlEncode(json_encode($payload, JSON_THROW_ON_ERROR));

        return "{$header}.{$body}.".$this->sign("{$header}.{$body}");
    }

    private function sign(string $value): string
    {
        return $this->base64UrlEncode(hash_hmac('sha256', $value, $this->secret(), true));
    }

    private function secret(): string
    {
        $secret = (string) config('jwt.secret');

        if ($secret === '') {
            throw new \RuntimeException('JWT secret is not configured. Set JWT_SECRET or APP_KEY.');
        }

        if (str_starts_with($secret, 'base64:')) {
            $decoded = base64_decode(substr($secret, 7), true);

            if (is_string($decoded) && $decoded !== '') {
                return $decoded;
            }
        }

        return $secret;
    }

    private function cookie(string $name, string $value, int $minutes, string $path): Cookie
    {
        return new Cookie(
            $name,
            $value,
            time() + ($minutes * 60),
            $path,
            null,
            $this->secure(),
            true,
            false,
            (string) config('jwt.cookie_same_site', 'lax'),
        );
    }

    private function expiredCookie(string $name, string $path): Cookie
    {
        return new Cookie(
            $name,
            '',
            time() - 3600,
            $path,
            null,
            $this->secure(),
            true,
            false,
            (string) config('jwt.cookie_same_site', 'lax'),
        );
    }

    /**
     * Browsers reject a SameSite=None cookie that is not Secure, so an explicit
     * JWT_COOKIE_SECURE wins and otherwise the (trusted-proxy aware) request
     * scheme decides.
     */
    private function secure(): bool
    {
        $configured = config('jwt.cookie_secure');

        if ($configured === null || $configured === '') {
            return request()->isSecure();
        }

        return filter_var($configured, FILTER_VALIDATE_BOOLEAN);
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $value): string
    {
        $padding = strlen($value) % 4;

        if ($padding > 0) {
            $value .= str_repeat('=', 4 - $padding);
        }

        $decoded = base64_decode(strtr($value, '-_', '+/'), true);

        if ($decoded === false) {
            throw new UnexpectedValueException('Invalid token encoding.');
        }

        return $decoded;
    }
}
