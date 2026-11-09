const http = require("node:http");
const jwt = require("jsonwebtoken");
const app = require("../server");
const pool = require("../config/db");

process.env.NODE_ENV = "test";
process.env.DISABLE_RATE_LIMIT = "true";

let server;
let baseUrl;
let token;

// Percentile calculator helper
function calculateStats(latencies) {
  if (latencies.length === 0) return { avg: 0, median: 0, p95: 0, p99: 0, min: 0, max: 0 };
  latencies.sort((a, b) => a - b);
  const sum = latencies.reduce((acc, v) => acc + v, 0);
  const avg = sum / latencies.length;
  const p = (pct) => latencies[Math.floor(latencies.length * (pct / 100))];

  return {
    min: latencies[0].toFixed(2),
    max: latencies[latencies.length - 1].toFixed(2),
    avg: avg.toFixed(2),
    median: p(50).toFixed(2),
    p90: p(90).toFixed(2),
    p95: p(95).toFixed(2),
    p99: p(99).toFixed(2),
  };
}

// Single request runner
async function runSingleRequest(url, options = {}) {
  const start = performance.now();
  try {
    const res = await fetch(url, options);
    const duration = performance.now() - start;
    return { success: res.ok, status: res.status, duration };
  } catch (err) {
    const duration = performance.now() - start;
    return { success: false, status: 0, error: err.message, duration };
  }
}

// Concurrency pool runner
async function runBenchmark(name, { concurrency, totalRequests, endpoint, method = "GET", body = null }) {
  console.log(`\n======================================================`);
  console.log(`Running Scenario: ${name}`);
  console.log(`Concurrency: ${concurrency} | Total Requests: ${totalRequests}`);
  console.log(`Target: ${method} ${endpoint}`);
  console.log(`------------------------------------------------------`);

  const initialMemory = process.memoryUsage();
  const startTime = performance.now();
  const latencies = [];
  let errorCount = 0;
  let completed = 0;

  const url = `${baseUrl}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  if (body) {
    headers["Content-Type"] = "application/json";
  }

  // Work queue
  let requestIndex = 0;

  async function worker() {
    while (requestIndex < totalRequests) {
      requestIndex++;
      const res = await runSingleRequest(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      latencies.push(res.duration);
      if (!res.success) {
        errorCount++;
      }
      completed++;
    }
  }

  const workers = [];
  for (let i = 0; i < concurrency; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);

  const totalTimeSec = (performance.now() - startTime) / 1000;
  const rps = (completed / totalTimeSec).toFixed(1);
  const stats = calculateStats(latencies);
  const finalMemory = process.memoryUsage();
  const heapUsedDiffMb = ((finalMemory.heapUsed - initialMemory.heapUsed) / (1024 * 1024)).toFixed(2);

  console.log(`Results for ${name}:`);
  console.log(`  Requests Completed : ${completed}`);
  console.log(`  Total Time Taken   : ${totalTimeSec.toFixed(2)}s`);
  console.log(`  Requests / Second  : ${rps} req/sec`);
  console.log(`  Average Latency    : ${stats.avg} ms`);
  console.log(`  Median Latency     : ${stats.median} ms`);
  console.log(`  P90 Latency        : ${stats.p90} ms`);
  console.log(`  P95 Latency        : ${stats.p95} ms`);
  console.log(`  P99 Latency        : ${stats.p99} ms`);
  console.log(`  Min Latency        : ${stats.min} ms`);
  console.log(`  Max Latency        : ${stats.max} ms`);
  console.log(`  Errors             : ${errorCount} (${((errorCount / completed) * 100).toFixed(2)}%)`);
  console.log(`  Heap Delta         : ${heapUsedDiffMb} MB`);

  return {
    name,
    concurrency,
    totalRequests,
    rps: parseFloat(rps),
    stats,
    errorCount,
    errorRate: ((errorCount / completed) * 100).toFixed(2) + "%",
    totalTimeSec: totalTimeSec.toFixed(2),
  };
}

async function main() {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`Benchmarking against ${baseUrl}`);
      resolve();
    });
  });

  const [admins] = await pool.query("SELECT id, email FROM admins LIMIT 1");
  const admin = admins[0] || { id: 1, email: "admin@britoschool.com" };
  token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET || "your_super_secret_jwt_key_here_12345", {
    expiresIn: "1h",
  });

  const summary = [];

  // Scenario 1: Normal Traffic (1 user)
  summary.push(
    await runBenchmark("Normal Traffic (Baseline)", {
      concurrency: 1,
      totalRequests: 100,
      endpoint: "/api/admin/announcements",
    })
  );

  // Scenario 2: 10 Concurrent Users
  summary.push(
    await runBenchmark("10 Concurrent Users", {
      concurrency: 10,
      totalRequests: 500,
      endpoint: "/api/admin/announcements",
    })
  );

  // Scenario 3: 50 Concurrent Users
  summary.push(
    await runBenchmark("50 Concurrent Users", {
      concurrency: 50,
      totalRequests: 1000,
      endpoint: "/api/admin/announcements",
    })
  );

  // Scenario 4: 100 Concurrent Users (Heavy concurrency)
  summary.push(
    await runBenchmark("100 Concurrent Users", {
      concurrency: 100,
      totalRequests: 2000,
      endpoint: "/api/admin/announcements",
    })
  );

  // Scenario 5: Database-heavy / High-Record Endpoint (Thirukkural)
  summary.push(
    await runBenchmark("50 Concurrent Users on Thirukkural", {
      concurrency: 50,
      totalRequests: 1000,
      endpoint: "/api/admin/thirukkural",
    })
  );

  console.log("\n=========================================================================");
  console.log("FINAL LOAD TEST SUMMARY TABLE");
  console.log("=========================================================================");
  console.table(
    summary.map((s) => ({
      Scenario: s.name,
      Concurrency: s.concurrency,
      Requests: s.totalRequests,
      RPS: s.rps,
      "Avg (ms)": s.stats.avg,
      "P95 (ms)": s.stats.p95,
      "P99 (ms)": s.stats.p99,
      "Errors (%)": s.errorRate,
    }))
  );

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await pool.end();
}

main().catch((err) => {
  console.error("Load test runner error:", err);
  process.exit(1);
});
