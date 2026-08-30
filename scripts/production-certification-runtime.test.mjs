import { strict as assert } from 'node:assert';
import { certifyProduction, PRODUCTION_CERTIFICATION_EVIDENCE_KEYS, isMandatoryCertificationEvidenceKey } from '../src/lib/production/productionCertification.ts';

const check = (key, passed = true, severity = 'INFO') => ({ key, passed, severity, evidence: `test:${key}` });
const complete = PRODUCTION_CERTIFICATION_EVIDENCE_KEYS.map(key => check(key));

const certified = certifyProduction(complete);
assert.equal(certified.certified, true, 'complete mandatory evidence must certify');
assert.deepEqual(certified.blockers, [], 'complete evidence must have no blockers');

const missing = certifyProduction(complete.filter(x => x.key !== 'backup'));
assert.equal(missing.certified, false, 'missing mandatory evidence must not certify');
assert.ok(missing.blockers.includes('MISSING_EVIDENCE:backup'));

const failed = certifyProduction(complete.map(x => x.key === 'rollback' ? check('rollback', false, 'WARNING') : x));
assert.equal(failed.certified, false, 'failed mandatory evidence must not certify');
assert.ok(failed.blockers.includes('FAILED_EVIDENCE:rollback'));

const duplicate = certifyProduction([...complete, check('backup', false, 'BLOCKER')]);
assert.equal(duplicate.certified, false, 'duplicate mandatory evidence must not certify');
assert.ok(duplicate.blockers.includes('DUPLICATE_EVIDENCE:backup'));

const arbitrary = certifyProduction([...complete, check('unrelated-warning', false, 'WARNING')]);
assert.equal(arbitrary.certified, true, 'non-mandatory warnings must not invalidate complete mandatory evidence');
assert.equal(arbitrary.score, 1, 'non-mandatory warnings must not dilute the mandatory score');

assert.equal(isMandatoryCertificationEvidenceKey('tenant'), true);
assert.equal(isMandatoryCertificationEvidenceKey('live'), false);
assert.equal(isMandatoryCertificationEvidenceKey('backup'), true);

console.log('Production certification runtime tests PASS (complete/missing/failed/duplicate/unrelated evidence attacks).');
