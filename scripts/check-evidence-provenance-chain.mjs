import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = [
  'src/lib/production-intelligence.ts',
  'src/lib/phase-kl-runtime.ts',
  'supabase/migrations/20260825142000_phase_kl_runtime_closure.sql',
];

for (const file of files) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error(`Missing evidence component: ${file}`);
  }
}

const production = fs.readFileSync(path.join(root, files[0]), 'utf8');
const runtime = fs.readFileSync(path.join(root, files[1]), 'utf8');
const migration = fs.readFileSync(path.join(root, files[2]), 'utf8');

const required = [
  ['production intelligence source-version identity', production, 'sourceVersionKey'],
  ['production intelligence materiality ranking', production, 'materiality'],
  ['runtime evidence model', runtime, 'interface RuntimeEvidence'],
  ['runtime source hash binding', runtime, 'sourceHash'],
  ['runtime lineage builder', runtime, 'buildLineage'],
  ['runtime evidence quality guard', runtime, 'evidenceQuality'],
  ['tenant-bound runtime evidence graph', migration, 'executive_evidence_graph'],
  ['tenant-bound runtime functions', migration, 'current_company_id()'],
  ['runtime evidence provenance relation', migration, "'derived_from'"],
];

for (const [label, text, token] of required) {
  if (!text.includes(token)) {
    throw new Error(`Evidence provenance invariant missing: ${label} (${token})`);
  }
}

if (!/company_id\s*=\s*public\.current_company_id\(\)/.test(migration)) {
  throw new Error('Evidence provenance invariant missing: tenant-bound company_id predicate');
}

console.log('Evidence provenance chain: PASS');
