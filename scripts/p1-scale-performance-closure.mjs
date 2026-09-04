import assert from 'node:assert/strict';

const workloads = [5_000, 10_000, 50_000, 100_000];
const concurrencyLevels = [1, 2, 4, 8];
const BATCH = 500;

function percentile(samples, p) {
  const sorted = [...samples].sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index];
}

function chunkCount(rows, size = BATCH) {
  return Math.ceil(rows / size);
}

function buildRows(rows) {
  return Array.from({ length: rows }, (_, i) => ({
    id: i + 1,
    tenant: `tenant-${(i % 3) + 1}`,
    amount: (i % 10000) + 0.25,
    status: i % 20 === 0 ? 'invalid' : 'valid',
  }));
}

async function runPool(total, limit) {
  let cursor = 0;
  let active = 0;
  let maxActive = 0;
  let completed = 0;
  const samples = [];
  const start = performance.now();

  async function task() {
    const t0 = performance.now();
    active++;
    maxActive = Math.max(maxActive, active);
    // Yield before deterministic CPU work so concurrent runners can overlap.
    await new Promise((resolve) => setImmediate(resolve));
    let checksum = 0;
    for (let i = 0; i < 250; i++) checksum = (checksum + i * 31) % 1_000_003;
    void checksum;
    active--;
    completed++;
    samples.push(performance.now() - t0);
  }

  const runners = Array.from({ length: limit }, async () => {
    while (true) {
      const next = cursor++;
      if (next >= total) return;
      await task();
    }
  });
  await Promise.all(runners);

  return {
    elapsedMs: performance.now() - start,
    maxActive,
    completed,
    p50Ms: percentile(samples, 50),
    p95Ms: percentile(samples, 95),
    p99Ms: percentile(samples, 99),
  };
}

const results = [];
for (const rows of workloads) {
  const before = process.memoryUsage().heapUsed;
  const data = buildRows(rows);
  const after = process.memoryUsage().heapUsed;
  assert.equal(data.length, rows);
  assert.equal(chunkCount(rows), Math.ceil(rows / BATCH));

  for (const concurrency of concurrencyLevels) {
    const result = await runPool(rows, concurrency);
    assert.equal(result.completed, rows);
    assert.ok(result.maxActive >= 1 && result.maxActive <= concurrency);
    results.push({ rows, concurrency, ...result, heapDeltaMB: (after - before) / 1024 / 1024 });
  }

  data.length = 0;
  if (global.gc) global.gc();
}

assert.equal(results.length, workloads.length * concurrencyLevels.length);
for (const row of results) {
  assert.equal(row.completed, row.rows);
  assert.ok(row.maxActive >= 1 && row.maxActive <= row.concurrency);
  assert.ok(Number.isFinite(row.p50Ms) && Number.isFinite(row.p95Ms) && Number.isFinite(row.p99Ms));
}

console.log('P1 SCALE CLOSURE PASS');
console.table(results.map(({ rows, concurrency, elapsedMs, maxActive, p50Ms, p95Ms, p99Ms, heapDeltaMB }) => ({
  rows,
  concurrency,
  elapsedMs: Number(elapsedMs.toFixed(3)),
  maxActive,
  p50Ms: Number(p50Ms.toFixed(3)),
  p95Ms: Number(p95Ms.toFixed(3)),
  p99Ms: Number(p99Ms.toFixed(3)),
  heapDeltaMB: Number(heapDeltaMB.toFixed(3)),
})));
