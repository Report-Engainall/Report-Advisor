import assert from 'node:assert/strict';

const manifest = {
  backup_id: 'backup-synthetic-001',
  source_revision: 'rc-under-test',
  created_at: '2026-08-31T00:00:00Z',
  checksum: 'sha256:synthetic-checksum',
  tenant_scope: 'tenant-a',
};

function verifyBackup(m) {
  for (const key of ['backup_id','source_revision','created_at','checksum','tenant_scope']) assert.ok(m[key], `BACKUP_${key.toUpperCase()}_REQUIRED`);
  assert.match(m.checksum, /^sha256:/);
  return true;
}
function restorePlan(m, target) {
  assert.equal(verifyBackup(m), true);
  assert(target, 'RESTORE_TARGET_REQUIRED');
  return { backup_id: m.backup_id, target, verified: true };
}
function rollbackPlan(revision, target) {
  assert(revision, 'ROLLBACK_REVISION_REQUIRED');
  assert(target, 'ROLLBACK_TARGET_REQUIRED');
  return { revision, target, verified: true };
}

assert.equal(verifyBackup(manifest), true);
assert.deepEqual(restorePlan(manifest, 'synthetic-restore'), { backup_id: manifest.backup_id, target: 'synthetic-restore', verified: true });
assert.deepEqual(rollbackPlan('rc-under-test', 'synthetic-runtime'), { revision: 'rc-under-test', target: 'synthetic-runtime', verified: true });
assert.throws(() => verifyBackup({ ...manifest, checksum: '' }), /BACKUP_CHECKSUM_REQUIRED/);
assert.throws(() => restorePlan(manifest, ''), /RESTORE_TARGET_REQUIRED/);
assert.throws(() => rollbackPlan('', 'target'), /ROLLBACK_REVISION_REQUIRED/);

console.log('dr recovery contract: PASS');
