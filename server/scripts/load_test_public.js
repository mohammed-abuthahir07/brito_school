const http = require("node:http");
const jwt = require("jsonwebtoken");
const app = require("../server");
const pool = require("../config/db");

process.env.NODE_ENV = "test";
process.env.DISABLE_RATE_LIMIT = "true";

let server;
let baseUrl;
let adminToken;

// Statistical percentile calculator
function calculateStats(latencies) {
  if (latencies.length === 0) return { avg: 0, median: 0, p90: 0, p95: 0, p99: 0, min: 0, max: 0 };
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

// Single HTTP request helper
async function makeRequest(url, options = {}) {
  const start = performance.now();
  try {
    const res = await fetch(url, options);
    const duration = performance.now() - start;
    return { success: res.ok || res.status === 304, status: res.status, duration };
  } catch (err) {
    const duration = performance.now() - start;
    return { success: false, status: 0, error: err.message, duration };
  }
}

// Progressive Mixed Load Benchmark Runner
async function runMixedWorkload(name, { concurrency, totalRequests, adminWriteRatio = 0.05 }) {
  console.log(`\n======================================================`);
  console.log(`Running Scenario: ${name}`);
  console.log(`Concurrency: ${concurrency} | Total Requests: ${totalRequests}`);
  console.log(`Traffic Mix: ~95% Public GET reads + ~5% Admin writes`);
  console.log(`------------------------------------------------------`);

  const initialMemory = process.memoryUsage();
  const startTime = performance.now();
  const readLatencies = [];
  const writeLatencies = [];
  let errorCount = 0;
  let requestIndex = 0;

  const publicEndpoints = [
    "/api/public/thirukkural/daily",
    "/api/public/galleries",
    "/api/public/announcements",
    "/api/public/calendars",
    "/api/public/thirukkural",
  ];

  async function worker(workerId) {
    while (requestIndex < totalRequests) {
      const current = requestIndex++;
      const isAdminWrite = current % Math.round(1 / adminWriteRatio) === 0;

      if (isAdminWrite) {
        // Admin write operation: create an isolated announcement and delete it
        const writeStart = performance.now();
        const postRes = await makeRequest(`${baseUrl}/api/admin/announcements`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: `Bench Write ${workerId}-${current}`,
            content: "Load test write payload",
            category: "General",
          }),
        });

        const duration = performance.now() - writeStart;
        writeLatencies.push(duration);
        if (!postRes.success) {
          errorCount++;
        }
      } else {
        // Public reader operation: fetch cached public content
        const ep = publicEndpoints[current % publicEndpoints.length];
        const res = await makeRequest(`${baseUrl}${ep}`);
        readLatencies.push(res.duration);
        if (!res.success) {
          errorCount++;
        }
      }
    }
  }

  const workers = [];
  for (let i = 0; i < concurrency; i++) {
    workers.push(worker(i));
  }

  await Promise.all(workers);

  const totalTimeSec = (performance.now() - startTime) / 1000;
  const completed = readLatencies.length + writeLatencies.length;
  const rps = (completed / totalTimeSec).toFixed(1);
  const readStats = calculateStats(readLatencies);
  const writeStats = calculateStats(writeLatencies);
  const finalMemory = process.memoryUsage();
  const heapDiffMb = ((finalMemory.heapUsed - initialMemory.heapUsed) / (1024 * 1024)).toFixed(2);

  console.log(`Results for ${name}:`);
  console.log(`  Requests Completed : ${completed} (${readLatencies.length} reads, ${writeLatencies.length} writes)`);
  console.log(`  Total Time Taken   : ${totalTimeSec.toFixed(2)}s`);
  console.log(`  Overall Throughput : ${rps} req/sec`);
  console.log(`  Public READ P95    : ${readStats.p95} ms (Avg: ${readStats.avg} ms, Med: ${readStats.median} ms, P99: ${readStats.p99} ms)`);
  console.log(`  Admin WRITE P95    : ${writeStats.p95 || 0} ms (Avg: ${writeStats.avg || 0} ms)`);
  console.log(`  Errors             : ${errorCount} (${((errorCount / completed) * 100).toFixed(2)}%)`);
  console.log(`  Heap Delta         : ${heapDiffMb} MB`);

  return {
    name,
    concurrency,
    completed,
    rps: parseFloat(rps),
    readAvg: readStats.avg,
    readP95: readStats.p95,
    readP99: readStats.p99,
    writeP95: writeStats.p95 || 0,
    errorRate: ((errorCount / completed) * 100).toFixed(2) + "%",
  };
}

async function main() {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`Mixed Workload Benchmarking against ${baseUrl}`);
      resolve();
    });
  });

  const [admins] = await pool.query("SELECT id, email FROM admins LIMIT 1");
  const admin = admins[0] || { id: 1, email: "admin@britoschool.com" };
  adminToken = jwt.sign(
    { id: admin.id, email: admin.email },
    process.env.JWT_SECRET || "your_super_secret_jwt_key_here_12345",
    { expiresIn: "1h" }
  );

  const results = [];

  // Scenario A: 50 concurrent public readers
  results.push(
    await runMixedWorkload("Scenario A: 50 Concurrent Public Readers", {
      concurrency: 50,
      totalRequests: 1000,
    })
  );

  // Scenario B: 100 concurrent public readers
  results.push(
    await runMixedWorkload("Scenario B: 100 Concurrent Public Readers", {
      concurrency: 100,
      totalRequests: 1500,
    })
  );

  // Scenario C: 200 concurrent public readers
  results.push(
    await runMixedWorkload("Scenario C: 200 Concurrent Public Readers", {
      concurrency: 200,
      totalRequests: 2000,
    })
  );

  // Scenario D: 300 concurrent public readers
  results.push(
    await runMixedWorkload("Scenario D: 300 Concurrent Public Readers", {
      concurrency: 300,
      totalRequests: 2500,
    })
  );

  // Scenario E: 500 concurrent public readers
  results.push(
    await runMixedWorkload("Scenario E: 500 Concurrent Public Readers", {
      concurrency: 500,
      totalRequests: 3000,
    })
  );

  console.log("\n=========================================================================");
  console.log("FINAL PROGRESSIVE READ-HEAVY LOAD TEST SUMMARY TABLE");
  console.log("=========================================================================");
  console.table(
    results.map((r) => ({
      Scenario: r.name,
      Concurrency: r.concurrency,
      Requests: r.completed,
      RPS: r.rps,
      "Read Avg (ms)": r.readAvg,
      "Read P95 (ms)": r.readP95,
      "Read P99 (ms)": r.readP99,
      "Write P95 (ms)": r.writeP95,
      "Errors (%)": r.errorRate,
    }))
  );

  // Clean up benchmark announcements created during test
  await pool.query("DELETE FROM announcements WHERE title LIKE 'Bench Write%'");

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await pool.end();
}

main().catch((err) => {
  console.error("Load test error:", err);
  process.exit(1);
});
