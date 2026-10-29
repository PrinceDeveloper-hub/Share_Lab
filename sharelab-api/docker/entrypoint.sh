#!/bin/sh
# Container entrypoint: prepare the filesystem, wait for the database, apply
# migrations, warm the caches and then hand over to supervisord (nginx + FPM).
set -eu

cd /var/www/html

log() {
    # Everything goes to stderr so platform log collectors see one stream.
    echo "[sharelab] $*" >&2
}

PORT="${PORT:-8080}"

# ---- nginx ---------------------------------------------------------------
# Rendered at start because the port is a runtime decision. Only $PORT is
# substituted so nginx variables in the template survive.
envsubst '$PORT' < /etc/nginx/templates/nginx.conf.template > /tmp/nginx.conf
if ! nginx -t -c /tmp/nginx.conf >/dev/null 2>&1; then
    log "nginx configuration is invalid; see the error below."
    nginx -t -c /tmp/nginx.conf >&2 || true
    exit 1
fi

# ---- writable paths ------------------------------------------------------
mkdir -p storage/framework/cache/data \
         storage/framework/sessions \
         storage/framework/views \
         storage/logs \
         storage/app/private \
         storage/app/public \
         bootstrap/cache

# A host bind mount can arrive owned by root. Named volumes inherit the image
# ownership (sharelab), in which case there is nothing to fix.
if [ "$(id -u)" = "0" ]; then
    chown -R sharelab:sharelab storage bootstrap/cache
fi

# Uploaded resource images are served from the public disk at /storage/...,
# which only exists through public/storage. Recreate it on every boot because
# it points into the storage volume, which is not part of the image.
php artisan storage:link --force --no-interaction >/dev/null 2>&1 || \
    log "storage:link failed (the public disk may be object storage); continuing."

# ---- database ------------------------------------------------------------
wait_for_database() {
    [ "${DB_CONNECTION:-mysql}" = "sqlite" ] && return 0
    [ -n "${DB_HOST:-}" ] || return 0

    attempt=1
    while [ "$attempt" -le 30 ]; do
        if php -r '
            $host = getenv("DB_HOST");
            $port = getenv("DB_PORT") ?: "3306";
            $database = getenv("DB_DATABASE");
            $user = getenv("DB_USERNAME");
            $password = getenv("DB_PASSWORD");
            try {
                new PDO(
                    "mysql:host={$host};port={$port};dbname={$database}",
                    (string) $user,
                    (string) $password,
                    [PDO::ATTR_TIMEOUT => 3],
                );
                exit(0);
            } catch (Throwable $e) {
                exit(1);
            }
        ' 2>/dev/null; then
            log "database is reachable (attempt ${attempt})."
            return 0
        fi

        log "waiting for the database at ${DB_HOST}:${DB_PORT:-3306} (attempt ${attempt}/30)."
        attempt=$((attempt + 1))
        sleep 2
    done

    log "database did not become reachable in time; giving up."
    return 1
}

wait_for_database

# ---- schema and demo data ------------------------------------------------
if [ "${RUN_MIGRATIONS:-1}" = "1" ]; then
    log "running migrations."
    php artisan migrate --force --no-interaction
fi

# SEED_DEMO is the documented switch; SEED_DATABASE is honoured for older
# deployment files. Both are off by default.
if [ "${SEED_DEMO:-0}" = "1" ] || [ "${SEED_DATABASE:-0}" = "1" ]; then
    log "seeding demo data."
    php artisan db:seed --force --no-interaction
fi

# ---- caches --------------------------------------------------------------
# There are no Blade views to compile: this application serves JSON only.
php artisan config:cache
php artisan route:cache
php artisan event:cache

log "ready on port ${PORT} (app env: ${APP_ENV:-production})."

exec "$@"
