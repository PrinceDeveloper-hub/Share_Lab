<?php

namespace App\Support;

use RuntimeException;

/**
 * Fails the boot in production when the deployment contract is incomplete.
 *
 * A misconfigured container that starts happily and then answers every request
 * with a 500 (or signs tokens with the application key) is much harder to
 * diagnose than a boot that refuses to start with a readable message.
 *
 * Everything is read through `config()`, never `env()`, so the check also works
 * when the entrypoint has cached the configuration.
 */
class EnvironmentGuard
{
    /**
     * @return list<string> Human readable list of missing or unsafe settings.
     */
    public static function missingRequirements(): array
    {
        $missing = [];

        if (! config('app.key')) {
            $missing[] = 'APP_KEY (php artisan key:generate --show)';
        }

        if (! config('jwt.secret_configured')) {
            $missing[] = 'JWT_SECRET (openssl rand -base64 48)';
        }

        $connection = (string) config('database.default');
        $database = (array) config("database.connections.{$connection}", []);

        if (empty($database['database'])) {
            $missing[] = 'DB_DATABASE';
        }

        if (empty($database['host'])) {
            $missing[] = 'DB_HOST';
        }

        // SameSite=None cookies are only accepted over HTTPS, so a production
        // deployment must state the flag instead of relying on proxy detection.
        if (! config('jwt.cookie_secure')) {
            $missing[] = 'AUTH_COOKIE_SECURE=true';
        }

        if (empty(config('sharelab.allowed_origins'))) {
            $missing[] = 'ALLOWED_ORIGINS (the SPA origin)';
        }

        return $missing;
    }

    public static function assertProductionReady(): void
    {
        if (! app()->environment('production')) {
            return;
        }

        $missing = self::missingRequirements();

        if ($missing !== []) {
            throw new RuntimeException(
                'ShareLab API cannot start: missing or insecure configuration: '.implode('; ', $missing)
            );
        }
    }
}
