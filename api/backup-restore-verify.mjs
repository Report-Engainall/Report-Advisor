import { json, requireConfig, requireMethod, requireOperationalToken, managementRequest, sha256ResponseBody, persistBackupEvidence, isProductionEnv } from '../src/server/resilience-runtime.mjs';

export default async function handler(req, res) {
  if (!requireMethod(req, res, 'POST')) return;
  if (!requireOperationalToken(req, res)) return;
  if (!requireConfig(res, [
    'SUPABASE_MANAGEMENT_TOKEN',
    'SUPABASE_PROJECT_REF',
    'RESILIENCE_COMPANY_ID',
    'RESILIENCE_TARGET_ENV',
    'RESILIENCE_MAX_RPO_SECONDS',
    'RESILIENCE_BACKUP_ARTIFACT_URL',
    'RESILIENCE_BACKUP_ARTIFACT_SHA256',
    'RESILIENCE_RESTORE_VERIFIER_URL',
  ])) return;
  if (isProductionEnv()) return json(res, 409, { status: 'blocked', error: 'production_restore_verification_forbidden' });

  const maxRpoSeconds = Number(process.env.RESILIENCE_MAX_RPO_SECONDS);
  const expectedArtifactSha256 = process.env.RESILIENCE_BACKUP_ARTIFACT_SHA256.trim().toLowerCase();
  if (!Number.isFinite(maxRpoSeconds) || maxRpoSeconds < 0) {
    return json(res, 503, { status: 'blocked', error: 'invalid_max_rpo_seconds' });
  }
  if (!/^[a-f0-9]{64}$/.test(expectedArtifactSha256)) {
    return json(res, 503, { status: 'blocked', error: 'invalid_backup_artifact_sha256' });
  }

  const startedAt = Date.now();
  try {
    const backupsResponse = await managementRequest(`/projects/${encodeURIComponent(process.env.SUPABASE_PROJECT_REF.trim())}/database/backups`);
    if (!backupsResponse.ok) return json(res, 503, { status: 'blocked', error: `backup_inventory_failed:${backupsResponse.status}` });
    const inventory = await backupsResponse.json();
    const backups = Array.isArray(inventory.backups) ? inventory.backups : [];
    const completed = backups
      .filter((backup) => {
        const insertedAt = Date.parse(backup?.inserted_at || '');
        return String(backup?.status).toUpperCase() === 'COMPLETED'
          && Boolean(String(backup?.id || '').trim())
          && Number.isFinite(insertedAt);
      })
      .sort((a, b) => Date.parse(b.inserted_at) - Date.parse(a.inserted_at));
    const latest = completed[0];
    if (!latest) return json(res, 503, { status: 'blocked', error: 'no_completed_backup_available' });

    const backupCompletedAt = new Date(latest.inserted_at);
    const rpoSeconds = Math.max(0, (Date.now() - backupCompletedAt.getTime()) / 1000);
    if (!Number.isFinite(rpoSeconds) || rpoSeconds > maxRpoSeconds) {
      await persistBackupEvidence(process.env.RESILIENCE_COMPANY_ID.trim(), {
        backup_ref: String(latest.id),
        status: 'failed',
        backup_completed_at: backupCompletedAt.toISOString(),
        rpo_seconds: rpoSeconds,
        evidence: { reason: 'rpo_budget_exceeded', inventory_status: latest.status },
      });
      return json(res, 503, { status: 'failed', error: 'rpo_budget_exceeded', rpo_seconds: rpoSeconds });
    }

    const artifactResponse = await fetch(process.env.RESILIENCE_BACKUP_ARTIFACT_URL.trim(), { headers: { Accept: 'application/octet-stream' } });
    if (!artifactResponse.ok) return json(res, 503, { status: 'blocked', error: `backup_artifact_fetch_failed:${artifactResponse.status}` });
    const { sha256, bytes } = await sha256ResponseBody(artifactResponse);
    if (sha256 !== expectedArtifactSha256) {
      await persistBackupEvidence(process.env.RESILIENCE_COMPANY_ID.trim(), {
        backup_ref: String(latest.id),
        status: 'failed',
        backup_completed_at: backupCompletedAt.toISOString(),
        rpo_seconds: rpoSeconds,
        integrity_hash: sha256,
        evidence: { reason: 'backup_integrity_hash_mismatch', bytes },
      });
      return json(res, 503, { status: 'failed', error: 'backup_integrity_hash_mismatch' });
    }

    const restoreStartedAt = Date.now();
    const restoreResponse = await fetch(process.env.RESILIENCE_RESTORE_VERIFIER_URL.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        backup_ref: String(latest.id),
        backup_artifact_url: process.env.RESILIENCE_BACKUP_ARTIFACT_URL.trim(),
        backup_sha256: sha256,
        target_env: process.env.RESILIENCE_TARGET_ENV.trim(),
      }),
    });
    const restoreText = await restoreResponse.text();
    if (!restoreResponse.ok) {
      await persistBackupEvidence(process.env.RESILIENCE_COMPANY_ID.trim(), {
        backup_ref: String(latest.id),
        status: 'partial',
        backup_completed_at: backupCompletedAt.toISOString(),
        restore_started_at: new Date(restoreStartedAt).toISOString(),
        rpo_seconds: rpoSeconds,
        integrity_hash: sha256,
        evidence: { reason: 'restore_verifier_failed', http_status: restoreResponse.status, response: restoreText.slice(0, 500) },
      });
      return json(res, 503, { status: 'failed', error: `restore_verification_failed:${restoreResponse.status}` });
    }

    let restoreEvidence = {};
    try { restoreEvidence = JSON.parse(restoreText); } catch { restoreEvidence = { response: restoreText.slice(0, 500) }; }
    const restoreCompletedAt = Date.now();
    const measuredRto = (restoreCompletedAt - restoreStartedAt) / 1000;
    const reportedRto = Number(restoreEvidence.rto_seconds);
    const rtoSeconds = measuredRto;
    if (restoreEvidence.restored !== true || restoreEvidence.integrity_verified !== true) {
      await persistBackupEvidence(process.env.RESILIENCE_COMPANY_ID.trim(), {
        backup_ref: String(latest.id),
        status: 'partial',
        backup_completed_at: backupCompletedAt.toISOString(),
        restore_started_at: new Date(restoreStartedAt).toISOString(),
        restore_completed_at: new Date(restoreCompletedAt).toISOString(),
        rpo_seconds: rpoSeconds,
        rto_seconds: rtoSeconds,
        integrity_hash: sha256,
        evidence: { reason: 'restore_verifier_did_not_prove_restore', restore: restoreEvidence, reported_rto_seconds: Number.isFinite(reportedRto) ? reportedRto : null },
      });
      return json(res, 503, { status: 'failed', error: 'restore_verification_not_proven' });
    }

    await persistBackupEvidence(process.env.RESILIENCE_COMPANY_ID.trim(), {
      backup_ref: String(latest.id),
      status: 'passed',
      backup_completed_at: backupCompletedAt.toISOString(),
      restore_started_at: new Date(restoreStartedAt).toISOString(),
      restore_completed_at: new Date(restoreCompletedAt).toISOString(),
      rpo_seconds: rpoSeconds,
      rto_seconds: rtoSeconds,
      integrity_hash: sha256,
      evidence: { bytes, backup_status: latest.status, restore: restoreEvidence, reported_rto_seconds: Number.isFinite(reportedRto) ? reportedRto : null, total_elapsed_seconds: (Date.now() - startedAt) / 1000 },
    });
    return json(res, 200, { status: 'passed', backup_ref: String(latest.id), integrity_verified: true, restored: true, rpo_seconds: rpoSeconds, rto_seconds: rtoSeconds });
  } catch (error) {
    return json(res, 503, { status: 'blocked', error: String(error) });
  }
}