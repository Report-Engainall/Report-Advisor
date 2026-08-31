import fs from 'node:fs';

const sql = fs.readFileSync('supabase/migrations/20260831014000_harden_generated_outcome_provenance_precedence.sql', 'utf8');

if (!/jsonb_typeof\(p_evidence\)\s*<>\s*'object'/i.test(sql)) {
  throw new Error('Outcome evidence object-shape guard is missing');
}
if (!/COALESCE\(p_evidence,'\{\}'::jsonb\)\s*\|\|\s*jsonb_build_object\(/i.test(sql)) {
  throw new Error('Caller evidence is not merged before generated provenance');
}
if (!/'work_item_id',p_work_item_id/i.test(sql) || !/'outcome_delta'/i.test(sql)) {
  throw new Error('Generated provenance fields are missing');
}
if (!/IF EXISTS \(\s*SELECT 1 FROM public\.decision_work_items/i.test(sql)) {
  throw new Error('Decision terminal-state guard is missing');
}

console.log('Generated outcome provenance precedence: PASS');
console.log('Generated work-item identity and computed outcome delta override caller-supplied evidence metadata.');
