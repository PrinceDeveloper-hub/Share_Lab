# ShareLab --- Campus Commons

**Unlock underused campus equipment and shared spaces---safely, fairly,
and transparently.**

ShareLab is a campus resource-sharing platform concept for helping
students, researchers, creators, and early-stage teams discover and
request access to laboratory equipment, makerspaces, and shared
facilities. It is designed around more than availability: access
requirements, fair usage, human-reviewed decisions, condition reports,
and an auditable history are part of the workflow.

> **Project status:** This README describes the product scope and
> architecture in the ShareLab project blueprint. Features should be
> considered implemented only when they are present and verified in the
> current codebase.

## Contents

-   [The Problem](#the-problem)
-   [Our Approach](#our-approach)
-   [Core Features](#core-features)
-   [Roles and Permissions](#roles-and-permissions)
-   [How It Works](#how-it-works)
-   [Fairness and Safety Rules](#fairness-and-safety-rules)
-   [Technology Stack](#technology-stack)
-   [Architecture](#architecture)
-   [Data Model](#data-model)
-   [API Overview](#api-overview)
-   [Getting Started](#getting-started)
-   [Testing and Demo](#testing-and-demo)
-   [Security and Privacy Principles](#security-and-privacy-principles)
-   [Scope and Limitations](#scope-and-limitations)
-   [Contributing](#contributing)
-   [License](#license)

## The Problem

Colleges and research facilities may own useful equipment that remains
idle while students and early-stage teams cannot easily access it. A
basic booking calendar does not fully address the trust, safety, and
fairness requirements involved in sharing institutional resources.

ShareLab is designed to address problems such as:

-   **Unclear access requirements:** users may not have the training or
    credentials needed to use equipment safely.
-   **Limited accountability:** it can be difficult to establish who
    requested, used, or returned a resource.
-   **Condition disputes:** damage or changes in condition may be
    difficult to review without check-in and return records.
-   **Unequal access:** a small number of users may consume most of the
    available time.
-   **Opaque decisions:** users may not understand why a request was
    approved, rejected, or waitlisted.
-   **Missing history:** owners and users need a reliable record of
    actions and decisions.

## Our Approach

ShareLab combines resource discovery and booking with verified
eligibility, usage limits, explainable manager decisions, condition
reports, and audit timelines.

The platform is designed to support community access while keeping
resource owners in control. Automated rules can validate requests and
provide recommendations, but **approval, rejection, and penalties are
not intended to be fully automated**.

## Core Features

### Resource catalogue

-   Browse and search shared campus resources.
-   Filter resources and view their details, rules, and requirements.
-   Allow authorized owners or staff to manage resource listings.

### Credentials and eligibility

-   Display the requirements associated with a resource.
-   Show users which requirements are missing or awaiting verification.
-   Allow users to submit credential evidence.
-   Allow authorized managers to verify or reject credentials.

### Booking and availability

-   Submit a booking request with a time slot, purpose, and relevant
    notes.
-   Validate eligibility, weekly usage limits, and booking conflicts.
-   Place conflicting requests on a waitlist where appropriate.
-   Explain blocking conditions and waitlist status to users.

### Human-reviewed decisions

-   Provide managers with a request queue and priority information.
-   Support approve, reject, or waitlist decisions.
-   Require a reason for each decision and make that reason visible to
    the user.
-   Keep system recommendations separate from the final human decision.

### Check-in, return, and condition reports

-   Record the initial condition at check-in.
-   Record the condition when a resource is returned.
-   Capture notes and, where implemented, photos.
-   Flag possible discrepancies for review rather than automatically
    assigning blame.

### Incidents and notifications

-   Report damage, delay, or other incidents.
-   Allow managers to review and resolve incidents with a reason.
-   Provide in-app notifications for relevant events, where implemented.

### Audit timeline

-   Record important state changes and the reasons behind them.
-   Give authorized users access to the relevant booking timeline.
-   Provide administrators with a filterable audit view.

## Roles and Permissions

ShareLab defines four roles in its product blueprint:

  -----------------------------------------------------------------------
  Role                                Intended responsibilities
  ----------------------------------- -----------------------------------
  **User**                            Discover resources, check
                                      eligibility, submit credentials,
                                      request bookings, check in, return
                                      resources, report issues, and view
                                      personal history.

  **Owner**                           List resources, set requirements
                                      and usage rules, manage their
                                      resources, and review related
                                      incidents.

  **Manager**                         Verify credentials, review booking
                                      requests, make decisions with
                                      reasons, and review incidents.

  **Admin**                           Manage platform users and roles,
                                      review the full audit log, and
                                      resolve escalated disputes.
  -----------------------------------------------------------------------

Permissions must be enforced by the backend. Hiding a button in the
frontend is not an authorization mechanism.

## How It Works

The intended resource lifecycle consists of ten steps:

1.  **List a resource:** an owner publishes a resource and defines its
    rules and requirements.
2.  **Discover:** a user searches the catalogue and opens the resource
    details.
3.  **Check eligibility:** the platform shows whether required
    credentials are verified or missing.
4.  **Request a booking:** the user selects a time slot, states the
    purpose, and submits the request.
5.  **Validate the request:** the system checks eligibility, weekly
    limits, and conflicting bookings.
6.  **Review the request:** a manager considers the request, priority
    information, and recommendation.
7.  **Record the decision:** the manager approves, rejects, or waitlists
    the request with a reason.
8.  **Check in and use:** the user records the initial condition and
    follows the resource rules.
9.  **Return and review:** the user records the final condition;
    potential damage or delay can be reviewed as an incident.
10. **Inspect the history:** authorized parties can review the booking
    timeline and its recorded actions.

## Fairness and Safety Rules

The blueprint defines the following core rules:

-   **Eligibility:** each required credential must be verified before
    the user qualifies.
-   **Weekly usage cap:** requests that exceed the applicable limit are
    blocked.
-   **Conflict detection:** overlapping booking intervals are checked;
    adjacent slots are allowed when they do not overlap.
-   **Priority:** lower usage over the previous 30 days ranks ahead,
    with earlier request time breaking ties.
-   **Waitlist promotion:** when a slot becomes available, the
    top-ranked eligible waitlisted request can receive an offer with a
    confirmation deadline.
-   **Auditability:** state changes and their reasons are recorded as
    part of the corresponding transaction.

The platform should explain decisions in plain language. For example, a
user may see that a required training credential is missing or that a
requested slot is already taken.

## Technology Stack

The project blueprint specifies the following stack:

  -----------------------------------------------------------------------
  Layer                   Technology              Purpose
  ----------------------- ----------------------- -----------------------
  Frontend                React, TypeScript, Vite User interface and
                                                  frontend application

  Routing                 TanStack Router         Page routing and
                                                  role-aware route guards

  Server state            TanStack Query          API data fetching and
                                                  caching

  UI and styling          Tailwind CSS, shadcn/ui Consistent, reusable
                                                  interface components

  Validation              Zod                     Frontend schema
                                                  validation

  Backend                 Laravel 11              JSON API and business
                                                  rules

  Authentication          Laravel Sanctum (as     Authentication and role
                          specified in the        checks
                          blueprint)              

  Database                MariaDB                 Persistent application
                                                  data

  Deployment              Docker Compose and a    Reproducible
                          VPS or supported        environment and public
                          hosting platform        deployment
  -----------------------------------------------------------------------

**Implementation note:** Confirm the authentication method and package
versions in the current repository before following setup instructions.
If the current codebase has deliberately moved from the blueprint's
Sanctum approach to JWT authentication with HttpOnly cookies, document
and use the implementation actually present in the repository.

## Architecture

The blueprint describes two application layers:

-   **Frontend:** renders pages, forms, resource details, booking
    workflows, dashboards, and role-aware navigation.
-   **Backend:** validates requests, applies business rules, enforces
    permissions, persists changes, and exposes API responses.
-   **Database:** stores users, resources, requirements, credentials,
    bookings, condition reports, incidents, and audit logs.

The backend is the source of truth for authorization, eligibility,
booking state, and decision outcomes. The frontend must not invent or
override those results.

For deployment, the blueprint proposes serving the built React
application from Laravel's public directory to simplify hosting and
avoid unnecessary cross-origin configuration. A separate frontend
deployment is also possible if the API's CORS and credential settings
are configured correctly.

## Data Model

The blueprint identifies eight core tables:

  -----------------------------------------------------------------------
  Table                               Purpose
  ----------------------------------- -----------------------------------
  `users`                             Accounts, roles, and identity
                                      details

  `resources`                         Resource ownership, descriptions,
                                      rules, limits, and status

  `resource_requirements`             Credentials or requirements
                                      associated with resources

  `user_credentials`                  Submitted credential evidence and
                                      verification status

  `bookings`                          Requested slots, booking status,
                                      decision reasons, and priority

  `condition_reports`                 Check-in and return condition
                                      records

  `incidents`                         Damage, delay, and other incident
                                      records

  `audit_logs`                        Recorded actions, actors, reasons,
                                      and related metadata
  -----------------------------------------------------------------------

Use the actual migrations in the repository as the authoritative schema.

## API Overview

The blueprint lists these principal endpoints. Exact routes, middleware,
payloads, and response formats must be confirmed against the current
implementation.

  -------------------------------------------------------------------------------
  Method                  Endpoint                        Purpose
  ----------------------- ------------------------------- -----------------------
  `POST`                  `/login`                        Sign in

  `GET`                   `/me`                           Retrieve the current
                                                          user

  `GET`                   `/resources`                    List, search, and
                                                          filter resources

  `GET`                   `/resources/{id}`               View resource details

  `POST`                  `/resources`                    Create a resource with
                                                          authorized access

  `GET`                   `/resources/{id}/eligibility`   Check resource
                                                          eligibility

  `POST`                  `/credentials`                  Submit credential
                                                          evidence

  `PATCH`                 `/credentials/{id}/verify`      Verify or reject a
                                                          credential

  `POST`                  `/bookings`                     Submit a booking
                                                          request

  `GET`                   `/bookings`                     List permitted booking
                                                          records

  `PATCH`                 `/bookings/{id}/decision`       Approve, reject, or
                                                          waitlist with a reason

  `POST`                  `/bookings/{id}/checkin`        Record check-in and
                                                          initial condition

  `POST`                  `/bookings/{id}/return`         Record return condition

  `POST`                  `/bookings/{id}/incidents`      Report an incident

  `GET`                   `/bookings/{id}/timeline`       View authorized booking
                                                          history

  `GET`                   `/notifications`                Retrieve in-app
                                                          notifications
  -------------------------------------------------------------------------------

## Getting Started

The exact setup depends on the files and scripts in the current
repository. The following is a starting checklist, not a guarantee that
every command matches the current implementation.

### Prerequisites

-   Git
-   PHP version compatible with the Laravel application
-   Composer
-   Node.js version compatible with the frontend dependencies
-   pnpm, if the repository uses pnpm
-   MariaDB
-   Docker Compose, if the repository includes a Compose configuration

### 1. Clone the repository

``` bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_REPOSITORY_DIRECTORY>
```

Replace the placeholders with your Git repository URL and directory
name.

### 2. Configure the API

`sharelab-api/` is a Laravel 11 JSON API and nothing else: no Blade views, no
Vite, no npm, no Inertia. All routes live under `/api`.

```bash
cd sharelab-api
composer install
cp .env.example .env        # fill APP_KEY, JWT_SECRET and the DB_* values
php artisan key:generate
php artisan migrate --seed  # creates the five demo accounts
```

The local API is served over HTTPS at **https://sharelab-api.local** by a
Laragon vhost whose document root is `sharelab-api/public`. If you prefer the
built-in server (`php artisan serve`, `http://127.0.0.1:8000`), start the
frontend with `VITE_API_PROXY_TARGET=http://127.0.0.1:8000 pnpm dev` instead.
Locally issued certificates are self-signed, so `curl` needs `-k` until the
Laragon CA is trusted.

Or run the same API in Docker together with MariaDB:

```bash
cp .env.example .env        # repository root: APP_KEY, JWT_SECRET, DB_PASSWORD
docker compose up -d --build
curl -k https://sharelab-api.local/api/health   # proxied to the container's :8000
```

### 3. Configure the frontend

```bash
cd sharelab
pnpm install
pnpm dev                    # http://localhost:3000
```

Vite proxies `/api` and `/storage` to `https://sharelab-api.local`, so the SPA
calls relative URLs and the auth cookies stay first-party. No API URL needs to
be configured for local work; set `VITE_API_PROXY_TARGET` to proxy elsewhere.

Deployment (Vercel + the API container) is documented in
[DEPLOYMENT.md](DEPLOYMENT.md).

### 4. Verify the application

Before using the application, verify:

-   The backend connects to MariaDB.
-   Migrations complete successfully.
-   The frontend starts without build errors.
-   The frontend can reach the API.
-   Authentication and protected routes work.
-   Resource data is returned by the API.
-   Booking and permission rules are enforced by the backend.

Do not publish `.env` files, database passwords, signing keys, tokens,
or real credential documents.

## Testing and Demo

The blueprint's five-minute demonstration follows this journey:

1.  A student finds the 3D printer and sees that 3D Printer Training is
    missing.
2.  The student submits the credential and a manager verifies it.
3.  The student requests a slot; an overlapping request is waitlisted
    with an explanation.
4.  The manager approves the request and the student checks in with an
    initial condition record.
5.  The student returns the resource and records a scratch; a manager
    reviews the resulting incident.
6.  Both authorized parties open the timeline and review the recorded
    actions.

Use fictional or explicitly permissioned demo data. Demo credentials
should be documented separately from this README and must never be real
user credentials.

## Security and Privacy Principles

ShareLab's design principles include:

-   Enforce authorization and ownership checks on the backend.
-   Validate all incoming data on the server.
-   Require verified credentials where a resource requires them.
-   Keep credential uploads private and restrict access to authorized
    users.
-   Record reasons for manager decisions.
-   Preserve an auditable history of important state changes.
-   Use transactions for related booking and audit updates.
-   Store timestamps consistently and exchange API timestamps in ISO
    8601 format; the blueprint recommends UTC.
-   Avoid exposing secrets, private files, or sensitive account data.
-   Keep automated recommendations separate from human decisions.

These are design requirements, not a security certification. Security
depends on the implementation, configuration, and testing of the actual
application.

## Scope and Limitations

The blueprint prioritizes the complete resource lifecycle, audit
timeline, and explainable fairness decisions.

The following items are listed as optional or out of the initial scope
in the blueprint:

-   Natural-language resource search using AI
-   Email notifications
-   Hash-chained audit logs
-   AI-generated incident summaries
-   Payments and deposits
-   Multi-institution support
-   Automatic photo comparison
-   Analytics dashboards
-   A separate mobile application

The current status of each item must be checked in the repository before
it is described as implemented.

## Contributing

Contributions and improvements are welcome.

1.  Review the existing architecture and project conventions.
2.  Create a focused branch for your change.
3.  Keep business rules and authorization on the backend.
4.  Add or update tests for changed behavior.
5.  Verify frontend type checks and production builds.
6.  Document any new environment variables or setup steps without
    including their secret values.
7.  Submit a pull request describing the change and its verification.

Do not commit generated build output, dependency folders, local
environment files, or private user data unless the repository explicitly
requires them.

## License

No license has been specified in the project blueprint.

Before publishing or accepting external contributions, choose and add an
appropriate `LICENSE` file. Until then, do not assume that the
repository is open source or that others have permission to reuse its
code.
