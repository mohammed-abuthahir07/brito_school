# Brito School Backend - API & Architecture Documentation

Welcome to the official developer documentation for the **Brito School Backend API**, built with Node.js, Express.js, and MySQL.

This documentation suite covers every aspect of the backend system: architecture, security, database schema, performance optimizations, every API endpoint, Postman collections, and OpenAPI specifications.

---

## 📚 Documentation Index

| Document | Description |
| :--- | :--- |
| [**API Documentation**](./API_DOCUMENTATION.md) | Exhaustive guide covering all 22 API endpoints with full schemas, parameters, and examples |
| [**API Reference**](./API_REFERENCE.md) | Quick-reference lookup table for all routes, methods, and status codes |
| [**Authentication Guide**](./AUTHENTICATION.md) | JWT tokens, bcrypt password hashing, OTP flow, security headers, and rate limiting |
| [**Database Overview**](./DATABASE_OVERVIEW.md) | MySQL schema definitions, table relationships, foreign keys, indexes, and connection pooling |
| [**Error Codes & Handling**](./ERROR_CODES.md) | Error response standards, HTTP status codes, Multer errors, and edge cases |
| [**Postman Collection**](./postman_collection.json) | Importable Postman Collection covering all endpoints with automated JWT token handling |
| [**Postman Environment**](./postman_environment.json) | Postman environment variables (`base_url`, `auth_token`) |
| [**OpenAPI Specification**](./openapi.yaml) | Standard OpenAPI 3.0.3 definition file for Swagger UI and SDK generation |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18.0.0 or higher; v24.x tested & verified)
- **MySQL** (v8.0 or higher)
- **npm** or **pnpm**

### Installation & Environment Setup
1. Clone the repository and enter the server directory:
   ```bash
   cd server
   npm install
   ```

2. Configure environment variables in `.env`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=brito_school
   DB_PORT=3306
   DB_CONNECTION_LIMIT=20
   JWT_SECRET=your_super_secret_jwt_key_here_12345
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   ```

3. Run the Database Index Migration:
   ```bash
   node scripts/migrate_indexes.js
   # or execute scripts/migrate_indexes.sql in MySQL Workbench / CLI
   ```

4. Start the Application:
   ```bash
   # Production mode
   npm start

   # Development mode with hot reload
   npm run dev
   ```

---

## 🧪 Testing & Benchmarks

### Automated Test Suite
The project includes a comprehensive automated test suite covering authentication, route protections, CRUD operations, file validations, and error edge cases:
```bash
node --test tests/api.test.js
```
- **38 automated tests** passing across 9 test suites with 0 failures.

### Load & Stress Benchmarking
Execute the high-concurrency load testing suite measuring RPS, P95 latency, and memory consumption:
```bash
node scripts/load_test.js
```
- **Benchmark Highlights**:
  - Baseline (1 user): 14.15 ms average latency
  - 10 Concurrent Users: **1,870.8 req/sec**, 5.31 ms avg latency (P95: 7.95 ms)
  - 50 Concurrent Users: **3,197.4 req/sec**, 15.48 ms avg latency (P95: 26.04 ms)
  - 100 Concurrent Users: **3,256.0 req/sec**, 30.47 ms avg latency (P95: 42.74 ms)
  - Database-Heavy Search: **3,743.5 req/sec**, 13.22 ms avg latency (P95: 19.43 ms)
  - Error rate across all concurrency tiers: **0.00%**

---

## 🛡️ Production Readiness Checklist
- [x] Security headers enabled (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection: 0`, `Referrer-Policy: strict-origin-when-cross-origin`)
- [x] `X-Powered-By` header disabled
- [x] Rate limiting enabled (auth endpoints: 30 req/15 min; general: 1,000 req/15 min)
- [x] Payload size limits enforced (`2mb` on JSON and urlencoded bodies)
- [x] MySQL Connection Pooling with keep-alive, idle pruning, and auto-reconnect
- [x] Non-blocking asynchronous file operations (`fs.promises.unlink`)
- [x] Composite and timestamp indexes applied to prevent table filesorts
- [x] Centralized error handling and 404 route fallbacks
- [x] Graceful shutdown on `SIGINT` / `SIGTERM` draining HTTP and MySQL connections
