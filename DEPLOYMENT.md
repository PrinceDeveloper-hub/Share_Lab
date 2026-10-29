# Deployment

Two deployables, one origin:

```
browser
  │  https://<app>.vercel.app/*
  ▼
Vercel (static SPA, sharelab/dist)
  │  rewrite /api/*  →  https://<api-host>/api/*
  ▼
API container (sharelab-api: nginx:8080 + PHP-FPM + Laravel 11)
  │  pdo_mysql
  ▼
MariaDB / MySQL
```

The rewrite is what makes authentication work: the browser talks to a **single
origin**, so the `sharelab_access` / `sharelab_refresh` HttpOnly cookies are
first-party and `SameSite=Lax` is enough. Nothing on the frontend knows the API
host — it calls relative `/api/...` with `withCredentials`.

`sharelab-api` is API-only: no Blade views, no Vite, no npm, no Inertia. Its
root path answers with JSON and every product route lives under `/api`.

| Endpoint | Purpose |
| --- | --- |
| `GET /up` | Laravel's built-in liveness route |
| `GET /api/health` | JSON: `status`, `name`, `version`, `environment`, `database`, `timestamp`. `503` when the database is unreachable. No secrets. |
| `GET /` | `{name, version, status}` |

## 1. Build the API image

```bash
docker build -t sharelab-api sharelab-api
docker run --rm -p 8080:8080 --env-file .env sharelab-api
curl -s http://localhost:8080/api/health
```

The image is a single non-root container: nginx listens on `$PORT` (default
`8080`) and proxies to PHP-FPM over localhost, supervised by supervisord. On
boot the entrypoint:

1. renders `docker/nginx.conf.template` for `$PORT` and validates it,
2. creates the writable storage paths and (as root only) fixes ownership,
3. recreates `public/storage`,
4. waits up to 60 s for the database (`PDO` probe, no extra binaries),
5. runs `php artisan migrate --force` when `RUN_MIGRATIONS=1`,
6. seeds demo data only when `SEED_DEMO=1`,
7. caches config, routes and events,
8. starts supervisord.

`docker/php.ini` sets `upload_max_filesize=6M` / `post_max_size=8M`; nginx allows
`6m`. The application itself rejects uploads above `MAX_UPLOAD_KB` (default
**4096**, i.e. 4 MB) in the FormRequests, and the SPA validates the same 4 MB
before sending.

## 2. Environment contract

Never commit a filled `.env`. `sharelab-api/.env.example` is the template.

| Variable | Example | Notes |
| --- | --- | --- |
| `APP_NAME` | `ShareLab` | |
| `APP_VERSION` | `1.0.0` | Reported by `/api/health` and `/`. Bump per release. |
| `APP_ENV` | `production` | Boot guard runs when this is `production`. |
| `APP_DEBUG` | `false` | |
| `APP_KEY` | `php artisan key:generate --show` | Required. |
| `APP_URL` | `https://api.example.com` | Used for absolute image URLs and signed download links. |
| `LOG_CHANNEL` | `stderr` | Container-friendly. |
| `JWT_SECRET` | `openssl rand -base64 48` | Required; must not be the app key. |
| `JWT_TTL` | `15` | Access token, minutes. |
| `JWT_REFRESH_TTL` | `10080` | Refresh token, minutes (7 days). |
| `AUTH_COOKIE_SECURE` | `true` | Required in production. |
| `AUTH_COOKIE_SAMESITE` | `lax` | Use `none` only for a true cross-origin API. |
| `ALLOWED_ORIGINS` | `https://share-lab.vercel.app` | Comma-separated exact origins. Drives CORS **and** the write-origin check. |
| `DB_CONNECTION` | `mysql` | Works against MariaDB and MySQL. |
| `DB_HOST` / `DB_PORT` | `db` / `3306` | |
| `DB_DATABASE` / `DB_USERNAME` / `DB_PASSWORD` | `sharelab` / ... | |
| `SEED_DEMO` | `false` | `true` on a fresh demo install only. |
| `RUN_MIGRATIONS` | `1` | `0` on the scheduler container. |
| `FILESYSTEM_DISK` | `local` | Private uploads (credentials, condition photos). |
| `PUBLIC_FILESYSTEM_DISK` | `public` | Resource images. |
| `MAX_UPLOAD_KB` | `4096` | Keep at or below 4096 behind Vercel. |
| `AWS_*` | — | Only for object storage; see §7. |
| `CACHE_STORE` | `file` | |
| `SESSION_DRIVER` | `cookie` | The API is stateless; sessions are unused. |
| `QUEUE_CONNECTION` | `sync` | No queue worker is needed: notifications are database rows. |

`ALLOWED_ORIGINS` accepts **no wildcard**: credentialed requests cannot use
`*`. Add every origin that can reach the API, including Vercel preview URLs if
you test on them:

```bash
# In Vercel: Project → Settings → Environment Variables for the Preview scope.
ALLOWED_ORIGINS=https://share-lab.vercel.app,https://share-lab-git-main-yourteam.vercel.app
```

Preview deployments get a different hostname per commit. Either add the stable
branch alias, or omit preview testing — do not reach for a wildcard.

### Boot guard

With `APP_ENV=production` the app throws at boot when `APP_KEY`, `JWT_SECRET`,
`DB_HOST`, `DB_DATABASE`, `AUTH_COOKIE_SECURE` or `ALLOWED_ORIGINS` is missing.
`docker compose logs api` shows the missing keys; the container exits instead of
serving 500s.

## 3. Target A — VPS with docker-compose.prod.yml

```bash
git clone <repo> && cd <repo>
cp sharelab-api/.env.example .env.production   # fill in every blank
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl -fsS https://api.example.com/api/health
```

Services: `api` (port 8080), `scheduler` (`php artisan schedule:work`), `db`
(MariaDB 11). Volumes: `api-storage` → `/var/www/html/storage/app`,
`db-data` → `/var/lib/mysql`.

Terminate TLS in front of the container (Caddy, host nginx, or a load balancer)
and forward `X-Forwarded-Proto`/`X-Forwarded-For`; the app trusts forwarded
headers, so `APP_URL` and Secure cookies are detected correctly.

Uploads live on the `api-storage` volume. Back it up together with the database:

```bash
docker run --rm -v sharelab-prod_api-storage:/data -v "$PWD":/backup alpine \
  tar czf /backup/api-storage.tgz -C /data .
docker compose -f docker-compose.prod.yml exec db sh -c \
  'exec mariadb-dump -uroot -p"$MARIADB_ROOT_PASSWORD" "$MARIADB_DATABASE"' > db.sql
```

## 4. Target B — container PaaS with managed MySQL/MariaDB

1. Create a MySQL/MariaDB instance and note host, port, database, user, password.
2. Deploy `sharelab-api/` as a Docker service. The Dockerfile has one stage, so
   no build target is needed; the container listens on `8080`.
3. Attach the environment table from §2 with `DB_HOST`/`DB_PORT` pointing at the
   managed instance.
4. Set the health check path to `/api/health`.
5. Attach a persistent disk at `/var/www/html/storage/app`, **or** configure
   object storage (§7) — without one of the two, uploaded files disappear on
   every deploy.
6. Keep exactly one replica: the container runs migrations on boot, and the
   scheduler is a separate process. Scale the scheduler with a
   `command: php artisan schedule:work` service if the platform supports it,
   otherwise run it on a small always-on instance.
7. Give the platform a 60 s start timeout: PHP extensions compile in the image
   build, but the entrypoint waits for the database before serving.

Local equivalent: `docker compose up -d --build` (API on `localhost:8000`, DB on
`localhost:3307`, optional phpMyAdmin with `--profile tools` on `localhost:8081`).

## 5. Frontend on Vercel

| Setting | Value |
| --- | --- |
| Root Directory | `sharelab` |
| Framework Preset | Vite |
| Install Command | `pnpm install --frozen-lockfile` |
| Build Command | `pnpm build` |
| Output Directory | `dist` |
| Node Version | 22 |

`sharelab/vercel.json` pins install/build/output, so only the rewrite needs
editing:

```json
{ "source": "/api/(.*)", "destination": "https://YOUR-API-HOST/api/$1" }
```

Replace `https://YOUR-API-HOST` with the API origin — **no `/api` suffix, no
trailing slash** — then redeploy. `vercel.json` cannot interpolate environment
variables, which is why the host is written literally.

Leave `VITE_API_URL` unset: the relative default `/api` is what the rewrite
expects. Setting it to an absolute URL bypasses the rewrite and makes the
cookies cross-site (then set `AUTH_COOKIE_SAMESITE=none`).

Delete or repoint any old Vercel project whose Root Directory is `sharelab-api`:
that project tried to build the Laravel app with npm, which is exactly the
`php: command not found` failure the API-only split removes.

## 6. First-deploy checklist

```bash
curl -fsS  https://api.example.com/api/health          # 200, "database":"ok"
curl -s -o /dev/null -w '%{http_code}\n' \
     https://<app>.vercel.app/api/health               # 200 through the rewrite
curl -s -o /dev/null -w '%{http_code}\n' \
     https://<app>.vercel.app/api/resources             # 200 (public catalogue)
```

- [ ] `/api/health` returns `"database":"ok"` from both the API host and the SPA
      host (the second proves the rewrite).
- [ ] Log in in the browser; DevTools → Application → Cookies shows
      `sharelab_access` and `sharelab_refresh`, both `HttpOnly`, `Secure`, and
      `SameSite=Lax` (or `None` for a cross-origin setup).
- [ ] The login response body contains **no token** — only user data.
- [ ] Reloading the page keeps the session (the access cookie is used).
- [ ] After 15 minutes the session survives a refresh call
      (`POST /api/refresh` rotates both cookies).
- [ ] Logout clears the cookies and `/api/me` returns 401.
- [ ] Upload a 3 MB credential PDF: 201. Upload a 5 MB file: rejected with a
      validation error, not a proxy error.
- [ ] Resource images resolve (`<APP_URL>/storage/resources/...`).
- [ ] `docker compose -f docker-compose.prod.yml logs scheduler` shows the
      schedule running (`sharelab:expire-waitlist-offers` every minute).

## 7. Object storage (ephemeral disks)

The `s3` disk is configured in `config/filesystems.php` for S3-compatible
services. The Flysystem adapter is **not** installed by default (the AWS SDK is
large); install it in the image when you need it:

```dockerfile
RUN composer require league/flysystem-aws-s3-v3:^3.0 --no-interaction
```

then set `FILESYSTEM_DISK=s3`, `PUBLIC_FILESYSTEM_DISK=s3`, the `AWS_*`
variables, and `AWS_URL` (public base URL or CDN) so resource images resolve.
Private uploads stay private: they are streamed by
`GET /api/credentials/{credential}/download`, which verifies a signed URL and
authorization before touching the disk, so the bucket never needs public read
access for them.

## 8. Secrets

Generate once, store in the host's secret manager:

```bash
php artisan key:generate --show          # APP_KEY
openssl rand -base64 48                  # JWT_SECRET
```

Rotating `JWT_SECRET` invalidates every session immediately (users log in
again) — that is the intended emergency response. Rotating `APP_KEY` also
invalidates encrypted values and signed URLs; rotate it only with a maintenance
window. `git log --all -- sharelab-api/.env` and `git log --all -- '*.env'` show
no `.env` was ever committed: both `.gitignore` files exclude it.

## 9. Rollback

1. `docker compose -f docker-compose.prod.yml down` (volumes are kept).
2. Check out the previous image tag or commit, `docker build` it, and start again.
3. If a migration must be undone: `docker compose exec api php artisan migrate:rollback --step=1`
   — test on a copy first; every table has a `down()`.

Vercel keeps every deployment; "Promote to Production" on the previous build is
the frontend rollback.

## 10. Known limitations

- Larastan runs with `phpstan-baseline.neon` (172 pre-existing findings). The
  baseline must shrink; new code is analysed at level 5.
- The scheduler container is single-instance (`schedule:work`); running two
  would duplicate the waitlist job. `withoutOverlapping()` protects each run.
- Vercel's rewrite caps request bodies at ~4.5 MB, hence the 4 MB application
  limit. Larger uploads need a direct-to-API or direct-to-S3 flow.
- The API assumes a single container per release when migrations run on boot.
- `docker-compose.prod.yml` uses MariaDB on the same host; for a managed
  database, deploy only `api` and `scheduler` and point `DB_HOST` at it.
