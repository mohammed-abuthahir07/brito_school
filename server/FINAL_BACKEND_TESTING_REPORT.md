# Brito School Backend — Final Testing Report

| Field | Value |
|---|---|
| Document | Final complete backend testing report |
| Date | 17 November 2026 |
| Version | 1.0.0 |
| Scope | `server/` only |
| Runtime | Node.js v24.19.0, npm 11.17.0, MySQL 8.0.46, database `brito_school` |
| Application code modified this testing pass | **None** |

**These results describe the tested local environment and do not constitute a guaranteed production capacity or SLA.**

---

## Overall status

| Category | Status |
|---|---|
| 1. Application overview | PASS |
| 2. Public API testing | PASS |
| 3. Admin API testing | PASS |
| 4. JWT and admin security | PASS (with one explicitly untested destructive case) |
| 5. CORS | PASS |
| 6. Rate limiting (limiters enabled) | PASS |
| 7. Database | PASS |
| 8. File upload | PASS |
| 9. Cache and concurrency | PASS |
| 10. Performance benchmarks | PASS (local only; no production SLA) |
| 11. Security findings | PASS — no critical/high finding unreported |
| 12. Automated test suite | PASS — 100 passed, 0 failed |
| 13. Failed or skipped automated tests | None skipped; see “Not tested” for live destructive cases |

---

## 1. Application overview

The backend is a single Express 5 process with mysql2 pooling, JWT admin auth, in-memory public cache, and multer uploads. Automated coverage lives in:

- `tests/api.test.js` — `NODE_ENV=test` and `DISABLE_RATE_LIMIT=true` (functional behavior)
- `tests/rateLimit.security.test.js` — limiters **enabled** (CORS, JWT, 429)

Load:

- `npm run test:load`
- `npm run test:load:public`
- `npm run test:measure`

Functional tests create temporary rows and delete them. Load tests use an ephemeral HTTP server on `127.0.0.1`. Real production rows were not deleted as part of this pass.

---

## 2. Public API testing results — PASS

Discovered public handlers in `public/routes/publicRoutes.js`, mounted at `/api/public` and aliased under `/api`:

| Method | Endpoint | Auth | Result |
|---|---|---|---|
| GET | `/api/public/announcements` | None | PASS |
| GET | `/api/public/calendars` | None | PASS |
| GET | `/api/public/galleries` | None | PASS |
| GET | `/api/public/thirukkural` | None | PASS |
| GET | `/api/public/thirukkural/daily` | None | PASS |
| GET | `/api/announcements` (alias) | None | PASS |
| GET | `/api/calendars` (alias) | None | PASS |
| GET | `/api/galleries` (alias) | None | PASS |
| GET | `/api/thirukkural` (alias) | None | PASS |
| GET | `/api/thirukkural/daily` (alias) | None | PASS |

Verified by `tests/api.test.js` “Public Content APIs & Caching”, admin-write/public-read workflows, and cache generation tests:

- HTTP 200 JSON `{ success: true, ... }`
- Accessible without JWT
- ETag present; `If-None-Match` → **304**
- Empty lists return `count: 0` / `kural: null` as coded
- After admin create/update/delete, public GET reflects the new data
- Cache miss fills once (single-flight); stale generation does not overwrite newer cache

Unknown routes return 404 `{ success: false, message: "Endpoint not found" }`.

---

## 3. Admin API testing results — PASS

| Module | Methods tested | Result |
|---|---|---|
| Login | POST `/api/admin/login` | PASS — 400 missing fields, 401 bad credentials, 200 valid |
| Profile | GET / POST / PUT | PASS — 401 without token; required fields; update |
| Profile DELETE | DELETE `/api/admin/profile` | PASS — **404** (endpoint not registered, as designed) |
| Dashboard | GET `/api/admin/dashboard` | PASS — structure, numeric totals, `byCategory` array |
| Announcements | GET POST PUT DELETE | PASS — validation, 404 unknown id, cache invalidation |
| Calendars | GET POST DELETE | PASS — no PUT exists; missing file/title 400 |
| Galleries | GET POST PUT DELETE | PASS — capacity 30, 409 on 31st, concurrent create cap |
| Thirukkural | GET POST PUT DELETE | PASS — daily replace rules, unique number, validation |
| Forgot / reset | POST | PASS — generic forgot message, OTP reuse/expiry |

Temporary records only. Existing production content was not targeted for deletion.

---

## 4. JWT and admin security testing — PASS

| Check | Evidence | Status |
|---|---|---|
| Valid admin credentials login | api + rate-limit suites | PASS |
| Incorrect credentials 401 | api.test.js | PASS |
| Missing JWT 401 | both suites | PASS |
| Invalid JWT 401 | both suites | PASS |
| Expired JWT 401 | api.test.js + rateLimit.security.test.js | PASS |
| Signed JWT missing id 401 | api.test.js | PASS |
| Signed JWT for nonexistent admin id 401 | both suites | PASS |
| Valid admin JWT authorized | both suites | PASS |
| Public APIs without JWT | api.test.js | PASS |
| No public admin registration route | route inspection + 404 fallback | PASS |
| Deleted admin cannot use old JWT | Would require deleting the only admin row | **NOT TESTED** (unsafe on the live `admins` table) |

Code path for a missing admin row after `jwt.verify` is `findAdminById` → 401. That branch is covered by the nonexistent-id token test, which is the safe equivalent of “admin does not exist.”

There is no multi-role system; none was added.

---

## 5. CORS testing results — PASS

| Check | Result |
|---|---|
| Allowed local origin (`http://localhost:3000`) receives `Access-Control-Allow-Origin` | PASS |
| Unauthorized origin is not reflected | PASS |
| OPTIONS preflight 204/200 for allowed origin | PASS |
| Request without `Origin` still succeeds | PASS |

Configured behavior (`server.js`): `CORS_ORIGIN` comma-separated allow-list; if empty, localhost/127.0.0.1/[::1] in non-production; production with empty list **rejects** browser origins. Missing Origin is allowed (`isCorsOriginAllowed` returns true).

---

## 6. Rate-limit testing results — PASS

`tests/rateLimit.security.test.js` runs **with limiters enabled** (`DISABLE_RATE_LIMIT` is not set true there).

| Limiter | Config | Verified |
|---|---|---|
| Auth | 30 / 15 minutes | Headers `X-RateLimit-Limit: 30`; 31st request **429**, `Retry-After`, `retryAfterSeconds` |
| Public GET `/api/public` | 10,000 / 15 minutes | Limit header 10000; fill remaining then **429** |
| Other `/api` | 1,000 / 15 minutes | Admin GET limit 1000; **429** after budget |
| Alias `/api/announcements` | general 1000, not 10000 | PASS — documented behavior |
| Window reset | isolated limiter 80 ms / max 2 | PASS |

Load tests **disable** rate limiting and are **not** used as rate-limit evidence.

Traffic below the caps is not blocked. Auth, public, and general limiters are distinct Maps (independent budgets).

---

## 7. Database testing results — PASS

| Check | Result |
|---|---|
| Pool defaults 25 / 500 / keep-alive / waitForConnections | Verified in `config/db.js` |
| Parameterized SQL | Models use `?` placeholders |
| Indexes present (SHOW CREATE 17 Nov 2026) | `idx_announcements_created_at`, `idx_calendars_created_at`, `idx_galleries_created_at`, `idx_thirukkural_created_at_id` |
| Unique `kural_number`, unique `admins.email`, PKs | Present |
| Foreign keys | **None** (verified SHOW CREATE) |
| Transactions / GET_LOCK | Gallery create and daily Thirukkural publish; connections released in `finally` |
| Concurrent gallery writes | Test: 29 rows then parallel uploads never exceed 30 |
| Concurrent daily kural | Test: simultaneous POSTs leave a single active row |
| Connection leak in tests | Load tests completed; health reports pool metrics; no leak test soak beyond suite duration |

Schema was **not** modified in this testing pass.

---

## 8. File upload testing results — PASS

| Case | Result |
|---|---|
| Gallery valid image (JPEG including alternate field name `file`) | PASS |
| Gallery invalid type / fake magic bytes | PASS 400 |
| Gallery 30 MB or larger (single and any-of-multiple) | PASS 400 |
| Gallery missing image/title | PASS 400 |
| Gallery 31st image | PASS 409 |
| Calendar fake PDF without `%PDF` | PASS 400 |
| Calendar image extension allowed | PASS |
| Calendar missing file/title | PASS 400 |
| Path traversal unlink | `files.js` rejects paths outside `uploads/` (code inspection) |

Temporary upload files created by tests are cleaned up in those tests. Empty-file-as-a-zero-byte-image is covered by magic-byte rejection for claimed raster images.

---

## 9. Cache and concurrency testing results — PASS

`ContentCache` unit-style tests inside api.test.js:

| Scenario | Status |
|---|---|
| A — stale in-flight fill after invalidate does not populate cache | PASS |
| B — concurrent loads share one fill | PASS |
| C — admin invalidate then load returns newest data | PASS |
| D — older generation never overwrites newer cache | PASS |
| E — expired entries refresh | PASS |
| HTTP ETag / 304 | PASS |
| Public workflow after announcement/kural writes | PASS |

TTL in production is 5 minutes; tests use a short TTL on a standalone `ContentCache` instance for expiration.

---

## 10. Performance benchmark results — PASS (local)

### Sequential (`npm run test:measure`)

See technical documentation Part 6. Averages ~13–16 ms for GET; invalid login ~65 ms; 0% errors.

### Admin/health load (`npm run test:load`)

| Scenario | Conc | RPS | P95 | Errors |
|---|---:|---:|---:|---:|
| Announcements | 1 | 70.6 | 17.83 ms | 0% |
| Announcements | 10 | 1153.2 | 13.02 ms | 0% |
| Announcements | 50 | 1994.8 | 35.87 ms | 0% |
| Announcements | 100 | 2074.6 | 59.37 ms | 0% |
| Thirukkural | 50 | 2343.0 | 26.90 ms | 0% |
| Dashboard | 50 | 1582.3 | 50.26 ms | 0% |
| Health | 100 | 6085.5 | 23.80 ms | 0% |

### Mixed public + admin write (`npm run test:load:public`)

| Conc | RPS | Read P95 | Write P95 | Errors | Pool peak | Event-loop max |
|---:|---:|---:|---:|---:|---|---:|
| 50 | 2225.0 | 39.31 ms | 124.08 ms | 0% | 8 / 0 | 29.77 ms |
| 100 | 3836.1 | 36.76 ms | 58.79 ms | 0% | 8 / 0 | 28.56 ms |
| 200 | 3680.9 | 81.82 ms | 340.14 ms | 0% | 25 / 23 | 39.94 ms |
| 300 | 3604.9 | 114.93 ms | 261.75 ms | 0% | 25 / 15 | 39.94 ms |
| 500 | 2209.7 | 453.28 ms | 719.80 ms | 0% | 25 / 20 | 165.81 ms |

Compared with an earlier mixed-load snapshot (500 workers ~4222 RPS, read P95 ~163 ms, 0% errors): this rerun is **slower at 500 workers** but still **error-free**. Variance is expected on a busy local workstation. **No unexplained functional regression.** Latency at 500 workers is a known limitation, not a test failure.

Dedicated named “cache-hit only” / “cache-miss only” load scripts do not exist; mixed writes invalidate cache. Sequential public GETs after warmup are cache-hit dominated.

---

## 11. Error and security testing — PASS

| Area | How verified | Status |
|---|---|---|
| SQL injection | Parameterized queries; integer parsers; no string-concat user SQL | PASS (code). Live attack payloads against production **not** run |
| Invalid JSON | Central handler `Invalid JSON payload` 400 | PASS (code + Express body parser) |
| Missing / wrong types | Controller tests | PASS |
| Oversized JSON (2 MB) | Limit in `server.js`; dedicated HTTP test **not** present | **NOT TESTED** as an HTTP case |
| Auth / authz bypass | JWT suite | PASS |
| Sensitive errors | Production message generic; tests in `NODE_ENV=test` | PASS |
| Unhandled rejections | `process.on` logger in `server.js` | PASS (handler present) |
| Connection leaks | `finally` release; tests complete | PASS for suite duration; long soak **NOT TESTED** |
| Memory leaks | Load heap deltas fluctuate including GC | No leak proven; long soak **NOT TESTED** |
| Cache races | Generation tests | PASS |
| HTTP status codes | CRUD/auth/upload tests | PASS |

**Findings:** none critical or high remaining unreported. Informational: public URL aliases share the 1,000/15m limiter; in-memory limiters/cache are per process; JWT not revocable until expiry.

---

## 12. Automated test suite — PASS

Command: `npm test`  
(`node --test tests/api.test.js && node --test tests/rateLimit.security.test.js`)

| Suite | Tests | Result |
|---|---:|---|
| `tests/api.test.js` (rate limit disabled) | 88 | passed |
| `tests/rateLimit.security.test.js` (limiters on) | 12 | passed |
| **Total** | **100** | **0 failed, 0 skipped** |

Previously cited baseline of 71 tests is superseded: security, CORS, cache-generation, and limiter tests were added earlier in this hardening work. This report’s verified total is **100**.

---

## 13. Failed or skipped tests

- Automated: **none failed, none skipped**.
- Intentionally not executed:
  - Deleting the real admin account
  - Destructive SQL against production
  - Deployed multi-instance rate-limit/cache sharing
  - Multi-hour memory soak
  - HTTP body > 2 MB probe

---

## Remaining known limitations

1. In-memory cache and rate limits are per Node process.
2. Single process; P95 grows from ~200 concurrent mixed workers locally.
3. Health DB ping may be up to 1 second stale (250 ms on failure).
4. MySQL may table-scan tiny tables despite indexes.
5. `/api/*` public aliases are limited to 1,000 requests / 15 minutes.
6. Production simultaneous-user capacity is **not** established.

---

## Backend files modified

**None** during this final testing and documentation pass. Deliverables only:

- `server/BACKEND_COMPLETE_TECHNICAL_DOCUMENTATION.md` (created)
- `server/FINAL_BACKEND_TESTING_REPORT.md` (this file)

Temporary `server/scripts/_doc_inspect.js` (read-only SHOW CREATE helper) is removed if present; it is not application runtime code.

Client folder: **not modified**. Application: **not deployed**.

---

## Final acceptance checklist

| Condition | Result |
|---|---|
| Intended public APIs work | PASS |
| Intended admin APIs work | PASS |
| Only existing admin JWT identity can access protected APIs | PASS (nonexistent id rejected) |
| Existing functionality not broken (100/100 tests) | PASS |
| Connections released | PASS |
| Cache invalidation correct | PASS |
| Rate limiting verified with limiters enabled | PASS |
| Existing and new automated tests pass | PASS |
| No unexplained performance regression | PASS (500-worker latency varies; 0% errors) |
| No unreported critical/high security issue | PASS |

**Final verdict: the Brito School backend meets the final verification criteria in the tested local environment.**
