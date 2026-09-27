import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, ArrowUpLeft, CalendarClock, CheckCircle2, ChevronLeft, FileSearch, Lightbulb,
  ShieldCheck, Target, UserRound, Workflow, XCircle
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfidenceBadge, PriorityBadge, SeverityBadge } from '@/components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import {
  createDecisionWorkItem,
  createRuntimeDecision,
  decideApproval,
  fetchAlerts,
  fetchDecisionApproval,
  fetchDecisionWorkItem,
  fetchImportEvidenceSnapshot,
  fetchRecommendationOutcome,
  fetchRecommendations,
  fetchRecommendationsBoundToImport,
  fetchRuntimeDecisionForRecommendation,
  linkRecommendationToDecision,
  requestDecisionApproval,
  type DecisionApprovalRecord,
  type DecisionWorkItemRecord,
  type ImportEvidenceSnapshot,
  type RuntimeDecisionRecord,
} from '@/lib/queries';
import { formatCurrency, relativeTime } from '@/lib/format';
import type { Alert, Recommendation } from '@/lib/types';

type Stage = 'command' | 'evidence' | 'decision' | 'approval' | 'work' | 'outcome';

const STAGES: { id: Stage; label: string; description: string }[] = [
  { id: 'command', label: 'الإشارة', description: 'ما الذي يحتاج انتباهًا؟' },
  { id: 'evidence', label: 'الدليل', description: 'ما الذي يثبت ذلك؟' },
  { id: 'decision', label: 'القرار', description: 'ما الإجراء المقترح؟' },
  { id: 'approval', label: 'الموافقة', description: 'من يعتمد الإجراء؟' },
  { id: 'work', label: 'التنفيذ', description: 'ماذا تم فعليًا؟' },
  { id: 'outcome', label: 'النتيجة', description: 'ما الذي حدث بعد ذلك؟' },
];


function statusLabel(status: string | null): string {
  if (!status) return 'غير متاح';
  const labels: Record<string, string> = {
    pending: 'قيد المراجعة',
    PENDING: 'قيد المراجعة',
    proposed: 'مقترح',
    PROPOSED: 'مقترح',
    approved: 'معتمد',
    APPROVED: 'معتمد',
    open: 'جاهز للتنفيذ',
    OPEN: 'جاهز للتنفيذ',
    in_progress: 'قيد التنفيذ',
    IN_PROGRESS: 'قيد التنفيذ',
    completed: 'مكتمل',
    COMPLETED: 'مكتمل',
    executed: 'منفذ',
    EXECUTED: 'منفذ',
    rejected: 'مرفوض',
    REJECTED: 'مرفوض',
    cancelled: 'ملغى',
    CANCELLED: 'ملغى',
  };
  return labels[status] ?? status;
}

function decisionReadiness(recommendation: Recommendation | null): { label: string; tone: string; detail: string } {
  if (!recommendation) return { label: 'لا توجد توصية', tone: 'text-ink-500 bg-ink-50', detail: 'لا يوجد عنصر حقيقي لبدء مسار القرار.' };
  if (!recommendation.owner) return { label: 'ينقص المسؤول', tone: 'text-warning-700 bg-warning-50', detail: 'التوصية موجودة، لكن لا يظهر مسؤول فعلي مرتبط بها.' };
  if (!recommendation.deadline) return { label: 'ينقص الموعد', tone: 'text-warning-700 bg-warning-50', detail: 'التوصية لها مسؤول، لكن الموعد غير مثبت بعد.' };
  if (recommendation.expected_impact == null) return { label: 'الأثر غير متاح', tone: 'text-warning-700 bg-warning-50', detail: 'لا يوجد أثر متوقع قابل للعرض على هذه التوصية.' };
  return { label: 'سياق القرار مكتمل', tone: 'text-success-700 bg-success-50', detail: 'المسؤول والموعد والأثر المتوقع متاحة في سجل التوصية.' };
}

function formatDeadline(value: string | null): string {
  if (!value) return 'غير متاح';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('ar-YE', { year: 'numeric', month: 'short', day: 'numeric' });
}

function BlockedState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-[14px] border border-warning-200 bg-warning-50/70 p-4" role="status">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning-100 text-warning-800"><ShieldCheck size={17}/></div>
        <div className="min-w-0">
          <div className="text-[12px] font-black text-warning-950">{title}</div>
          <p className="mt-1 text-[11px] leading-5 text-warning-900/80">{detail}</p>
        </div>
      </div>
    </div>
  );
}

function StageHeader({ label, description }: { label: string; description: string }) {
  return (
    <div>
      <div className="section-kicker">{label}</div>
      <h2 className="mt-1 text-xl font-black text-ink-950">{description}</h2>
    </div>
  );
}

function RecommendationCard({
  recommendation,
  active,
  onClick,
}: {
  recommendation: Recommendation;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={'w-full rounded-[14px] border p-4 text-right transition ' + (active ? 'border-primary-300 bg-primary-50/50 shadow-sm' : 'border-ink-200 bg-white hover:border-primary-200 hover:bg-primary-50/20')}
    >
      <div className="flex items-start gap-3">
        <span className={'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ' + (active ? 'bg-primary-100 text-primary-700' : 'bg-ink-50 text-ink-500')}>
          <Lightbulb size={17}/>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2"><span className="text-[13px] font-black text-ink-900">{recommendation.title}</span><PriorityBadge priority={recommendation.priority}/></span>
          {recommendation.description && <span className="mt-1 block text-[11px] leading-5 text-ink-500">{recommendation.description}</span>}
          <span className="mt-2 flex flex-wrap items-center gap-2">
            <ConfidenceBadge confidence={recommendation.confidence}/>
            {recommendation.expected_impact !== undefined && recommendation.expected_impact !== null && <span className="text-[10px] font-bold text-success-700">أثر متوقع: {formatCurrency(recommendation.expected_impact)}</span>}
          </span>
        </span>
        <ChevronLeft size={16} className="mt-1 shrink-0 text-ink-300"/>
      </div>
    </button>
  );
}

export function DecisionExperiencePage() {
  const [params, setParams] = useSearchParams();
  const requestedStage = params.get('stage') as Stage | null;
  const importJobId = params.get('import');
  const [stage, setStage] = useState<Stage>(STAGES.some((item) => item.id === requestedStage) ? requestedStage! : 'command');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [sourceSnapshot, setSourceSnapshot] = useState<ImportEvidenceSnapshot | null>(null);
  const [runtimeDecision, setRuntimeDecision] = useState<RuntimeDecisionRecord | null>(null);
  const [approval, setApproval] = useState<DecisionApprovalRecord | null>(null);
  const [workItem, setWorkItem] = useState<DecisionWorkItemRecord | null>(null);
  const [outcome, setOutcome] = useState<RecommendationOutcomeRecord | null>(null);
  const [decisionMutationBusy, setDecisionMutationBusy] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(params.get('recommendationId'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const nextSourceSnapshot = importJobId ? await fetchImportEvidenceSnapshot(importJobId) : null;
      const nextRecommendations = importJobId
        ? (nextSourceSnapshot
            ? await fetchRecommendationsBoundToImport({
                importJobId,
                snapshotId: nextSourceSnapshot.id,
                sourceHash: nextSourceSnapshot.source_hash,
              })
            : [])
        : await fetchRecommendations();
      const nextAlerts = await fetchAlerts();
      setRecommendations(nextRecommendations);
      setAlerts(nextAlerts);
      setSourceSnapshot(nextSourceSnapshot);
      setSelectedId((current) => current && nextRecommendations.some((item) => item.id === current) ? current : nextRecommendations[0]?.id ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تحميل سياق القرار');
    } finally {
      setLoading(false);
    }
  }, [importJobId]);

  useEffect(() => { void load(); }, [load]);

  const refreshRuntimeDecision = useCallback(async () => {
    if (!selectedId) {
      setRuntimeDecision(null);
      setApproval(null);
      return;
    }
    try {
      const nextDecision = await fetchRuntimeDecisionForRecommendation(selectedId);
      setRuntimeDecision(nextDecision);
      if (!nextDecision) {
        setApproval(null);
        setWorkItem(null);
        setOutcome(null);
        return;
      }
      const [nextApproval, nextWorkItem, nextOutcome] = await Promise.all([
        fetchDecisionApproval(nextDecision.id),
        fetchDecisionWorkItem(nextDecision.id),
        fetchRecommendationOutcome(nextDecision.id),
      ]);
      setApproval(nextApproval);
      setWorkItem(nextWorkItem);
      setOutcome(nextOutcome);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر قراءة حالة القرار المحفوظ');
    }
  }, [selectedId]);

  useEffect(() => { void refreshRuntimeDecision(); }, [refreshRuntimeDecision]);

  const ensureDecisionAndApproval = useCallback(async () => {
    if (!selected || !sourceSnapshot || !importJobId) throw new Error('DECISION_SOURCE_EVIDENCE_REQUIRED');
    setDecisionMutationBusy(true);
    setError(null);
    try {
      let decision = runtimeDecision;
      if (!decision) {
        const evidenceConfidence = sourceSnapshot.quality_score == null ? null : Math.max(0, Math.min(1, sourceSnapshot.quality_score / 100));
        if (evidenceConfidence == null) throw new Error('DECISION_EVIDENCE_CONFIDENCE_UNAVAILABLE');
        const decisionId = await createRuntimeDecision({
          decisionKey: 'import:' + importJobId + ':recommendation:' + selected.id,
          decisionType: 'recommendation:' + (selected.category || 'general'),
          confidence: evidenceConfidence,
          expectedImpact: selected.expected_impact,
          evidence: {
            evidence_snapshot_id: sourceSnapshot.id,
            import_job_id: importJobId,
            source_hash: sourceSnapshot.source_hash,
            source_quality_score: sourceSnapshot.quality_score,
            source_specialty: sourceSnapshot.metadata.sourceSpecialty ?? null,
            source_specialty_confidence: sourceSnapshot.metadata.sourceSpecialtyConfidence ?? null,
            recommendation_id: selected.id,
            confidence_basis: 'source_quality_bound',
          },
        });
        await linkRecommendationToDecision(selected.id, decisionId);
        decision = await fetchRuntimeDecisionForRecommendation(selected.id);
      }
      if (!decision) throw new Error('DECISION_CREATE_READBACK_FAILED');
      setRuntimeDecision(decision);
      let currentApproval = await fetchDecisionApproval(decision.id);
      if (!currentApproval && decision.status === 'PROPOSED') {
        await requestDecisionApproval(decision.id, 'طلب اعتماد توصية بعد إثبات المصدر ودليلها الكانوني.');
        currentApproval = await fetchDecisionApproval(decision.id);
      }
      setApproval(currentApproval);
      setStage('approval');
      const nextParams = new URLSearchParams(params);
      nextParams.set('stage', 'approval');
      if (selected.id) nextParams.set('recommendationId', selected.id);
      setParams(nextParams, { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر إنشاء مسار القرار');
    } finally {
      setDecisionMutationBusy(false);
    }
  }, [selected, sourceSnapshot, importJobId, runtimeDecision, params, setParams]);

  const decideCurrentApproval = useCallback(async (approve: boolean) => {
    if (!approval) return;
    setDecisionMutationBusy(true);
    setError(null);
    try {
      await decideApproval(approval.id, approve, approve ? 'اعتماد القرار بعد مراجعة الدليل.' : 'رفض القرار بعد مراجعة الدليل.');
      await refreshRuntimeDecision();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تنفيذ قرار الموافقة');
    } finally {
      setDecisionMutationBusy(false);
    }
  }, [approval, refreshRuntimeDecision]);

  const ensureWorkItem = useCallback(async () => {
    if (!runtimeDecision || runtimeDecision.status !== 'APPROVED' || approval?.status !== 'APPROVED' || !selected || !sourceSnapshot) {
      throw new Error('WORK_ITEM_APPROVAL_REQUIRED');
    }
    if (workItem) return;
    const normalizedPriority = String(selected.priority ?? '').toUpperCase();
    if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(normalizedPriority)) {
      throw new Error('WORK_ITEM_PRIORITY_UNSUPPORTED');
    }
    setDecisionMutationBusy(true);
    setError(null);
    try {
      await createDecisionWorkItem({
        decisionId: runtimeDecision.id,
        recommendationId: selected.id,
        department: String(selected.category || 'general').trim() || 'general',
        assigneeLabel: 'المستخدم الحالي',
        title: selected.title,
        description: selected.description,
        priority: normalizedPriority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        dueAt: selected.deadline && !Number.isNaN(Date.parse(selected.deadline + 'T00:00:00Z'))
          ? new Date(selected.deadline + 'T00:00:00Z').toISOString()
          : null,
        expectedImpact: selected.expected_impact,
        evidenceRefs: [{ evidence_snapshot_id: sourceSnapshot.id, import_job_id: importJobId, source_hash: sourceSnapshot.source_hash }],
      });
      await refreshRuntimeDecision();
      setStage('work');
      const nextParams = new URLSearchParams(params);
      nextParams.set('stage', 'work');
      nextParams.set('recommendationId', selected.id);
      setParams(nextParams, { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر إنشاء مهمة التنفيذ');
    } finally {
      setDecisionMutationBusy(false);
    }
  }, [runtimeDecision, approval, selected, sourceSnapshot, workItem, importJobId, refreshRuntimeDecision, params, setParams]);

  useEffect(() => {
    if (!requestedStage || !STAGES.some((item) => item.id === requestedStage)) return;
    const sourceBlocked = Boolean(importJobId && !sourceSnapshot);
    const safeRequestedStage = sourceBlocked && ['decision', 'approval', 'work', 'outcome'].includes(requestedStage) ? 'evidence' : requestedStage;
    setStage(safeRequestedStage);
  }, [requestedStage, importJobId, sourceSnapshot]);

  const selected = recommendations.find((item) => item.id === selectedId) ?? null;
  const currentStageIndex = Math.max(0, STAGES.findIndex((item) => item.id === stage));
  const activeAlerts = useMemo(() => alerts.filter((item) => !item.is_read).slice(0, 6), [alerts]);
  const selectedStatus = selected?.status ?? null;

  const navigateStage = (next: Stage, id = selectedId) => {
    const sourceBlocked = Boolean(importJobId && !sourceSnapshot);
    const safeNext = sourceBlocked && ['decision', 'approval', 'work', 'outcome'].includes(next) ? 'evidence' : next;
    setStage(safeNext);
    const nextParams = new URLSearchParams(params);
    nextParams.set('stage', safeNext);
    if (id) nextParams.set('recommendationId', id);
    else nextParams.delete('recommendationId');
    setParams(nextParams, { replace: true });
  };

  const selectRecommendation = (id: string, next: Stage = 'evidence') => {
    setSelectedId(id);
    navigateStage(next, id);
  };

  if (loading) return <LoadingState message="جارٍ تحميل سياق القرار..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  const readiness = decisionReadiness(selected);

  return (
    <div dir="rtl" className="ag-decision-experience-surface space-y-5 animate-fade-in pb-10">
      <section className="ag-command-hero rounded-[20px] border border-ink-200 bg-ink-950 p-5 text-white shadow-elevated lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-[11px] font-black text-primary-300"><Workflow size={15}/> تجربة القرار</div>
            <h1 className="mt-2 text-[25px] font-black tracking-tight lg:text-[31px]">من الإشارة إلى النتيجة — دون فقدان الدليل</h1>
            <p className="mt-2 text-[12px] leading-6 text-ink-300">المسار يحفظ السياق ويُظهر بوضوح ما هو موجود، وما يحتاج إثباتًا، وما لم يُنفذ بعد.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-ink-200">المرحلة {String(currentStageIndex + 1).padStart(2, '0')} / {String(STAGES.length).padStart(2, '0')}</span>
            <Link to="/command-center" className="inline-flex items-center gap-2 rounded-[9px] border border-white/15 bg-white/10 px-3.5 py-2.5 text-[11px] font-bold text-white hover:bg-white/15">العودة لمركز القيادة <ArrowUpLeft size={13}/></Link>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-6 gap-1" aria-label="مراحل القرار" role="progressbar" aria-valuemin={1} aria-valuemax={STAGES.length} aria-valuenow={currentStageIndex + 1} aria-valuetext={`${STAGES[currentStageIndex]?.label}: ${STAGES[currentStageIndex]?.description}`}>
          {STAGES.map((item, index) => <button key={item.id} type="button" onClick={() => navigateStage(item.id)} aria-current={stage === item.id ? 'step' : undefined} className={'h-1.5 rounded-full transition-colors ' + (index <= currentStageIndex ? 'bg-primary-400' : 'bg-white/15')} title={item.label} aria-label={`${index + 1}. ${item.label}: ${item.description}`}/>)}
        </div>
      </section>

      {importJobId && (
        <section className={"rounded-[16px] border p-4 " + (sourceSnapshot ? "border-success-200 bg-success-50/60" : "border-warning-200 bg-warning-50/70")} role="status">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className={"text-[9px] font-black tracking-[.12em] " + (sourceSnapshot ? "text-success-700" : "text-warning-800")}>IMPORTED SOURCE CONTEXT</div>
              <div className="mt-1 text-sm font-black text-ink-950">{sourceSnapshot ? 'الدليل المرتبط بالمصدر مثبت — يمكن متابعة مسار القرار.' : 'الدليل المرتبط بالمصدر غير مثبت — القرار محجوب مؤقتًا.'}</div>
              <p className="mt-1 text-[10px] leading-5 text-ink-600">{sourceSnapshot ? ('المصدر: ' + String(sourceSnapshot.metadata.fileName ?? sourceSnapshot.source_path) + ' · ' + sourceSnapshot.row_count + ' صف · جودة ' + (sourceSnapshot.quality_score == null ? 'غير متاحة' : sourceSnapshot.quality_score + '%')) : 'الاستيراد قد يكون مرّ في المسار التشغيلي، لكن لا توجد Snapshot دليل قابلة للقراءة في هذه الجلسة.'}</p>
            </div>
            {!sourceSnapshot && <Link to={"/trust?import=" + encodeURIComponent(importJobId)} className="btn-secondary text-[11px]">فتح Evidence Passport</Link>}
          </div>
        </section>
      )}
      <section className="ag-decision-strip" aria-label="ملخص القرار">
        <div className="ag-decision-cell"><span className="ag-decision-label">التوصية المحددة</span><span className="ag-decision-value">{selected?.title ?? 'لم تُحدد بعد'}</span></div>
        <div className="ag-decision-cell"><span className="ag-decision-label">الثقة</span><span className="ag-decision-value">{selected?.confidence ?? 'غير متاح'}</span></div>
        <div className="ag-decision-cell"><span className="ag-decision-label">الحالة</span><span className="ag-decision-value">{statusLabel(selectedStatus)}</span></div>
        <div className="ag-decision-cell"><span className="ag-decision-label">المسؤول</span><span className="ag-decision-value">{selected?.owner ?? 'غير متاح'}</span></div>
        <div className="ag-decision-cell"><span className="ag-decision-label">الموعد</span><span className="ag-decision-value">{formatDeadline(selected?.deadline ?? null)}</span></div>
        <div className="ag-decision-cell"><span className="ag-decision-label">المرحلة</span><span className="ag-decision-value">{STAGES[currentStageIndex]?.label}</span></div>
      </section>

      <nav aria-label="مراحل القرار" className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {STAGES.map((item, index) => (
          <button key={item.id} type="button" onClick={() => navigateStage(item.id)} className={'stage-pill ' + (stage === item.id ? 'stage-pill-active' : 'hover:border-ink-300 hover:bg-ink-50')} aria-current={stage === item.id ? 'step' : undefined}>
            <span className="block text-xs font-bold">{index + 1}. {item.label}</span>
            <span className="mt-1 block text-[10px] text-ink-500">{item.description}</span>
          </button>
        ))}
      </nav>

      {stage === 'command' && (
        <>
          <section className="rounded-[16px] border border-ink-200 bg-white p-4 shadow-card">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="section-kicker">DECISION READINESS</div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${readiness.tone}`}>{readiness.label}</span>
                <span className="text-[10px] text-ink-400">{readiness.detail}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold text-ink-600">
              <span className="inline-flex items-center gap-1 rounded-xl bg-ink-50 px-2.5 py-2"><UserRound size={13}/> {selected?.owner ?? 'مسؤول غير مثبت'}</span>
              <span className="inline-flex items-center gap-1 rounded-xl bg-ink-50 px-2.5 py-2"><CalendarClock size={13}/> {formatDeadline(selected?.deadline ?? null)}</span>
              <span className="inline-flex items-center gap-1 rounded-xl bg-ink-50 px-2.5 py-2">الأثر: {selected?.expected_impact == null ? 'غير متاح' : formatCurrency(selected.expected_impact)}</span>
            </div>
          </div>
        </section>

          <section className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
          <Card>
            <CardHeader title="الإشارات التي تستدعي قرارًا" subtitle="اختر الإشارة التي تريد تحويلها إلى مسار قرار." />
            <CardBody>
              <div className="space-y-3">
                {activeAlerts.map((alert) => (
                  <article key={alert.id} className="rounded-[14px] border border-ink-200 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-danger-50 text-danger-700"><AlertTriangle size={17}/></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2"><SeverityBadge severity={alert.severity}/><span className="text-[10px] text-ink-400">{relativeTime(alert.created_at)}</span></div>
                        <div className="mt-2 text-[13px] font-black text-ink-900">{alert.title}</div>
                        {alert.description && <p className="mt-1 text-[11px] leading-5 text-ink-500">{alert.description}</p>}
                        <Link to="/trust" className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-primary-700">فحص المصدر أولًا <ArrowUpLeft size={13}/></Link>
                      </div>
                    </div>
                  </article>
                ))}
                {!activeAlerts.length && <EmptyState title="لا توجد إشارات نشطة" message="لا توجد تنبيهات غير مقروءة في المصدر الحالي." action={<Link to="/trust" className="btn-secondary text-[11px]">فحص الثقة</Link>}/>} 
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="مرشحات القرار" subtitle="التوصية هي مرشح، وليست نتيجة تنفيذية محفوظة." />
            <CardBody>
              <div className="space-y-3">
                {recommendations.slice(0, 6).map((recommendation) => <RecommendationCard key={recommendation.id} recommendation={recommendation} active={selectedId === recommendation.id} onClick={() => selectRecommendation(recommendation.id)} />)}
                {!recommendations.length && <EmptyState title={importJobId ? 'لا توجد توصيات مرتبطة بهذا المصدر' : 'لا توجد توصيات'} message={importJobId ? 'لن يتم ربط توصية عامة بملف مستورد دون provenance يثبت علاقتها بالمصدر.' : 'لا يتم إنشاء توصية بديلة عند غياب بيانات المصدر.'} action={<Link to="/import" className="btn-primary text-[11px]">إضافة مصدر</Link>}/>} 
              </div>
            </CardBody>
          </Card>
          </section>
        </>
      )}

      {stage === 'evidence' && (
        <section className="grid gap-4 xl:grid-cols-[.82fr_1.18fr]">
          <Card>
            <CardHeader title="اختيار التوصية" subtitle="حدد عنصرًا حقيقيًا من المصدر." />
            <CardBody>
              <div className="space-y-2">
                {recommendations.map((recommendation) => <RecommendationCard key={recommendation.id} recommendation={recommendation} active={selectedId === recommendation.id} onClick={() => selectRecommendation(recommendation.id, 'evidence')} />)}
                {!recommendations.length && <EmptyState title={importJobId ? 'لا توجد توصيات موثقة لهذا المصدر' : 'لا توجد توصيات'} message={importJobId ? 'الدليل موجود، لكن لا توجد توصية مرتبطة به في المصدر الكانوني؛ لا يمكن القفز إلى قرار.' : 'لا يمكن فحص دليل لعنصر غير موجود.'} action={<Link to="/import" className="btn-primary text-[11px]">إضافة مصدر</Link>}/>} 
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="مساحة الدليل" subtitle="المصدر، السياق، والثقة قبل القرار." action={selected ? <ConfidenceBadge confidence={selected.confidence} /> : undefined} />
            <CardBody>
              {selected ? (
                <div className="space-y-4">
                  <div className="rounded-[14px] border border-ink-200 bg-ink-50/70 p-4">
                    <div className="surface-label">موضوع القرار</div>
                    <h2 className="mt-1 text-lg font-black text-ink-950">{selected.title}</h2>
                    {selected.description && <p className="mt-2 text-[12px] leading-6 text-ink-600">{selected.description}</p>}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[12px] border border-ink-100 bg-white p-3"><div className="text-[10px] text-ink-400">الحالة</div><div className="mt-1 text-[12px] font-black text-ink-900">{selectedStatus ?? 'غير متاح'}</div></div>
                    <div className="rounded-[12px] border border-ink-100 bg-white p-3"><div className="text-[10px] text-ink-400">الثقة</div><div className="mt-1"><ConfidenceBadge confidence={selected.confidence}/></div></div>
                    <div className="rounded-[12px] border border-ink-100 bg-white p-3"><div className="text-[10px] text-ink-400">الأثر المتوقع</div><div className="mt-1 text-[12px] font-black text-ink-900">{selected.expected_impact == null ? 'غير متاح' : formatCurrency(selected.expected_impact)}</div></div>
                  </div>
                  <BlockedState title="الدليل التشغيلي غير مثبت هنا" detail="لا تُعرض بيانات مصدرية مصطنعة ولا يتم تحويل وصف التوصية إلى دليل. الانتقال إلى القرار يحافظ على حالة المراجعة بدل الادعاء بوجود إثبات غير متاح." />
                  <div className="flex flex-wrap gap-2"><button type="button" onClick={() => navigateStage('decision')} className="btn-primary text-[11px]">متابعة إلى القرار <ArrowUpLeft size={13}/></button><Link to="/metrics" className="btn-secondary text-[11px]">فحص تعريف المؤشر <FileSearch size={13}/></Link></div>
                </div>
              ) : <EmptyState title="اختر توصية" message="اختر عنصرًا موجودًا لفحص سياق الدليل." action={<Link to="/command-center" className="btn-secondary text-[11px]">العودة إلى الإشارات</Link>}/>} 
            </CardBody>
          </Card>
        </section>
      )}

      {stage === 'decision' && (
        <section className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
          <Card>
            <CardHeader title="صياغة القرار" subtitle="حوّل الإشارة إلى إجراء مقترح دون تسجيل نتيجة لم تحدث." />
            <CardBody>
              {selected ? (
                <div className="space-y-4">
                  <div className="rounded-[14px] border border-primary-100 bg-primary-50/40 p-4">
                    <div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-black text-primary-700">التوصية المختارة</span><PriorityBadge priority={selected.priority}/><ConfidenceBadge confidence={selected.confidence}/></div>
                    <h2 className="mt-2 text-lg font-black text-ink-950">{selected.title}</h2>
                    {selected.description && <p className="mt-1 text-[11px] leading-5 text-ink-600">{selected.description}</p>}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-[12px] border border-ink-100 bg-white p-4"><div className="text-[10px] text-ink-400">ما نعرفه</div><div className="mt-2 text-[12px] font-bold text-ink-900">{statusLabel(selected.status)}</div></div>
                    <div className="rounded-[12px] border border-ink-100 bg-white p-4"><div className="text-[10px] text-ink-400">المسؤول</div><div className="mt-2 text-[12px] font-bold text-ink-900">{selected.owner ?? 'غير مثبت'}</div></div>
                    <div className="rounded-[12px] border border-ink-100 bg-white p-4"><div className="text-[10px] text-ink-400">الموعد</div><div className="mt-2 text-[12px] font-bold text-ink-900">{formatDeadline(selected.deadline)}</div></div>
                    <div className="rounded-[12px] border border-ink-100 bg-white p-4"><div className="text-[10px] text-ink-400">ما لا نعرفه بعد</div><div className="mt-2 text-[12px] font-bold text-ink-900">نتيجة تشغيلية مثبتة بعد التنفيذ.</div></div>
                  </div>
                </div>
              ) : <EmptyState title="لا يوجد مرشح قرار" message="اختر توصية من خطوة الدليل أولًا." />}
            </CardBody>
          </Card>
          <div className="space-y-4">
            {!importJobId || !sourceSnapshot ? (
              <BlockedState title="الدليل المصدر غير مثبت" detail="لا يمكن إنشاء قرار محفوظ قبل وجود Evidence Snapshot مرتبط بالمصدر الحالي." />
            ) : runtimeDecision ? (
              <>
                <div className="rounded-[14px] border border-success-200 bg-success-50/70 p-4">
                  <div className="flex flex-wrap items-center gap-2"><CheckCircle2 size={16} className="text-success-700"/><span className="text-[11px] font-black text-success-900">القرار محفوظ فعليًا</span><span className="rounded-full bg-white px-2 py-1 text-[9px] font-black text-ink-700">{statusLabel(runtimeDecision.status)}</span></div>
                  <div className="mt-2 text-[10px] leading-5 text-success-900">Decision ID: {runtimeDecision.id}</div>
                  <div className="mt-2 text-[10px] leading-5 text-success-900">الدليل: {sourceSnapshot.id} · أساس الثقة: جودة المصدر {sourceSnapshot.quality_score == null ? 'غير متاحة' : sourceSnapshot.quality_score + '%'}</div>
                </div>
                <div className="rounded-[12px] border border-ink-200 bg-white p-4">
                  <div className="text-[10px] font-black text-ink-700">الموافقة الحالية</div>
                  <div className="mt-2 text-sm font-black text-ink-950">{approval?.status ?? 'لم تُطلب بعد'}</div>
                  <div className="mt-1 text-[10px] text-ink-400">{approval ? 'تُحكم الصلاحية من RPC قاعدة البيانات.' : 'يمكن طلب الموافقة من نفس المسار دون إنشاء حالة محلية.'}</div>
                </div>
              </>
            ) : (
              <div className="rounded-[14px] border border-primary-200 bg-primary-50/60 p-4">
                <div className="text-sm font-black text-ink-950">إنشاء قرار حقيقي من هذه التوصية</div>
                <p className="mt-1 text-[11px] leading-5 text-ink-600">سيُسجل القرار في قاعدة البيانات، ويربط بالتوصية وبـEvidence Snapshot نفسها، ثم يرسل طلب الموافقة عبر المسار المحكوم.</p>
                <button type="button" onClick={() => void ensureDecisionAndApproval()} disabled={decisionMutationBusy} className="mt-4 btn-primary text-[11px] disabled:opacity-60">
                  {decisionMutationBusy ? 'جارٍ إنشاء القرار...' : 'إنشاء القرار وطلب الموافقة'}
                </button>
              </div>
            )}
            <div className="grid gap-3">
              <div className="rounded-[12px] border border-ink-200 bg-white p-4"><div className="flex items-center gap-2 text-[12px] font-black"><CheckCircle2 size={15} className="text-success-700"/> التوصية</div><p className="mt-1 text-[10px] text-ink-400">موجودة في المصدر</p></div>
              <div className="rounded-[12px] border border-ink-200 bg-white p-4"><div className="flex items-center gap-2 text-[12px] font-black"><ShieldCheck size={15} className="text-warning-700"/> الموافقة</div><p className="mt-1 text-[10px] text-ink-400">{approval?.status ?? 'لم تُطلب بعد'}</p></div>
              <div className="rounded-[12px] border border-ink-200 bg-white p-4"><div className="flex items-center gap-2 text-[12px] font-black"><XCircle size={15} className="text-ink-400"/> النتيجة</div><p className="mt-1 text-[10px] text-ink-400">لا تُسجل قبل التنفيذ الفعلي.</p></div>
            </div>
          </div>
        </section>
      )}

      {stage === 'approval' && (
        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="الموافقة والمسؤولية" subtitle="من يعتمد؟ وعلى أي دليل؟" />
            <CardBody>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[12px] border border-ink-100 bg-white p-4"><div className="text-[10px] text-ink-400">المسؤول المعتمد</div><div className="mt-2 text-[12px] font-black text-ink-900">غير متاح</div></div>
                <div className="rounded-[12px] border border-ink-100 bg-white p-4"><div className="text-[10px] text-ink-400">وقت الاعتماد</div><div className="mt-2 text-[12px] font-black text-ink-900">غير متاح</div></div>
                <div className="rounded-[12px] border border-ink-100 bg-white p-4"><div className="text-[10px] text-ink-400">الصلاحية</div><div className="mt-2 text-[12px] font-black text-ink-900">يتطلب جلسة موثقة</div></div>
                <div className="rounded-[12px] border border-ink-100 bg-white p-4"><div className="text-[10px] text-ink-400">الدليل</div><div className="mt-2 text-[12px] font-black text-ink-900">يحتاج إثباتًا حيًا</div></div>
              </div>
            </CardBody>
          </Card>
          {runtimeDecision && approval ? (
            <div className="rounded-[14px] border border-ink-200 bg-white p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-black text-ink-600">حالة الموافقة</span><span className="rounded-full bg-primary-50 px-2.5 py-1 text-[9px] font-black text-primary-800">{approval.status}</span></div>
              <div className="text-[10px] leading-5 text-ink-500">القرار: {runtimeDecision.id} · الدليل: {sourceSnapshot?.id ?? 'غير متاح'}</div>
              {approval.status === 'PENDING' && (
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => void decideCurrentApproval(true)} disabled={decisionMutationBusy} className="btn-primary text-[11px] disabled:opacity-60">اعتماد</button>
                  <button type="button" onClick={() => void decideCurrentApproval(false)} disabled={decisionMutationBusy} className="btn-secondary text-[11px] disabled:opacity-60">رفض</button>
                </div>
              )}
              {approval.status === 'APPROVED' && (
                <div className="rounded-lg border border-success-200 bg-success-50 p-3 text-[10px] font-black text-success-800">
                  <div>تم اعتماد القرار.</div>
                  {workItem ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2 font-normal text-ink-700">
                      <span>Work Item: {workItem.status}</span>
                      <Link to="/work-center" className="btn-secondary text-[10px]">فتح مركز العمل</Link>
                    </div>
                  ) : (
                    <button type="button" onClick={() => void ensureWorkItem()} disabled={decisionMutationBusy} className="mt-2 btn-primary text-[10px] disabled:opacity-60">
                      {decisionMutationBusy ? 'جارٍ إنشاء مهمة التنفيذ...' : 'إنشاء مهمة تنفيذ للمستخدم الحالي'}
                    </button>
                  )}
                </div>
              )}
              {approval.status === 'REJECTED' && <div className="rounded-lg bg-danger-50 p-3 text-[10px] font-black text-danger-800">القرار مرفوض؛ لا يتم إنشاء تنفيذ أو نتيجة تلقائيًا.</div>}
            </div>
          ) : (
            <BlockedState title="لا توجد موافقة محفوظة بعد" detail="أنشئ القرار من مرحلة القرار أولًا، ثم يطلب النظام الموافقة عبر RPC المحكوم." />
          )}
        </section>
      )}

      {stage === 'work' && (
        <section className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
          <Card>
            <CardHeader title="التنفيذ والمتابعة" subtitle="المهمة نفسها من قاعدة البيانات، دون إنشاء حالة محلية بديلة." />
            <CardBody>
              {workItem ? (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-[12px] border border-ink-100 bg-white p-4"><div className="text-[10px] text-ink-400">المهمة</div><div className="mt-2 text-[12px] font-black text-ink-900">{workItem.title}</div></div>
                    <div className="rounded-[12px] border border-ink-100 bg-white p-4"><div className="text-[10px] text-ink-400">الحالة</div><div className="mt-2 text-[12px] font-black text-ink-900">{statusLabel(workItem.status)}</div></div>
                    <div className="rounded-[12px] border border-ink-100 bg-white p-4"><div className="text-[10px] text-ink-400">المسؤول</div><div className="mt-2 text-[12px] font-black text-ink-900">{workItem.assignee_label ?? 'غير مثبت'}</div></div>
                    <div className="rounded-[12px] border border-ink-100 bg-white p-4"><div className="text-[10px] text-ink-400">الموعد</div><div className="mt-2 text-[12px] font-black text-ink-900">{formatDeadline(workItem.due_at)}</div></div>
                    <div className="rounded-[12px] border border-ink-100 bg-white p-4"><div className="text-[10px] text-ink-400">الأثر المتوقع</div><div className="mt-2 text-[12px] font-black text-ink-900">{workItem.expected_impact == null ? 'غير متاح' : formatCurrency(workItem.expected_impact)}</div></div>
                    <div className="rounded-[12px] border border-ink-100 bg-white p-4"><div className="text-[10px] text-ink-400">الأثر الفعلي</div><div className="mt-2 text-[12px] font-black text-ink-900">{workItem.actual_impact == null ? 'غير متاح بعد' : formatCurrency(workItem.actual_impact)}</div></div>
                  </div>
                  {workItem.description && <div className="rounded-xl border border-ink-100 bg-ink-50/50 p-3 text-[11px] leading-5 text-ink-600">{workItem.description}</div>}
                  <Link to="/work-center" className="btn-primary text-[11px]">فتح المهمة في مركز العمل <ArrowUpLeft size={13}/></Link>
                </div>
              ) : (
                <BlockedState title="لا توجد مهمة تنفيذ محفوظة" detail="أنشئ Work Item من مرحلة الموافقة بعد اعتماد القرار؛ لا يتم افتراض التنفيذ من مجرد وجود التوصية." />
              )}
            </CardBody>
          </Card>
          <BlockedState title="بدء التنفيذ يحتاج فعلًا تشغيليًا" detail="لا يبدأ العمل تلقائيًا عند اعتماد القرار. يبدأ من مركز العمل عندما يملك المستخدم صلاحية التنفيذ وتكون المهمة OPEN." />
        </section>
      )}

      {stage === 'outcome' && (
        <section className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
          <Card>
            <CardHeader title="النتيجة والتعلّم" subtitle="المتوقع مقابل الفعلي يظهر فقط من سجل outcome محفوظ." />
            <CardBody>
              {outcome ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    ['المتوقع', outcome.expected_impact == null ? 'غير متاح' : formatCurrency(outcome.expected_impact)],
                    ['الفعلي', outcome.actual_impact == null ? 'غير متاح' : formatCurrency(outcome.actual_impact)],
                    ['الفارق', outcome.actual_impact == null || outcome.expected_impact == null ? 'لا يمكن حسابه' : formatCurrency(outcome.actual_impact - outcome.expected_impact)],
                    ['جودة النتيجة', outcome.outcome_quality == null ? 'غير متاحة' : outcome.outcome_quality + '%'],
                    ['الحالة', outcome.status],
                    ['وقت الرصد', new Date(outcome.observed_at).toLocaleString('ar-YE')],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-[12px] border border-ink-100 bg-white p-4">
                      <div className="text-[10px] text-ink-400">{label}</div>
                      <div className="mt-2 text-[12px] font-black text-ink-900">{value}</div>
                    </div>
                  ))}
                  <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-primary-100 bg-primary-50/40 p-3 text-[10px] leading-5 text-ink-600">Outcome ID: {outcome.id} · Evidence: {String(outcome.evidence.evidence_snapshot_id ?? 'غير متاح')}</div>
                </div>
              ) : (
                <div className="rounded-[14px] border border-warning-200 bg-warning-50/70 p-4 text-[11px] leading-6 text-warning-900">لم تُثبت نتيجة تنفيذ لهذا القرار بعد. لا يتم تحويل التوصية إلى أثر أو تعلّم تلقائيًا.</div>
              )}
            </CardBody>
          </Card>
          {!outcome && <BlockedState title="النتيجة الفعلية غير موجودة بعد" detail="أكمل Work Item فعليًا وأرفق Evidence Snapshot مناسبًا؛ بعدها ستظهر النتيجة هنا تلقائيًا من السجل." />}
          {outcome && <div className="flex h-fit flex-wrap gap-2"><Link to="/work-center" className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-3 text-[11px] font-black text-ink-700">مراجعة المهمة والأدلة <ArrowUpLeft size={13}/></Link><Link to="/replay" className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-[11px] font-black text-primary-800">فتح سجل Business Replay <ArrowUpLeft size={13}/></Link></div>}
        </section>
      )}

      {selected && stage !== 'command' && (
        <div className="flex flex-col gap-3 rounded-[14px] border border-ink-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0"><div className="surface-label">السياق الحالي</div><div className="mt-1 truncate text-sm font-black text-ink-900">{selected.title}</div></div>
          <div className="flex flex-wrap gap-2"><button type="button" onClick={() => navigateStage(STAGES[Math.max(0, currentStageIndex - 1)].id)} className="btn-secondary text-[11px]" disabled={currentStageIndex === 0}>السابق <ChevronLeft size={13}/></button><button type="button" onClick={() => navigateStage(STAGES[Math.min(STAGES.length - 1, currentStageIndex + 1)].id)} className="btn-primary text-[11px]" disabled={currentStageIndex === STAGES.length - 1}>التالي <ArrowUpLeft size={13}/></button></div>
        </div>
      )}
    </div>
  );
}
