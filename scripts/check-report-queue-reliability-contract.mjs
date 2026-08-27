import fs from 'node:fs';

const file = 'src/lib/report-execution/queue.ts';
const text = fs.readFileSync(file, 'utf8');
const required = [
  'idempotency',
  'leaseOwner',
  'leaseExpiresAt',
  'heartbeat(',
  'attempts < job.maxAttempts',
  "status = job.attempts < job.maxAttempts ? 'queued' : 'failed'",
  'listDeadLetters()',
];
const missing = required.filter((x) => !text.includes(x));
if (missing.length) {
  console.error('REPORT_QUEUE_RELIABILITY_FAIL');
  missing.forEach((x) => console.error(`missing=${x}`));
  process.exit(1);
}
if (!/job\.leaseOwner\s*!==\s*workerId/.test(text)) throw new Error('Lease ownership is not enforced');
if (!/job\.leaseExpiresAt\s*<=\s*now/.test(text)) throw new Error('Stale lease detection is missing');
if (!/this\.idempotency\.get\(key\)/.test(text)) throw new Error('Idempotency lookup is missing');
console.log('REPORT_QUEUE_RELIABILITY_CONTRACT_PASS');
