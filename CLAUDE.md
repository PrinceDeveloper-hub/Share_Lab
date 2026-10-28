# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Build, Lint, and Test

**Backend (Laravel):**

- Run all checks: `cd sharelab-api && pnpm ci:check`
- Lint only: `cd sharelab-api && pnpm lint`
- Typecheck only: `cd sharelab-api && pnpm types:check`
- Run tests: `cd sharelab-api && pnpm test`
- Seed database: `cd sharelab-api && php artisan db:seed`
- Reset demo data: `cd sharelab-api && php artisan sharelab:demo-reset`

**Frontend (React/Vite):**

- Development: `cd sharelab && pnpm dev`
- Build: `cd sharelab && pnpm build`
- Lint: `cd sharelab && pnpm lint`
- Format: `cd sharelab && pnpm format`
- Check: `cd sharelab && pnpm check`

### Key Paths

- **Backend**: `sharelab-api/` — Laravel 11 JSON API
- **Frontend**: `sharelab/` — Vite + React + TanStack Router
- **API routes**: `sharelab-api/routes/api.php`
- **Frontend routes**: `sharelab/src/routes/` (TanStack file-based routes)
- **Database migrations**: `sharelab-api/database/migrations/`
- **Seeders**: `sharelab-api/database/seeders/`
- **API Resources**: `sharelab-api/backend/app/Http/Resources/`
- **Service classes**: `sharelab-api/backend/app/Services/`
- **Enums**: `sharelab-api/backend/app/Enums/`
- **Models**: `sharelab-api/backend/app/Models/`

## Architecture

This is a monorepo with a Laravel JSON API backend and a React+TanStack Router frontend.

### Backend Layering (strict one-direction dependency)

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
  Providers/          # Bind interfaces to implementations (RepositoryServiceProvider,
                      # DomainServiceProvider)

routes/
  api.php             # All API routes (see below)

Every response goes through an API Resource. Never return Eloquent models or raw arrays
from controllers. The envelope format is: { data, message, errors, meta }.

### Frontend Architecture

```
src/
  components/
    {ui,layout,navigation,feedback,glass,shared}  # UI components
  features/
    {auth,home,resources,eligibility,credentials,
     bookings,check-in-return,incidents,notifications,
     owner,manager,admin,audit}  # Feature areas
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

## API Routes (all under `auth:sanctum` unless noted)

| Method | Path | Description |
|--------|------|-------------|
| POST | /login | Authenticate, return Sanctum token |
| POST | /logout | Revoke token |
| GET | /me | Get authenticated user |
| GET | /resources | List resources with filters (q, category, status, sort, paginated) |
| GET | /resources/{id} | Get single resource |
| POST | /resources | Create resource (owners only) |
| PATCH | /resources/{id} | Update resource (owners only) |
| POST | /resources/{id}/images | Upload resource images |
| GET | /resources/{id}/eligibility | Check user eligibility for resource |
| GET | /resources/{id}/availability | Check availability for date |
| POST | /credentials (multipart) | Upload credential file |
| GET | /credentials | List user credentials |
| PATCH | /credentials/{id}/verify | Verify credential (admins/owners only) |
| POST | /bookings | Create booking request |
| GET | /bookings | List user's bookings |
| GET | /bookings/{id} | Get specific booking |
| PATCH | /bookings/{id}/decision | Approve/reject/waitlist (admin/owner/manager) |
| POST | /bookings/{id}/cancel | Cancel booking |
| PATCH | /bookings/{id}/extend | Extend booking end time |
| POST | /bookings/{id}/confirm | Confirm waitlist offer (24h deadline) |
| POST | /bookings/{id}/checkin | Check in for booking (with condition report) |
| POST | /bookings/{id}/return | Return items (with condition report) |
| GET | /bookings/{id}/timeline | Get audit timeline for booking |
| POST | /bookings/{id}/incidents | Report incident (damage/delay/other) |
| GET | /incidents | List incidents (filtered by assigned resources for managers) |
| PATCH | /incidents/{id}/confirm | Confirm system-suggested incident |
| PATCH | /incidents/{id}/resolve | Resolve incident |
| GET | /notifications | List user notifications |
| PATCH | /notifications/{id}/read | Mark notification read |
| POST | /notifications/read-all | Mark all notifications read |
| GET | /admin/audit | Audit logs (filters: actor, action, booking_id, date range) |
| GET | /admin/users | List users with role assignment |
| PATCH | /admin/users/{id}/role | Update user role |
| PATCH | /admin/users/{id}/status | Update user status |

## Design Tokens (Warm Beige + Espresso Glassmorphism)

**CSS Variables:**

```
--ivory: #F7F0E6      (page bg)
--cream: #FFF9F1      (cards)
--soft-beige: #E9D9C6
--sand: #D6BDA4       (borders)
--taupe: #A78B73
--espresso: #4B2F1F   (primary buttons)
--deep-brown: #302219 (sidebar)
--charcoal: #282522   (text)
--muted: #82776D
--success: #387653
--warning: #B77932
--error: #B44D42
```

**Glass components** (reusable): `GlassPanel`, `GlassCard`, `GlassNavbar`, `GlassModal`
- `background: rgba(255,249,241,.76);`
- `border:1px solid rgba(255,255,255,.62);`
- `backdrop-filter: blur(16px) saturate(115%);`
- `box-shadow: 0 12px 36px rgba(75,47,31,.08), inset 0 1px 0 rgba(255,255,255,.68)`

**Typography**: Manrope for headings, Inter for body/controls
**Radii**: 12-20px cards, smaller for inputs
**Status badges**: Always with icon (pending amber, waitlisted sky/taupe, approved green, rejected red, checked_in espresso, returned muted, cancelled grey)

**Dark theme**: Deep espresso surfaces, warm charcoal, cream text, muted brown borders; toggle persisted; no pure black or blinding white.

## SOLID Principles (document in ARCHITECTURE.md)

- **S - Single Responsibility**: controllers only translate HTTP <-> DTO; FormRequests only validate/authorize input; services own use-case logic; repositories own queries; each Rule class checks exactly one rule.
- **O - Open/Closed**: booking rules implement `BookingRule` and are registered in a tagged collection (`booking.rules`); adding a rule means adding a class, not editing `BookingService`.
- **L - Liskov**: any implementation of a contract (e.g. `BookingRepository`, `AuditRecorder`) must be swappable without changing callers; cover with contract-level tests (Eloquent vs in-memory fake).
- **I - Interface Segregation**: small, focused contracts (`ResourceReader`, `ResourceWriter`, `BookingReader`, `BookingWriter`, `ConflictFinder`, `AuditRecorder`, `Notifier`), not one giant interface.
- **D - Dependency Inversion**: controllers and services depend on contracts via constructor injection; bindings in service providers; no `new` of collaborators, no facades inside domain code.

## Booking Lifecycle (mandatory)

1. **Eligibility**: Check all resource requirements; `requires_verification` credentials must be VERIFIED
2. **Duration & Weekly Cap**: Max hours per booking; sum user's approved/checked_in/returned hours in ISO week (UTC); block if exceeding weekly cap
3. **Conflict**: `existing.start_at < new.end_at AND existing.end_at > new.start_at` against approved/checked_in bookings with `lockForUpdate()`
4. **Priority Score**: Hours used in last 30 days (lower = higher priority); earlier request time breaks ties
5. **Recommendation**: Read-only suggestion (approve|waitlist|reject + reason); never applied automatically
6. **Decision**: approve/reject/waitlist with REQUIRED reason; re-check conflict on approve (409 if now conflicting); notify user; audit
7. **Waitlist Promotion**: On cancel of approved booking, offer slot to top-ranked eligible waitlisted request; set `confirm_by = now+24h`; notify "A slot opened. Confirm within 24 hours."
8. **Cancel, Extend**: Re-run cap and conflict checks
9. **Check-in**: Owner of approved booking, within configured window (30 min before start to end of slot), condition report required
10. **Return**: Checked_in state, condition report required, `is_late` flag if now > end_at; if return condition worse than check-in, create system-suggested `damage` incident (stays suggestion until manager confirms)
11. **State Machine**: `BookingStateMachine` defines valid transitions; invalid ones throw `InvalidTransitionException`

## Testing

### Backend (PHPUnit/Pest)

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

### Frontend

- Type-check, lint, build
- Component tests for eligibility panel, booking panel, decision dialog
- Route-guard tests
- E2E acceptance scenarios (documented manual walkthrough)

### Acceptance Scenarios

A) Missing eligibility → submit credential → manager verifies → eligibility updates
B) Eligible booking persists and appears in My Bookings
C) Overlapping request is waitlisted with reason
D) Manager decision with reason visible to user
E) Check-in, return with scratch noted, discrepancy flagged for review
F) Incident reported, reviewed, resolved, visible in timeline and audit
G) Authorization (no access to others' records or manager/admin actions)
H) Cancellation promotes the next waitlisted request with 24h offer
I) Every state transition has an audit entry; audit cannot be altered
J) All main routes usable at desktop and mobile widths

## Phase Order (verify at end of each phase)

1. Foundation: Laravel + Vite scaffolds, MariaDB connection, contracts/providers skeleton, envelope + exception handler, Sanctum, design tokens, shadcn setup, glass component system
2. Data and auth: enums, migrations, models, seeders, repositories, policies, login/register/me, role middleware, API Resources for users and resources, app shell, homepage, catalog, resource detail
3. Eligibility and booking: credentials (uploads) and verification, eligibility endpoint, availability endpoint, BookingService + rules + priority + recommendation, booking form, My Bookings
4. Dashboards: user, owner (resource CRUD), manager (queue, credentials, incidents), admin (users, resources, bookings, stats)
5. Lifecycle and transparency: decisions, cancel/extend, waitlist promotion + offer expiry command, check-in/return + condition comparer, incidents, notifications + scheduler, timeline, append-only audit, admin audit page
6. Verification and delivery: run all tests, fix type/build errors, run acceptance scenarios, responsive checks, light/dark checks, build React into Laravel `public/`, Docker Compose, deploy notes

## Before You Start

- Check `sharelab-api/.env` — DB configuration goes ONLY in `backend/.env` (gitignored); ship `.env.example` with a blank password
- Run `cd sharelab-api && php artisan key:generate` after first setup
- Ensure MariaDB is running with `sharelab` database (utf8mb4)
- The demo uses these accounts (password "password" for local/demo only):
  - user1@sharelab.test (no credential — needs to submit one)
  - user2@sharelab.test (verified credential for 3D Printer Training)
  - owner@sharelab.test
  - manager@sharelab.test
  - admin@sharelab.test
- Six seeded resources: 3D Printer (requires "3D Printer Training"), Oscilloscope, Camera Kit, Meeting Room, Laser Cutter, Soldering Station
- Run `cd sharelab-api && php artisan sharelab:demo-reset` to reset seed data

## Important Notes

- **Never** return Eloquent models or raw arrays from controllers — always use API Resources
- **Never** hardcode credentials in code or commits
- **Never** modify files in `__generated__`
- Status codes: 200, 201, 204, 401, 403, 404, 409 (conflict), 422 (validation), 429
- All timestamps in resources are ISO-8601 UTC
- Uploads: validate mime (pdf, jpg, png, webp) and size (5 MB), private disk, authorized/signed URLs
- Role is never trusted from client; always verified server-side via Policies + `role:` middleware
- No `new` of collaborators and no facades inside domain/application code (use injected ClockInterface/Carbon provider for time so tests can freeze time)
- Run Laravel Pint and Larastan (level 6+ target) and fix findings
- Run `pnpm` (not npm) for frontend operations