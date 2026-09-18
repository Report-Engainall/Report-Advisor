import assert from 'node:assert/strict';
import fs from 'node:fs';

const core = fs.readFileSync('src/lib/data-quality-snapshot-core.ts', 'utf8');
const page = fs.readFileSync('src/pages/DataQualitySnapshotPage.tsx', 'utf8');

assert.match(core, /export function calculateOverallQualityScore\(entities: EntityQuality\[\]\): number/);
assert.match(core, /if \(totalRecords === 0\) return 0;/);
assert.match(core, /Math\.max\(0, Math\.min\(100/);

assert.match(page, /calculateOverallQualityScore/);
assert.match(page, /fetchDataQualitySnapshot/);
assert.match(page, /TruthContextStrip status=\{snapshotStatus === 'EMPTY' \? 'NO_DATA' : 'CALCULATED'\}/);
assert.match(page, /asOf="غير متاحة من المصدر"/);
assert.match(page, /asOfLabel="حداثة المصدر"/);
assert.match(page, /rangeLabel="لقطة جودة المصدر الحالية"/);
assert.match(page, /درجة مجمعة مشتقة من لقطة المصدر/);
assert.doesNotMatch(page, /Math\.round\(\(\(totalRecords-totalIssues\)\/totalRecords\)\*100\)/);
assert.doesNotMatch(page, /Math\.random\(|mock|synthetic/i);

console.log('Data Quality truth contract: PASS');
console.log('  - aggregate score formula is centralized in the pure snapshot core');
console.log('  - zero-record snapshots resolve to score 0');
console.log('  - UI declares CALCULATED vs NO_DATA truth state explicitly');
console.log('  - UI never fabricates source as-of/freshness');
