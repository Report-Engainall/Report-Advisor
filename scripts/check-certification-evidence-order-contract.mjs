import fs from 'node:fs';

const source = fs.readFileSync('src/lib/production/productionCertification.ts', 'utf8');
const match = source.match(/PRODUCTION_CERTIFICATION_EVIDENCE_KEYS[^=]*=\s*\[([\s\S]*?)\];/);
if (!match) throw new Error('CERTIFICATION_EVIDENCE_ORDER_MISSING');
const keys = [...match[1].matchAll(/['\"]([a-z_]+)['\"]/g)].map((m) => m[1]);
const expected = ['tenant', 'backup', 'rollback', 'artifact', 'security'];
if (JSON.stringify(keys) !== JSON.stringify(expected)) {
  throw new Error(`CERTIFICATION_EVIDENCE_ORDER_DRIFT:${JSON.stringify(keys)}`);
}
console.log('CERTIFICATION_EVIDENCE_ORDER_PASS');
