import fs from 'node:fs';
const sql = fs.readdirSync('supabase/migrations')
  .filter(name => /decision_evidence_authority/i.test(name))
  .sort().map(name => fs.readFileSync('supabase/migrations/'+name,'utf8')).join('\n');
for (const token of [
  'DECISION_EVIDENCE_SNAPSHOT_REQUIRED',
  'DECISION_EVIDENCE_SNAPSHOT_NOT_FOUND_OR_FORBIDDEN',
  'DECISION_ACTION_EVIDENCE_REQUIRED',
  'DECISION_ACTION_EVIDENCE_NOT_FOUND_OR_FORBIDDEN',
  'WORK_ITEM_EVIDENCE_REQUIRED',
  'WORK_ITEM_EVIDENCE_NOT_FOUND_OR_FORBIDDEN',
  /jsonb_build_object\(\s*'work_item_id'\s*,\s*p_work_item_id\s*,\s*'evidence_snapshot_id'\s*,\s*v_evidence_snapshot_id\s*\)/s
]) {
  const present = token instanceof RegExp ? token.test(sql) : sql.includes(token);
  if (!present) throw new Error('Decision evidence authority missing token: '+String(token));
}
console.log('Decision evidence authority gate: PASS');
