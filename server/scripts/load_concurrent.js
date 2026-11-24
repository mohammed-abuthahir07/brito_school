/**
 * GET-only concurrent load against a running local API.
 * Usage: node scripts/load_concurrent.js <concurrency> <totalRequests> [baseUrl]
 */
const concurrency = Math.max(1, Number(process.argv[2] || 100));
const totalRequests = Math.max(concurrency, Number(process.argv[3] || concurrency * 4));
const baseUrl = process.argv[4] || process.env.LOAD_BASE_URL || "http://127.0.0.1:5000";

const endpoints = [
  "/health/live",
  "/api/public/announcements",
  "/api/public/calendars",
  "/api/public/galleries",
  "/api/public/thirukkural/daily",
];

const percentile = (sorted, p) => {
  if (!sorted.length) return 0;
  const index = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[index];
};

async function oneRequest(url) {
  const start = performance.now();
  try {
    const res = await fetch(url);
    await res.arrayBuffer();
    return { ok: res.ok || res.status === 304, status: res.status, ms: performance.now() - start };
  } catch {
    return { ok: false, status: 0, ms: performance.now() - start };
  }
}

async function main() {
  console.log(`Load: concurrency=${concurrency} total=${totalRequests} base=${baseUrl}`);
  const started = performance.now();
  let next = 0;
  const results = [];

  async function worker() {
    while (true) {
      const i = next++;
      if (i >= totalRequests) return;
      const path = endpoints[i % endpoints.length];
      results.push(await oneRequest(`${baseUrl}${path}`));
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  const elapsed = (performance.now() - started) / 1000;
  const times = results.map((r) => r.ms).sort((a, b) => a - b);
  const ok = results.filter((r) => r.ok).length;
  const fail = results.length - ok;
  const avg = times.reduce((s, n) => s + n, 0) / (times.length || 1);
  const statusCounts = {};
  for (const row of results) {
    const key = String(row.status);
    statusCounts[key] = (statusCounts[key] || 0) + 1;
  }
  console.log(
    JSON.stringify(
      {
        concurrency,
        total: results.length,
        ok,
        fail,
        successPct: Number(((ok / results.length) * 100).toFixed(2)),
        rps: Number((results.length / elapsed).toFixed(1)),
        avgMs: Number(avg.toFixed(2)),
        medianMs: Number(percentile(times, 50).toFixed(2)),
        p95Ms: Number(percentile(times, 95).toFixed(2)),
        p99Ms: Number(percentile(times, 99).toFixed(2)),
        elapsedSec: Number(elapsed.toFixed(2)),
        statusCounts,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
