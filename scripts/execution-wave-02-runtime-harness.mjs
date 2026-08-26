import { createHash } from 'node:crypto';

const TERMINAL = new Set(['completed', 'failed', 'cancelled', 'dead-letter']);

export function createRuntimeHarness() {
  const jobs = new Map();
  const receipts = new Map();
  const trace = [];

  const emit = (event) => trace.push({ ...event, at: trace.length });

  function createJob({ jobId, tenantId, importId }) {
    if (!jobId || !tenantId || !importId) throw new Error('job identity required');
    if (jobs.has(jobId)) return jobs.get(jobId);
    const job = {
      jobId, tenantId, importId, state: 'queued', attempt: 0,
      leaseOwner: null, leaseUntil: null, checkpoint: 0, receipt: null,
      dlqReason: null,
    };
    jobs.set(jobId, job);
    emit({ type: 'job.created', jobId, tenantId, importId });
    return job;
  }

  function claim(jobId, workerId, now = 0, leaseMs = 100) {
    const job = jobs.get(jobId);
    if (!job) throw new Error('unknown job');
    if (TERMINAL.has(job.state)) return false;
    if (job.leaseOwner && job.leaseUntil > now) return false;
    job.leaseOwner = workerId;
    job.leaseUntil = now + leaseMs;
    job.attempt += 1;
    job.state = 'leased';
    emit({ type: 'job.leased', jobId, tenantId: job.tenantId, workerId, attempt: job.attempt });
    return true;
  }

  function heartbeat(jobId, workerId, now = 0, leaseMs = 100) {
    const job = jobs.get(jobId);
    if (!job || job.leaseOwner !== workerId || job.leaseUntil < now) return false;
    job.leaseUntil = now + leaseMs;
    job.state = 'running';
    emit({ type: 'job.heartbeat', jobId, tenantId: job.tenantId, workerId });
    return true;
  }

  function checkpoint(jobId, workerId, cursor) {
    const job = jobs.get(jobId);
    if (!job || job.leaseOwner !== workerId || cursor < job.checkpoint) return false;
    job.checkpoint = cursor;
    job.state = 'checkpointed';
    emit({ type: 'job.checkpoint', jobId, tenantId: job.tenantId, cursor });
    return true;
  }

  function recover(jobId, now = 0) {
    const job = jobs.get(jobId);
    if (!job || TERMINAL.has(job.state)) return false;
    if (job.leaseUntil != null && job.leaseUntil > now) return false;
    job.leaseOwner = null;
    job.leaseUntil = null;
    job.state = 'recovering';
    emit({ type: 'job.recovered', jobId, tenantId: job.tenantId, cursor: job.checkpoint });
    return true;
  }

  function complete(jobId, workerId, result, now = 0) {
    const job = jobs.get(jobId);
    if (!job) throw new Error('unknown job');
    if (job.state === 'completed') return job.receipt;
    if (job.leaseOwner !== workerId || job.leaseUntil < now) throw new Error('completion authority invalid');
    if (result.tenantId !== job.tenantId) throw new Error('tenant mismatch');
    const receipt = { receiptId: `receipt:${jobId}`, jobId, tenantId: job.tenantId, checkpoint: job.checkpoint, digest: digest(result) };
    job.state = 'completed';
    job.receipt = receipt;
    receipts.set(jobId, receipt);
    emit({ type: 'job.completed', jobId, tenantId: job.tenantId, receiptId: receipt.receiptId });
    return receipt;
  }

  function fail(jobId, workerId, reason, maxAttempts = 3) {
    const job = jobs.get(jobId);
    if (!job || job.leaseOwner !== workerId) throw new Error('failure authority invalid');
    if (job.attempt >= maxAttempts) {
      job.state = 'dead-letter';
      job.dlqReason = reason;
      emit({ type: 'job.dead-letter', jobId, tenantId: job.tenantId, reason });
    } else {
      job.state = 'failed';
      job.leaseOwner = null;
      job.leaseUntil = null;
      emit({ type: 'job.failed', jobId, tenantId: job.tenantId, reason });
    }
  }

  return {
    createJob, claim, heartbeat, checkpoint, recover, complete, fail,
    getJob: (jobId) => jobs.get(jobId), getTrace: () => [...trace], getReceipt: (jobId) => receipts.get(jobId),
  };
}

export function digest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export function canonicalKpi({ revenue, cogs, periodStart, periodEnd }) {
  if (![revenue, cogs].every((n) => Number.isFinite(n)) || revenue < 0 || cogs < 0) {
    throw new Error('invalid KPI inputs');
  }
  if (!(periodStart instanceof Date) || !(periodEnd instanceof Date) || periodEnd < periodStart) {
    throw new Error('invalid period');
  }
  return Object.freeze({
    grossProfit: revenue - cogs,
    grossMargin: revenue === 0 ? null : (revenue - cogs) / revenue,
    period: [periodStart.toISOString(), periodEnd.toISOString()],
  });
}

export function crossSurfaceTruth(input) {
  const canonical = canonicalKpi(input);
  return Object.freeze({ dashboard: canonical, report: canonical, export: canonical, decision: canonical });
}

export function buildTraceContext(ids) {
  const required = ['user_action_id', 'request_id', 'job_id', 'import_id', 'evidence_id', 'report_id', 'decision_id', 'outcome_id', 'tenant_id'];
  for (const key of required) if (!ids[key]) throw new Error(`missing trace id: ${key}`);
  return Object.freeze({ ...ids });
}

export function buildBackupArtifact({ schemaVersion, migrations, payload }) {
  if (!schemaVersion || !Array.isArray(migrations) || payload == null) throw new Error('backup inputs required');
  const manifest = { schemaVersion, migrations: [...migrations], payloadDigest: digest(payload) };
  return Object.freeze({ manifest, payload, checksum: digest(manifest) });
}

export function verifyBackupArtifact(artifact) {
  if (!artifact?.manifest || !artifact?.payload || !artifact?.checksum) return false;
  return artifact.checksum === digest(artifact.manifest) && artifact.manifest.payloadDigest === digest(artifact.payload);
}

export function watchedFileIdentity(content, tenantId) {
  if (!tenantId) throw new Error('tenant required');
  return Object.freeze({ tenantId, sha256: createHash('sha256').update(content).digest('hex') });
}
