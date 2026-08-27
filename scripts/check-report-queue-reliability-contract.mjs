import fs from 'node:fs';

const text = fs.readFileSync('src/lib/report-execution/queue.ts', 'utf8');
const required = [
  'idempotency', 'leaseOwner', 'leaseToken', 'leaseExpiresAt', 'heartbeat(',
  'attempts < job.maxAttempts', "status = job.attempts < job.maxAttempts ? 'queued' : 'failed'",
  'listDeadLetters()', 'assertLease(',
];
const missing = required.filter((x) => !text.includes(x));
if (missing.length) throw new Error(`REPORT_QUEUE_RELIABILITY_FAIL: missing ${missing.join(', ')}`);
if (!/job\.leaseOwner\s*!==\s*workerId/.test(text)) throw new Error('Lease owner is not enforced');
if (!/job\.leaseToken\s*!==\s*leaseToken/.test(text)) throw new Error('Unique lease token is not enforced');
if (!/job\.leaseExpiresAt\s*<=\s*now/.test(text)) throw new Error('Stale lease detection is missing');
if (!/this\.idempotency\.get\(key\)/.test(text)) throw new Error('Idempotency lookup is missing');
if (!/job\.leaseToken\s*=\s*undefined/.test(text)) throw new Error('Lease token is not cleared after terminal transition');
console.log('REPORT_QUEUE_RELIABILITY_CONTRACT_PASS');
