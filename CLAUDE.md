# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Build, Lint, and Test

**Backend (Laravel 11 JSON API):**

- Run all checks: `cd sharelab-api && pnpm ci:check`
- Lint only: `cd sharelab-api && pnpm lint`
- Typecheck only: `cd sharelab-api && pnpm types:check`
- Run tests: `cd sharelab-api && pnpm test`
- Seed database: `cd sharelab-api && php artisan db:seed`
- Reset demo data: `cd sharelab-api && php artisan sharelab:demo-reset`
- Code format check: `cd sharelab-api && vendor/bin/pint --test`
- Code format fix: `cd sharelab-api && vendor/bin/pint --parallel`

**Frontend (React 19 + Vite + TanStack Router):**

- Development: `cd sharelab && pnpm dev`
- Build: `cd sharelab && pnpm build`
- Lint: `cd sharelab && pnpm lint`
- Format: `cd sharelab && pnpm format`
- Check: `cd sharelab && pnpm check`
- Type check: `cd sharelab && pnpm types:check`
- Generate routes: `cd sharelab && pnpm generate-routes` (required after adding/renaming route files)

**Root-level (monorepo):**

- CI check (lint → typecheck → test): `pnpm --filter sharelab-api ci:check` (from root)
- Full dev stack: `docker compose up -d --build` (starts API + web + db)

### Before You Start

- Check `sharelab-api/.env` — DB configuration goes ONLY in `backend/.env` (gitignored); ship `.env.example` with a blank password
- Run `cd sharelab-api && php artisan key:generate` after first setup
- Ensure MariaDB is running with `sharelab` database (utf8mb4)
- The demo uses these accounts (password "password" for local/demo only):
  - `user1@sharelab.test` (student; pending Laser Cutter Certification, needs 3D Printer Training)
  - `user2@sharelab.test` (student; verified 3D Printer Training and Oscilloscope Safety)
  - `manager@sharelab.test` (assigned to all six resources)
  - `owner@sharelab.test`
  - `admin@sharelab.test`
  - All five use the password `password`. Reseeding removes older demo accounts.
- Six seeded resources: 3D Printer (requires "3D Printer Training"), Oscilloscope, Camera Kit, Meeting Room, Laser Cutter, Soldering Station
- Run `cd sharelab-api && php artisan sharelab:demo-reset` to reset seed data

### Quickstart

```bash
# 1. Ensure MariaDB is running with 'sharelab' database (utf8mb4)
# 2. Set up backend: cd sharelab-api && cp .env.example .env && php artisan key:generate && php artisan migrate --seed
# 3. Start API: cd sharelab-api && php artisan serve          # http://127.0.0.1:8000
# 4. Start frontend: cd sharelab && pnpm dev                # http://localhost:3000
```

### Demo Accounts (password: `password`)

- `user1@sharelab.test` — student; pending 3D Printer Training
- `user2@sharelab.test` — student; verified 3D Printer Training + Oscilloscope Safety
- `manager@sharelab.test` — assigned to all six resources
- `owner@sharelab.test` — resource owner
- `admin@sharelab.test` — platform administrator

## High-Level Architecture

This is a **monorepo** with two distinct packages:

- **`sharelab-api/`** — Laravel 11 JSON API backend. No Blade views, no Vite, no Inertia.
- **`sharelab/`** — React 19 + Vite 8 + TanStack Router + TanStack Query. Tailwind CSS v4.

### Layering (strict one-direction dependency)

```
app/
  Controllers/Api/    # thin: translate HTTP <-> DTO, return Resource
  Requests/           # FormRequests: validate/authorize input shape
  Resources/          # JsonResource: envelope + role-based fields
  Services/           # Service classes: use-case logic
  Enums/              # PHP backed enums: Role, BookingStatus, etc.
  Exceptions/Domain/  # Domain exceptions mapped by exception handler
  DTOs/               # readonly classes (CreateBookingData, etc.)
  Events/ + Listeners/ # BookingDecided, BookingCancelled, etc.
  Repositories/Eloquent/ # Eloquent implementations of contracts
  Policies/           # Authorization policies
  Providers/          # Bind interfaces to implementations
```

Every response goes through an API Resource. Never return Eloquent models or raw arrays from controllers.

### Frontend Architecture

```
src/
  components/
    {ui,layout,navigation,feedback,glass,shared}  # UI components
  features/
    {auth,home,resources,eligibility,credentials,
     bookings,check-in-return,incidents,notifications,
     owner,manager,admin}  # Feature areas
  routes/              # Route file TanStack definitions
  lib/
    api-client.ts      # Attaches Sanctum token, unwraps envelope, logs out on 401
    auth.ts            # Auth state & token management
    query-client.ts    # TanStack Query config
    permissions.ts     # Role/permission logic
    date-time.ts       # UTC handling, timezone conversion
    motion.ts          # Framer Motion config
    utils.ts           # Helper functions
  hooks/               # Custom React hooks
  styles/              # Global styles, Tailwind config
  types/               # TypeScript type definitions
```

### API Routes (all under `auth:sanctum` unless noted)

Key endpoints organized by function:

**Authentication:** POST /login, POST /logout, GET /me

**Resources:** GET /resources, GET /resources/{id}, POST /resources, PATCH /resources/{id}, POST /resources/{id}/images, GET /resources/{id}/eligibility, GET /resources/{id}/availability

**Credentials:** POST /credentials (multipart), GET /credentials, PATCH /credentials/{id}/verify

**Bookings:** POST /bookings, GET /bookings, GET /bookings/{id}, PATCH /bookings/{id}/decision, POST /bookings/{id}/cancel, PATCH /bookings/{id}/extend, POST /bookings/{id}/confirm, POST /bookings/{id}/checkin, POST /bookings/{id}/return, GET /bookings/{id}/timeline, POST /bookings/{id}/incidents

**Incidents:** GET /incidents, PATCH /incidents/{id}/confirm, PATCH /incidents/{id}/resolve

**Admin:** GET /admin/audit, GET /admin/users, PATCH /admin/users/{id}/role, PATCH /admin/users/{id}/status

**Notifications:** GET /notifications, PATCH /notifications/{id}/read, POST /notifications/read-all

## Key Patterns

### Booking Lifecycle (mandatory flow)

1. **Eligibility**: Check all resource requirements; `requires_verification` credentials must be VERIFIED
2. **Duration & Weekly Cap**: Max hours per booking; sum user's approved/checked_in/returned hours in ISO week (UTC); block if exceeding weekly cap
3. **Conflict**: `existing.start_at < new.end_at AND existing.end_at > new.start_at` against approved/checked_in bookings with `lockForUpdate()`
4. **Priority Score**: Hours used in last 30 days (lower = higher priority); earlier request time breaks ties
5. **Recommendation**: Read-only suggestion (approve|waitlist|reject + reason); never applied automatically
6. **Decision**: approve/reject/waitlist with REQUIRED reason; re-check conflict on approve (409 if now conflicting); notify user; audit
7. **Waitlist Promotion**: On cancel of approved booking, offer slot to top-ranked eligible waitlisted request; set `confirm_by = now+24h`; notify user
8. **Cancel, Extend**: Re-run cap and conflict checks
9. **Check-in**: Owner of approved booking, within configured window (30 min before start to end of slot), condition report required
10. **Return**: Checked_in state, condition report required, `is_late` flag if now > end_at; if return condition worse than check-in, create system-suggested `damage` incident (stays suggestion until manager confirms)
11. **State Machine**: `BookingStateMachine` defines valid transitions; invalid ones throw `InvalidTransitionException`

### API Resource Pattern

- Every response goes through an API Resource
- Never return Eloquent models or raw arrays from controllers
- Resources enforce role-based fields (some fields only visible to owners/admins)
- Use `whenLoaded` to avoid N+1 queries
- Query-count assertions in tests to prevent N+1

### Dependency Injection

- Controllers and services depend on contracts via constructor injection
- Bindings in service providers (no `new` of collaborators, no facades inside domain code)
- Small, focused contracts (ResourceReader, ResourceWriter, BookingReader, BookingWriter, ConflictFinder, AuditRecorder, Notifier)

### Testing Approach

**Backend (PHPUnit/Pest):**

- Unit tests per Rule class and PriorityScoreCalculator
- State machine transition tests
- Overlap edge cases (touching, nested, partial, identical)
- ISO-week boundaries and UTC handling
- Waitlist promotion order and offer expiry
- Contract tests for repository interfaces (Eloquent vs in-memory fake)
- API Resource shape tests (fields, role-based fields, whenLoaded, no N+1 via query-count assertions)
- Policy denials per role
- Decision without reason → 422
- Audit append-only
- Audit rollback consistency (rollback leaves no audit row)
- Concurrency: two simultaneous requests for one slot → exactly one approvable, one waitlisted
- Late-return flag and system-suggested incidents
- Upload validation (mime: pdf/jpg/png/webp, size: 5MB)

**Frontend:**

- Type-check, lint, build
- Component tests for eligibility panel, booking panel, decision dialog
- Route-guard tests
- E2E acceptance scenarios (documented manual walkthrough)

## Design Tokens (Warm Beige + Espresso Glassmorphism)

**CSS Variables (from `sharelab/src/styles/tokens.css`):**

| Variable | Value | Purpose |
|---|---|---|
| `--ivory` | `#F7F0E6` | Page bg |
| `--cream` | `#FFF9F1` | Cards |
| `--soft-beige` | `#E9D9C6` | |
| `--sand` | `#D6BDA4` | Borders |
| `--taupe` | `#A78B73` | |
| `--espresso` | `#4B2F1F` | Primary buttons |
| `--deep-brown` | `#302219` | Sidebar |
| `--charcoal` | `#282522` | Text |
| `--muted` | `#82776D` | |
| `--success` | `#387653` | |
| `--warning` | `#B77932` | |
| `--error` | `#B44D42` | |

**Glass components** (reusable): `GlassPanel`, `GlassCard`, `GlassNavbar`, `GlassModal`

- `background: rgba(255,249,241,.76);`
- `border:1px solid rgba(255,255,255,.62);`
- `backdrop-filter: blur(16px) saturate(115%);`
- `box-shadow: 0 12px 36px rgba(75,47,31,.08), inset 0 1px 0 rgba(255,255,255,.68)`

**Typography**: Manrope for headings, Inter for body/controls
**Radii**: 12-20px cards, smaller for inputs
**Status badges**: Always with icon (pending amber, waitlisted sky/taupe, approved green, rejected red, checked_in espresso, returned muted, cancelled grey)

**Dark theme**: Deep espresso surfaces, warm charcoal, cream text, muted brown borders; toggle persisted; no pure black or blinding white.

## What to Avoid

- Never return Eloquent models or raw arrays from controllers — always use API Resources
- Never hardcode credentials in code or commits
- Never modify files in `__generated__`
- Role is never trusted from client; always verified server-side via Policies + `role:` middleware
- No `new` of collaborators and no facades inside domain/application code
- Run Laravel Pint and Larastan (level 6+ target) and fix findings
- Run `pnpm` (not npm) for frontend operations
- Do not skip `pnpm generate-routes` after route file changes — the frontend will fail to resolve paths
- Do not assume Sanctum tokens are used — this repo uses JWT in HttpOnly cookies
- Do not run `php artisan test` without MariaDB `sharelab_test` available

## Project Status

- This CLAUDE.md is derived from the project blueprint and existing codebase documentation.
- Verify against the actual codebase before assuming any feature is implemented.
- The demo uses five accounts and six seeded resources; reseed with `php artisan sharelab:demo-reset` to refresh.