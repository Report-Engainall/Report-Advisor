import { useEffect, useMemo, useState } from 'react';
import { BrainCircuit, DatabaseZap, GitBranch, Layers3, Save, ShieldCheck, Sparkles, Waypoints } from 'lucide-react';
import { supabase, resolveCurrentCompanyId } from '@/lib/supabase';
import {
  assessCausalHypothesis, buildKnowledgeGraph, buildLearningCandidate, buildRowCellProvenance,
  buildForecastGovernance, compareCounterfactual, detectDrift, evaluateDetailedDecisionPolicy,
  evaluateVOI, rankDecisionPortfolio, semanticDiff, savePersistentView, persistCausalHypothesis,
  persistVOIRequest, persistHumanLearningFeedback, persistRowCellProvenance, persistDecisionOutcome,
  type DriftEvent, type ForecastGovernance, type PortfolioDecision,
} from '@/lib/intelligence/closure-runtime';
import { calculateDecisionScore } from '@/lib/intelligence/decisionScore';
import { explainDecision } from '@/lib/intelligence/decisionExplainability';
import { analyzeProcessEvents } from '@/lib/intelligence/closure-runtime';
import { fetchLatestGovernedScenario, type GovernedScenarioRecord } from '@/lib/governed-scenarios';
import type { KernelRow } from '@/lib/decision-intelligence-kernel';

type Props = {
  rows: KernelRow[];
  sourceHash?: string | null;
  reportJobId?: string | null;
  recommendation?: string | null;
  qualityScore: number;
  gaps: Array<{ id: string; title: string; state: string; action: string }>;
  demo?: boolean;
};

type ClosureState = {
  savedViews: number;
  portfolioItems: Array<Record<string, unknown>>;
  driftEvents: Array<Record<string, unknown>>;
  forecasts: Array<Record<string, unknown>>;
  learning: number;
  lineage: number;
  loading: boolean;
  error: string | null;
  outcomes: number;
};

const fmt = (v: unknown) => typeof v === 'number' && Number.isFinite(v) ? v.toLocaleString('ar-YE', { maximumFractionDigits: 2 }) : 'غير متاح';
const numericField = (rows: KernelRow[], preferred: string[]) => preferred.find((field) => rows.some((r) => typeof r[field] === 'number' && Number.isFinite(r[field]))) ?? null;

export function IntelligenceClosurePanel({ rows, sourceHash = null, reportJobId = null, recommendation = null, qualityScore, gaps, demo = false }: Props) {
  const [scenario, setScenario] = useState<GovernedScenarioRecord | null>(null);
  const [closure, setClosure] = useState<ClosureState>({ savedViews: 0, portfolioItems: [], driftEvents: [], forecasts: [], learning: 0, lineage: 0, loading: false, error: null, outcomes: 0 });
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [outcomeLabel, setOutcomeLabel] = useState<'correct' | 'incorrect' | 'partial' | 'unknown'>('partial');
  const [outcomeActual, setOutcomeActual] = useState('');
  const [outcomeExpected, setOutcomeExpected] = useState('');
  const [outcomeNotes, setOutcomeNotes] = useState('');

  const driverField = useMemo(() => numericField(rows, ['salesQty','quantity','volume','netAmount']), [rows]);
  const outcomeField = useMemo(() => numericField(rows, ['profit','currentStock','netAmount','balance']), [rows]);

  const causal = useMemo(() => driverField && outcomeField && driverField !== outcomeField && sourceHash
    ? assessCausalHypothesis({
        claimKey: `report:${sourceHash}:${driverField}:${outcomeField}`,
        rows,
        driverField,
        outcomeField,
        sourceHash,
        reportExecutionJobId: reportJobId ?? undefined,
        minimumPoints: 6,
      })
    : null, [rows, driverField, outcomeField, sourceHash, reportJobId]);

  const counterfactual = useMemo(() => scenario?.outputs && sourceHash
    ? compareCounterfactual({
        baseline: scenario.outputs.baseline.profit,
        intervention: scenario.outputs.scenario.profit,
        resultHash: scenario.outputs.resultHash,
        sourceHash,
        scenarioKey: scenario.scenarioKey,
        uncertaintyBoundary: scenario.assumptions.boundary,
      })
    : null, [scenario, sourceHash]);

  const voi = useMemo(() => {
    if (!counterfactual) return null;
    const missing = gaps.map((g) => g.title).slice(0, 5);
    return evaluateVOI({
      question: missing.length ? `ما المعلومات التي تحسم: ${missing.join('، ')}؟` : 'هل يحتاج القرار إلى evidence إضافي قبل الاعتماد؟',
      decisionKey: recommendation ? 'recommendation:' + recommendation : 'report:' + (reportJobId ?? 'unknown'),
      currentDecisionValue: counterfactual.baseline,
      alternativeDecisionValue: counterfactual.intervention,
      evidenceCost: missing.length ? Math.min(1, missing.length * 0.15) : 0,
      minimumEvidence: missing,
    });
  }, [counterfactual, gaps, recommendation, reportJobId]);

  const semantic = useMemo(() => {
    const current = [...new Set(rows.flatMap((r) => Object.keys(r)))]
      .map((key) => ({ key, meaning: key, grain: 'row', period: null, unit: null, rule: null }));
    return semanticDiff(current, current, driverField && outcomeField ? [driverField, outcomeField] : []);
  }, [rows, driverField, outcomeField]);

  const drift: DriftEvent[] = useMemo(() => closure.driftEvents.map((event) => ({
    type: String(event.domain ?? '').toLowerCase().includes('recommend') ? 'RECOMMENDATION_DRIFT' : String(event.domain ?? '').toLowerCase().includes('model') ? 'MODEL_DRIFT' : String(event.domain ?? '').toLowerCase().includes('business') ? 'BUSINESS_DRIFT' : 'DATA_DRIFT',
    severity: ['LOW','MEDIUM','HIGH','CRITICAL'].includes(String(event.severity)) ? String(event.severity) as DriftEvent['severity'] : 'MEDIUM',
    deviation: Number(event.deviation ?? 0),
    evidence: Array.isArray(event.evidence) ? event.evidence.map(String) : [String(event.drift_key ?? event.id ?? 'stored-drift')],
    affectedOutputs: [],
    recommendedResponse: String(event.status ?? '').toLowerCase() === 'open' ? 'تحقق من خط الأساس والمصدر قبل الاعتماد.' : 'اتبع حالة drift المسجلة ومصدرها قبل تغيير القرار.',
  })), [closure.driftEvents]);

  const forecast: ForecastGovernance | null = useMemo(() => {
    const points: Array<{ actual: number; predicted: number }> = [];
    for (const row of rows) {
      const actual = typeof row.actual === 'number' ? row.actual : null;
      const predicted = typeof row.predicted === 'number' ? row.predicted : null;
      if (actual != null && predicted != null) points.push({ actual, predicted });
    }
    return points.length ? buildForecastGovernance({
      method: 'SOURCE_PROVIDED',
      horizon: 'source-defined',
      historicalBasis: `${points.length} source rows with actual/predicted`,
      assumptions: ['لا يتم اختراع forecast عندما لا تكون السلسلة موجودة.'],
      points, observations: points,
      sourceHash: sourceHash ?? 'UNKNOWN_SOURCE',
      forecastId: reportJobId ?? undefined,
    }) : null;
  }, [rows, sourceHash, reportJobId]);

  const processFindings = useMemo(() => {
    const events = rows.flatMap((r) => {
      const caseId = typeof r.caseId === 'string' ? r.caseId : null;
      const event = typeof r.event === 'string' ? r.event : null;
      const timestamp = typeof r.timestamp === 'string' ? r.timestamp : null;
      return caseId && event && timestamp ? [{ caseId, event, timestamp }] : [];
    });
    return events.length ? analyzeProcessEvents(events) : [];
  }, [rows]);

  const graph = useMemo(() => buildKnowledgeGraph(
    [
      { id: 'source:' + (sourceHash ?? 'missing'), type: 'SOURCE', sourceRef: sourceHash },
      ...(reportJobId ? [{ id: 'report:' + reportJobId, type: 'REPORT', sourceRef: reportJobId }] : []),
      ...(recommendation ? [{ id: 'recommendation:' + recommendation, type: 'RECOMMENDATION', sourceRef: recommendation }] : []),
      ...(causal ? [{ id: 'claim:' + causal.claimKey, type: 'CLAIM', sourceRef: causal.provenance.sourceHash }] : []),
      ...(counterfactual ? [{ id: 'counterfactual:' + counterfactual.provenance.resultHash, type: 'COUNTERFACTUAL', sourceRef: counterfactual.provenance.resultHash }] : []),
    ],
    [
      ...(reportJobId ? [{ from: 'source:' + (sourceHash ?? 'missing'), to: 'report:' + reportJobId, relation: 'produced', evidence: [sourceHash ?? 'missing'] }] : []),
      ...(causal && reportJobId ? [{ from: 'report:' + reportJobId, to: 'claim:' + causal.claimKey, relation: 'supports', evidence: [sourceHash ?? 'missing'] }] : []),
      ...(recommendation && causal ? [{ from: 'claim:' + causal.claimKey, to: 'recommendation:' + recommendation, relation: 'informs', evidence: [sourceHash ?? 'missing'] }] : []),
      ...(counterfactual && recommendation ? [{ from: 'counterfactual:' + counterfactual.provenance.resultHash, to: 'recommendation:' + recommendation, relation: 'tests', evidence: [String(counterfactual.provenance.resultHash ?? 'missing')] }] : []),
    ],
  ), [sourceHash, reportJobId, recommendation, causal, counterfactual]);

  const decisionGate = useMemo(() => {
    const score = calculateDecisionScore({
      dataQuality: Math.max(0, Math.min(1, qualityScore / 100)),
      sourceBound: sourceHash ? 1 : 0,
      gapClosure: gaps.length ? 0 : 1,
    }, sourceHash ? [] : ['SOURCE_HASH_MISSING']);
    const explanation = explainDecision(score, [
      { key: 'dataQuality', value: score.factors.dataQuality, source: 'canonical-quality', freshness: 1, impact: 'positive' },
      { key: 'sourceBound', value: score.factors.sourceBound, source: 'source-hash', freshness: 1, impact: score.factors.sourceBound ? 'positive' : 'blocking' },
      { key: 'gapClosure', value: score.factors.gapClosure, source: 'decision-gaps', freshness: 1, impact: score.factors.gapClosure ? 'positive' : 'negative' },
    ]);
    return evaluateDetailedDecisionPolicy({
      score, explanation, highImpact: true,
      minimumEvidence: 1, availableEvidence: sourceHash && reportJobId ? 1 : 0,
      risk: 1 - score.score, maxRisk: 0.25,
      owner: null, escalation: gaps.length ? 'DATA_OWNER' : 'APPROVER',
    });
  }, [qualityScore, sourceHash, reportJobId, gaps.length]);

  const portfolio = useMemo<PortfolioDecision[]>(() => closure.portfolioItems.flatMap((item) => {
    const evidence = item.evidence && typeof item.evidence === 'object' ? item.evidence as Record<string, unknown> : {};
    const candidate: PortfolioDecision = {
      decisionKey: String(item.decision_key ?? item.id ?? 'decision'),
      value: Number(item.materiality_score ?? Number.NaN),
      urgency: Number(item.priority_score ?? Number.NaN),
      risk: Number(item.risk_consumption ?? Number.NaN),
      confidence: Number(item.confidence_score ?? Number.NaN),
      expectedOutcome: Number(evidence.expectedOutcome ?? Number.NaN),
      dependencies: Array.isArray(evidence.dependencies) ? evidence.dependencies.map(String) : [],
      effort: Number(evidence.effort ?? Number.NaN),
      evidenceReadiness: evidence.readiness != null ? Number(evidence.readiness) : (evidence.evidenceReady ? 1 : 0),
      ownerCapacity: evidence.ownerCapacity != null ? Number(evidence.ownerCapacity) : 0,
      score: 0,
      tradeOffs: [],
    };
    return [Object.values(candidate).every((v) => Array.isArray(v) || typeof v !== 'number' || Number.isFinite(v)) ? candidate : null].filter((v): v is PortfolioDecision => Boolean(v));
  }), [closure.portfolioItems]);

  const rankedPortfolio = useMemo(() => portfolio.length ? rankDecisionPortfolio(portfolio) : [], [portfolio]);
  const decisionFingerprint = useMemo(() => recommendation ? 'recommendation:' + recommendation : 'report:' + (reportJobId ?? 'unknown'), [recommendation, reportJobId]);
  const learningCandidate = useMemo(() => buildLearningCandidate({
    decisionKey: decisionFingerprint,
  }), [decisionFingerprint]);

  useEffect(() => {
    if (demo) return;
    if (!sourceHash && !reportJobId) return;
    let cancelled = false;
    setClosure((s) => ({ ...s, loading: true, error: null }));
    (async () => {
      try {
        const companyId = await resolveCurrentCompanyId();
        if (!companyId) throw new Error('AUTHENTICATED_TENANT_REQUIRED');
        const [views, portfolioRes, driftRes, forecastRes, learningRes, lineageRes, latest] = await Promise.all([
          supabase.from('saved_views').select('id').eq('company_id', companyId),
          supabase.from('decision_portfolio_items').select('id,decision_key,priority_score,materiality_score,confidence_score,risk_consumption,status,evidence').eq('company_id', companyId).order('priority_score', { ascending:false }).limit(20),
          supabase.from('control_plane_drift_events').select('id,drift_key,domain,severity,status,deviation,evidence').eq('company_id', companyId).order('detected_at', { ascending:false }).limit(20),
          supabase.from('forecasts').select('id,metric,period,forecast_value,lower_bound,upper_bound,model_name,quality_score,confidence,data_points').eq('company_id', companyId).order('created_at', { ascending:false }).limit(20),
          supabase.from('human_override_feedback').select('id').eq('company_id', companyId).limit(100),
          supabase.from('report_cell_lineage').select('id').eq('company_id', companyId).eq('report_execution_job_id', reportJobId ?? '').limit(100),
          supabase.from('decision_outcomes').select('id').eq('company_id', companyId).eq('decision_fingerprint', decisionFingerprint).limit(100),
          fetchLatestGovernedScenario(),
        ]);
        for (const res of [views,portfolioRes,driftRes,forecastRes,learningRes,lineageRes,outcomeRes]) if (res.error) throw res.error;
        if (cancelled) return;
        setScenario(latest);
        setClosure({
          savedViews: views.data?.length ?? 0,
          portfolioItems: (portfolioRes.data ?? []) as Array<Record<string, unknown>>,
          driftEvents: (driftRes.data ?? []) as Array<Record<string, unknown>>,
          forecasts: (forecastRes.data ?? []) as Array<Record<string, unknown>>,
          learning: learningRes.data?.length ?? 0,
          lineage: lineageRes.data?.length ?? 0,
          outcomes: outcomeRes.data?.length ?? 0,
          loading: false,
          error: null,
        });
      } catch (error) {
        if (!cancelled) setClosure((s) => ({ ...s, loading:false, error:error instanceof Error ? error.message : 'CLOSURE_LOAD_FAILED' }));
      }
    })();
    return () => { cancelled = true; };
  }, [sourceHash, reportJobId]);

  const saveView = async () => {
    if (demo) { setMessage('المعاينة العامة للـFixture للقراءة فقط؛ الحفظ يحتاج جلسة شركة مصادقًا عليها.'); return; }
    setSaving(true); setMessage(null);
    try {
      await savePersistentView({
        viewKey: `studio:${reportJobId ?? sourceHash ?? 'unknown'}`,
        name: 'Decision Intelligence Studio',
        route: '/import/analyze',
        state: { sourceHash, reportJobId, recommendation, filters: {}, activeDomains: ['causal','counterfactual','voi','drift','forecast','process','graph','policy','portfolio','learning','provenance'] },
      });
      setClosure((s) => ({ ...s, savedViews: s.savedViews + 1 }));
      setMessage('تم حفظ العرض للمستخدم الحالي داخل الشركة.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'SAVE_VIEW_FAILED'); }
    finally { setSaving(false); }
  };

  const persistCurrent = async () => {
    if (demo) { setMessage('المعاينة لا تكتب إلى قاعدة العملاء؛ انتقل إلى التقرير الذكي داخل جلسة الشركة للحفظ.'); return; }
    setMessage(null);
    try {
      if (causal && sourceHash) await persistCausalHypothesis(causal);
      if (voi && sourceHash) await persistVOIRequest({ ...voi, sourceHash, reportExecutionJobId: reportJobId ?? undefined });
      if (causal && driverField && outcomeField) {
        await persistRowCellProvenance(buildRowCellProvenance({
          sourceHash: sourceHash ?? 'UNKNOWN_SOURCE', reportExecutionJobId: reportJobId ?? undefined,
          rowKey: 'sample', sourceLocator: 'row:sample', sourceField: driverField, canonicalField: driverField,
          transformation: 'canonical-input', metricKey: outcomeField, claimKey: causal.claimKey,
        }));
      }
      setMessage('تم حفظ Causal/VOI/Lineage بعد ربطها بالمصدر.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'PERSIST_INTELLIGENCE_FAILED'); }
  };

  const persistOutcome = async () => {
    if (demo) { setMessage('المعاينة العامة لا تكتب نتائج تنفيذية.'); return; }
    if (!sourceHash || !reportJobId) { setMessage('لا يمكن تسجيل النتيجة دون reportJobId و sourceHash.'); return; }
    setSaving(true); setMessage(null);
    try {
      const { data: snapshots, error: snapshotError } = await supabase
        .from('report_evidence_snapshots')
        .select('id,verification_status,source_hash,report_execution_job_id')
        .eq('report_execution_job_id', reportJobId)
        .eq('source_hash', sourceHash)
        .eq('verification_status', 'VERIFIED')
        .order('created_at', { ascending: false })
        .limit(1);
      if (snapshotError) throw snapshotError;
      const snapshot = snapshots?.[0];
      if (!snapshot?.id) throw new Error('VERIFIED_EVIDENCE_SNAPSHOT_REQUIRED_FOR_OUTCOME');
      const actual = outcomeActual.trim() === '' ? null : Number(outcomeActual);
      const expected = outcomeExpected.trim() === '' ? null : Number(outcomeExpected);
      if (actual != null && !Number.isFinite(actual)) throw new Error('INVALID_ACTUAL_VALUE');
      if (expected != null && !Number.isFinite(expected)) throw new Error('INVALID_EXPECTED_VALUE');
      await persistDecisionOutcome({
        decisionFingerprint,
        evidenceSnapshotId: String(snapshot.id),
        observedAt: new Date().toISOString(),
        label: outcomeLabel,
        actualValue: actual,
        expectedValue: expected,
        notes: outcomeNotes.trim() || null,
      });
      setClosure((s) => ({ ...s, outcomes: s.outcomes + 1 }));
      setMessage('تم تسجيل النتيجة الفعلية وربطها بلقطة الدليل الموثقة. لا تُعدّل سياسة القرار تلقائيًا.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'OUTCOME_PERSIST_FAILED');
    } finally {
      setSaving(false);
    }
  };

  const persistLearning = async (overrideStatus: string) => {
    if (demo) { setMessage('قرار الإنسان في المعاينة لا يُحفظ؛ هذه النسخة لإثبات السلوك فقط.'); return; }
    try {
      await persistHumanLearningFeedback({
        decisionKey: recommendation ?? ('report:' + (reportJobId ?? 'unknown')),
        originalStatus: decisionGate.outcome,
        overrideStatus,
        reason: 'قرار المستخدم على بوابة القرار الاستشارية.',
        learnedSignal: { candidate: learningCandidate, sourceHash, reportJobId },
        evidence: { sourceHash, reportJobId, causalState: causal?.state ?? null },
      });
      setMessage('تم حفظ قرار الإنسان كسجل تعلم قابل للتتبع.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'LEARNING_PERSIST_FAILED'); }
  };

  const blocks = [
    { title:'Causal', value: causal ? causal.state : 'INSUFFICIENT_DATA', detail: causal ? `r=${causal.correlation?.toFixed(3) ?? 'n/a'} · alternatives=${causal.alternativeExplanations.length}` : 'يلزم مصدر بزمن/حقلين رقميين.' },
    { title:'Counterfactual', value: counterfactual ? (counterfactual.delta >= 0 ? 'IMPROVES' : 'REDUCES') : 'PENDING_GOVERNED_RUN', detail: counterfactual ? `Δ الربح: ${fmt(counterfactual.delta)}` : 'يعتمد على آخر Scenario محفوظ.' },
    { title:'VOI', value: voi?.state ?? 'BLOCKED', detail: voi ? `قيمة تقديرية: ${fmt(voi.estimatedValue)} · حساسية: ${fmt(voi.sensitivity)}` : 'لا توجد مقارنة محفوظة حتى الآن.' },
    { title:'Semantic Diff', value: semantic.changed.length || semantic.added.length || semantic.removed.length ? 'CHANGED' : 'NO_NEW_VERSION', detail: semantic.businessImpact.length ? semantic.businessImpact[0] : 'المقارنة تحتاج نسختين مصدر فعليتين.' },
    { title:'Drift', value: drift.length ? drift[0].severity : (closure.driftEvents.length ? 'OBSERVED' : 'NO_EVIDENCE'), detail: closure.driftEvents.length ? `${closure.driftEvents.length} drift events from tenant store` : 'لا نختلق drift.' },
    { title:'Forecast', value: forecast?.calibration.calibrated ? 'CALIBRATED' : forecast ? 'REVIEW_REQUIRED' : 'INSUFFICIENT_DATA', detail: forecast ? `backtest=${forecast.backtest.count} · MAE=${fmt(forecast.backtest.mae)}` : 'لا forecast source-bound داخل هذه الصفوف.' },
    { title:'Process', value: processFindings.length ? 'EVENT_DATA_ANALYZED' : 'INSUFFICIENT_EVENT_DATA', detail: processFindings.length ? `${processFindings.length} variants · البوتلنك مشتق من event history.` : 'يُحلل فقط event history الموجود فعليًا.' },
    { title:'Knowledge Graph', value: graph.edges.length ? `${graph.edges.length} edges` : 'SOURCE_LINKED', detail: `${graph.nodes.length} nodes · isolated=${graph.isolated.length}` },
    { title:'Decision Policy', value: decisionGate.outcome, detail: decisionGate.reasons.join(' · ') || 'Policy allows next state.' },
    { title:'Portfolio', value: rankedPortfolio.length ? `Top ${Math.min(3, rankedPortfolio.length)}` : 'NO_PERSISTED_PORTFOLIO', detail: rankedPortfolio[0]?.tradeOffs.join(' · ') || 'تظهر من قرارات محفوظة فقط.' },
    { title:'Outcome → Learning', value: closure.outcomes ? `${closure.outcomes} outcomes` : learningCandidate.state, detail: closure.outcomes ? 'نتائج تنفيذية مرتبطة بلقطة دليل موثقة.' : 'بانتظار نتيجة فعلية؛ لا تعديل تلقائي للسياسة.' },
    { title:'Row/Cell Provenance', value: closure.lineage ? `${closure.lineage} rows` : 'READY_TO_WRITE', detail: 'المسار: Source → Row → Field → Metric → Claim.' },
  ];

  return <section dir="rtl" className="rounded-[26px] border border-emerald-400/15 bg-[#071019] text-white shadow-[0_28px_90px_-48px_rgba(20,184,166,.45)]">
    <header className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,.10),transparent_40%),linear-gradient(135deg,#08131d,#071018)] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><div className="flex items-center gap-2 text-[9px] font-black tracking-[.12em] text-emerald-300"><Sparkles size={14}/> INTELLIGENCE CLOSURE</div><h3 className="mt-2 text-xl font-black">المساحة الموحدة من السبب إلى القرار والتعلّم</h3><p className="mt-1 max-w-3xl text-[10px] leading-6 text-slate-400">كل بطاقة أدناه تحمل حدًّا ثبوتيًا: لا causal بلا إثبات سببي، لا forecast بلا backtest، ولا outcome بلا قياس فعلي.</p></div>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={saveView} disabled={saving || demo} className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-[9px] font-black text-cyan-100"><Save size={13}/>{saving ? 'يحفظ…' : 'حفظ العرض'}</button><button type="button" onClick={() => void persistCurrent()} disabled={demo} className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-[9px] font-black text-emerald-100"><ShieldCheck size={13}/> حفظ Intelligence + Lineage</button></div>
      </div>
      {message && <div className="mt-3 rounded-xl border border-white/10 bg-white/[.03] p-2.5 text-[9px] text-slate-300">{message}</div>}
      <div className="mt-4 rounded-2xl border border-amber-300/15 bg-amber-300/[.035] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[9px] font-black tracking-[.12em] text-amber-200">OUTCOME CAPTURE · النتيجة الفعلية</div>
            <div className="mt-1 text-[10px] leading-5 text-slate-400">التسجيل يتطلب Snapshot موثقًا لنفس التقرير. الهدف هو إغلاق حلقة التنفيذ والتعلّم، وليس كتابة PASS يدوي.</div>
          </div>
          <button type="button" onClick={() => void persistOutcome()} disabled={saving || demo || !sourceHash || !reportJobId} className="rounded-xl bg-amber-200 px-3 py-2 text-[9px] font-black text-slate-950 disabled:opacity-40">تسجيل النتيجة</button>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          <select value={outcomeLabel} onChange={(event) => setOutcomeLabel(event.target.value as typeof outcomeLabel)} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[10px] text-white">
            <option value="correct">Correct · تحققت</option>
            <option value="partial">Partial · جزئية</option>
            <option value="incorrect">Incorrect · لم تتحقق</option>
            <option value="unknown">Unknown · غير محسومة</option>
          </select>
          <input value={outcomeExpected} onChange={(event) => setOutcomeExpected(event.target.value)} inputMode="decimal" placeholder="القيمة المتوقعة" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[10px] text-white placeholder:text-slate-600" />
          <input value={outcomeActual} onChange={(event) => setOutcomeActual(event.target.value)} inputMode="decimal" placeholder="القيمة الفعلية" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[10px] text-white placeholder:text-slate-600" />
          <input value={outcomeNotes} onChange={(event) => setOutcomeNotes(event.target.value)} placeholder="ملاحظة/قرينة بعد التنفيذ" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[10px] text-white placeholder:text-slate-600" />
        </div>
      </div>
    </header>
    <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-4">
      {blocks.map((item) => <article key={item.title} className="rounded-2xl border border-white/10 bg-white/[.025] p-4"><div className="flex items-center justify-between gap-2"><div className="text-[8px] font-black tracking-[.12em] text-slate-500">{item.title}</div><Layers3 size={13} className="text-emerald-300/70"/></div><div className="mt-2 text-sm font-black text-white">{item.value}</div><div className="mt-1 text-[9px] leading-5 text-slate-400">{item.detail}</div></article>)}
    </div>
    <div className="grid gap-4 px-5 pb-5 lg:grid-cols-3">
      <div className="rounded-2xl border border-fuchsia-300/15 bg-fuchsia-300/[.04] p-4"><div className="flex items-center gap-2 text-fuchsia-200"><BrainCircuit size={15}/><span className="text-[9px] font-black">CAUSAL + VOI</span></div><div className="mt-3 space-y-2 text-[9px] text-slate-300"><div>الحالة: <b>{causal?.state ?? 'INSUFFICIENT_DATA'}</b></div><div>الدليل المؤيد: {causal?.evidenceSupporting.length ?? 0}</div><div>الدليل المعارض: {causal?.evidenceContradicting.length ?? 0}</div><div>المعلومات ذات الأولوية: {voi?.minimumEvidence.join('، ') || 'لا شيء مثبت الآن'}</div></div></div>
      <div className="rounded-2xl border border-sky-300/15 bg-sky-300/[.04] p-4"><div className="flex items-center gap-2 text-sky-200"><GitBranch size={15}/><span className="text-[9px] font-black">KNOWLEDGE GRAPH</span></div><div className="mt-3 text-[9px] text-slate-300"><div>{graph.nodes.length} nodes / {graph.edges.length} evidence-backed edges</div><div className="mt-2 space-y-1">{graph.edges.slice(0,5).map((e)=><div key={e.from+e.to} className="rounded-lg border border-white/10 bg-black/10 px-2 py-1">{e.from} → {e.to} · {e.relation}</div>)}</div></div></div>
      <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[.04] p-4"><div className="flex items-center gap-2 text-amber-200"><Waypoints size={15}/><span className="text-[9px] font-black">PERSISTED STATE</span></div><div className="mt-3 grid grid-cols-2 gap-2 text-[8px]"><div className="rounded-lg border border-white/10 bg-black/10 p-2">Saved Views <b className="block text-sm">{closure.savedViews}</b></div><div className="rounded-lg border border-white/10 bg-black/10 p-2">Portfolio <b className="block text-sm">{closure.portfolioItems.length}</b></div><div className="rounded-lg border border-white/10 bg-black/10 p-2">Forecasts <b className="block text-sm">{closure.forecasts.length}</b></div><div className="rounded-lg border border-white/10 bg-black/10 p-2">Learning <b className="block text-sm">{closure.learning}</b></div></div></div>
    </div>
    <footer className="flex flex-wrap items-center gap-3 border-t border-white/10 px-5 py-3 text-[8px] text-slate-500"><DatabaseZap size={12}/> tenant-safe persistence · source-bound evidence · no automatic policy mutation · {closure.loading ? 'يُقرأ…' : closure.error ?? 'readback ready'}</footer>
  </section>;
}
