import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('decision experience lifecycle contract', () => {
  const queries = readFileSync(resolve(process.cwd(), 'src/lib/queries.ts'), 'utf8');
  const page = readFileSync(resolve(process.cwd(), 'src/pages/DecisionExperiencePage.tsx'), 'utf8');

  it('uses the governed decision lifecycle RPCs already defined by the database', () => {
    for (const rpc of [
      "create_runtime_decision",
      "link_recommendation_to_decision",
      "request_decision_approval",
      "decide_approval",
      "create_decision_work_item",
      "start_decision_work_item",
      "complete_decision_work_item",
      "update_recommendation_status",
    ]) expect(queries).toContain(rpc);
    expect(queries).not.toContain("from('business_intelligence_decisions').insert");
    expect(queries).not.toContain("from('decision_work_items').insert");
  });

  it('requires a real evidence snapshot before decision/work mutations', () => {
    expect(queries).toContain('DECISION_EVIDENCE_SNAPSHOT_UNAVAILABLE');
    expect(queries).toContain('WORK_EVIDENCE_SNAPSHOT_UNAVAILABLE');
    expect(queries).toContain('OUTCOME_EVIDENCE_SNAPSHOT_UNAVAILABLE');
    expect(page).toContain('لقطة الدليل');
  });

  it('keeps self-approval controlled by the canonical database function', () => {
    expect(queries).toContain("decide_approval");
    expect(page).not.toContain("setSelectedId(null)");
    expect(page).toContain('اعتماد القرار');
  });

  it('gates stage navigation by persisted lifecycle state', () => {
    expect(page).toContain('const stageGate = useMemo<Record<Stage');
    expect(page).toContain("decisionContext?.decisionStatus === 'APPROVED'");
    expect(page).toContain('decisionContext?.workItemStatus === \'COMPLETED\'');
    expect(page).toContain('stageLockReason');
  });

  it('renders persisted outcome fields instead of inventing a result', () => {
    expect(queries).toContain('fetchRecommendationOutcome');
    expect(queries).toContain('recommendation_outcomes');
    expect(page).toContain('النتيجة محفوظة في سجل التعلّم');
    expect(page).toContain('غير متاح بعد');
  });
});
