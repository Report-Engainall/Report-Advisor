import assert from 'node:assert/strict';
import { advanceFile, canResume, retryFile } from '../src/lib/import-pipeline/file-lifecycle-engine.ts';

const failed = advanceFile({ fileId: 'f1', stage: 'parsed', attempt: 1, updatedAt: 'x' }, 'failed', 'fail', 'parse error');
assert.equal(failed.stage, 'failed');
assert.equal(failed.attempt, 2);
assert.equal(failed.resumeStage, 'parsed');
assert.equal(failed.lastError, 'parse error');
assert.equal(canResume(failed), true);

const retried = retryFile(failed, 'retry');
assert.equal(retried.stage, 'parsed');
assert.equal(retried.attempt, 3);
assert.equal(retried.resumeStage, undefined);
assert.equal(retried.lastError, undefined);
assert.equal(canResume(retried), true);

assert.throws(() => advanceFile(failed, 'fingerprinted', 'invalid'), /retried explicitly/);
assert.throws(() => retryFile({ fileId: 'f2', stage: 'archived', attempt: 1, updatedAt: 'x' }, 'invalid'), /cannot retry/);
assert.equal(canResume({ fileId: 'f3', stage: 'archived', attempt: 1, updatedAt: 'x' }), false);

console.log('File lifecycle retry regression: PASS');
