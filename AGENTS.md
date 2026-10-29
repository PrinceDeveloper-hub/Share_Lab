# AGENTS.md

Campus lab/makerspace booking app. No workspace root manifest — run commands from each package dir.

## Map
- `sharelab/` — React 19 + Vite 8 + TanStack Router SPA.
- `sharelab-api/backend/` — **real backend** (Laravel 11 JSON API, Sanctum). Entry: `routes/api.php`, core logic in `app/Services/BookingService.php`. No `vendor/`/`.env` committed.
- `sharelab-api/` (root) — **stock Laravel 13 + Inertia starter kit** (teams/passkeys/Wayfinder). No ShareLab code/routes; ignore its CI/PHPStan for this app.
- `CLAUDE.md`/`knowledge.md` mix aspirational (repos/DTOs/events/`sharelab:*`, `pnpm` at root of starter) with reality — verify against code.

## Commands

### Frontend (`cd sharelab`)
- `pnpm install`
- `pnpm dev` (Vite :3000, proxies `/api` → `http://localhost:8000`)
- `pnpm build` → `dist/`
- `pnpm lint` (clean now)
- `pnpm format` (Prettier write + ESLint fix) / `pnpm check` (Prettier check only)
- `pnpm exec tsc --noEmit` (no `typecheck` script)
- `pnpm generate-routes` (`tsr generate`; runs on dev/build)

### Backend (`cd sharelab-api/backend`)
- `composer install`
- Setup: copy `.env.example` → `.env`, `php artisan key:generate`, `php artisan migrate --seed`
- `php artisan serve` (:8000)
- Tests: `php artisan test` or `php artisan test --filter=<name>` / `vendor/bin/phpunit tests/Unit/BookingServiceTest.php` (**wipes configured dev DB** via `RefreshDatabase`, no separate test DB)
- Lint: `vendor/bin/pint` / `vendor/bin/pint --test`
- Reset: `php artisan migrate:fresh --seed`
- No `composer test`/`lint`/`types:check` scripts; no PHPStan/Larastan.

## API/auth
- Cookie auth: `POST /api/login` sets HttpOnly `sharelab_token`; `AuthenticateFromCookie` forwards to Sanctum as Bearer. Frontend uses `withCredentials`, no tokens in JS.
- Envelope `{ data, message, errors?, meta? }`; paginated lists add `meta`. ISO-8601 UTC.
- Use API Resources in `app/Http/Resources/`; don't return bare models. 
- AuthZ via `role:` (`EnsureRole`), `User` helpers, inline ownership checks. Policy classes exist but unused (`authorize()` not called).

## Gotchas
**Backend**
- `BookingService` methods are **static**, called directly from controllers — no repo/DI layer; follow static style.
- `routes/api.php` has inline closures (incidents/notifications/admin). Most controllers validate inline (`$request->validate`); only `LoginRequest`, `RegisterRequest`, `ResourceCreateRequest` exist.
- No `php artisan sharelab:demo-reset`/`sharelab:expire-offers`, no scheduler. Waitlist offer expiry checked lazily in `BookingController@confirm`. `DatabaseSeeder` uses `User::create` → re-seed needs `migrate:fresh`.
- Models lack `HasFactory` except `UserFactory`; tests call factories for `User/Resource/Booking` → suite currently broken. 
- DB only in `sharelab-api/backend/.env` (gitignored), `.env.example` has blank password. Demo: `user1@sharelab.test`/`user2@sharelab.test`/`owner@sharelab.test`/`manager@sharelab.test`/`admin@sharelab.test` (pw `password`).

**Frontend**
- Routes: files in `src/routes/` (thin wrappers), pages in `src/features/<area>/`. `src/routeTree.gen.ts` generated — never edit.
- API via `src/lib/api-client.ts` (unwraps envelope), hooks in `src/hooks/`. Relative imports; `#/` and `@/` aliases configured but unused.
- Tailwind v4 via `@tailwindcss/vite`, tokens in `src/styles/tokens.css`. Reuse `GlassPanel`/`GlassCard` and tokens.
- Prettier: no semicolons, single quotes, trailing commas. `pnpm check` fails on many pre-existing files — avoid mass-formatting.
- No frontend test runner; verify with `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`.
- `sharelab/AGENTS.md` expects Intent skills via `pnpm exec intent list/load` but `@tanstack/intent` not installed — report missing dep, don't install replacement.
