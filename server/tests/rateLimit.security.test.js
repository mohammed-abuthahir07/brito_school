const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const jwt = require("jsonwebtoken");

process.env.NODE_ENV = "test";
process.env.DISABLE_RATE_LIMIT = "false";

const app = require("../server");
const pool = require("../config/db");
const { createRateLimiter } = require("../admin/middleware/rateLimiter");
const { GENERIC_FORGOT_MESSAGE } = require("../admin/controller/adminForgetpasswordController");

const testEmail = "admin@britoschool.com";
const GENERIC_FORGOT = GENERIC_FORGOT_MESSAGE;

let server;
let baseUrl;
let authToken;
let admin;

async function request(endpoint, options = {}) {
  const headers = { ...options.headers };
  let body = options.body;
  if (body && typeof body === "object") {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
    body = JSON.stringify(body);
  }
  const res = await fetch(`${baseUrl}${endpoint}`, {
    method: options.method || "GET",
    headers,
    body,
  });
  const contentType = res.headers.get("content-type") || "";
  let data;
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  return { status: res.status, headers: res.headers, data };
}

async function burst(endpoint, count, options = {}, concurrency = 40) {
  const statuses = {};
  let remainingHeaders = [];
  let index = 0;

  async function worker() {
    while (true) {
      const current = index++;
      if (current >= count) {
        return;
      }
      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: options.method || "GET",
        headers: options.headers || {},
        body: options.body,
      });
      await res.arrayBuffer();
      statuses[res.status] = (statuses[res.status] || 0) + 1;
      remainingHeaders.push(res.headers.get("x-ratelimit-remaining"));
    }
  }

  const workers = Math.min(concurrency, count);
  await Promise.all(Array.from({ length: workers }, () => worker()));
  return { statuses, remainingHeaders };
}

describe("Rate-limit and security regression (limiters enabled)", { concurrency: 1 }, () => {
  before(async () => {
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen({ port: 0, host: "127.0.0.1", backlog: 2048 }, () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        console.log(`Rate-limit test server started at ${baseUrl}`);
        resolve();
      });
    });

    const [admins] = await pool.query("SELECT id, email FROM admins WHERE email = ? LIMIT 1", [testEmail]);
    admin = admins[0] || { id: 1, email: testEmail };
    authToken = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET || "your_super_secret_jwt_key_here_12345",
      { expiresIn: "1h" }
    );
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await pool.end();
  });

  test("normal public and admin traffic is not blocked below the limits", async () => {
    const started = performance.now();
    const samples = [];
    for (let i = 0; i < 10; i++) {
      const t0 = performance.now();
      const res = await request("/api/public/announcements");
      samples.push(performance.now() - t0);
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.headers.get("x-ratelimit-limit"), "10000");
    }
    const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
    console.log(`Public GET avg with rate limits ON: ${avg.toFixed(2)} ms (${samples.length} samples, window ${((performance.now() - started) / 1000).toFixed(2)}s)`);

    const dashboard = await request("/api/admin/dashboard", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.equal(dashboard.status, 200);
    assert.equal(dashboard.data.success, true);
    assert.equal(dashboard.headers.get("x-ratelimit-limit"), "1000");
  });

  test("missing, invalid, and expired JWT return 401", async () => {
    const missing = await request("/api/admin/announcements");
    assert.equal(missing.status, 401);
    assert.equal(missing.data.message, "Unauthorized: No token provided");

    const invalid = await request("/api/admin/announcements", {
      headers: { Authorization: "Bearer invalid_token_value_12345" },
    });
    assert.equal(invalid.status, 401);
    assert.equal(invalid.data.message, "Unauthorized: Invalid or expired token");

    const expired = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET || "your_super_secret_jwt_key_here_12345",
      { expiresIn: -10 }
    );
    const expiredRes = await request("/api/admin/announcements", {
      headers: { Authorization: `Bearer ${expired}` },
    });
    assert.equal(expiredRes.status, 401);
    assert.equal(expiredRes.data.message, "Unauthorized: Invalid or expired token");
  });

  test("valid admin JWT can access admin APIs; unauthenticated cannot", async () => {
    const ok = await request("/api/admin/profile", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.equal(ok.status, 200);
    assert.equal(ok.data.success, true);

    const denied = await request("/api/admin/profile");
    assert.equal(denied.status, 401);
  });

  test("JWT signed for a non-existent admin id is rejected with 401", async () => {
    const outsider = jwt.sign(
      { id: 999999, email: "not-an-admin@example.com" },
      process.env.JWT_SECRET || "your_super_secret_jwt_key_here_12345",
      { expiresIn: "5m" }
    );
    const res = await request("/api/admin/dashboard", {
      headers: { Authorization: `Bearer ${outsider}` },
    });
    assert.equal(res.status, 401);
    assert.equal(res.data.success, false);
    assert.equal(res.data.message, "Unauthorized: Invalid or expired token");
  });

  test("forgot-password responses match for registered and unknown emails", async () => {
    const unknown = await request("/api/admin/forgot-password", {
      method: "POST",
      body: { email: "doesnotexist_rate_limit@example.com" },
    });
    const known = await request("/api/admin/forgot-password", {
      method: "POST",
      body: { email: testEmail },
    });
    assert.equal(unknown.status, 200);
    assert.equal(known.status, 200);
    assert.deepEqual(unknown.data, known.data);
    assert.equal(known.data.message, GENERIC_FORGOT);
  });

  test("password reset OTP cannot be reused", async () => {
    const [beforeRows] = await pool.query("SELECT password FROM admins WHERE email = ? LIMIT 1", [testEmail]);
    const originalHash = beforeRows[0].password;
    try {
      const forgot = await request("/api/admin/forgot-password", {
        method: "POST",
        body: { email: testEmail },
      });
      assert.equal(forgot.status, 200);
      const [otpRows] = await pool.query("SELECT otp_code FROM admins WHERE email = ? LIMIT 1", [testEmail]);
      const otp = otpRows[0].otp_code;
      assert.ok(otp);

      const reset = await request("/api/admin/reset-password", {
        method: "POST",
        body: {
          email: testEmail,
          otp,
          newPassword: "TempRate9",
          confirmPassword: "TempRate9",
        },
      });
      assert.equal(reset.status, 200);

      const reuse = await request("/api/admin/reset-password", {
        method: "POST",
        body: {
          email: testEmail,
          otp,
          newPassword: "TempRate9",
          confirmPassword: "TempRate9",
        },
      });
      assert.equal(reuse.status, 400);
      assert.equal(reuse.data.message, "Invalid OTP code.");
    } finally {
      await pool.execute(
        "UPDATE admins SET password = ?, otp_code = NULL, otp_expires_at = NULL WHERE email = ?",
        [originalHash, testEmail]
      );
    }
  });

  test("CORS allows local origins and rejects unauthorized browser origins", async () => {
    const allowed = await request("/api/public/calendars", {
      headers: { Origin: "http://127.0.0.1:4173" },
    });
    assert.equal(allowed.status, 200);
    assert.equal(allowed.headers.get("access-control-allow-origin"), "http://127.0.0.1:4173");

    const blocked = await request("/api/public/calendars", {
      headers: { Origin: "https://evil.example" },
    });
    assert.equal(blocked.status, 200);
    assert.notEqual(blocked.headers.get("access-control-allow-origin"), "https://evil.example");

    const preflight = await request("/api/public/calendars", {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:3000",
        "Access-Control-Request-Method": "GET",
      },
    });
    assert.ok(preflight.status === 204 || preflight.status === 200);
    assert.equal(preflight.headers.get("access-control-allow-origin"), "http://localhost:3000");
  });

  test("each route class exposes the configured limiter", async () => {
    const auth = await request("/api/admin/login", {
      method: "POST",
      body: { email: "limiter-probe@example.com", password: "wrong" },
    });
    assert.equal(auth.status, 401);
    assert.equal(auth.headers.get("x-ratelimit-limit"), "30");
    assert.ok(Number(auth.headers.get("x-ratelimit-remaining")) < 30);
    assert.ok(Number(auth.headers.get("x-ratelimit-reset")) > Math.floor(Date.now() / 1000));

    const pub = await request("/api/public/thirukkural/daily");
    assert.equal(pub.status, 200);
    assert.equal(pub.headers.get("x-ratelimit-limit"), "10000");

    const adminGet = await request("/api/admin/thirukkural", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.equal(adminGet.status, 200);
    assert.equal(adminGet.headers.get("x-ratelimit-limit"), "1000");

    const alias = await request("/api/announcements");
    assert.equal(alias.status, 200);
    assert.equal(alias.headers.get("x-ratelimit-limit"), "1000");
  });

  test("auth limiter allows 30 requests then returns 429", { timeout: 60000 }, async () => {
    const probe = await request("/api/admin/forgot-password", {
      method: "POST",
      body: { email: "auth-limit-probe@example.com" },
    });
    assert.equal(probe.headers.get("x-ratelimit-limit"), "30");
    const remaining = Number(probe.headers.get("x-ratelimit-remaining"));
    assert.ok(remaining >= 0);
    assert.ok(remaining < 30);

    if (remaining > 0) {
      const burstResult = await burst(
        "/api/admin/forgot-password",
        remaining,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "auth-limit-fill@example.com" }),
        },
        5
      );
      const allowed = Object.entries(burstResult.statuses).reduce((sum, [status, count]) => {
        return Number(status) !== 429 ? sum + count : sum;
      }, 0);
      assert.equal(allowed, remaining);
      assert.equal(burstResult.statuses[429] || 0, 0);
    }

    const blocked = await request("/api/admin/forgot-password", {
      method: "POST",
      body: { email: "auth-limit-blocked@example.com" },
    });
    assert.equal(blocked.status, 429);
    assert.equal(blocked.data.success, false);
    assert.match(blocked.data.message, /Too many authentication attempts/);
    assert.equal(blocked.headers.get("x-ratelimit-limit"), "30");
    assert.equal(blocked.headers.get("x-ratelimit-remaining"), "0");
    assert.ok(Number(blocked.headers.get("retry-after")) > 0);
    assert.ok(blocked.data.retryAfterSeconds > 0);
    assert.ok(Number(blocked.headers.get("x-ratelimit-reset")) >= Math.floor(Date.now() / 1000));
    console.log(
      `Auth limiter: allowed 30 / 15m, blocked with 429, Retry-After=${blocked.headers.get("retry-after")}s`
    );
  });

  test("general API limiter allows 1000 requests then returns 429", { timeout: 120000 }, async () => {
    const probe = await request("/api/admin/announcements", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.ok(probe.status === 200 || probe.status === 429);
    assert.equal(probe.headers.get("x-ratelimit-limit"), "1000");
    if (probe.status === 429) {
      return;
    }
    const remaining = Number(probe.headers.get("x-ratelimit-remaining"));
    const burstResult = await burst(
      "/api/admin/announcements",
      remaining,
      { headers: { Authorization: `Bearer ${authToken}` } },
      50
    );
    const blockedDuringFill = burstResult.statuses[429] || 0;
    assert.equal(blockedDuringFill, 0);

    const blocked = await request("/api/admin/announcements", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.equal(blocked.status, 429);
    assert.equal(blocked.headers.get("x-ratelimit-limit"), "1000");
    assert.equal(blocked.headers.get("x-ratelimit-remaining"), "0");
    assert.ok(Number(blocked.headers.get("retry-after")) > 0);
    console.log(`General limiter: allowed 1000 / 15m, 429 Retry-After=${blocked.headers.get("retry-after")}s`);
  });

  test("public GET limiter allows 10000 requests then returns 429", { timeout: 180000 }, async () => {
    const probe = await request("/api/public/galleries");
    assert.equal(probe.status, 200);
    assert.equal(probe.headers.get("x-ratelimit-limit"), "10000");
    const remaining = Number(probe.headers.get("x-ratelimit-remaining"));
    assert.ok(remaining <= 9999);

    const burstResult = await burst("/api/public/galleries", remaining, {}, 80);
    assert.equal(burstResult.statuses[429] || 0, 0);
    const allowed = Object.values(burstResult.statuses).reduce((a, b) => a + b, 0);
    assert.equal(allowed, remaining);

    const blocked = await request("/api/public/galleries");
    assert.equal(blocked.status, 429);
    assert.equal(blocked.headers.get("x-ratelimit-limit"), "10000");
    assert.equal(blocked.headers.get("x-ratelimit-remaining"), "0");
    assert.ok(Number(blocked.headers.get("retry-after")) > 0);
    assert.match(blocked.data.message, /Rate limit exceeded/);
    console.log(`Public limiter: allowed 10000 / 15m, 429 Retry-After=${blocked.headers.get("retry-after")}s`);
  });
});

describe("Rate-limit window reset (same createRateLimiter implementation)", { concurrency: 1 }, () => {
  test("counter resets after the window elapses", async () => {
    const limiter = createRateLimiter({
      windowMs: 80,
      max: 2,
      message: "limited",
    });

    const run = () =>
      new Promise((resolve) => {
        const req = { ip: "203.0.113.10", socket: {} };
        const res = {
          headers: {},
          setHeader(name, value) {
            this.headers[name.toLowerCase()] = String(value);
          },
          status(code) {
            this.statusCode = code;
            return this;
          },
          json(body) {
            this.body = body;
            resolve({ status: this.statusCode || 200, headers: this.headers, body });
            return this;
          },
        };
        limiter(req, res, () => resolve({ status: 200, headers: res.headers }));
      });

    const first = await run();
    const second = await run();
    const third = await run();
    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal(third.status, 429);
    assert.equal(third.headers["x-ratelimit-limit"], "2");
    assert.equal(third.headers["x-ratelimit-remaining"], "0");
    assert.ok(Number(third.headers["retry-after"]) >= 0);

    await new Promise((resolve) => setTimeout(resolve, 90));
    const afterReset = await run();
    assert.equal(afterReset.status, 200);
    assert.equal(afterReset.headers["x-ratelimit-remaining"], "1");
  });
});
