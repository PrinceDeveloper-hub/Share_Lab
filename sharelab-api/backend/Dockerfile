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

# ---- Runtime -------------------------------------------------------------
FROM php:8.3-fpm-alpine

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
