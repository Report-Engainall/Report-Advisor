import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migration = path.join(root, 'supabase', 'migrations', '20260825181000_alternative_group_tenant_boundary.sql');
if (!fs.existsSync(migration)) throw new Error('Alternative schema contract: canonical tenant-boundary migration is missing');

const sql = fs.readFileSync(migration, 'utf8');
const required = [
  /ALTER TABLE public\.alternative_item_groups ENABLE ROW LEVEL SECURITY/i,
  /ALTER TABLE public\.alternative_item_group_members ENABLE ROW LEVEL SECURITY/i,
  /company_id\s*=\s*public\.current_company_id\(\)/i,
  /WITH CHECK\s*\([\s\S]*company_id\s*=\s*public\.current_company_id\(\)/i,
  /create_alternative_item_group/i,
  /add_alternative_item_group_member/i,
  /remove_alternative_item_group_member/i,
  /REVOKE EXECUTE ON FUNCTION public\.create_alternative_item_group[\s\S]*FROM anon/i,
];
for (const pattern of required) {
  if (!pattern.test(sql)) throw new Error(`Alternative schema contract: missing canonical assertion ${pattern}`);
}
if (/USING\s*\(\s*true\s*\)/i.test(sql) || /WITH CHECK\s*\(\s*true\s*\)/i.test(sql)) {
  throw new Error('Alternative schema contract: permissive tenant policy detected');
}
console.log('Alternative schema contract: PASS (canonical tenant boundary verified)');
