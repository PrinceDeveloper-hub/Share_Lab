#!/bin/sh
set -e

cd /var/www/html

# The uploads volume can be mounted over storage/app on first boot, so make
# sure the runtime user still owns the writable paths.
mkdir -p storage/framework/cache/data \
         storage/framework/sessions \
         storage/framework/views \
         storage/logs \
         storage/app/private \
         bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

if [ -n "$APP_KEY" ] && [ "$APP_KEY" = "base64:production_key_will_be_set_here" ]; then
    echo "APP_KEY is still the placeholder value. Set a real key in .env." >&2
    exit 1
fi

if [ "${RUN_MIGRATIONS:-1}" = "1" ]; then
    echo "Running database migrations..."
    php artisan migrate --force --no-interaction
fi

if [ "${SEED_DATABASE:-0}" = "1" ]; then
    echo "Seeding demo data..."
    php artisan db:seed --force --no-interaction
fi

php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "ShareLab API ready."
exec "$@"
