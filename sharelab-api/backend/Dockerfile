# syntax=docker/dockerfile:1

# ---- Composer dependencies ----------------------------------------------
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

# ---- Runtime (PHP-FPM only) ----------------------------------------------
FROM php:8.3-fpm-alpine AS runtime

RUN apk add --no-cache icu-dev oniguruma-dev libzip-dev \
    && docker-php-ext-install -j"$(nproc)" pdo pdo_mysql mbstring intl bcmath opcache \
    && apk del icu-dev oniguruma-dev libzip-dev \
    && rm -rf /var/lib/apt/lists/* /tmp/*

WORKDIR /var/www/html

COPY --from=vendor /app /var/www/html
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh \
    && mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]

# ---- Standalone (nginx + PHP-FPM in one container) ------------------------
# The last stage of this file is the default build target, so a PaaS that only
# knows "build this Dockerfile and route HTTP to it" gets a self-contained API:
# nginx listens on $PORT and proxies to PHP-FPM over localhost. docker compose
# pins the FPM-only `runtime` stage instead (see docker-compose.yml).
FROM runtime AS standalone

RUN apk add --no-cache nginx supervisor gettext \
    && mkdir -p /etc/nginx/templates

COPY docker/nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY docker/supervisord.conf /etc/supervisord.conf

ENV PORT=8080

EXPOSE 8080

CMD ["sh", "-c", "envsubst '$PORT' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/nginx.conf && exec supervisord -c /etc/supervisord.conf"]
