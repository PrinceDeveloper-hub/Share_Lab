# Progress

Last updated: 2026-10-30

## Where the project stands

| Area | State |
| --- | --- |
| `sharelab/` — React 19 + Vite 8 SPA (TanStack Router/Query, Tailwind v4) | Builds and deploys to Vercel as a static site. |
| `sharelab-api/` — Laravel 11 JSON API | API-only service: no Blade, Vite, npm, Inertia or Wayfinder. Deployed as one container. |
| Auth | JWT in HttpOnly cookies (`sharelab_access`, `sharelab_refresh`), refresh rotation, logout, origin-checked writes. |
| Booking workflow | Request → manager decision → confirm/waitlist → check-in → return, condition reports, incidents, timeline, audit log. |
| Demo data | `php artisan migrate --seed` creates five accounts (`user1@sharelab.test` … `admin@sharelab.test`, password `password`) and eleven resources. |

## What changed in this iteration

The backend was a Laravel 11 API living in `sharelab-api/backend/` next to a
stock Laravel 13 starter kit in `sharelab-api/`. That scaffold owned
`package.json` and a Vite config whose Wayfinder plugin shells out to `php`, so
a Vercel build pointed at `sharelab-api` failed with `php: command not found`.

The API now lives at `sharelab-api/` and the scaffold is deleted, together with
every Node, Blade, Inertia, Fortify and Wayfinder dependency. See
[DEPLOYMENT.md](DEPLOYMENT.md) for the two supported deployment shapes.

## Verification log

Commands are run from the directory named in each row.

| Check | Command | Result |
| --- | --- | --- |
| Route table (including `api/health`) | `php artisan route:list` | 66 routes, no closures |
| Route/config/event caching | `php artisan route:cache`, `config:cache`, `event:cache` | pass |
| Backend tests | `php artisan test` | 65 passed, 297 assertions |
| Code style | `vendor/bin/pint --test` | pass (133 files) |
| Static analysis | `vendor/bin/phpstan analyse` (Larastan, level 5) | pass with `phpstan-baseline.neon` |
| Frontend types | `pnpm exec tsc --noEmit` | pass |
| Frontend lint | `pnpm lint` | pass |
| Frontend build | `pnpm build` | pass |
| Frontend build without PHP | `PATH=<node only> pnpm build` | pass (`php` absent from PATH) |
| API image | `docker compose build api` | pass |
| Container health | `GET /api/health` on the running container | `200`, `"database":"ok"` |
| Cookie auth flow | login → `/api/me` → refresh → logout with a cookie jar | `200 / 200 / 200 / 200`, then `/api/me` `401`; two `HttpOnly; SameSite=Lax` cookies, no token in the body |
| Untrusted origin | `POST /api/login` with `Origin: https://evil.example` | `403 Origin not allowed.` |
| Upload ceiling | 3 MB PDF accepted path, 5 MB PDF | 5 MB → `422` "must not be greater than 4096 kilobytes" |
| Public uploads | owner uploads a resource image, fetch the returned URL | `200 image/png` from `/storage/resources/...`; `GET /.env` → `403` |
| Demo journey | guest → student → manager → admin over the containerised API | 21 API calls, all expected statuses (2 deliberate 401s), timeline has 5 entries |
| Production boot guard | `APP_ENV=production` with keys removed | boot aborts listing the missing keys |
| Production compose | `docker compose -f docker-compose.prod.yml config` | renders with `api`, `scheduler`, `db` |

## Known gaps

- Object storage (`FILESYSTEM_DISK=s3`) needs
  `composer require league/flysystem-aws-s3-v3:^3.0`; the disk is configured but
  the adapter is not installed by default (see DEPLOYMENT.md §7).
- Larastan runs against a baseline of pre-existing findings. New code must be
  clean; the baseline may shrink, never grow.
- The scheduler is a single container; two would duplicate scheduled jobs.
- Uploads are capped at 4 MB because the Vercel rewrite cannot forward larger
  request bodies.
- No frontend unit-test runner is configured: `pnpm lint`, `tsc`, `build` and
  the Playwright configuration cover the SPA.
