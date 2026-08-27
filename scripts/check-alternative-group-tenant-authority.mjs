import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260827123000_alternative_group_canonical_tenant.sql','utf8');
const page = fs.readFileSync('src/pages/AlternativeGroupsPage.tsx','utf8');

for (const invariant of [
  'create_alternative_item_group(\n  p_name text',
  'add_alternative_item_group_member(\n  p_group_id uuid',
  'remove_alternative_item_group_member(\n  p_member_id uuid',
  'public.current_company_id()',
]) {
  if (!migration.includes(invariant)) throw new Error('Alternative-group tenant contract missing: '+invariant);
}
if (/p_company_id/.test(migration)) throw new Error('Canonical alternative-group RPCs must not accept caller-supplied tenant ids.');
if (/create_alternative_item_group'.*p_company_id|add_alternative_item_group_member'.*p_company_id|remove_alternative_item_group_member'.*p_company_id/s.test(page)) {
  throw new Error('Alternative-group UI still supplies tenant authority to a sensitive RPC.');
}
console.log('Alternative-group tenant authority: PASS (RPC tenant derived server-side; UI supplies no tenant id)');
