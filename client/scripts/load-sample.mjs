const base = process.env.API || 'http://localhost:5000';
const n = Number(process.env.N || 100);
const path = process.env.PATH_URL || '/api/public/announcements';
const started = Date.now();

const rows = await Promise.all(
  Array.from({ length: n }, () =>
    fetch(`${base}${path}`)
      .then(async (r) => {
        await r.text();
        return { ok: r.ok, status: r.status };
      })
      .catch(() => ({ ok: false, status: 0 })),
  ),
);

const elapsedMs = Date.now() - started;
const ok = rows.filter((r) => r.ok).length;
const codes = {};
for (const r of rows) {
  codes[r.status] = (codes[r.status] || 0) + 1;
}

console.log(
  JSON.stringify(
    {
      scenario: `${n} concurrent GET ${path}`,
      total: n,
      ok,
      fail: n - ok,
      elapsedMs,
      statusCounts: codes,
    },
    null,
    2,
  ),
);
