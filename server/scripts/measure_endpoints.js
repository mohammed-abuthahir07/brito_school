const http = require("node:http");
const jwt = require("jsonwebtoken");
const app = require("../server");
const pool = require("../config/db");

process.env.NODE_ENV = "test";
process.env.DISABLE_RATE_LIMIT = "true";

function stats(latencies) {
  if (!latencies.length) return {};
  const sorted = [...latencies].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const at = (p) => sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
  return {
    samples: sorted.length,
    min: sorted[0].toFixed(2),
    avg: (sum / sorted.length).toFixed(2),
    median: at(50).toFixed(2),
    p90: at(90).toFixed(2),
    p95: at(95).toFixed(2),
    p99: at(99).toFixed(2),
    max: sorted[sorted.length - 1].toFixed(2),
  };
}

async function timed(url, options = {}) {
  const start = performance.now();
  try {
    const res = await fetch(url, options);
    await res.arrayBuffer();
    return { ok: res.ok || res.status === 304 || res.status === 401, status: res.status, ms: performance.now() - start };
  } catch (err) {
    return { ok: false, status: 0, ms: performance.now() - start, error: err.message };
  }
}

async function measure(name, iterations, fn) {
  const latencies = [];
  let errors = 0;
  for (let i = 0; i < iterations; i++) {
    const result = await fn();
    latencies.push(result.ms);
    if (!result.ok) errors += 1;
  }
  const s = stats(latencies);
  const totalSec = latencies.reduce((a, b) => a + b, 0) / 1000;
  return {
    Endpoint: name,
    Samples: s.samples,
    "Avg (ms)": s.avg,
    "Median": s.median,
    P90: s.p90,
    P95: s.p95,
    P99: s.p99,
    Max: s.max,
    "Err %": ((errors / iterations) * 100).toFixed(2),
    RPS: (iterations / totalSec).toFixed(1),
  };
}

async function main() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const [admins] = await pool.query("SELECT id, email FROM admins LIMIT 1");
  const admin = admins[0] || { id: 1, email: "admin@britoschool.com" };
  const token = jwt.sign(
    { id: admin.id, email: admin.email },
    process.env.JWT_SECRET || "your_super_secret_jwt_key_here_12345",
    { expiresIn: "1h" }
  );
  const auth = { Authorization: `Bearer ${token}` };

  const rows = [];
  rows.push(await measure("GET /health", 40, () => timed(`${baseUrl}/health`)));
  rows.push(await measure("GET /health/live", 40, () => timed(`${baseUrl}/health/live`)));
  rows.push(await measure("GET /health/ready", 40, () => timed(`${baseUrl}/health/ready`)));
  rows.push(await measure("GET /api/public/announcements", 40, () => timed(`${baseUrl}/api/public/announcements`)));
  rows.push(await measure("GET /api/public/calendars", 40, () => timed(`${baseUrl}/api/public/calendars`)));
  rows.push(await measure("GET /api/public/galleries", 40, () => timed(`${baseUrl}/api/public/galleries`)));
  rows.push(await measure("GET /api/public/thirukkural", 40, () => timed(`${baseUrl}/api/public/thirukkural`)));
  rows.push(await measure("GET /api/public/thirukkural/daily", 40, () => timed(`${baseUrl}/api/public/thirukkural/daily`)));
  rows.push(await measure("GET /api/admin/announcements", 30, () => timed(`${baseUrl}/api/admin/announcements`, { headers: auth })));
  rows.push(await measure("GET /api/admin/dashboard", 30, () => timed(`${baseUrl}/api/admin/dashboard`, { headers: auth })));
  rows.push(await measure("GET /api/admin/profile", 30, () => timed(`${baseUrl}/api/admin/profile`, { headers: auth })));
  rows.push(await measure("GET /api/admin/thirukkural", 30, () => timed(`${baseUrl}/api/admin/thirukkural`, { headers: auth })));
  rows.push(
    await measure("POST /api/admin/login (invalid)", 10, () =>
      timed(`${baseUrl}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "nobody@example.com", password: "wrong-password" }),
      })
    )
  );

  console.table(rows);

  await new Promise((resolve) => server.close(resolve));
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
