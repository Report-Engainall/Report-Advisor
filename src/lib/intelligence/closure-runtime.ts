import { supabase, resolveCurrentCompanyId } from '@/lib/supabase';
import { requireAuthenticatedUser } from '@/lib/auth-session';
import { evaluateDecisionPolicy, type DecisionPolicyInput } from '@/lib/intelligence/decisionPolicy';
import { backtestForecast, type ForecastPoint } from '@/lib/analytics/forecast-backtest';
import { calibrateForecast, type ForecastObservation } from '@/lib/intelligence/forecastCalibration';

export type IntelligenceState =
  | 'IMPLEMENTED'
  | 'INTEGRATED'
  | 'PERSISTED'
  | 'UI-EXPOSED'
  | 'READBACK-PROVEN'
  | 'BROWSER-PROVEN'
  | 'PRODUCTION-PROVEN'
  | 'PRODUCT-COMPLETE';

export type EvidenceItem = {
  id: string;
  statement: string;
  sourceRef: string;
  strength?: number;
  direction?: 'supporting' | 'contradicting';
};

export type CausalHypothesis = {
  claimKey: string;
  state: 'CORRELATION' | 'EXPLANATION' | 'CAUSAL_HYPOTHESIS' | 'CAUSALITY_PROVEN' | 'REVIEW_REQUIRED' | 'UNRESOLVED';
  correlation: number | null;
  evidenceSupporting: EvidenceItem[];
  evidenceContradicting: EvidenceItem[];
  assumptions: string[];
  alternativeExplanations: string[];
  confidence: number | null;
  unresolvedCause: boolean;
  provenance: { sourceHash: string; reportExecutionJobId?: string; method: string };
};

function finite(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function correlation(xs: number[], ys: number[]): number | null {
  if (xs.length !== ys.length || xs.length < 3) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  let num = 0; let dx = 0; let dy = 0;
  for (let i = 0; i < xs.length; i += 1) {
    const x = xs[i] - mx; const y = ys[i] - my;
    num += x * y; dx += x * x; dy += y * y;
  }
  return dx > 0 && dy > 0 ? num / Math.sqrt(dx * dy) : null;
}

export function assessCausalHypothesis(input: {
  claimKey: string;
  rows: Record<string, unknown>[];
  driverField: string;
  outcomeField: string;
  sourceHash: string;
  reportExecutionJobId?: string;
  timeField?: string;
  minimumPoints?: number;
  interventionEvidence?: EvidenceItem[];
  knownConfounders?: string[];
}): CausalHypothesis {
  const pairs = input.rows.flatMap((row) => {
    const x = finite(row[input.driverField]); const y = finite(row[input.outcomeField]);
    return x == null || y == null ? [] : [{ x, y }];
  });
  const xs = pairs.map((p) => p.x); const ys = pairs.map((p) => p.y);
  const r = correlation(xs, ys);
  const confounders = input.knownConfounders ?? [];
  const supporting: EvidenceItem[] = [];
  const contradicting: EvidenceItem[] = [];
  if (r != null) {
    supporting.push({
      id: input.claimKey + ':correlation',
      statement: `ارتباط اتجاهي محسوب بين ${input.driverField} و${input.outcomeField}: r=${r.toFixed(3)}`,
      sourceRef: input.sourceHash,
      strength: Math.min(1, Math.abs(r)),
      direction: Math.abs(r) >= 0.5 ? 'supporting' : 'contradicting',
    });
  }
  if (pairs.length < (input.minimumPoints ?? 6)) {
    return {
      claimKey: input.claimKey, state: 'REVIEW_REQUIRED', correlation: r,
      evidenceSupporting: supporting, evidenceContradicting: [{ id: input.claimKey + ':sample', statement: 'العينة الزمنية/الرصدية غير كافية لإثبات سبب.', sourceRef: input.sourceHash, direction: 'contradicting' }],
      assumptions: ['لا يوجد تصميم تجريبي مثبت في هذا الاستنتاج.'],
      alternativeExplanations: confounders.length ? confounders : ['تغيرات موسمية أو عوامل خارج المتغير المقاس.'],
      confidence: null, unresolvedCause: true,
      provenance: { sourceHash: input.sourceHash, reportExecutionJobId: input.reportExecutionJobId, method: input.timeField ? 'observational-time-series' : 'observational' },
    };
  }
  const strongCorrelation = r != null && Math.abs(r) >= 0.7;
  const method = input.interventionEvidence?.length ? 'source-linked-intervention-evidence' : (input.timeField ? 'observational-time-series' : 'observational');
  const causalDesign = Boolean(input.interventionEvidence?.some((e) => e.id.startsWith('causal-design:')));
  const state = causalDesign && strongCorrelation ? 'CAUSALITY_PROVEN' : strongCorrelation ? 'CAUSAL_HYPOTHESIS' : 'CORRELATION';
  const confidence = r == null ? null : Math.min(1, Math.abs(r) * (causalDesign ? 1 : 0.8));
  return {
    claimKey: input.claimKey, state, correlation: r,
    evidenceSupporting: supporting,
    evidenceContradicting: confounders.length ? [{ id: input.claimKey + ':confounders', statement: 'يوجد confounders غير مضبوطة؛ يمنع ذلك تحويل الارتباط إلى سببية مثبتة.', sourceRef: input.sourceHash, direction: 'contradicting' }] : [],
    assumptions: causalDesign ? ['تصميم التدخل موثق في evidence.'] : ['النتيجة رصدية وليست تجربة عشوائية.'],
    alternativeExplanations: confounders.length ? confounders : ['عوامل مشتركة غير مرصودة.', 'تغيرات الفترة/المزيج.'],
    confidence, unresolvedCause: state !== 'CAUSALITY_PROVEN',
    provenance: { sourceHash: input.sourceHash, reportExecutionJobId: input.reportExecutionJobId, method },
  };
}

export type CounterfactualComparison = {
  baseline: number;
  intervention: number;
  delta: number;
  deltaPct: number | null;
  uncertaintyBoundary: string;
  provenance: Record<string, string | null>;
};
export function compareCounterfactual(input: {
  baseline: number;
  intervention: number;
  resultHash: string;
  sourceHash: string;
  scenarioKey: string;
  uncertaintyBoundary?: string;
}): CounterfactualComparison {
  const delta = input.intervention - input.baseline;
  return {
    baseline: input.baseline, intervention: input.intervention, delta,
    deltaPct: input.baseline === 0 ? null : (delta / Math.abs(input.baseline)) * 100,
    uncertaintyBoundary: input.uncertaintyBoundary ?? 'BOUNDARY_NOT_ESTIMATED',
    provenance: { resultHash: input.resultHash, sourceHash: input.sourceHash, scenarioKey: input.scenarioKey },
  };
}

export type VOIRequest = {
  question: string;
  decisionKey: string;
  sensitivity: number;
  estimatedValue: number;
  priorityScore: number;
  minimumEvidence: string[];
  state: 'OPEN' | 'COLLECTING' | 'SUFFICIENT' | 'DEFERRED' | 'BLOCKED';
};
export function evaluateVOI(input: {
  question: string;
  decisionKey: string;
  currentDecisionValue: number;
  alternativeDecisionValue: number;
  evidenceCost: number;
  minimumEvidence: string[];
}): VOIRequest {
  const sensitivity = Math.abs(input.alternativeDecisionValue - input.currentDecisionValue);
  const estimatedValue = Math.max(0, sensitivity - Math.max(0, input.evidenceCost));
  const priorityScore = estimatedValue * (1 + Math.min(1, sensitivity));
  return {
    question: input.question, decisionKey: input.decisionKey, sensitivity,
    estimatedValue, priorityScore, minimumEvidence: input.minimumEvidence,
    state: input.minimumEvidence.length ? 'OPEN' : 'BLOCKED',
  };
}

export type SemanticField = {
  key: string;
  meaning?: string | null;
  unit?: string | null;
  grain?: string | null;
  period?: string | null;
  rule?: string | null;
};
export type SemanticDiff = {
  changed: Array<{ field: string; dimensions: string[]; severity: 'LOW' | 'MEDIUM' | 'HIGH' }>;
  added: string[];
  removed: string[];
  businessImpact: string[];
};
export function semanticDiff(before: SemanticField[], after: SemanticField[], decisionFields: string[] = []): SemanticDiff {
  const a = new Map(before.map((f) => [f.key, f])); const b = new Map(after.map((f) => [f.key, f]));
  const added = [...b.keys()].filter((k) => !a.has(k)); const removed = [...a.keys()].filter((k) => !b.has(k));
  const changed: SemanticDiff['changed'] = [];
  for (const key of [...a.keys()].filter((k) => b.has(k))) {
    const left = a.get(key)!; const right = b.get(key)!;
    const dimensions = (['meaning','unit','grain','period','rule'] as const).filter((d) => left[d] !== right[d]);
    if (dimensions.length) changed.push({ field: key, dimensions, severity: decisionFields.includes(key) ? 'HIGH' : dimensions.includes('grain') || dimensions.includes('unit') ? 'HIGH' : 'MEDIUM' });
  }
  const businessImpact = [
    ...removed.filter((k) => decisionFields.includes(k)).map((k) => `قرار متأثر بإزالة الحقل ${k}`),
    ...added.filter((k) => decisionFields.includes(k)).map((k) => `قرار متأثر بإضافة الحقل ${k}`),
    ...changed.filter((x) => x.severity === 'HIGH' && decisionFields.includes(x.field)).map((x) => `المعنى/الوحدة/الحبيبة تغيرت في ${x.field}`),
  ];
  return { changed, added, removed, businessImpact };
}

export type DriftEvent = {
  type: 'DATA_DRIFT' | 'MODEL_DRIFT' | 'RECOMMENDATION_DRIFT' | 'BUSINESS_DRIFT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  deviation: number;
  evidence: string[];
  affectedOutputs: string[];
  recommendedResponse: string;
};
export function detectDrift(input: {
  baseline: Record<string, number>;
  observed: Record<string, number>;
  affectedOutputs: Record<string, string[]>;
  threshold: number;
}): DriftEvent[] {
  const events: DriftEvent[] = [];
  for (const key of Object.keys(input.observed)) {
    const base = input.baseline[key]; const value = input.observed[key];
    if (!Number.isFinite(base) || !Number.isFinite(value)) continue;
    const deviation = base === 0 ? Math.abs(value) : Math.abs((value - base) / Math.abs(base));
    if (deviation < input.threshold) continue;
    const severity = deviation >= input.threshold * 3 ? 'CRITICAL' : deviation >= input.threshold * 2 ? 'HIGH' : 'MEDIUM';
    const type: DriftEvent['type'] = key.toLowerCase().includes('recommend') ? 'RECOMMENDATION_DRIFT' : key.toLowerCase().includes('model') ? 'MODEL_DRIFT' : key.toLowerCase().includes('business') ? 'BUSINESS_DRIFT' : 'DATA_DRIFT';
    events.push({
      type, severity, deviation, evidence: [`baseline=${base}`, `observed=${value}`, `threshold=${input.threshold}`],
      affectedOutputs: input.affectedOutputs[key] ?? [],
      recommendedResponse: severity === 'CRITICAL' ? 'أوقف الاعتماد الآلي وأعد التحقق من المصدر/القاعدة.' : 'أعد التحقق من baseline ثم راقب القرار المتأثر.',
    });
  }
  return events;
}

export type ForecastGovernance = {
  method: string;
  horizon: string;
  historicalBasis: string;
  assumptions: string[];
  uncertainty: { lower?: number; upper?: number; state: 'AVAILABLE' | 'NOT_AVAILABLE' };
  backtest: ReturnType<typeof backtestForecast>;
  calibration: ReturnType<typeof calibrateForecast>;
  forecastVsActual: { status: 'AVAILABLE' | 'PENDING' | 'INSUFFICIENT_DATA'; points: number };
  limitations: string[];
  provenance: Record<string, string | null>;
};
export function buildForecastGovernance(input: {
  method: string; horizon: string; historicalBasis: string; assumptions: string[];
  points: ForecastPoint[]; observations: ForecastObservation[]; sourceHash: string; forecastId?: string;
  lower?: number; upper?: number; driftState?: string;
}): ForecastGovernance {
  const backtest = backtestForecast(input.points);
  const calibration = calibrateForecast(input.observations);
  const limitations: string[] = [];
  if (backtest.count < 3) limitations.push('عدد نقاط backtest غير كافٍ.');
  if (!calibration.calibrated) limitations.push('المعايرة ليست مثبتة.');
  if (input.driftState && input.driftState !== 'STABLE') limitations.push('يوجد drift يجب مراجعته قبل الاعتماد.');
  return {
    method: input.method, horizon: input.horizon, historicalBasis: input.historicalBasis,
    assumptions: input.assumptions, uncertainty: { lower: input.lower, upper: input.upper, state: input.lower != null && input.upper != null ? 'AVAILABLE' : 'NOT_AVAILABLE' },
    backtest, calibration,
    forecastVsActual: { status: input.points.length >= 3 ? 'AVAILABLE' : 'INSUFFICIENT_DATA', points: input.points.length },
    limitations,
    provenance: { sourceHash: input.sourceHash, forecastId: input.forecastId ?? null },
  };
}

export type ProcessFinding = {
  variant: string; count: number; bottleneck: string | null; delay: number | null; rework: number; anomaly: boolean; action: string;
};
export function analyzeProcessEvents(events: Array<{ caseId: string; event: string; timestamp: string }>): ProcessFinding[] {
  if (!events.length) return [];
  const byCase = new Map<string, Array<{ event: string; timestamp: number }>>();
  for (const e of events) {
    const t = new Date(e.timestamp).getTime(); if (!Number.isFinite(t)) continue;
    const list = byCase.get(e.caseId) ?? []; list.push({ event: e.event, timestamp: t }); byCase.set(e.caseId, list);
  }
  const variantCounts = new Map<string, number>(); const waits = new Map<string, number>(); let rework = 0;
  for (const steps of byCase.values()) {
    steps.sort((a,b)=>a.timestamp-b.timestamp);
    const variant = steps.map(s=>s.event).join(' → '); variantCounts.set(variant,(variantCounts.get(variant)??0)+1);
    for (let i=1;i<steps.length;i+=1) {
      const wait = (steps[i].timestamp-steps[i-1].timestamp)/3600000;
      const key = steps[i-1].event+' → '+steps[i].event; waits.set(key,(waits.get(key)??0)+wait);
      if (steps[i].event===steps[i-1].event) rework += 1;
    }
  }
  const bottleneck = [...waits.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0] ?? null;
  return [...variantCounts.entries()].sort((a,b)=>b[1]-a[1]).map(([variant,count])=>({
    variant, count, bottleneck, delay: bottleneck ? (waits.get(bottleneck)??0)/Math.max(1,count) : null,
    rework, anomaly: rework>0 || count===1, action: bottleneck ? `راجع نقطة الاختناق: ${bottleneck}` : 'لا توجد نقطة اختناق مثبتة.',
  }));
}

export type GraphNode = { id: string; type: string; sourceRef?: string | null; value?: unknown };
export type GraphEdge = { from: string; to: string; relation: string; evidence?: string[] };
export function buildKnowledgeGraph(nodes: GraphNode[], edges: GraphEdge[]): { nodes: GraphNode[]; edges: GraphEdge[]; isolated: string[] } {
  const valid = new Set(nodes.map((n) => n.id));
  const filteredEdges = edges.filter((e) => valid.has(e.from) && valid.has(e.to) && e.from !== e.to && (e.evidence?.length ?? 0) > 0);
  const connected = new Set(filteredEdges.flatMap((e) => [e.from,e.to]));
  return { nodes, edges: filteredEdges, isolated: nodes.filter((n)=>!connected.has(n.id)).map(n=>n.id) };
}

export type CrossDomainGuard = { allowed: boolean; reason: string; sharedKey?: string };
export function guardCrossDomainJoin(input: {
  entityIdA?: string | null; entityIdB?: string | null; periodA?: string | null; periodB?: string | null;
  grainA?: string | null; grainB?: string | null; semanticA?: string | null; semanticB?: string | null;
  evidenceA?: string; evidenceB?: string;
}): CrossDomainGuard {
  if (!input.entityIdA || !input.entityIdB || input.entityIdA !== input.entityIdB) return { allowed:false, reason:'ENTITY_ID_MISMATCH' };
  if (!input.periodA || input.periodA !== input.periodB) return { allowed:false, reason:'PERIOD_MISMATCH' };
  if (!input.grainA || input.grainA !== input.grainB) return { allowed:false, reason:'GRAIN_MISMATCH' };
  if (!input.semanticA || input.semanticA !== input.semanticB) return { allowed:false, reason:'SEMANTIC_INCOMPATIBILITY' };
  if (!input.evidenceA || !input.evidenceB) return { allowed:false, reason:'EVIDENCE_REQUIRED' };
  return { allowed:true, reason:'COMPATIBLE', sharedKey: input.entityIdA + ':' + input.periodA };
}

export function evaluateDetailedDecisionPolicy(input: DecisionPolicyInput & {
  minimumEvidence: number; availableEvidence: number; risk: number; maxRisk: number; owner?: string | null; escalation?: string | null;
}) {
  const base = evaluateDecisionPolicy(input);
  const reasons = [...base.reasons];
  if (input.availableEvidence < input.minimumEvidence) reasons.push('EVIDENCE_MINIMUM_NOT_MET');
  if (input.risk > input.maxRisk) reasons.push('RISK_BUDGET_EXCEEDED');
  const outcome = reasons.length ? 'BLOCK' : base.outcome;
  return {
    outcome, reasons: [...new Set(reasons)],
    execution: {
      owner: input.owner ?? null, escalation: input.escalation ?? (outcome === 'BLOCK' ? 'REVIEW' : null),
      executionAllowed: outcome === 'AUTOMATE' || outcome === 'APPROVE',
    },
  };
}

export type PortfolioDecision = {
  decisionKey: string; value: number; urgency: number; risk: number; confidence: number; expectedOutcome: number;
  dependencies: string[]; effort: number; evidenceReadiness: number; ownerCapacity: number; score: number; tradeOffs: string[];
};
export function rankDecisionPortfolio(input: PortfolioDecision[]): PortfolioDecision[] {
  return [...input].map((item) => {
    const score = item.value*0.25 + item.urgency*0.15 + item.confidence*0.15 + item.expectedOutcome*0.2 + item.evidenceReadiness*0.1 + item.ownerCapacity*0.1 - item.risk*0.05 - item.effort*0.05;
    const tradeOffs = [
      item.risk > 0.7 ? 'قيمة مرتفعة لكن المخاطر تستهلك جزءًا كبيرًا من الميزانية.' : '',
      item.evidenceReadiness < 0.6 ? 'الأولوية مقيدة بضعف الدليل.' : '',
      item.ownerCapacity < 0.5 ? 'التنفيذ قد يتأخر بسبب سعة المالك.' : '',
    ].filter(Boolean);
    return { ...item, score, tradeOffs };
  }).sort((a,b)=>b.score-a.score);
}

export type LearningCandidate = {
  decisionKey: string; observedOutcome: 'correct'|'incorrect'|'partial'|'unknown';
  ruleChange: string | null; state: 'CANDIDATE'|'REVIEW_REQUIRED'|'APPROVED'|'REJECTED';
  reason: string;
};
export function buildLearningCandidate(input: {
  decisionKey: string; expectedValue?: number; actualValue?: number; quality?: number;
}): LearningCandidate {
  if (!Number.isFinite(input.expectedValue) || !Number.isFinite(input.actualValue)) {
    return { decisionKey: input.decisionKey, observedOutcome:'unknown', ruleChange:null, state:'REVIEW_REQUIRED', reason:'OUTCOME_INSUFFICIENT_DATA' };
  }
  const delta = (input.actualValue as number) - (input.expectedValue as number);
  const relative = Math.abs(input.expectedValue as number) > 0 ? Math.abs(delta / (input.expectedValue as number)) : Math.abs(delta);
  const observedOutcome = relative <= 0.1 ? 'correct' : relative <= 0.25 ? 'partial' : 'incorrect';
  return {
    decisionKey: input.decisionKey, observedOutcome,
    ruleChange: observedOutcome === 'incorrect' ? 'مراجعة threshold/assumption قبل أي تغيير للسياسة.' : null,
    state: observedOutcome === 'incorrect' && (input.quality ?? 0) < 0.8 ? 'REVIEW_REQUIRED' : 'CANDIDATE',
    reason: observedOutcome === 'correct' ? 'OUTCOME_ALIGNED' : 'VARIANCE_REQUIRES_HUMAN_REVIEW',
  };
}

export type RowCellProvenance = {
  sourceHash: string; reportExecutionJobId?: string; rowKey: string; sourceLocator: string; sourceField: string;
  canonicalField: string; transformation?: string; metricKey?: string; claimKey?: string;
};
export function buildRowCellProvenance(input: RowCellProvenance): RowCellProvenance { return { ...input }; }

export async function savePersistentView(input: { viewKey: string; name: string; route: string; state: Record<string, unknown> }) {
  const companyId = await resolveCurrentCompanyId(); const user = await requireAuthenticatedUser();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.from('saved_views').upsert({
    company_id: companyId, user_id: user.id, view_key: input.viewKey, name: input.name, route: input.route,
    state: input.state, updated_at: new Date().toISOString(),
  }, { onConflict: 'company_id,user_id,view_key' }).select('*').single();
  if (error) throw error; return data;
}

export async function readPersistentViews(route?: string) {
  const companyId = await resolveCurrentCompanyId(); const user = await requireAuthenticatedUser();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  let query = supabase.from('saved_views').select('*').eq('company_id', companyId).eq('user_id', user.id).order('updated_at', { ascending:false });
  if (route) query = query.eq('route', route);
  const { data, error } = await query; if (error) throw error; return data ?? [];
}

export async function persistCausalHypothesis(input: CausalHypothesis & { reportExecutionJobId?: string }) {
  const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.from('intelligence_causal_hypotheses').upsert({
    company_id: companyId, report_execution_job_id: input.reportExecutionJobId ?? null, source_hash: input.provenance.sourceHash,
    claim_key: input.claimKey, state: input.state, evidence_supporting: input.evidenceSupporting, evidence_contradicting: input.evidenceContradicting,
    assumptions: input.assumptions, alternative_explanations: input.alternativeExplanations, confidence: input.confidence,
    unresolved_cause: input.unresolvedCause, provenance: input.provenance,
  }, { onConflict:'company_id,source_hash,claim_key' }).select('*').single();
  if (error) throw error; return data;
}

export async function persistVOIRequest(input: VOIRequest & { sourceHash: string; reportExecutionJobId?: string }) {
  const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.from('intelligence_voi_requests').insert({
    company_id: companyId, report_execution_job_id: input.reportExecutionJobId ?? null, source_hash: input.sourceHash,
    question: input.question, decision_key: input.decisionKey, sensitivity: input.sensitivity, estimated_value: input.estimatedValue,
    priority_score: input.priorityScore, minimum_evidence: input.minimumEvidence, state: input.state, provenance: { sourceHash: input.sourceHash },
  }).select('*').single();
  if (error) throw error; return data;
}

export async function persistRowCellProvenance(input: RowCellProvenance) {
  const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.from('report_cell_lineage').upsert({
    company_id: companyId, report_execution_job_id: input.reportExecutionJobId ?? null, row_key: input.rowKey,
    source_locator: input.sourceLocator, source_field: input.sourceField, canonical_field: input.canonicalField,
    transformation: input.transformation ?? null, metric_key: input.metricKey ?? null, claim_key: input.claimKey ?? null,
    evidence: { sourceHash: input.sourceHash },
  }, { onConflict:'company_id,report_execution_job_id,row_key,source_locator,canonical_field' }).select('*').single();
  if (error) throw error; return data;
}

export async function persistHumanLearningFeedback(input: {
  decisionKey: string; originalStatus: string; overrideStatus: string; reason: string; learnedSignal: Record<string, unknown>; evidence: Record<string, unknown>;
}) {
  const companyId = await resolveCurrentCompanyId(); const user = await requireAuthenticatedUser();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.from('human_override_feedback').insert({
    company_id: companyId, decision_key: input.decisionKey, original_status: input.originalStatus,
    override_status: input.overrideStatus, reason: input.reason, evidence: input.evidence, learned_signal: input.learnedSignal,
  }).select('*').single();
  if (error) throw error; return data;
}


export type PersistedDecisionOutcome = {
  id?: string;
  decisionFingerprint: string;
  evidenceSnapshotId: string;
  actionId?: string | null;
  observedAt: string;
  label: 'correct' | 'incorrect' | 'partial' | 'unknown';
  actualValue?: number | null;
  expectedValue?: number | null;
  impactValue?: number | null;
  notes?: string | null;
};

export async function persistDecisionOutcome(input: PersistedDecisionOutcome) {
  const { data, error } = await supabase.rpc('record_decision_outcome', {
    p_decision_fingerprint: input.decisionFingerprint,
    p_evidence_snapshot_id: input.evidenceSnapshotId,
    p_action_id: input.actionId ?? null,
    p_observed_at: input.observedAt,
    p_label: input.label,
    p_actual_value: input.actualValue ?? null,
    p_expected_value: input.expectedValue ?? null,
    p_impact_value: input.impactValue ?? null,
    p_notes: input.notes ?? null,
  });
  if (error) throw error;
  return data;
}

export async function readDecisionOutcomes(decisionFingerprint: string) {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase
    .from('decision_outcomes')
    .select('id,decision_fingerprint,evidence_snapshot_id,action_id,observed_at,label,actual_value,expected_value,impact_value,notes,created_at,observed_by')
    .eq('company_id', companyId)
    .eq('decision_fingerprint', decisionFingerprint)
    .order('observed_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export function buildOutcomeLearningFromHistory(outcomes: Array<{
  label: 'correct' | 'incorrect' | 'partial' | 'unknown';
  actual_value?: number | null;
  expected_value?: number | null;
}>) {
  const known = outcomes.filter(item => item.label !== 'unknown');
  const comparable = outcomes.filter(item => Number.isFinite(item.actual_value) && Number.isFinite(item.expected_value));
  const correct = known.filter(item => item.label === 'correct').length;
  const accuracy = known.length ? correct / known.length : null;
  const meanAbsoluteRelativeError = comparable.length
    ? comparable.reduce((sum, item) => {
        const actual = Number(item.actual_value);
        const expected = Number(item.expected_value);
        const base = Math.max(1, Math.abs(expected));
        return sum + Math.abs(actual - expected) / base;
      }, 0) / comparable.length
    : null;
  return {
    state: known.length ? 'OBSERVED' as const : 'PENDING' as const,
    observations: outcomes.length,
    accuracy,
    meanAbsoluteRelativeError,
    learningState: comparable.length >= 3 ? 'CANDIDATE' as const : known.length ? 'REVIEW_REQUIRED' as const : 'NOT_READY' as const,
    recommendation: comparable.length >= 3
      ? 'راجع threshold والافتراضات مقابل النتيجة المرصودة؛ لا تطبق التغيير تلقائيًا.'
      : 'اجمع نتائج إضافية قبل تعديل قاعدة القرار.',
  };
}
