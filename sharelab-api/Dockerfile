# syntax=docker/dockerfile:1

# ---- Composer dependencies ----------------------------------------------
# Dependencies are installed without dev packages and with an optimised
# autoloader, so the runtime image carries only what production needs.
FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-scripts \
    --prefer-dist \
    --ignore-platform-reqs

COPY . .
RUN composer dump-autoload --optimize --no-dev --no-scripts

# ---- Runtime -------------------------------------------------------------
# One process tree, one container: nginx terminates HTTP on $PORT and proxies
# to PHP-FPM over localhost. This is the shape a container PaaS expects (route
# traffic to the container's port) and it also runs unchanged on a VPS.
FROM php:8.3-fpm-alpine

# Runtime libraries are kept, build-only headers are removed again.
RUN apk add --no-cache \
        freetype libjpeg-turbo libpng oniguruma \
        icu-libs libzip nginx supervisor gettext \
    && apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS freetype-dev libjpeg-turbo-dev libpng-dev \
        icu-dev libzip-dev oniguruma-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_mysql mbstring bcmath intl zip gd opcache \
    && apk del .build-deps \
    && rm -rf /tmp/* /usr/local/etc/php-fpm.d/www.conf /usr/local/etc/php-fpm.d/zz-docker.conf

# Non-root runtime user. UID is fixed so a host volume can be chowned to it.
RUN adduser -D -u 10000 -h /var/www/html sharelab

WORKDIR /var/www/html

COPY --from=vendor --chown=sharelab:sharelab /app /var/www/html
COPY --chown=sharelab:sharelab docker/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY docker/php.ini /usr/local/etc/php/conf.d/zz-sharelab.ini
COPY docker/php-fpm.conf /usr/local/etc/php-fpm.d/zz-sharelab.conf
COPY docker/nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY docker/supervisord.conf /etc/supervisord.conf

RUN chmod +x /usr/local/bin/entrypoint.sh \
    && mkdir -p storage/framework/cache/data \
                storage/framework/sessions \
                storage/framework/views \
                storage/logs \
                storage/app/private \
                storage/app/public \
                bootstrap/cache \
    && chown -R sharelab:sharelab storage bootstrap/cache \
    && chmod -R ug+rwX storage bootstrap/cache

ENV PORT=8080 \
    APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr

USER sharelab

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/api/health" || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
