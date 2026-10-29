# ShareLab — project knowledge

ShareLab is a campus equipment/makerspace sharing app: catalogue, credential
verification, booking requests with fairness rules, manager decisions,
check-in/return condition reports, incidents, notifications and audit trail.
Core principle: **humans decide** — automation only recommends; every
decision records a reason.

## Repo layout

- `sharelab/` — frontend. React 19 + Vite 8 + TanStack Router/Query +
  Tailwind v4. Path alias `#/*` → `./src/*`.
  - `src/routes/` — file-based routes; generated tree lives in `routeTree.gen.ts`
  - `src/features/` — admin, auth, bookings, check-in-return, credentials,
    dashboard, home, how-it-works, incidents, manager, notifications, owner,
    profile, resources, about
  - `src/components/{auth,glass,home,layout,navigation,resources,ui}`
  - `src/lib/` — `api-client.ts` (axios + envelope + 401 refresh),
    `auth.ts`, per-domain API modules (`resources.ts`, `bookings`…), `utils`
  - `src/hooks/` — TanStack Query hooks; **`useAuth.ts` is the real one**,
    `use-auth.ts` is only a re-export shim
  - `src/styles/` — `tokens.css` (design tokens), `base.css`, `fonts.css`
- `sharelab-api/` — **the API**. Laravel 11, custom JWT guard
  (`app/Auth/JwtGuard.php`), guards on `api`, no Sanctum tokens. API-only:
  no Blade, npm, Vite, Inertia or Wayfinder; the old starter-kit scaffold and
  the nested `backend/` directory are gone.

## Commands

Frontend (`cd sharelab`), pnpm only:
- `pnpm dev` — Vite on port 3000; proxies `/api` and `/storage` to
  `https://sharelab-api.local` (override with `VITE_API_PROXY_TARGET`)
- `pnpm build`, `pnpm preview`
- `pnpm lint` (eslint), `pnpm check` (prettier --check), `pnpm format`
- `pnpm generate-routes` (`tsr generate`); dev/build also regenerate
- There is no frontend test runner configured.

Backend (`cd sharelab-api`):
- `composer install`, then `cp .env.example .env && php artisan key:generate`
- `php artisan migrate --seed` (MariaDB database `sharelab`, utf8mb4)
- Laragon serves the API at `https://sharelab-api.local` (document root
  `sharelab-api/public`); `php artisan serve` on `:8000` is the fallback
- `php artisan test` — PHPUnit; tests use DB `sharelab_test` (real MariaDB,
  not sqlite), array cache, array mailer
- `vendor/bin/pint --parallel` (or `--test` to check only)
- `composer dev` runs serve + queue + pail + vite together

## API conventions

- Envelope: `{ data, message, errors, meta }` (paginated lists add
  `page`, `per_page`, `total`, `last_page` in `meta`)
- Never return Eloquent models or raw arrays — use API Resources under
  `app/Http/Resources/`
- Status codes: 200, 201, 204, 401, 403, 404, 409 (conflict), 422, 429
  (login is throttled 10/min)
- Auth is **JWT in HttpOnly cookies** (`sharelab_access`,
  `sharelab_refresh`; TTLs `JWT_ACCESS_TTL=15`, `JWT_REFRESH_TTL=10080`).
  Frontend uses `withCredentials` and silently retries once via
  `POST /api/refresh` on 401, then emits `sharelab:auth-expired`.
  Global middleware alias `jwt.auth` = `JwtCookieMiddleware`.
- Authorization: `role:` middleware (aliases `role:owner`, `role:manager`)
  plus Policies. Role is never trusted from the client.
- All timestamps are ISO-8601 UTC.

## Domain rules

- Roles: user, owner, manager, admin. `RoleMiddleware` does an exact
  string match on `users.role`, so `role:owner` and `role:manager` are
  mutually exclusive; broader access is granted in Policies/controllers.
- Eligibility: every `requires_verification` requirement needs a VERIFIED
  `user_credentials` row.
- Booking: max hours per booking; weekly cap sums
  approved/checked_in/returned hours in the ISO week (UTC) of the start;
  overlap test `existing.start_at < new.end_at AND existing.end_at > new.start_at`
  with `lockForUpdate()` — touching slots do not conflict. Overlap creates
  a waitlisted booking rather than an error.
- Priority = hours used in the last 30 days (lower is better), earlier
  request time breaks ties.
- Cancel of an approved booking promotes the top waitlisted request with
  `confirm_by = now + 24h`; `POST /api/bookings/{id}/confirm` approves it
  after re-checking conflicts.
- Check-in window: 30 minutes before start through end of slot; condition
  report required. Return sets `is_late` and creates
  `suggested_by_system` damage/delay incidents that stay suggestions until
  a manager confirms.
- `AuditLog` is append-only (model blocks update/delete).
- Uploads: pdf/jpg/png/webp, max 5 MB, private disk, served through a
  signed short-lived route (`GET /api/credentials/{id}/download`).
- Backend service layers live in `app/Services/{Auth,Booking,Condition,
  Credential,Eligibility,Incident,Notification,Resource,Audit}/` plus
  `app/Services/BookingService.php`.
- Seeder: 5 demo accounts (`user1@sharelab.test`, `user2@sharelab.test`,
  `manager@sharelab.test`, `owner@sharelab.test`, `admin@sharelab.test`;
  password `password` for all), 6 resources (3D Printer requires "3D
  Printer Training"), manager assigned to every resource, sample
  credentials/bookings/audit rows. Reseeding purges the older
  `user@user.com` style demo accounts and their records.

## Frontend conventions and gotchas

- Design system: warm beige + espresso glassmorphism. Use tokens from
  `src/styles/tokens.css` (ivory, cream, soft-beige, sand, taupe, espresso,
  deep-brown, charcoal, muted, success, warning, error) rather than raw hex.
- Reuse the glass surface (`components/glass/GlassPanel.tsx`) and the
  `--glass-*` variables in `tokens.css` instead of hand-rolling blur,
  borders and shadows.
- Typography: Manrope headings, Inter body.
- Status badges always pair a color with an icon.
- TanStack Router routes are file-based; run `pnpm generate-routes` after
  adding/renaming a route file.
- Keep API calls in `src/lib/*` modules and data fetching in
  `src/hooks/*`; components should not call axios directly.
- Windows checkout contains both `use-auth.ts` and `useAuth.ts` (case
  collision) — import `useAuth.ts`.
- Verification for UI work: `pnpm lint` + `pnpm build` (no test suite).

## Deployment

Docker Compose stack at the project root: `web` (nginx serving the built SPA
and proxying `/api`), `api` (PHP 8.3-FPM Laravel image, `sharelab-api/Dockerfile`)
and `db` (MariaDB 11). Same-origin, so the JWT cookies stay first-party.

- `cp .env.example .env` and set `APP_KEY`, `JWT_SECRET`, DB passwords, `APP_URL`
- `docker compose up -d --build` — the API entrypoint migrates and caches config/routes/views
- Seed once: `docker compose run --rm -e SEED_DATABASE=1 api php artisan db:seed --force`
- Full runbook: `DEPLOYMENT.md`

## Environment notes

- Backend env file is `sharelab-api/.env` (gitignored); DB config
  belongs only there. Ship `DB_PASSWORD=` blank in `.env.example`.
- Needs MariaDB running with `sharelab` (and `sharelab_test` for tests).
- JWT signing uses `JWT_SECRET`, falling back to `APP_KEY`
  (`config/jwt.php`), so `php artisan key:generate` is enough locally.
- Do not commit generated build output (`sharelab/dist`, `sharelab-api/public/build`),
  `node_modules`, `vendor`, or `.env` files.
