# Deploying ShareLab

ShareLab ships as two images plus MariaDB:

| Service | Image | Role |
| --- | --- | --- |
| `web` | nginx serving the built Vite SPA | public entrypoint, proxies `/api` to PHP-FPM |
| `api` | PHP 8.3-FPM + Laravel 11 JSON API | business rules, auth, uploads |
| `db` | MariaDB 11 | persistent data |

The SPA and API share one origin, so the JWT cookies stay first-party and no
CORS configuration is needed in the default setup.

## 1. Configure

```bash
cp .env.example .env
```

Fill in:

- `APP_KEY` — `php artisan key:generate --show` (run locally, or inside the container)
- `JWT_SECRET` — `openssl rand -base64 48`
- `DB_PASSWORD`, `DB_ROOT_PASSWORD`
- `APP_URL` / `APP_PORT` — the public URL the browser will use

Set `APP_URL` to the real `https://…` address in production. Cookies are marked
secure automatically once the request arrives over TLS (`request()->isSecure()`,
with nginx forwarding `X-Forwarded-Proto`).

## 2. Build and start

```bash
docker compose up -d --build
docker compose ps
```

On boot the API container runs `php artisan migrate --force`, caches config,
routes and views, then starts PHP-FPM. Follow logs with:

```bash
docker compose logs -f api
```

The site is available at `http://localhost:8080` (or `APP_PORT`).

## 3. Load the demo data (optional, once)

```bash
docker compose run --rm -e SEED_DATABASE=1 api php artisan db:seed --force
```

Seeding leaves exactly four accounts, all with the password `password`:

| Role | Email |
| --- | --- |
| Student A | `user1@sharelab.test` |
| Student B | `user2@sharelab.test` |
| Manager | `manager@sharelab.test` |
| Owner | `owner@sharelab.test` |
| Admin | `admin@sharelab.test` |

Reseeding deletes the earlier `user@user.com` style demo accounts and their records.
For a real deployment, change these passwords or remove the seeder entirely.

## 4. HTTPS

Terminate TLS at your load balancer or a fronting proxy and forward to
`APP_PORT`. The API trusts forwarded headers, so secure-cookie detection and
generated URLs use the public HTTPS scheme. If you terminate TLS inside this
stack, add the certificate volume and a `listen 443 ssl` server block to
`sharelab/deploy/nginx.conf`.

## 5. Operations

```bash
docker compose logs -f api          # application logs (stderr channel)
docker compose exec api php artisan sharelab:expire-offers   # waitlist expiry
docker compose exec db mariadb-dump -u root -p"$DB_ROOT_PASSWORD" sharelab > backup.sql
docker compose pull && docker compose up -d --build           # upgrade
```

Uploaded credential files live in the `api-storage` volume; the database lives
in `db-data`. Back up both.

## 6. Alternative: split deployment

If the frontend is hosted separately (Vercel, Netlify, S3), build it with an
absolute API URL:

```bash
cd sharelab
VITE_API_BASE_URL=https://api.example.com/api pnpm build
```

Then set the API's `CORS_ALLOWED_ORIGINS` to the frontend origin (comma-separated)
and ensure cookies are `SameSite=None; Secure` — which requires HTTPS on both
origins. The same-origin setup above avoids that complexity.

## 7. Local development

```bash
cd sharelab-api/backend && composer install && php artisan migrate --seed && php artisan serve
cd sharelab && pnpm install && pnpm dev
```

The Vite dev server proxies `/api` to `http://localhost:8000`.

## 8. Pre-flight checklist

- [ ] `APP_KEY` and `JWT_SECRET` are set to unique random values
- [ ] `APP_DEBUG=false`, `APP_ENV=production`
- [ ] Database credentials are not the defaults, and ports are not publicly exposed
- [ ] `docker compose run --rm api php artisan migrate:status` shows all migrations
- [ ] `curl -fsS http://localhost:8080/up` returns 200
- [ ] Sign-in works for one seeded account, then rotate the demo passwords
