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

### Vercel

The frontend lives in `sharelab/`, which is a subdirectory of this repository.
Configure the Vercel project exactly like this:

| Setting | Value |
|---|---|
| Root Directory | `sharelab` |
| Framework Preset | Vite |
| Install Command | `pnpm install --frozen-lockfile` |
| Build Command | `pnpm build` |
| Output Directory | `dist` |
| Environment variable | `VITE_API_BASE_URL=https://<api-host>/api` |

`sharelab/vercel.json` already pins the install and build commands plus the SPA
fallback, but Vercel only reads it from the **Root Directory**. If the Root
Directory is left at the repository root or at `sharelab-api`, the build runs
the Laravel starter kit instead of the SPA. That build now tolerates the
missing PHP binary (see [Wayfinder types](#wayfinder-types-sharelab-api)), but
the artifact you want is still the SPA in `sharelab/`.

Notes:

- `sharelab/pnpm-lock.yaml` is the lockfile. Verify the log says pnpm; an
  `npm install` step re-resolves every floating range and can pull broken
  upstream releases.
- The SPA rewrite must keep `/api` excluded (`sharelab/vercel.json`), otherwise
  API requests return `index.html` with status 200 and the app crashes on
  unexpected response shapes.
- Vercel hosts only the SPA. The Laravel API still needs its own host (Docker
  Compose above, or any PHP host) and `CORS_ALLOWED_ORIGINS` set to the Vercel
  origin.

### Wayfinder types (`sharelab-api`)

`resources/js/actions`, `resources/js/routes` and `resources/js/wayfinder` in
`sharelab-api` are generated from PHP routes and controllers by
`@laravel/vite-plugin-wayfinder`, which shells out to
`php artisan wayfinder:generate --with-form`. Hosted build images such as
Vercel's have no PHP, so `sharelab-api/vite.config.ts` probes for a `php`
binary (and skips immediately when `VERCEL` is set) and leaves the plugin out
instead of failing the build. The build then compiles the committed generated
files, which is why they are tracked in Git and no longer listed in
`sharelab-api/.gitignore`:

| Path | Contents |
| --- | --- |
| `resources/js/actions/**` | one module per controller action |
| `resources/js/routes/**` | one module per named route |
| `resources/js/wayfinder/index.ts` | shared URL and query helpers |

Regenerate and commit them whenever Laravel routes or controller signatures
change:

```bash
cd sharelab-api
php artisan wayfinder:generate --with-form
git add resources/js/actions resources/js/routes resources/js/wayfinder
```

If a PHP-less build starts without those files, `vite.config.ts` stops it with
`Wayfinder types are missing and php is not available to generate them:`
followed by the absent paths, rather than letting it surface as unresolved
`@/actions` and `@/routes` imports. `sharelab-api/.prettierignore` keeps the
generated output out of `vp check` / `vp fmt`, since the `fmt.ignorePatterns`
block does not match those directories.

### Deploying the API for a Vercel-hosted SPA

Once the SPA lives on Vercel and the API does not, every `/api/...` request
from the SPA hits Vercel, which answers with its own 404. Reachability check:

| Request | API is live when | API is missing when |
| --- | --- | --- |
| `GET https://<api-host>/up` | `200` | `404` or an HTML page |
| `GET https://<api-host>/api/resources` | `200` with the JSON envelope (public list) | `404` or an HTML page |
| `GET https://<api-host>/api/me` | JSON `401` envelope (no cookie yet) | `404` or an HTML page |

The API image (`sharelab-api/backend/Dockerfile`) runs PHP-FPM on port 9000,
so it needs a web server in front of it — either the nginx service from
`docker-compose.yml` or your own reverse proxy. The compose stack already
routes `/api` and `/up` to FPM, so a VPS deployment exposes the API at
`https://<host>/api` with nothing else to configure:

```bash
docker compose up -d --build
curl -fsS https://<host>/up
```

If the API goes to a Docker PaaS that routes HTTP to one container, build the
`standalone` stage instead: it runs nginx and PHP-FPM in the same image,
listens on `$PORT` (default `8080`) and needs no sidecar proxy.

```bash
docker build --target standalone -t sharelab-api sharelab-api/backend
docker run -p 8080:8080 --env-file .env sharelab-api
curl -fsS http://localhost:8080/up
```

`standalone` is the last stage of `sharelab-api/backend/Dockerfile`, so a
platform that simply builds the file (Render, Railway, Fly, App Runner) gets
it without a target setting; platforms that assign a port only have to pass
`PORT`, and the container listens there. `docker compose up api-http` builds
the same image locally and publishes it on `API_HTTP_PORT` (8001 by default).
PHP-FPM alone stays available as the `runtime` stage, which is what the
compose `api` service builds.

API environment (container or platform variables — never committed):

| Variable | Value |
| --- | --- |
| `APP_NAME` | `ShareLab` |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_KEY` | `php artisan key:generate --show` |
| `APP_URL` | `https://<api-host>` |
| `DB_CONNECTION` | `mysql` |
| `DB_HOST` / `DB_PORT` | database host / `3306` |
| `DB_DATABASE` / `DB_USERNAME` / `DB_PASSWORD` | database credentials |
| `JWT_SECRET` | `openssl rand -base64 48` |
| `CORS_ALLOWED_ORIGINS` | the SPA origin, e.g. `https://share-lab.vercel.app` |
| `RUN_MIGRATIONS` | `1` (the entrypoint runs `php artisan migrate --force`) |
| `JWT_COOKIE_SAME_SITE` | `none` |
| `JWT_COOKIE_SECURE` | `true` |

`CORS_ALLOWED_ORIGINS` takes a comma-separated list of exact origins: scheme
plus host, no trailing slash, no wildcard (wildcards are incompatible with
`supports_credentials`, which the cookies need).

Cross-site cookies: both sides must be HTTPS, and `JWT_COOKIE_SAME_SITE=none`
requires `JWT_COOKIE_SECURE=true`, otherwise the browser drops the cookie and
every request after a successful login returns 401. Keep the `lax` default for
same-origin deployments. Uploaded files live in `storage/app`, so mount a
persistent volume there or uploads disappear on redeploy.

Uploaded resource images need no rewrite on the SPA host: `config/filesystems.php`
builds public-disk URLs from `APP_URL`, so an uploaded image is returned as
`https://<api-host>/storage/resources/…` and the browser fetches it from the API
directly. Two pieces keep that path alive — the entrypoint recreates
`public/storage` on every boot (it points into the mounted volume), and nginx
serves `/storage/` from the `api-storage` volume, which `sharelab/deploy/nginx.conf`
does for the compose stack and the `standalone` image does through its document
root. Credential files stay private and stream through
`GET /api/credentials/{id}/download`.

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
