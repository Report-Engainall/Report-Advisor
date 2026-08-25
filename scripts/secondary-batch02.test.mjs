import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const fixtureDir = path.join(root, 'fixtures', 'secondary-batch02');
const required = [
  'arabic-excel.csv','english-excel.csv','arabic-ocr.txt','english-ocr.txt',
  'headerless-table.csv','bad-headers.csv','duplicate-records.csv','missing-fields.csv',
  'merged-cells.txt','multi-table-document.txt','tables-spanning-pages.txt',
  'reconciliation-mismatch.json','unknown-evidence.json'
];
for (const name of required) {
  const file = path.join(fixtureDir, name);
  if (!fs.existsSync(file)) throw new Error(`Missing golden fixture: ${name}`);
  if (!fs.readFileSync(file, 'utf8').trim()) throw new Error(`Empty golden fixture: ${name}`);
}

const arabic = fs.readFileSync(path.join(fixtureDir, 'arabic-excel.csv'), 'utf8');
if (!/[\u0600-\u06FF]/.test(arabic)) throw new Error('Arabic fixture contains no Arabic text');
const mismatch = JSON.parse(fs.readFileSync(path.join(fixtureDir, 'reconciliation-mismatch.json'), 'utf8'));
if (mismatch.status !== 'FAILED' || mismatch.sourceRows === mismatch.canonicalRows) throw new Error('Reconciliation mismatch fixture is not a real mismatch case');
const unknown = JSON.parse(fs.readFileSync(path.join(fixtureDir, 'unknown-evidence.json'), 'utf8'));
if (unknown.status !== 'UNKNOWN' || unknown.expected !== 'INSUFFICIENT_EVIDENCE') throw new Error('UNKNOWN evidence fixture contract failed');

const source = fs.readFileSync(path.join(root, 'src', 'lib', 'secondary-batch02.ts'), 'utf8');
for (const token of ['DataQualityReadModel','ControlPlaneReadModel','DocumentWorkspaceReadModel','ReconciliationReadModel','SchemaDiscoveryReadModel','UNKNOWN','BLOCKED','NOT_CONFIGURED']) {
  if (!source.includes(token)) throw new Error(`Batch 02 contract missing: ${token}`);
}
console.log(`Batch 02 golden corpus contract: PASS (${required.length} fixtures)`);
console.log('No customer/business secrets are included.');
