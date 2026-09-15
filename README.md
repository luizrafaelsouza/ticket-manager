# Support Ticket Portal

Internal system where employees open support tickets and the support team tracks, filters, advances the status of, and resolves each one through to closure.

## Quick Start

This section assumes you've never opened a terminal before. Follow it top to bottom and you'll end with the system running and yourself logged in. Every command is meant to be copied exactly as written. If you're already comfortable with Docker and Node, you can skip ahead to "Getting Started — Additional Detail" further below for the condensed/technical version.

**What you'll do, in order:** open a terminal → install two programs (Docker, Node.js) → run two commands, each in its own terminal window → open the system in your browser → log in and try it.

#### Step 1 — Open a terminal in the project folder

A "terminal" is a window where you type commands instead of clicking buttons. You'll need it a few times below.

- **Windows**: open the folder containing `ticket-manager` in File Explorer, then right-click inside it and choose **"Open in Terminal"** (Windows 11) or **"Open PowerShell window here"** (Windows 10).
- **Mac**: open **Finder**, right-click the `ticket-manager` folder, choose **Services → New Terminal at Folder** (if that option isn't there, open the **Terminal** app from Launchpad and type `cd ` followed by dragging the `ticket-manager` folder into the window, then press Enter).
- **Linux**: open your file manager, right-click inside the `ticket-manager` folder, and look for **"Open Terminal Here"** (or open a terminal from your applications menu and use `cd` to navigate there).

Keep this terminal window open — you'll type the next commands into it.

#### Step 2 — Install Docker

Docker is the program that runs the backend (the server), the database, and the tool that captures test emails — all three together, without installing any of them individually.

1. Go to **https://docs.docker.com/get-docker/** and download **Docker Desktop** for your operating system.
2. Run the installer, accepting the defaults.
3. Open Docker Desktop once installation finishes, and wait until it shows it's running (a whale icon appears in your taskbar/menu bar, and the app itself says something like "Docker Desktop is running").
4. Back in your terminal from Step 1, type this and press Enter to confirm it worked:
   ```bash
   docker --version
   ```
   You should see a line like `Docker version 27...`. If instead you see "command not found", close and reopen your terminal (or restart your computer) and try again.

#### Step 3 — Install Node.js

Node.js is what runs the frontend (the visual part of the system) while you're developing.

1. Go to **https://nodejs.org/** and click the button labeled **LTS** (it's the recommended, most stable version — that's what you want).
2. Run the installer, accepting the defaults.
3. Back in your terminal, confirm it worked:
   ```bash
   node --version
   ```
   You should see a version number starting with `v20` or higher (for example `v22.x.x`).

#### Step 4 — Start the backend

Still in the same terminal (the one already inside the `ticket-manager` folder), run:

```bash
docker compose up
```

The first time you run this, it downloads everything it needs, which can take a few minutes — that's expected. You'll see a lot of text scroll by; that's normal. **Leave this terminal window open and running** — closing it stops the system. You'll know it's ready when the scrolling slows down and you see a line mentioning `Application startup complete`.

This one command starts three things together: the database, the API server, and a tool that captures test emails so you can see them without a real inbox.

#### Step 5 — Start the frontend

Open a **second, new terminal window**, the same way you did in Step 1 (so you now have two terminal windows open — don't close the first one). In this new window, navigate into the project folder the same way as Step 1, then run:

```bash
cd ticket-manager-front
npm install
npm run dev
```

`npm install` only needs to run once — it downloads the pieces the frontend needs, and takes a minute or two. Once it finishes, `npm run dev` starts the frontend and prints a line with a web address, something like:
```
Local:   http://localhost:5173/
```

#### Step 6 — Open it in your browser and log in

Open your web browser and go to:

```
http://localhost:5173
```

You'll land on a login screen. Two accounts already exist for testing, same password for both:

| Role | Email | Password |
|---|---|---|
| Employee | `ana@ticketmanager.local` | `Aa12345678` |
| Support | `carlos@ticketmanager.local` | `Aa12345678` |

Type the email into the **Email** field and the password into the **Password** field, then click **Sign in**.

#### Step 7 — Try it out

A short script to confirm everything is working end to end:

1. Log in as **Ana** (`ana@ticketmanager.local`) — she's an **employee**.
2. Click the **Create ticket** tile, fill in a title and description, pick a category and priority, and click **Submit ticket**.
3. Click **Sign out** (top right), then log in again as **Carlos** (`carlos@ticketmanager.local`) — he's on the **support** team.
4. Click the **List tickets** tile — you should see the ticket Ana just created.
5. Click the **View / Update Status** tile, click that same ticket in the table, and click the **↻ Update** button. Every ticket starts as "Open" — click the button that says something like **Advance to: In Progress** to move it forward.
6. Open **http://localhost:8025** in another browser tab — this is Mailpit, the test email tool from Step 4. You should see a new email addressed to `ana@ticketmanager.local`, notifying her that her ticket's status changed. That confirms the whole system — frontend, backend, database, and email — is working together.

#### If something goes wrong

| Problem | What it usually means |
|---|---|
| `docker compose up` says a port is already in use (e.g. `5434`, `8000`, `1025`, `8025`) | Something else on your computer is already using that port. Close whatever that might be, or see `docker-compose.yml` to change the port numbers. |
| `npm run dev` fails immediately | Make sure you ran `npm install` first, inside the `ticket-manager-front` folder specifically (not the outer `ticket-manager` folder). |
| The browser shows "can't reach this page" at `localhost:5173` | Check that Step 5's terminal is still open and didn't show an error — `npm run dev` needs to keep running the whole time you're using the system. |
| Login fails with an error message | Double-check the email and password were typed exactly as shown in Step 6 (no extra spaces), and that Step 4's terminal is still running without errors. |
| `docker` or `node` commands say "command not found" | The install in Step 2 or 3 didn't finish, or your terminal needs to be reopened after installing. Close the terminal window completely and open a fresh one. |

## Step 8 - Additional Detail

Everything below explains *why* the steps above work the way they do — useful if you're curious or if something needs debugging, but not required just to run the system.

### Install — what's really needed, and why

The backend and frontend have different runtimes, and each is installed differently:

**Backend — nothing to install beyond Docker.** The API runs entirely inside Docker: `ticket-manager-back/Dockerfile` pins `python:3.13-slim` as the base image, and `requirements.txt` (FastAPI, SQLAlchemy, Alembic, Pydantic, PyJWT, bcrypt, etc.) is installed inside that container image, not on your machine. Docker itself is the only host requirement — specifically **Docker Compose V2** (the `docker compose` command, no hyphen), which Docker Desktop already includes.

**Frontend — Node.js and npm, installed on your machine.** `ticket-manager-front/package.json` has no `engines` field pinning a Node version, but its build tool does: `node_modules/vite/package.json` requires `node ^20.19.0 || >=22.12.0` (Vite 8). TypeScript's own requirement (`>=14.17`) is looser and isn't the binding constraint — this is why Step 3 above just points at the LTS installer rather than a specific number: any current LTS release satisfies it.

### Configure — what the environment variables do

**Frontend → backend address.** `ticket-manager-front/src/api/client.ts` reads the API's URL from an environment variable, with a default already pointing at the setup above:

```ts
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
```

Running everything on one machine as in the Quick Start, **no `.env` file is needed**. It would only matter if the backend ran on a different host/port — then create `ticket-manager-front/.env` (copy `.env.example`) with:
```
VITE_API_URL=http://localhost:8000
```

**Backend environment variables.** These are already set with working defaults directly in `docker-compose.yml` — nothing to copy or fill in for local use:

| Variable | Default (in `docker-compose.yml`) | What it's for |
|---|---|---|
| `DATABASE_URL` | `postgresql+psycopg://ticketing:ticketing@db:5432/ticketing` | Connection string the API uses to reach the `db` container |
| `JWT_SECRET_KEY` | `dev-secret-change-me-before-deploying-to-production` | Signs the login tokens — a placeholder, fine for local use, must be replaced for any real deployment |
| `CORS_ORIGINS` | `http://localhost:5173` | Allows the frontend (running on Vite's dev server) to call the API |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_FROM` | `mailpit` / `1025` / `noreply@ticketmanager.local` | Where status-change notification emails are sent — to the local Mailpit container, not a real mail server |

### How the database is created (Postgres tables + login users)

Step 4 of the Quick Start (`docker compose up`) does this automatically, but here's what actually happens — this is what turns an empty Postgres container into a working database with table structure and the two login users:

**a) The database itself is created by the Postgres image.** In `docker-compose.yml`, the `db` service (`postgres:17`) gets `POSTGRES_DB=ticketing` — on its first startup, the official Postgres image creates an empty database with that name automatically. This happens before anything else touches it.

**b) The tables are created by Alembic (SQLAlchemy's migration tool).** The `api` container's startup command, in `docker-compose.yml`, chains three commands:
```bash
alembic upgrade head && python -m app.db.seed && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
`alembic upgrade head` applies the migration file in `ticket-manager-back/alembic/versions/eed06114ee66_create_users_tickets_ticket_status_.py`, which creates the `users`, `tickets`, and `ticket_status_history` tables (with their foreign keys and indexes) — this is the schema. Instead of running SQL by hand, every schema change is a versioned Python file checked into the repo, so the database structure has the same history as the rest of the code.

**c) The login users are created by the seed script.** Right after the migration, `python -m app.db.seed` runs `ticket-manager-back/app/db/seed.py`, which inserts two `User` rows with a bcrypt-hashed password (the credentials from Step 6 above) plus one example ticket. It checks `if db.query(User).count() > 0: return` first, so it's safe to run again — restarting the containers never duplicates data.

All three of the above run automatically, in order, every time the `api` container starts — there is no manual `createdb` or `alembic upgrade` command to type. If you ever need to wipe the database and start over, `docker compose down -v` removes the `pgdata` volume (step a runs again on the next `docker compose up`).

## What the system does

| Feature | Description |
|---|---|
| Submitting tickets | Employee creates a ticket with title, description, category, and priority |
| Listing tickets | Support sees all tickets in a table; an employee sees only the ones they created |
| Filtering and sorting | Filter by status, category, or priority; sort by date or priority |
| Status management | Support advances the status: `Open → In Progress → Resolved → Closed` |
| Detail with history | Clicking a ticket shows the full data plus the complete status change history |
| Login | Real JWT authentication, with two roles (`employee` / `support`) |
| Email notification | When a ticket's status changes, whoever created the ticket gets a notification email |

## Screen map

| Screen | Who accesses it | What it does |
|---|---|---|
| Login | Anyone, no session | Authentication |
| Dashboard | Any authenticated user | Central navigation point — every feature is a button from here |
| New ticket | Any authenticated user | Ticket creation form |
| List tickets | Any authenticated user (scoped by role) | Table with filtering, sorting, and pagination |
| View / Update Status | Any authenticated user (the advance-status button only appears for support) | Compact list + detail of the selected ticket + history + status advancement |

## API Endpoints

`/api` prefix on all business routes; full interactive documentation (auto-generated) at `/docs`.

| Method | Route | Auth | What it does |
|---|---|---|---|
| `POST` | `/api/auth/login` | — | Login — takes email and password, returns a JWT token |
| `GET` | `/api/auth/me` | Bearer | Returns the data of whoever owns the token |
| `POST` | `/api/tickets` | Bearer | Creates a ticket (initial status is always `OPEN`) |
| `GET` | `/api/tickets` | Bearer | Paginated list, with filtering and sorting |
| `GET` | `/api/tickets/{id}` | Bearer | Full detail of a ticket + status history |
| `PATCH` | `/api/tickets/{id}/status` | Bearer, `support` role only | Advances the status (only the next valid step) |
| `GET` | `/health` | — | Simple healthcheck |

Details for each one, with `request`/`response` examples, below. Possible errors are in the "Error codes" table right after.

### `POST /api/auth/login`
Login — does not require prior authentication.

Request:
```json
{
  "email": "ana@ticketmanager.local",
  "password": "Aa12345678"
}
```
Response `200`:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "ana-employee",
    "name": "Ana",
    "email": "ana@ticketmanager.local",
    "role": "EMPLOYEE"
  }
}
```

### `GET /api/auth/me`
Returns the data of whoever owns the token — used to keep the session alive after a refresh. Header `Authorization: Bearer <token>`, no request body.

Response `200`:
```json
{
  "id": "ana-employee",
  "name": "Ana",
  "email": "ana@ticketmanager.local",
  "role": "EMPLOYEE"
}
```

### `POST /api/tickets`
Creates a new ticket — any authenticated user. Initial status is always `OPEN`.

Request:
```json
{
  "title": "3rd floor printer won't turn on",
  "description": "The printer near the break room stopped responding.",
  "category": "IT",
  "priority": "HIGH"
}
```
Response `201`:
```json
{
  "id": "b77b7627-7d43-4c8b-9d43-b397adbeab77",
  "title": "3rd floor printer won't turn on",
  "description": "The printer near the break room stopped responding.",
  "category": "IT",
  "priority": "HIGH",
  "status": "OPEN",
  "created_by_id": "ana-employee",
  "created_at": "2026-09-15T14:30:05.309145Z",
  "updated_at": "2026-09-15T14:30:05.309145Z"
}
```

### `GET /api/tickets`
Paginated list, with filters and sorting via query string. An employee sees only their own; support sees all.

Example call: `GET /api/tickets?status=OPEN&sort_by=priority&sort_dir=desc&page=1&page_size=10`

| Query param | Accepted values | Default |
|---|---|---|
| `status` | `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED` | (no filter) |
| `category` | `IT`, `FACILITIES`, `HR` | (no filter) |
| `priority` | `LOW`, `MEDIUM`, `HIGH`, `URGENT` | (no filter) |
| `sort_by` | `created_at`, `priority` | `created_at` |
| `sort_dir` | `asc`, `desc` | `desc` |
| `page` | integer ≥ 1 | `1` |
| `page_size` | integer between 1 and 100 | `10` |

Response `200`:
```json
{
  "items": [
    {
      "id": "b77b7627-7d43-4c8b-9d43-b397adbeab77",
      "title": "3rd floor printer won't turn on",
      "category": "IT",
      "priority": "HIGH",
      "status": "OPEN",
      "created_by_name": "Ana",
      "created_at": "2026-09-15T14:30:05.309145Z",
      "updated_at": "2026-09-15T14:30:05.309145Z"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 10
}
```

### `GET /api/tickets/{id}`
Full detail of a ticket, including the complete status history.

Response `200`:
```json
{
  "id": "b77b7627-7d43-4c8b-9d43-b397adbeab77",
  "title": "3rd floor printer won't turn on",
  "description": "The printer near the break room stopped responding.",
  "category": "IT",
  "priority": "HIGH",
  "status": "IN_PROGRESS",
  "created_by_name": "Ana",
  "created_at": "2026-09-15T14:30:05.309145Z",
  "updated_at": "2026-09-15T14:30:05.363064Z",
  "history": [
    {
      "from_status": null,
      "to_status": "OPEN",
      "changed_by_name": "Ana",
      "changed_at": "2026-09-15T14:30:05.315274Z"
    },
    {
      "from_status": "OPEN",
      "to_status": "IN_PROGRESS",
      "changed_by_name": "Carlos",
      "changed_at": "2026-09-15T14:30:05.365916Z"
    }
  ]
}
```

### `PATCH /api/tickets/{id}/status`
Advances the status — only users with the `support` role. Only accepts the single valid next step in the sequence `OPEN → IN_PROGRESS → RESOLVED → CLOSED`.

Request:
```json
{
  "status": "IN_PROGRESS"
}
```
Response `200`: same format as `GET /api/tickets/{id}` above, with the status and history already updated.

### `GET /health`
Simple healthcheck, no authentication.

Response `200`:
```json
{ "status": "ok" }
```

### Error codes

Every error response follows the same format: `{"detail": "human-readable message"}`.

| Code | When it happens |
|---|---|
| `401` | Not authenticated — missing, invalid, or expired token, or wrong login credentials |
| `403` | Authenticated, but without permission — employee accessing someone else's ticket, or calling the status endpoint |
| `404` | Ticket with the given `id` does not exist |
| `409` | Invalid status transition — skipping a step, or trying to change a ticket that's already `CLOSED` |
| `422` | Invalid request body or query parameters (automatic validation) |
| `500` | Unexpected error — never exposes internal detail in the response, only logs it server-side |

## Full flow explained: creating a ticket

Step by step, end to end, for anyone reading the code for the first time to understand how the pieces connect:

1. **Frontend — form**: the user fills in the form in `src/components/tickets/TicketForm.tsx`; required-field validation runs in `src/components/tickets/useTicketForm.ts`, before any network call.
2. **Frontend — triggering the call**: `src/pages/NewTicketPage.tsx` calls the `useCreateTicket()` hook (`src/hooks/useTickets.ts`), which calls `createTicket()` in `src/api/tickets.ts`.
3. **Network**: `src/api/client.ts` builds the `POST /api/tickets` request, attaching the `Authorization: Bearer <token>` header (the token was stored in `localStorage` at login time).
4. **Backend — automatic validation**: FastAPI validates the body against the `TicketCreate` schema (`app/schemas/ticket.py`) — non-empty title and description, category and priority within the accepted values. If anything is wrong, it returns `422` on its own, with no manual validation code.
5. **Backend — identifying the user**: the `get_current_user` dependency (`app/core/deps.py`) decodes the JWT from the header and looks up the matching user in the database.
6. **Backend — business rule**: `app/services/ticket_service.py: create_ticket()` creates the ticket with status `OPEN` and already writes the first status history row (`from_status: null → to_status: OPEN`), in the same transaction.
7. **Database**: PostgreSQL writes both rows (`tickets` and `ticket_status_history`) together — if one fails, the other is rolled back too.
8. **Response**: the router returns the created ticket (`201`); the frontend uses this to navigate back to the dashboard.

## Stack

| Technology | Where | Why this choice |
|---|---|---|
| **FastAPI** | Backend | Asynchronous Python framework, with data validation and interactive docs (`/docs`) generated automatically from the schemas — less repeated manual validation code |
| **SQLAlchemy 2.0 + Alembic** | Backend | Mature Python ORM, with versioned database migrations (every schema change becomes a reviewable file) |
| **PostgreSQL 17** | Database | See dedicated section below |
| **Pydantic v2** | Backend | Input/output validation, natively integrated with FastAPI |
| **PyJWT + bcrypt** | Backend | JWT token generation/validation and password hashing, without reinventing cryptography |
| **React 19 + Vite** | Frontend | React required by the brief; Vite for fast builds and hot-reload during development |
| **TypeScript** | Frontend | Static typing — the contract between frontend and backend (data shape) is checked at development time, not only in production |
| **Tailwind CSS** | Frontend | Utility-first styling directly in JSX, with no separate `.css` files to manage |
| **pytest** / **Vitest + Testing Library** | Tests | Standard tooling for each ecosystem — 44 backend tests, 53 frontend tests, all passing |
| **Docker Compose** | Local environment | Brings up the database, API, and email capture tool with a single command, with nothing to install besides Docker |
| **Mailpit** | Development (email) | Captures emails locally in a web interface, with no need for a real provider account |

### Why PostgreSQL (and not another database, or files)

1. **The domain is inherently relational**: `Ticket → User (creator) → status history` is a classic one-to-many relationship.
2. **Filtering and sorting are core requirements** of the brief — SQL (`WHERE`/`ORDER BY` with an index) does this natively; a document store or flat files would require filtering everything in application memory.
3. **The status change must be atomic**: updating `ticket.status` and inserting the history row have to happen together, in the same transaction — with multiple support agents working on tickets at the same time, this is a real ACID transaction requirement that files can't safely provide.
4. **Referential integrity** via foreign keys and enums, as an extra layer of guarantee beyond backend validation.
5. `docker compose up` brings everything up without requiring anything pre-installed on the evaluator's machine — closer to how production would actually work than asking someone to install a database by hand.

**In a real production environment**: the *type* of database (relational) is still the right choice — nothing about that would change. What would change is *how* it's hosted: instead of a self-managed Postgres container (great for development, but leaves you responsible for backups, version upgrades, and failure recovery), a **managed database service** (Cloud SQL, Amazon RDS, Azure Database for PostgreSQL) — same technology, but taking the operational work of keeping it safely running off your plate. This evolution is already sketched out in `infra/terraform/database.tf` (see the "What I'd improve with more time" section further below).

## Project structure

```
ticket-manager/
├── docker-compose.yml         # orchestrates database + API + Mailpit
├── .env.example
├── infra/terraform/           # production infrastructure — see "future improvements" section
├── .github/workflows/         # CI/CD — see "future improvements" section
├── ticket-manager-back/       # API (FastAPI)
│   └── app/
│       ├── main.py            # FastAPI app, middlewares, exception handlers, /health
│       ├── core/                # config, security (JWT/bcrypt), auth dependency, domain exceptions
│       ├── db/                  # database connection, user seeding
│       ├── models/             # tables (SQLAlchemy)
│       ├── schemas/            # input/output validation (Pydantic)
│       ├── routers/            # HTTP routes — "thin", with no business logic inside
│       └── services/           # the actual business logic
└── ticket-manager-front/      # application (React)
    └── src/
        ├── api/                 # HTTP calls — a fetch wrapper + one function per domain
        ├── auth/                # authentication context (login/logout/session)
        ├── components/         # reusable components, organized by domain
        ├── hooks/               # custom hooks for API calls (no caching library)
        ├── pages/               # screens
        └── types/               # shared TypeScript types
```

## Assumptions, Trade-offs, and the Road to Production

The brief asks for the assumptions made, what would be improved with more time, and code that reflects how production software gets written. This section covers all three — organized as: what was assumed where the brief was silent, the deliberate trade-offs behind the current code, and then a roadmap split by layer (frontend, backend, infrastructure) based on what's actually in this repository today.

### Assumptions

Places where the brief didn't specify behavior, and a decision had to be made:

| Assumption | Reasoning |
|---|---|
| **Employees see only their own tickets** | The brief says "the support team can view all tickets" but doesn't say what an employee sees. `GET /api/tickets` filters by `created_by_id` when the role is `employee` (`app/services/ticket_service.py`). |
| **Status only moves forward, one step at a time, with no reopening** | `OPEN → IN_PROGRESS → RESOLVED → CLOSED` — no skipping a step, no path back from `CLOSED`. Enforced both in the UI (only the single valid next status is ever offered) and in the backend (`ALLOWED_TRANSITIONS` in `ticket_service.py`). |
| **No self-service user registration** | The two existing users come from a seed script (`app/db/seed.py`), not a signup form — the brief didn't ask for account creation, so it was treated as out of scope rather than guessed at. |

### Trade-offs (deliberate, not oversights)

**"Plain" React, with no framework or helper libraries.** The brief asked for "the frontend to be built with React," without mentioning frameworks (Next.js, Remix) or helper libraries for routing, remote state, or forms. This was interpreted literally, and taken further: the project actually started with a few common ecosystem libraries, and they were deliberately removed — leaving only `react` and `react-dom` as runtime dependencies, so every piece of logic (navigation, API calls, form validation) stays visible in the code itself, with nothing hidden behind an abstraction. Fitting for a technical evaluation; a real production frontend would very likely want these back:

| Library | What it would solve, if the project grew |
|---|---|
| `react-router-dom` | Real navigable URLs (sharing a direct link to a ticket's detail, for example) and deep-linking |
| `@tanstack/react-query` | Automatic caching and revalidation of API data, in place of the manual hooks in `hooks/useTickets.ts` |
| `react-hook-form` | Less repeated `useState`-per-field code in every form |
| `zod` | Declarative schema validation, shareable between the form and the TypeScript type |
| `@hookform/resolvers` | Bridge between `react-hook-form` and `zod` |

**JWT in `localStorage`, not an httpOnly cookie.** An `httpOnly` cookie would prevent the token from being exposed to an XSS attack, but would require handling CSRF and `same-site` configuration between the frontend (`:5173`) and the backend (`:8000`) — disproportionate for this project's scope.

**Email notification is best-effort, not transactional.** Sending the status-change email must never break the API response — the status change is already committed to the database before the send is even attempted. If the mail server is unreachable (or anything else goes wrong while sending), it's only logged server-side; the caller still gets a normal success response (`app/services/notification_service.py`).

### What I'd improve with more time

Going through everything actually built — frontend, backend, and infrastructure — here's what's real about each, not a generic checklist:

#### Frontend

| Area | What's there today | What I'd add |
|---|---|---|
| Routing / data fetching / forms | Hand-rolled (`useState`-based view switching, manual `fetch` hooks, manual validation) — see the trade-off above | `react-router-dom`, `@tanstack/react-query`, `react-hook-form` + `zod`, as detailed in the table above |
| Bundle | `npm run build` produces a single JS chunk (~242 KB, ~74 KB gzipped) and a single CSS file — no code splitting | Route-based `React.lazy()` splitting once there are enough screens for it to matter |
| Testing | Vitest + Testing Library — 53 component/unit tests, no browser automation | An end-to-end suite (Playwright) covering the real login → create → advance-status → email flow across actual browser sessions |
| Language | UI text is hardcoded in English, with no translation layer | Extract strings into a small i18n layer if the product ever needed more than one language |

#### Backend

| Area | What's there today | What I'd add |
|---|---|---|
| Security | JWT + bcrypt, generic 401 on wrong credentials (timing-safe), input length limits — no dependency scanning, no HTTP security headers, no rate limiting at the application level (only at the infrastructure edge, see below) | Dependabot/`pip-audit`/`npm audit` in CI; SBOM + provenance attestation (SLSA) on image builds; CSP/HSTS headers; a formal pass against the OWASP API Security Top 10; and a startup check that refuses to boot if `JWT_SECRET_KEY` is still the default placeholder |
| Code quality gates | `pytest` runs in CI (`ci.yml`) — there's no linter or type-checker (`ruff`, `mypy`) wired in for the backend, and the frontend's own `oxlint` script exists but isn't called from `ci.yml` either | Add both to `ci.yml` as required checks, not just tests |
| Request handling | Status-change emails are sent synchronously inside the `PATCH .../status` request — the HTTP response waits for the SMTP call (up to its 5s timeout) to finish before returning | Move the send to a FastAPI `BackgroundTask` (or a proper queue, see Notifications below) so the response returns as soon as the status change is committed |
| Scalability | `create_engine(settings.DATABASE_URL)` uses SQLAlchemy's default pool, single database connection, no cache | Explicit connection pool sizing; Redis for the most common filtered listings; start routing read-only queries to the read replica that already exists in `infra/terraform/database.tf` (see Infrastructure below — it's provisioned but the application doesn't use it yet) |
| Observability | Plain `logging` calls (e.g. in `notification_service.py`); `/health` only confirms the process is up | OpenTelemetry for logs/metrics/traces under one standard; expand `/health` to check the database connection too; SLO/burn-rate alerting instead of a flat threshold |
| User registration | Deliberately absent (see Assumptions above) | If it became a real need: first a same-backend `POST /api/auth/register` (no restructuring needed — creating a user is a simple CRUD operation on the existing `User` model, so this **doesn't** justify splitting into microservices); if requirements grew further (multiple systems sharing login, stricter compliance), move to a managed identity provider (Auth0, AWS Cognito, Firebase Auth) rather than building one |
| Notifications | Synchronous email only, sent inline in the request (see above) | Evolve into an event-driven model (message queue) once there's a real reason to — it would also open the door to browser push (Web Push API, no Firebase needed) and receiving webhooks from external systems, without redesigning what already exists |

#### Infrastructure

`infra/terraform/` and `.github/workflows/` are a **real technical draft**, not just prose — they're validated (`terraform validate`/`terraform fmt`, `actionlint`) but never applied against a live cloud account (there are no credentials here). `docker compose up` remains everything needed to run the project today; none of this connects to the local setup until someone deliberately uses it.

| Area | What's there today | What I'd add / reconsider |
|---|---|---|
| Compute | **Cloud Run**, not Kubernetes (`cloud_run.tf`) — deliberate: for a single API with no other services to orchestrate, Cloud Run gets the same automatic scaling with far less operational surface | If the system ever grew into several independent services that need to be orchestrated together, that's the point where Kubernetes would start to earn its complexity — not before |
| Global reach | One Cloud Run service in a single region (`var.region`), behind a Global HTTPS Load Balancer (`load_balancer.tf`) | The Load Balancer's global anycast routing is only half-used this way — the frontend bucket does benefit (Cloud CDN caches it at the edge everywhere), but API requests still travel to the one region Cloud Run runs in. A genuinely global API would need Cloud Run deployed in multiple regions behind that same Load Balancer |
| Why there's a Load Balancer at all, given Cloud Run already balances its own instances | Cloud Run automatically distributes traffic across its own container instances (`0`–`max_instance_count`) — that part needs nothing extra | The Load Balancer exists for what Cloud Run alone doesn't do: **(1)** one hostname for both the API (Cloud Run) and the static frontend (Cloud Storage bucket), routed by path via `url_map`; **(2)** Cloud Armor (WAF + the 100 req/min rate limit) only attaches to a Load Balancer backend, not directly to Cloud Run; **(3)** Cloud CDN only caches a `backend_bucket`, unrelated to Cloud Run |
| Database | Cloud SQL Postgres with a **read replica** already provisioned (`database.tf`) | The replica is provisioned but currently unused — the application has a single `DATABASE_URL` pointing at the primary. Wiring read-only endpoints (`GET /api/tickets`, `GET /api/tickets/{id}`) to the replica is the natural next step once read traffic is the bottleneck |
| CI/CD | `ci.yml` runs tests only (no lint/type-check, see Backend above); `deploy.yml` uses Workload Identity Federation (no long-lived service account key) to build and deploy to Cloud Run on merge to `main` | Trunk-based development with feature flags and canary/progressive delivery instead of an all-at-once deploy; DORA metrics to track the health of the delivery process itself |

To actually apply the Terraform, someone with a Google Cloud account would:
1. Copy `infra/terraform/terraform.tfvars.example` to `terraform.tfvars` and fill it in with real values for their own project (this file must never be committed — it's already in `.gitignore`).
2. Pass the two secrets (`jwt_secret`, `db_password`) via environment variable, never writing them into a file:
   ```bash
   TF_VAR_jwt_secret="..." TF_VAR_db_password="..." terraform apply
   ```
3. Inside `infra/terraform/`: `terraform init`, then `terraform apply`.
4. Configure the repository secrets on GitHub (`GCP_WORKLOAD_IDENTITY_PROVIDER`, `GCP_DEPLOYER_SERVICE_ACCOUNT`, `GCP_REGION`, `GCP_PROJECT_ID`) using the Terraform outputs, so that `deploy.yml` works.

## Useful scripts

| Command | Where to run it | What it does |
|---|---|---|
| `docker compose run --rm api pytest -q` | repository root | Runs the backend tests (via Docker — nothing needs to be installed on the machine) |
| `npm run test` | `ticket-manager-front/` | Runs the frontend tests (Vitest) |
| `npm run build` | `ticket-manager-front/` | Type checking (`tsc`) + production build |

## About this project

Built as a submission for a full-stack development technical challenge. The `.docx` with the original brief remains in the repository root.
