# Brito School Management System — Backend API

A RESTful API backend for the Brito School Management System, built with **Node.js**, **Express.js**, and **MySQL**.

---

## Features

- 🔐 JWT Authentication with rate-limited login
- 📢 Announcements management (CRUD)
- 📅 Academic Calendar uploads (PDF)
- 🖼️ School Gallery management (image uploads)
- 📖 Thirukkural literature management (CRUD)
- 👤 Admin Profile management
- 📊 Real-time Dashboard statistics
- 🏥 Health check endpoint with DB/memory/disk metrics
- 🔒 Security headers on all responses
- 🗜️ gzip compression for large payloads

---

## Prerequisites

- Node.js 18+
- MySQL 8+
- npm

---

## Setup Instructions

### 1. Clone & Install

```bash
cd server
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` (or edit `.env` directly):

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=brito_school
JWT_SECRET=your_super_secret_jwt_key_here_12345
NODE_ENV=development
```

### 3. Set Up the Database

Create the MySQL database and run the schema migrations:

```bash
# Create database in MySQL
CREATE DATABASE brito_school;
```

Then run any migration scripts if provided. The system expects these tables:
`admins`, `announcements`, `calendars`, `galleries`, `thirukkural`

### 4. Seed the Admin Account

```bash
node admin/seed/seedAdmin.js
```

Default credentials:
- **Email:** `admin@britoschool.com`
- **Password:** `admin@123`

### 5. Start the Server

```bash
# Development (with nodemon auto-restart)
npm run dev

# Production
npm start
```

The server starts on `http://localhost:5000`.

---

## Available NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm start` | `node server.js` | Start production server |
| `npm run dev` | `nodemon server.js` | Start dev server with auto-reload |
| `npm test` | `node --test tests/api.test.js` | Run all API tests |
| `npm run test:measure` | `node scripts/measure_endpoints.js` | Per-endpoint latency samples |
| `npm run test:load` | `node scripts/load_test.js` | Admin GET concurrency |
| `npm run test:load:public` | `node scripts/load_test_public.js` | Public read-heavy mixed load |

---

## API Overview

| Group | Base Path | Description |
|-------|-----------|-------------|
| System | `/health`, `/health/live`, `/health/ready` | Health, liveness, readiness |
| Public | `/api/public/*` | Unauthenticated announcements, calendars, galleries, Thirukkural |
| Auth | `/api/admin/login` | Login, forgot/reset password |
| Dashboard | `/api/admin/dashboard` | Aggregated statistics |
| Announcements | `/api/admin/announcements` | Full CRUD |
| Calendars | `/api/admin/calendars` | PDF upload & list |
| Galleries | `/api/admin/galleries` | Image upload & full CRUD |
| Thirukkural | `/api/admin/thirukkural` | Full CRUD |
| Profile | `/api/admin/profile` | Admin profile management |

For complete documentation, see [API_DOCUMENT.md](./API_DOCUMENT.md) and [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

---

## Postman Collection

A ready-to-import Postman collection is available at:

```
server/docs/brito_school_postman_collection.json
```

Import it in Postman via **File → Import**, set `base_url` to `http://localhost:5000`, then run the **Login** request — the token is auto-saved.

---

## Project Structure

```
server/
├── admin/
│   ├── controller/        # Route handler logic
│   │   ├── adminAuthcontroller.js
│   │   ├── adminForgetpasswordController.js
│   │   ├── announcementController.js
│   │   ├── calendarController.js
│   │   ├── dashboardController.js   ← new
│   │   ├── galleryController.js
│   │   ├── profileController.js
│   │   └── thirukkuralController.js
│   ├── middleware/        # Auth & rate limiting
│   ├── model/             # Database query functions
│   ├── routes/            # Express routers
│   ├── seed/              # Database seed scripts
│   └── utils/             # Helpers (validate, files)
├── config/                # DB pool & JWT config
├── docs/                  # Postman collection
├── tests/                 # API test suite
├── uploads/               # Uploaded files (PDF, images)
├── server.js              # App entry point
├── API_DOCUMENT.md        # Full API documentation
└── README.md              # This file
```

---

## Running Tests

```bash
npm test --prefix server
```

Expected output: **70 tests pass, 0 fail**.

---

## Implementation History

| Date | Session | Changes |
|------|---------|---------|
| 2026-11-13 | Session 5 | **Gallery cap 30 + daily Thirukkural**: Enforced max 30 gallery rows with `GET_LOCK` so concurrent uploads cannot exceed 30 (`409` with the capacity message). PUT replacement does not increase count; delete unlinks files only when unreferenced. Daily Thirukkural uses Asia/Kolkata; same-day POST updates the current row; next-day POST replaces it in a transaction. Public gallery GET capped at 30; public Thirukkural GET returns at most one record. Existing DB counts were 0/0 (no cleanup). Frontend admin UI is still a stub, so capacity `18/30` display is returned as API fields (`total`, `max_capacity`, `remaining`) for the client to consume. Tests: **70/70**. |
| 2026-11-13 | Session 4 | **Complete backend audit**: Registered missing `GET /api/public/thirukkural/daily`. Public HTTP cache now revalidates (`max-age=0, must-revalidate`) so admin writes are not hidden by browser TTL. Gallery uploads restricted to images; calendars to PDF/images. Added `/health/live` and `/health/ready`. Public GET rate limit 10000/15m. Pool `queueLimit` default 500. In-memory cache capped at 200 entries. Regression: **64/64 tests**. Local mixed load 50–500 concurrent readers: **0.00% errors** (latency rises with concurrency on a single Node process; not a production capacity claim). |
| 2026-11-12 | Session 3 | **Production Audit, Optimization & File Upload Generalization**: Fixed Multer "Unexpected file field" error by supporting any form-data field name (`file`, `image`, etc.) across galleries and calendars. Allowed any file format for academic calendars and media uploads. Resolved high-concurrency connection pool queue limit bottleneck in `dashboardController.js` (combined 4 scalar count queries into 1, set `queueLimit: 0` for safe waiting) — eliminating 86.2% error rate under 50 concurrent users down to **0.00% errors** at 1,309+ RPS. Benchmarked 7 load test scenarios up to 4,428 RPS. Expanded test suite to 53 tests. |
| 2026-11-12 | Session 2 | Fixed broken Profile API (was referencing non-existent `admin_profiles` table — rewritten to use `admins` table directly). Added Dashboard API (`GET /api/admin/dashboard`) with parallel queries. Added `POST` and `DELETE` profile routes. Expanded test suite from 31 to 51 tests. Rewrote `API_DOCUMENT.md`. Created Postman collection file. |
| *(initial)* | Session 1 | Initial backend implementation: auth, announcements, calendars, galleries, thirukkural, profile routes, health check, rate limiting, security headers. |
