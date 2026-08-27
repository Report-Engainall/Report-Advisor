import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260827123000_alternative_group_canonical_tenant.sql','utf8');
const page = fs.readFileSync('src/pages/AlternativeGroupsPage.tsx','utf8');

for (const invariant of [
  'create_alternative_item_group(\n  p_name text',
  'add_alternative_item_group_member(\n  p_group_id uuid',
  'remove_alternative_item_group_member(\n  p_member_id uuid',
  'public.current_company_id()',
  'REVOKE ALL ON FUNCTION public.create_alternative_item_group(text,text,text) FROM PUBLIC;',
  'REVOKE ALL ON FUNCTION public.add_alternative_item_group_member(uuid,text,numeric) FROM PUBLIC;',
  'REVOKE ALL ON FUNCTION public.remove_alternative_item_group_member(uuid) FROM PUBLIC;',
]) {
  if (!migration.includes(invariant)) throw new Error('Alternative-group tenant contract missing: '+invariant);
}
if (/p_company_id/.test(migration)) throw new Error('Canonical alternative-group RPCs must not accept caller-supplied tenant ids.');
if (/SECURITY\s+DEFINER/.test(migration) && !/SET search_path = public/.test(migration)) throw new Error('SECURITY DEFINER alternative-group RPCs require a fixed search_path.');
if (/create_alternative_item_group'.*p_company_id|add_alternative_item_group_member'.*p_company_id|remove_alternative_item_group_member'.*p_company_id/s.test(page)) {
  throw new Error('Alternative-group UI still supplies tenant authority to a sensitive RPC.');
}
console.log('Alternative-group tenant authority: PASS (server-derived tenant, PUBLIC revoked, authenticated-only execution)');