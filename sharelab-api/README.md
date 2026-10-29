# ShareLab API

A Laravel 11 JSON API for a college's labs and makerspace share idle equipment with nearby students, with trust, safety and fairness controls.

## Core Principle: HUMANS DECIDE

Automation only recommends; every decision, reason, and state change is logged. No automatic approval, rejection, or penalty anywhere in the codebase.

## Setup

### Prerequisites

- PHP 8.3+
- Composer
- MariaDB 10.4+ or MySQL 8.0+
- Node.js & npm (for React Vite frontend)
- Docker (optional)

### 1. Environment Configuration

```bash
cp .env.example .env
# Edit .env with your database credentials
# DB_PASSWORD should be left blank in .env.example; you set it yourself
```

### 2. Database Setup

Create the database:

```bash
mysql -u root -p -e "CREATE DATABASE sharelab CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 3. Install Dependencies

```bash
composer install
npm install
```

### 4. Generate Application Key

```bash
php artisan key:generate
```

### 5. Run Migrations and Seeders

```bash
php artisan migrate --seed
```

This will create:

- 5 accounts: `user1@sharelab.test`, `user2@sharelab.test`, `manager@sharelab.test`, `owner@sharelab.test`, `admin@sharelab.test`
- 6 resources with requirements, caps and the manager assigned to each
- Sample credentials across both student accounts (verified 3D Printer Training, pending Laser Cutter Certification)
- Sample bookings in every status with audit entries

Default password for all accounts: `password`

Reseeding also deletes the earlier `user@user.com` style demo accounts and their
records, so exactly these five accounts remain.

### 6. Start the Development Server

Serve `public/` from a Laragon vhost; the local API is available at
`https://sharelab-api.local/api`. The built-in server also works:

```bash
php artisan serve   # http://127.0.0.1:8000/api
```

## API Endpoints

### Authentication

- `POST /api/login` - Login with email/password, returns JWT token
- `POST /api/logout` - Logout and invalidate token
- `GET /api/me` - Get authenticated user info

### Resources

- `GET /api/resources` - List resources with pagination and filters (q, category, status)
- `GET /api/resources/{id}` - Get resource details with requirements and rules
- `POST /api/resources` - Create resource (owner|manager|admin)
- `PATCH /api/resources/{id}` - Update resource (owner|admin)

### Credentials

- `POST /api/credentials` - Submit credential (multipart: requirement_name + file)
    - Validate mimes: pdf, jpg, png, webp
    - Max size: 5 MB
    - Store on private disk, return safe URLs
- `GET /api/credentials` - List credentials (own; manager sees pending for their resources; admin sees all)
- `PATCH /api/credentials/{id}` - Verify or reject credential (body: decision verify|reject, note)

### Bookings

- `POST /api/bookings` - Create booking request
- `GET /api/bookings` - List bookings (user: own; manager: queue with status and resource filters, sorted by priority)
- `GET /api/bookings/{id}` - Get booking details
- `PATCH /api/bookings/{id}/decision` - Decide on booking (approve|reject|waitlist, reason REQUIRED)
- `POST /api/bookings/{id}/cancel` - Cancel booking (owner or manager)
- `PATCH /api/bookings/{id}/extend` - Extend booking (re-run cap and conflict checks)
- `POST /api/bookings/{id}/confirm` - Confirm waitlist offer (within 24h)
- `POST /api/bookings/{id}/checkin` - Check in (owner only, within 30 min before to end of slot, requires condition report)
- `POST /api/bookings/{id}/return` - Return items (owner only on checked_in bookings, requires condition report)
- `GET /api/bookings/{id}/timeline` - Get audit timeline for booking

### Incidents

- `POST /api/bookings/{id}/incidents` - Report incident (damage|delay|other)
- `GET /api/incidents` - List incidents (manager/owner/admin)
- `PATCH /api/incidents/{id}/confirm` - Confirm system-suggested incident
- `PATCH /api/incidents/{id}/resolve` - Resolve incident

### Notifications

- `GET /api/notifications` - List user's notifications
- `PATCH /api/notifications/{id}/read` - Mark notification as read
- `POST /api/notifications/read-all` - Mark all notifications as read

### Admin

- `GET /api/admin/audit` - Paginated audit logs (filters: actor, action, booking_id, date_from, date_to)
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/{id}/role` - Update user role

## Response Envelope

All API responses follow this envelope format:

```json
{
  "data": {...},
  "message": "...",
  "errors": {
    "field": ["msg"]
  }
}
```

Paginated lists add `meta`:

```json
{
    "meta": {
        "page": 1,
        "per_page": 10,
        "total": 50,
        "last_page": 5
    }
}
```

## Status Codes

- `200` - Successful response
- `201` - Created
- `204` - No content (e.g., logout)
- `401` - Unauthenticated
- `403` - Unauthorized
- `404` - Not found
- `409` - Conflict (e.g., slot now conflicting)
- `422` - Validation errors (e.g., decision without reason)
- `429` - Rate limited

## Booking Service Rules

### Eligibility

Every requirement with `requires_verification` needs a VERIFIED credential for that user.

### Duration and Weekly Cap

- Reject if the slot exceeds `max_hours_per_booking` ("Maximum 2 hours per booking.")
- Sum the user's approved/checked_in/returned hours for that resource in the ISO week of the requested start; block if adding this request exceeds `weekly_cap_hours`.

### Conflict Check

Overlap test: `existing.start_at < new.end_at AND existing.end_at > new.start_at` against approved and checked_in bookings for the same resource, using `lockForUpdate()`.

Touching slots (end == start) do NOT conflict.

On conflict, create the booking as waitlisted with its position.

### Priority Score

Hours the user used in the last 30 days (lower ranks higher). Earlier request time breaks ties.

### Waitlist Promotion

When an approved booking is cancelled, promote the waitlist: offer the freed slot to the top-ranked waitlisted request that fits, set `confirm_by = now + 24h`, notify "A slot opened. Confirm within 24 hours."

A scheduled command (`php artisan sharelab:expire-offers`) expires unconfirmed offers and moves to the next request in line. Confirming approves the booking (re-check conflict first).

### Check-in

Only the booking owner, only on approved bookings, only within a window around start time (default 30 minutes before to end of slot). Requires a condition report. Status becomes checked_in.

### Return

Only on checked_in bookings. Requires a condition report. Set `is_late = true` if now > end_at and auto-create a "delay" incident flagged `suggested_by_system`. If the return condition is worse than the check-in condition, create a "damage" incident flagged `suggested_by_system` with the comparison in meta. System-suggested incidents stay suggestions until a manager confirms them (`confirmed_by`). Status becomes returned.

## Tests

Run the test suite:

```bash
php artisan test
```

Or with Pest:

```bash
php artisan pest
```

Tests cover:

- Unit tests for each BookingService rule: eligibility messages, cap across ISO week boundaries, max duration, overlap cases (touching, nested, partial, identical), UTC handling, priority ordering and tie-break, promotion order and offer expiry
- Feature tests: policy denials per role, decision without a reason returns 422, audit log cannot be updated or deleted, user cannot read another user's booking, late-return flag and system-suggested incidents
- Concurrency: two simultaneous requests for the same slot result in exactly one approvable booking and one waitlisted
- End-to-end demo test: missing credential -> submit -> verify -> book -> overlapping request waitlisted with reason -> approve -> check-in -> return with a scratch noted -> incident -> timeline contains every step with actor, time and reason

## Deliverables

- `app/` - Laravel application code
- `database/migrations/` - All migrations with foreign keys, indexes, enums
- `database/seeders/` - Database seeder with fictional data
- `tests/` - Unit and feature tests
- `.env.example` - Environment configuration template
- `routes/api.php` - API routes
- `config/cors.php` - CORS configuration
- `app/Enums/` - PHP backed enums (Role, BookingStatus, CredentialStatus, IncidentStatus, ConditionType)
- `app/Services/BookingService.php` - Core business logic
- `app/Http/Resources/` - API Resources for response envelope
- `app/Http/Requests/` - Form Requests for validation
- `LIMITATIONS.md` - What is faked or cut
- `DISCLOSURE.md` - Libraries, starter kits, AI tools used
- `docker-compose.yml` (optional) - App + MariaDB
- OpenAPI specification or Postman collection

## Rate Limiting

Login endpoint is rate-limited to 5 attempts/minute per email+IP.

## File Uploads

Credential files: validate mimes (pdf, jpg, png, webp) and size (max 5 MB), store on a private disk, serve through authorized routes or signed URLs. Return safe URLs only.

## CORS

Configured for `http://localhost:5173` (Vite dev server). Update `config/cors.php` for production origins.
