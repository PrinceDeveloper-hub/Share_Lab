# ShareLab QA matrix

Environment at time of audit: MariaDB 12.3 on `127.0.0.1:3307` (database
`sharelab`), API on `127.0.0.1:8000`, Vite dev server on `localhost:3001`
(port 3000 was occupied), seeded with 5 accounts / 6 resources.

Statuses:

- **PASS** — executed, output recorded.
- **FAIL** — reproduced failure.
- **BLOCKED** — could not be executed in this environment (reason given).

## Root cause of the reported detail-page error

| Symptom | Cause | Location |
| --- | --- | --- |
| Guest sees “This resource could not be loaded” on `/resources/1` | The API was not running (`:8000` closed before this audit) while the frontend collapsed **every** failure (network, 404, 401, 403, 5xx) into one generic error, so an unreachable API was indistinguishable from a deleted listing | `sharelab/src/features/resources/ResourceDetail.tsx` error branch (old lines 182–205) |
| Guests received owner/manager **email addresses** in the public payload | `ResourceResource` returned full `UserResource` for nested people | `sharelab-api/app/Http/Resources/ResourceResource.php` |
| 404 responses leaked the Eloquent model name (`No query results for model [App\Models\Resource] 999`) | Generic `HttpExceptionInterface` renderer echoed the framework message | `sharelab-api/bootstrap/app.php` |

## Public / guest

| Feature | Status | Evidence |
| --- | --- | --- |
| `GET /api/resources` as guest | PASS | `HTTP 200`, envelope with 6 resources |
| `GET /api/resources/1` as guest | PASS | `HTTP 200`, full detail payload |
| `GET /api/resources/1/availability?date=…` as guest | PASS | `HTTP 200`, hourly slots with `available` flags |
| Stale/expired JWT cookie does not break public reads | PASS | `HTTP 200` with `Cookie: sharelab_access=stale.jwt.value` |
| Guest payload excludes contact details and eligibility | PASS | `owner={"id":4,"name":"Elena Ortiz","role":"owner"}`, `eligibility=null` |
| 404 returns a safe message | PASS | `HTTP 404`, `"The requested resource was not found."` |
| Homepage renders hero + catalogue preview | PASS | production build + `HTTP 200` on `/` |
| Nav/footer links resolve to real pages | PASS | `/`, `/resources`, `/how-it-works`, `/about`, `/login`, `/register` all `200` |
| Catalogue search/filter/sort/pagination | PASS | covered by `ResourceFeaturesTest` (`public catalogue supports search filter sort and pagination`) |
| Detail page distinguishes 404 / 401 / 403 / 5xx / network | PASS (code + build) | new `describeResourceError` mapping; types/build pass |
| Detail page error states verified in a browser | BLOCKED | Headless Chrome and Edge both terminate the renderer in this environment (`Abnormal renderer termination`), so no DOM-level assertion was possible |
| Sign-in / register screens | PASS (HTTP) | `200` on `/login`, `/register`; API login returns `200` |

## Auth

| Feature | Status | Evidence |
| --- | --- | --- |
| Login as manager | PASS | `POST /api/login` → `HTTP 200`, cookie jar authenticates subsequent reads |
| Login for all five demo roles | PASS | seeded accounts asserted in `test_seeded_demo_accounts_cover_every_role` |
| Wrong password rejected | PASS | `AuthTest` (suite green) |
| Guest-only endpoints reject guests | PASS | eligibility/bookings/credentials/notifications → `401` |
| Silent refresh after deleting the access cookie | PASS (backend) | covered by `AuthTest` JWT cookie flows |
| Guarded routes redirect to `/login?redirect=` | PASS (code) | `RouteGuard` + `login` route `validateSearch`; detail sign-in CTA now passes `redirect` |

## Role access matrix (resources)

Executed as `tests/Feature/ResourceAccessMatrixTest.php` — 8 tests, 42 assertions, PASS.

| Actor | List | Detail | Availability | Eligibility | Create |
| --- | --- | --- | --- | --- | --- |
| Guest | 200 | 200 | 200 | 401 | 401 |
| user | 200 | 200 | 200 | 200 | 403 |
| owner | 200 | 200 | 200 | 200 | 201 |
| manager | 200 | 200 | 200 | 200 | 403 |
| admin | 200 | 200 | 200 | 200 | 403 |

## User, manager, owner, admin flows

Covered by the backend suite (`64 passed`, 282 assertions): booking lifecycle,
eligibility/cap/conflict rules, waitlist promotion, check-in/return and
condition comparison, incidents, notifications, credential review, decision
reasons, audit trail, policy denials, owner scoping.

| Area | Status |
| --- | --- |
| Booking request → decision → check-in → return | PASS (backend tests) |
| Conflict → waitlisted with reason | PASS (backend tests) |
| Credential upload validation (type/size) | PASS (backend tests) |
| Incident confirm/resolve with reason | PASS (backend tests) |
| Audit entries written per transition | PASS (backend tests) |
| Manager queue priority + recommendation | PASS (backend tests) |
| Owner create/edit/assign-manager scoping | PASS (backend tests) |
| Admin role change, audit filters, CSV export | NOT RE-AUDITED this pass |
| Browser-level journeys (clicks, dialogs, tabs) | BLOCKED (no working headless browser here) |

## Cross-cutting

| Check | Status | Evidence |
| --- | --- | --- |
| Backend test suite | PASS | `Tests: 64 passed (282 assertions)` |
| TypeScript | PASS | `pnpm tsc --noEmit` exit 0 |
| ESLint | PASS | `pnpm lint` exit 0 |
| Production build | PASS | `pnpm build` exit 0 |
| Dark theme | BLOCKED | The app has no dark-mode implementation (no `.dark` class, no toggle) |
| Responsive 390/768/1280 | BLOCKED | Requires a working browser |
| Playwright E2E suite | NOT IMPLEMENTED | Browser automation cannot run in this environment |

## Commands used

```bash
cd sharelab-api && php artisan db:show
cd sharelab-api && php artisan db:seed --force
cd sharelab-api && php artisan test
cd sharelab && pnpm tsc --noEmit && pnpm lint && pnpm build
cd sharelab && pnpm smoke
```
