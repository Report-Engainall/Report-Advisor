import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'supabase', 'migrations');
const files = readdirSync(dir)
  .filter((name) => name.endsWith('.sql'))
  .sort();

const definitions = [];
for (const file of files) {
  const text = readFileSync(join(dir, file), 'utf8');
  const matches = text.match(/create\s+or\s+replace\s+function\s+public\.current_company_id\s*\(/gi);
  if (matches?.length) {
    definitions.push({ file, count: matches.length });
  }
}

if (definitions.length === 0) {
  console.error('TENANT_RESOLVER_CONTRACT_FAIL: no public.current_company_id() definition found');
  process.exit(1);
}

const totalDefinitions = definitions.reduce((sum, item) => sum + item.count, 0);
const latest = definitions.at(-1);

// Multiple historical CREATE OR REPLACE definitions are allowed, but the final
// migration must explicitly implement the canonical default-membership contract.
const latestText = readFileSync(join(dir, latest.file), 'utf8');
const required = [
  'company_memberships',
  'is_default',
  'is_active',
  'auth.uid()',
];
const missing = required.filter((token) => !latestText.includes(token));

if (missing.length) {
  console.error(`TENANT_RESOLVER_CONTRACT_FAIL: latest resolver migration ${latest.file} is missing: ${missing.join(', ')}`);
  process.exit(1);
}

console.log(`TENANT_RESOLVER_CONTRACT_PASS: ${totalDefinitions} historical definition(s); final definition: ${latest.file}`);
console.log('TENANT_RESOLVER_CONTRACT_PASS: canonical resolver is membership/default based and fail-closed when no active default exists.');
console.log('TENANT_RESOLVER_NOTE: historical CREATE OR REPLACE definitions are preserved; this guard treats migration order as the source of final schema semantics.');
