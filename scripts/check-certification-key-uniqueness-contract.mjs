import fs from 'node:fs';
const source = fs.readFileSync('src/lib/production/productionCertification.ts', 'utf8');
const match = source.match(/PRODUCTION_CERTIFICATION_EVIDENCE_KEYS[^=]*=\s*\[([\s\S]*?)\];/);
if (!match) throw new Error('CERTIFICATION_KEYS_MISSING');
const keys = [...match[1].matchAll(/['\"]([a-z_]+)['\"]/g)].map(m => m[1]);
if (new Set(keys).size !== keys.length) throw new Error('CERTIFICATION_KEYS_NOT_UNIQUE');
console.log('CERTIFICATION_KEY_UNIQUENESS_PASS');
