import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const catalog = fs.readFileSync(path.join(process.cwd(), 'docs/evidence/BUSINESS_E2E_CATALOG_2026-09-04.md'), 'utf8');
const required = ['INPUT / Action','Expected UI','Expected RPC/API','Expected DB effect','Business result','Security','Persistence','Expected failure'];
const ids = [...catalog.matchAll(/\| (BF-\d{3}) \|/g)].map(m => m[1]);
assert.equal(ids.length, 20, 'business flow catalog must contain exactly 20 required flows');
assert.equal(new Set(ids).size, 20, 'business flow IDs must be unique');
for (const field of required) assert.ok(catalog.includes(field), `missing oracle field: ${field}`);
for (const id of ['BF-001','BF-002','BF-003','BF-004','BF-006','BF-011','BF-012','BF-013','BF-014','BF-015','BF-016','BF-017','BF-018','BF-019','BF-020']) assert.ok(catalog.includes(`| ${id} |`), `missing critical flow ${id}`);
for (const token of ['source_truth','parsed_truth','normalized_truth','db_truth','rpc_truth','analytics_truth','ui_truth','export_truth','exact_head']) assert.ok(catalog.includes(token), `missing evidence envelope field: ${token}`);
console.log('Business E2E catalog PASS: 20 flows + complete oracle/evidence envelope are present. Runtime execution remains separately gated by real authenticated environment.');