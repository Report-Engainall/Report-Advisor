import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260828170000_decision_action_outcome_runtime.sql', 'utf8');
const runtime = fs.readFileSync('src/lib/decision-automation/vertical-slice-runtime.ts', 'utf8');
const requiredMigration = [
  'ALTER TABLE public.recommendations',
  'ALTER TABLE public.business_intelligence_decisions',
  'CREATE TABLE IF NOT EXISTS public.decision_approvals',
  'CREATE TABLE IF NOT EXISTS public.decision_work_items',
  'CREATE TABLE IF NOT EXISTS public.decision_action_receipts',
  'recommendation_outcomes',
  'ALTER TABLE public.recommendations',
  'current_company_id()',
  'request_decision_approval',
  'decide_approval',
  'complete_decision_work_item',
  'outcome_delta',
];
const requiredRuntime = [
  'resolveCurrentCompanyId',
  'createRuntimeRecommendation',
  'createRuntimeDecision',
  'linkRecommendationToDecision',
  'requestRuntimeApproval',
  'decideRuntimeApproval',
  'createRuntimeWorkItem',
  'notifyWorkItem',
  'completeRuntimeWorkItem',
  'loadRuntimeOutcome',
  "eq('company_id', companyId)",
];
for (const token of requiredMigration) if (!migration.includes(token)) throw new Error(`runtime migration missing ${token}`);
for (const token of requiredRuntime) if (!runtime.includes(token)) throw new Error(`runtime service missing ${token}`);
if (!/status IN \('PENDING','APPROVED','REJECTED','CANCELLED'\)/.test(migration)) throw new Error('approval lifecycle is not deterministic');
if (!/status IN \('OPEN','IN_PROGRESS','COMPLETED','BLOCKED','CANCELLED'\)/.test(migration)) throw new Error('work lifecycle is not deterministic');
if (!/status IN \('ACCEPTED','RUNNING','SUCCEEDED','FAILED','BLOCKED','CANCELLED'\)/.test(migration)) throw new Error('action receipt lifecycle is not deterministic');
if (!migration.includes("AND d.status='PROPOSED'")) throw new Error('approval request bypasses decision state');
if (!migration.includes("SET status=CASE WHEN p_approve THEN 'APPROVED' ELSE 'REJECTED' END")) throw new Error('approval transition is not persisted');
if (!migration.includes("SET status='COMPLETED'")) throw new Error('completion does not persist terminal state');
console.log('runtime vertical slice contract: PASS');
