# ShareLab knowledge

ShareLab is a campus "labs & makerspace share idle equipment" app. Two packages:
a Laravel 11 JSON API (`sharelab-api`) and a React 19 + Vite + TanStack Router
frontend (`sharelab`). Everything runs over a warm-beige / espresso glassmorphism
design system.

## Commands

### Frontend (`sharelab`)
- Dev: `pnpm dev` (Vite on port 3000)
- Build: `pnpm build`
- Lint: `pnpm lint`
- Format: `pnpm format`
- Check: `pnpm check` (prettier)
- Route generation: `pnpm generate-routes`

### Backend (`sharelab-api/backend`)
- Install: `composer install`
- Dev: `composer dev` (serves artisan + pail + queue + vite concurrently)
- Test: `php artisan test` (runs `vendor/bin/phpunit` via composer script)
- Lint: `vendor/bin/pint --parallel`
- Lint check: `vendor/bin/pint --parallel --test`
- Typecheck/static analysis: `vendor/bin/phpstan analyse`
- Seed: `php artisan db:seed`

### Monorepo root
- `pnpm` is the package manager for the frontend; use it, not npm.

## Architecture

Monorepo: `sharelab/` (frontend) + `sharelab-api/` (Laravel backend).

### Backend layout
- `routes/api.php` - all API routes under `auth:sanctum` (except `/login`, `/logout`, `/me`, `/resources` which are public-ish, and the inline closure routes for incidents/notifications/admin)
- `app/Http/Controllers/Api/` - thin controllers, translate HTTP <-> DTO, always return API Resources
- `app/Http/Requests/` - FormRequests for validation + authorization
- `app/Http/Resources/` - JsonResource envelope `{ data, message, errors, meta }`
- `app/Services/BookingService.php` - core booking use-case logic
- `app/Enums/` - backed enums: Role, BookingStatus, CredentialStatus, IncidentStatus, ConditionType
- `app/Models/` - Eloquent models (User, Resource, Booking, UserCredential, ResourceRequirement, Incident, ConditionReport, Notification, AuditLog)
- `app/Policies/` - authorization policies (BookingPolicy, ResourcePolicy, UserPolicy)
- `app/Providers/AppServiceProvider.php` - only provider in use
- `database/migrations/` - all tables with foreign keys
- `database/seeders/DatabaseSeeder.php` - 5 accounts, 6 resources, sample bookings
- `tests/` - PHPUnit/Pest unit + feature tests

### Frontend layout (`sharelab/src`)
- `src/routes/` - TanStack file-based routes (`__root.tsx`, `index.tsx`)
- `src/features/` - feature areas: admin, bookings, check-in-return, dashboard, home, incidents, manager, owner, resources
- `src/components/` -glass/layout/navigation/ui/shared
- `src/lib/` - api-client.ts, auth.ts (hooks), query-client.ts, utils.ts
- `src/styles/` - tokens.css (CSS vars), tailwind config, global CSS

### Data flow
Frontend <-> `sharelab-api` (JSON) over Sanctum. All responses go through API
Resources (envelope). The frontend hooks (`useAuth`, `useBookings`) call the API.

## Backend rules (adhered to by code)
- Response envelope: `{ data, message, errors, meta }`
- Every response goes through an API Resource; never return Eloquent models or raw arrays from controllers
- Status codes: 200, 201, 204, 401, 403, 404, 409, 422, 429
- Timestamps are ISO-8601 UTC
- Role is never trusted from the client; server-side verification is via Policies + `role:` middleware
- Enums: Role (user/owner/manager/admin), BookingStatus (pending/waitlisted/approved/rejected/cancelled/checked_in/returned), CredentialStatus (pending/verified/rejected), IncidentStatus (open/resolved), ConditionType (checkin/return)
- Condition severity order (used by return/incident logic): excellent > good > fair > damaged
- Conflict test: `existing.start_at < new.end_at AND existing.end_at > new.start_at` against approved/checked_in bookings, `lockForUpdate()`; touching slots (end == start) do NOT conflict
- Weekly cap sums approved/checked_in/returned hours in the ISO week (UTC) of start
- Priority score = hours used in last 30 days (lower = higher priority); earlier request time breaks ties
- Waitlist promotion: on cancel of approved booking, top-ranked eligible waitlisted request gets the slot with `confirm_by = now + 24h`
- Check-in window: default 30 min before start to end of slot; owner only, approved only, condition report required
- Return: checked_in only; is_late = now > end_at; worse return condition than check-in -> system-suggested damage incident (`suggested_by_system = true`, unconfirmed until manager confirms)
- AuditLog is append-only (booted blockers on updating/deleting)
- Upload validation: mimes pdf/jpg/png/webp, max 5 MB, stored on private disk

## Notes
- `settings` are managed via `config/` files: auth, sanctum/cors, database, etc.
- `.env` lives in `sharelab-api/backend/.env` (gitignored); DB config goes ONLY there
- Demo accounts (password "password"): user1@sharelab.test, user2@sharelab.test, owner@sharelab.test, manager@sharelab.test, admin@sharelab.test
- Six seeded resources: 3D Printer (3D Printer Training), Oscilloscope, Camera Kit, Meeting Room, Laser Cutter, Soldering Station
- Frontend uses CSS variables from `src/styles/tokens.css` (Warm Beige + Espresso glassmorphism) and Tailwind config extends those token names
- Glass components use: `rgba(255,249,241,.76)` bg, `rgba(255,255,255,.62)` border, `blur(16px) saturate(115%)` backdrop
- Frontend route generation: `tsr generate` via `@tanstack/router-cli`
- Frontend TS config: strict, bundler moduleResolution, verbatimModuleSyntax, noEmit
- Frontend: tailwind v4 via `@tailwindcss/vite`; backend: tailwind v3 (config exists in `sharelab-api/backend/tailwind.config.js`)
- Public entrypoints (frontend build output goes to Laravel `public/`)
