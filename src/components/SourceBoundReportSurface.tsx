import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock3, FileSearch, ShieldCheck, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ErrorState, LoadingState } from '@/components/ui/States';
import { fetchSmartReport, type SmartReportDetail } from '@/lib/report-smart';
import { formatCurrency, formatNumber } from '@/lib/format';
import { ReportIntelligencePanel } from '@/components/ReportIntelligencePanel';
import { completeSourceDecisionWorkItem, createApprovedDecisionWorkItemForCurrentUser, decideSourceDecisionApproval, fetchSourceDecisionAuditTrace, fetchSourceDecisionProposals, requestSourceDecisionApproval, startSourceDecisionWorkItem, type DecisionAuditTrace, type SourceDecisionState } from '@/lib/report-decisions';
import { getAuthenticatedUser } from '@/lib/auth-session';

export type SourceBoundReportMode = 'executive' | 'trust' | 'decision' | 'work';

const STAGE_LABELS: Record<string, string> = {
  queued: 'الاصطفاف',
  fingerprinted: 'البصمة',
  extracted: 'الاستخراج',
  canonicalized: 'الكاننة',
  validated: 'التحقق',
  analyzed: 'التحليل',
  decisioned: 'القرار',
  committed: 'الاعتماد',
  rendered: 'العرض',
};

const STATE_LABELS: Record<string, string> = {
  TRUSTED: 'موثوق',
  VERIFIED: 'موثق',
  REVIEW: 'مراجعة',
  BLOCKED: 'محظور',
  NO_DECISION_COMMITTED: 'لا قرار معتمد',
  NO_ACTION_COMMITTED: 'لا إجراء معتمد',
  NOT_AVAILABLE: 'غير متاح',
  INSUFFICIENT_SAMPLE: 'عينة غير كافية',
  NOT_COMMITTED: 'غير معتمد',
  PENDING_EVIDENCE: 'بانتظار الدليل',
  GAP_DETECTED: 'فجوة اعتماد مكتشفة',
};

function stateLabel(value: unknown): string {
  if (value == null || value === '') return 'غير متاح';
  return STATE_LABELS[String(value)] ?? String(value);
}

function numberValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value.replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function specialtyPath(specialty: string | null): string | null {
  const map: Record<string, string> = {
    sales: '/reports/sales',
    purchases: '/reports/purchases',
    inventory: '/reports/inventory',
    receivables: '/reports/receivables',
    profitability: '/reports/profitability',
  };
  return specialty ? map[specialty] ?? null : null;
}

function buildMetrics(report: SmartReportDetail) {
  const dataset = report.sourceAnalysis?.datasets?.[0];
  const obj = dataset && typeof dataset === 'object' ? dataset as Record<string, unknown> : null;
  const columns = Array.isArray(obj?.columns)
    ? obj.columns.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object')
    : [];
  return columns
    .map((column) => ({
      label: String(column.mappedField ?? column.name ?? 'حقل'),
      value: numberValue((column.statistics as Record<string, unknown> | undefined)?.sum ?? null),
    }))
    .filter((metric) => metric.value != null)
    .slice(0, 6);
}

function StatusCell({ label, value }: { label: string; value: unknown }) {
  const text = stateLabel(value);
  const good = value === 'TRUSTED' || value === 'VERIFIED' || value === 'completed';
  const bad = value === 'BLOCKED' || value === 'failed';
  return (
    <div className={'rounded-xl border p-3 ' + (good ? 'border-success-200 bg-success-50' : bad ? 'border-danger-200 bg-danger-50' : 'border-ink-200 bg-ink-50')}>
      <div className="text-[9px] font-black text-ink-500">{label}</div>
      <div className="mt-1 text-xs font-black text-ink-900">{text}</div>
    </div>
  );
}

function SourceHeader({ report }: { report: SmartReportDetail }) {
  const domain = specialtyPath(report.specialty);
  return (
    <section className="rounded-[18px] border border-primary-200 bg-primary-50/60 p-5 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="text-[9px] font-black tracking-[.14em] text-primary-800">SOURCE-BOUND RESULT</div>
          <h1 className="mt-1 truncate text-lg font-black text-ink-950" title={report.sourcePath}>{report.sourcePath}</h1>
          <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-ink-600">
            <span>التخصص: {report.specialty ?? 'عام'}</span>
            <span>•</span>
            <span>الصفوف المصدرية: {report.rowCount == null ? 'غير متاح' : formatNumber(report.rowCount)}</span>
            <span>•</span>
            <span>الصفوف المعتمدة: {report.authoritativeCurrentRowCount == null ? 'غير متاح' : formatNumber(report.authoritativeCurrentRowCount)}</span>
            <span>•</span>
            <span>الجودة: {report.qualityScore == null ? 'غير متاح' : report.qualityScore + '%'}</span>
            <span>•</span>
            <span>الثقة: {stateLabel(report.trustState)}</span>
            <span>•</span>
            <span>المصدر: {stateLabel(report.sourceTrustState ?? report.trustState)}</span>
            <span>•</span>
            <span>التحقق: {report.reportVerificationState === 'VERIFIED' ? 'موثق' : report.reportVerificationState === 'GAP_DETECTED' ? 'فجوة اعتماد' : 'بانتظار الدليل'}</span>
          </div>
          <div className="mt-2 break-all font-mono text-[9px] text-ink-400">{report.sourceHash}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={'/reports/smart/' + report.jobId} className="btn-primary text-[10px]">التقرير الذكي <ArrowLeft size={12}/></Link>
          {domain && <Link to={domain + '?reportJobId=' + report.jobId + '&sourceHash=' + encodeURIComponent(report.sourceHash)} className="btn-secondary text-[10px]">التخصص <ArrowLeft size={12}/></Link>}
        </div>
      </div>
    </section>
  );
}

function ExecutiveMode({ report }: { report: SmartReportDetail }) {
  const metrics = buildMetrics(report);
  const output = report.renderedOutput;
  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatusCell label="Source Trust" value={report.sourceTrustState ?? report.trustState}/>
        <StatusCell label="Report Verification" value={report.reportVerificationState}/>
        <StatusCell label="Decision" value={output.decisionStatus}/>
        <StatusCell label="Benchmark" value={output.benchmarkStatus}/>
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-sm">
          <div className="text-[9px] font-black tracking-[.12em] text-primary-700">EXECUTIVE BRIEF</div>
          <h2 className="mt-1 text-xl font-black text-ink-950">هذه هي نتيجة المصدر نفسه</h2>
          <p className="mt-3 text-sm leading-7 text-ink-600">
            تم تحليل المصدر وربطه بالبصمة الأصلية. لا تُستبدل القيم غير الموجودة بتقديرات، ولا تُنسب نتائج تنفيذية لم تُسجل.
            حالة القرار الحالية: <strong>{stateLabel(output.decisionStatus)}</strong>، وحالة التنفيذ: <strong>{stateLabel(output.actionStatus)}</strong>.
          </p>
        </div>
        <div className="rounded-[18px] border border-ink-200 bg-ink-950 p-5 text-white shadow-sm">
          <div className="text-[9px] font-black tracking-[.12em] text-primary-200">SOURCE FACTS</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/5 p-3"><div className="text-[9px] text-ink-300">الصفوف</div><div className="mt-1 text-lg font-black">{report.rowCount == null ? 'غير متاح' : formatNumber(report.rowCount)}</div></div>
            <div className="rounded-xl bg-white/5 p-3"><div className="text-[9px] text-ink-300">الأعمدة</div><div className="mt-1 text-lg font-black">{report.sourceAnalysis?.columnCount ?? 'غير متاح'}</div></div>
            <div className="rounded-xl bg-white/5 p-3"><div className="text-[9px] text-ink-300">الصيغة</div><div className="mt-1 text-sm font-black">{report.sourceAnalysis?.sourceFormat ?? 'غير متاح'}</div></div>
            <div className="rounded-xl bg-white/5 p-3"><div className="text-[9px] text-ink-300">مرحلة</div><div className="mt-1 text-sm font-black">{STAGE_LABELS[report.checkpointStage ?? ''] ?? report.checkpointStage ?? 'غير متاح'}</div></div>
          </div>
        </div>
      </section>
      <section className="rounded-[18px] border border-primary-200 bg-primary-50/50 p-4" aria-label="نتيجة القرار والتعلم">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[9px] font-black tracking-[.12em] text-primary-700">OUTCOME → LEARNING</div>
            <div className="mt-1 text-sm font-black text-ink-950">النتيجة المسجلة تصبح معرفة قابلة للمتابعة، وليست نجاحًا افتراضيًا.</div>
            <p className="mt-1 text-[10px] leading-5 text-ink-600">حالة التعلم تُقرأ من سجل النتيجة المرتبط بالقرار والدليل. عند غياب سجل موثوق تبقى الحالة NOT AVAILABLE.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <StatusCell label="Outcome" value={output.outcomeStatus}/>
            <StatusCell label="Learning" value={output.learningStatus}/>
            <StatusCell label="Benchmark" value={output.benchmarkStatus}/>
          </div>
        </div>
      </section>
      <ReportIntelligencePanel report={report} />

      <section className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-sm">
        <div className="text-[9px] font-black tracking-[.12em] text-primary-700">SOURCE METRICS</div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.length ? metrics.map((metric) => <div key={metric.label} className="rounded-xl bg-ink-50 p-3"><div className="text-[10px] text-ink-500">{metric.label}</div><div className="mt-1 text-base font-black">{/amount|price|total|value|cost|sales|paid|balance|revenue|profit|ربح|قيمة|سعر|مبلغ/i.test(metric.label) ? formatCurrency(metric.value) : formatNumber(metric.value)}</div></div>) : <div className="rounded-xl border border-warning-200 bg-warning-50 p-4 text-xs text-warning-900">لا توجد قيمة رقمية كافية للعرض من المصدر الحالي.</div>}
        </div>
      </section>
    </>
  );
}

function TrustMode({ report }: { report: SmartReportDetail }) {
  const warnings = report.sourceAnalysis?.datasets?.length ? report.sourceAnalysis.datasets.length : 0;
  return (
    <>
      <ReportIntelligencePanel report={report} />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatusCell label="Truth" value={report.trustState}/>
        <StatusCell label="Evidence" value={report.evidenceStatus}/>
        <StatusCell label="Verification" value={report.reportVerificationState}/>
        <StatusCell label="Analysis" value={report.sourceAnalysis?.analysisStatus}/>
        <StatusCell label="Canonical" value={report.canonicalCommitVerified ? 'VERIFIED' : 'NOT_COMMITTED'}/>
      </section>
      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-sm">
          <div className="text-[9px] font-black tracking-[.12em] text-primary-700">EVIDENCE PASSPORT</div>
          <h2 className="mt-1 text-xl font-black">هوية الدليل</h2>
          <dl className="mt-4 grid gap-2 text-xs">
            <div className="flex justify-between gap-3 rounded-lg bg-ink-50 p-3"><dt>المصدر</dt><dd className="max-w-[70%] break-all font-mono text-right">{report.sourcePath}</dd></div>
            <div className="flex justify-between gap-3 rounded-lg bg-ink-50 p-3"><dt>البصمة</dt><dd className="max-w-[70%] break-all font-mono text-right">{report.sourceHash}</dd></div>
            <div className="flex justify-between gap-3 rounded-lg bg-ink-50 p-3"><dt>التحليل</dt><dd>{report.sourceAnalysis?.analysisStatus ?? 'غير متاح'}</dd></div>
            <div className="flex justify-between gap-3 rounded-lg bg-ink-50 p-3"><dt>الجودة</dt><dd>{report.qualityScore == null ? 'غير متاح' : report.qualityScore + '%'}</dd></div>
            <div className="flex justify-between gap-3 rounded-lg bg-ink-50 p-3"><dt>الصفوف × الأعمدة</dt><dd>{report.rowCount == null ? 'غير متاح' : formatNumber(report.rowCount)} × {report.sourceAnalysis?.columnCount ?? 'غير متاح'}</dd></div>
          </dl>
        </div>
        <div className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-sm">
          <div className="text-[9px] font-black tracking-[.12em] text-primary-700">EVIDENCE BOUNDARY</div>
          <h2 className="mt-1 text-xl font-black">ما الذي ثبت وما الذي لم يثبت؟</h2>
          <div className="mt-4 space-y-2">
            <div className={`rounded-xl border p-3 text-xs ${report.canonicalCommitVerified ? 'border-success-200 bg-success-50' : 'border-warning-200 bg-warning-50 text-warning-900'}`}>
              {report.canonicalCommitVerified ? `الاعتماد الكانوني مثبت: ${formatNumber(report.canonicalCommitCount)} سجل.` : 'الاعتماد الكانوني غير مثبت لهذا المصدر؛ لا تُرفع الثقة بالاستنتاج.'}
              {report.canonicalCommitGap != null && report.canonicalCommitGap > 0 && <span className="mr-2 font-bold text-warning-900">فجوة الاعتماد: {formatNumber(report.canonicalCommitGap)} صف.</span>}
            </div>
            <div className="rounded-xl border border-warning-200 bg-warning-50 p-3 text-xs text-warning-900">Trusted Source لا تعني Verified Report. حالة الدليل النهائية تعتمد على evidence acceptance مستقل.</div>
            <div className="rounded-xl border border-ink-200 bg-ink-50 p-3 text-xs text-ink-700">حالة التحقق: {report.reportVerificationState === 'VERIFIED' ? 'موثق' : report.reportVerificationState === 'GAP_DETECTED' ? 'فجوة اعتماد' : 'بانتظار الدليل'}</div>
            <div className="rounded-xl border border-ink-200 bg-ink-50 p-3 text-xs text-ink-700">Benchmark: {stateLabel(report.renderedOutput.benchmarkStatus)} — لا يتم اختلاق مقارنة عند نقص العينة.</div>
          </div>
        </div>
      </section>
    </>
  );
}

function DecisionMode({ report }: { report: SmartReportDetail }) {
  const output = report.renderedOutput;
  const [decisions, setDecisions] = useState<SourceDecisionState[]>([]);
  const [decisionAction, setDecisionAction] = useState<Record<string, string>>({});
  const [actualImpact, setActualImpact] = useState<Record<string, string>>({});
  const [workDueAt, setWorkDueAt] = useState<Record<string, string>>({});

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [auditTrace, setAuditTrace] = useState<DecisionAuditTrace[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const refreshDecisions = useCallback(async () => {
    const rows = await fetchSourceDecisionProposals(report.sourceHash);
    setDecisions(rows);
  }, [report.sourceHash]);

  const refreshAudit = useCallback(async (decision: SourceDecisionState) => {
    setAuditLoading(true);
    try {
      const rows = await fetchSourceDecisionAuditTrace(
        decision.id,
        decision.approvalId,
        decision.workItemId,
        decision.outcomeId,
      );
      setAuditTrace(rows);
    } catch {
      setAuditTrace([]);
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void refreshDecisions().catch(() => {
      if (active) setDecisions([]);
    });
    void getAuthenticatedUser().then((user) => {
      if (active) setCurrentUserId(user?.id ?? null);
    });
    return () => { active = false; };
  }, [refreshDecisions]);

  useEffect(() => {
    const latest = decisions[0];
    if (!latest) {
      setAuditTrace([]);
      return;
    }
    void refreshAudit(latest);
  }, [decisions, refreshAudit]);

  const createWorkItem = (decision: SourceDecisionState) => {
    setDecisionAction((current) => ({ ...current, [decision.id]: 'creating-work' }));
    const department = report.specialty === 'inventory'
      ? 'المخزون'
      : report.specialty === 'sales'
        ? 'المبيعات'
        : report.specialty === 'purchases'
          ? 'المشتريات'
          : report.specialty === 'receivables'
            ? 'التحصيل'
            : 'التشغيل';
    void createApprovedDecisionWorkItemForCurrentUser({
      decisionId: decision.id,
      reportJobId: report.jobId,
      sourceHash: report.sourceHash,
      signalTitle: decision.signalTitle ?? 'عنصر عمل من قرار مصدرّي',
      signalMessage: decision.signalMessage,
      signalSeverity: decision.signalSeverity,
      recommendationId: decision.recommendationId,
      evidenceSnapshotId: report.sourceAnalysis?.id ?? null,
      department,
      dueAt: workDueAt[decision.id] ? new Date(workDueAt[decision.id]).toISOString() : null,
    }).then((workItemId) => {
      setDecisionAction((current) => ({ ...current, [decision.id]: 'work-created' }));
      setDecisions((current) => current.map((item) => item.id === decision.id
        ? { ...item, workItemId, workItemStatus: 'OPEN' }
        : item));
    }).catch(() => {
      setDecisionAction((current) => ({ ...current, [decision.id]: 'work-error' }));
    });
  };

  const startWorkItem = (decision: SourceDecisionState) => {
    if (!decision.workItemId) return;
    setDecisionAction((current) => ({ ...current, [decision.id]: 'starting-work' }));
    void startSourceDecisionWorkItem(decision.workItemId).then(() => {
      setDecisionAction((current) => ({ ...current, [decision.id]: 'work-started' }));
      setDecisions((current) => current.map((item) => item.id === decision.id ? { ...item, workItemStatus: 'IN_PROGRESS' } : item));
    }).catch(() => {
      setDecisionAction((current) => ({ ...current, [decision.id]: 'start-error' }));
    });
  };

  const completeWorkItem = (decision: SourceDecisionState) => {
    if (!decision.workItemId || !report.sourceAnalysis?.id) return;
    const rawImpact = actualImpact[decision.id]?.trim() ?? '';
    const parsedImpact = rawImpact ? Number(rawImpact.replace(/,/g, '')) : null;
    if (parsedImpact != null && !Number.isFinite(parsedImpact)) {
      setDecisionAction((current) => ({ ...current, [decision.id]: 'impact-error' }));
      return;
    }
    setDecisionAction((current) => ({ ...current, [decision.id]: 'completing-work' }));
    void completeSourceDecisionWorkItem({
      workItemId: decision.workItemId,
      actualImpact: parsedImpact,
      evidenceSnapshotId: report.sourceAnalysis.id,
      reportJobId: report.jobId,
      sourceHash: report.sourceHash,
    }).then(() => {
      setDecisionAction((current) => ({ ...current, [decision.id]: 'work-completed' }));
      setDecisions((current) => current.map((item) => item.id === decision.id ? { ...item, workItemStatus: 'COMPLETED', status: 'EXECUTED' } : item));
    }).catch(() => {
      setDecisionAction((current) => ({ ...current, [decision.id]: 'complete-error' }));
    });
  };

  const requestApproval = (decision: SourceDecisionState) => {
    setDecisionAction((current) => ({ ...current, [decision.id]: 'saving' }));
    void requestSourceDecisionApproval(
      decision.id,
      'طلب موافقة على قرار مقترح مرتبط بتقرير مصدر محدد؛ لا يعني الطلب أن التنفيذ حدث.',
    ).then(async () => {
      await refreshDecisions();
      setDecisionAction((current) => ({ ...current, [decision.id]: 'requested' }));
    }).catch(() => {
      setDecisionAction((current) => ({ ...current, [decision.id]: 'error' }));
    });
  };

  const decideApproval = (decision: SourceDecisionState, approve: boolean) => {
    if (!decision.approvalId) return;
    if (decision.approvalRequestedBy && currentUserId === decision.approvalRequestedBy) {
      setDecisionAction((current) => ({ ...current, [decision.id]: 'self-approval-forbidden' }));
      return;
    }
    setDecisionAction((current) => ({ ...current, [decision.id]: approve ? 'approving' : 'rejecting' }));
    void decideSourceDecisionApproval(
      decision.approvalId,
      approve,
      approve ? 'اعتماد موثق لقرار مصدرّي' : 'رفض موثق لقرار مصدرّي',
    ).then(async () => {
      await refreshDecisions();
      setDecisionAction((current) => ({ ...current, [decision.id]: approve ? 'approved' : 'rejected' }));
    }).catch(() => {
      setDecisionAction((current) => ({ ...current, [decision.id]: 'approval-error' }));
    });
  };

  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatusCell label="Decision" value={output.decisionStatus}/>
        <StatusCell label="Approval" value={output.approvalStatus}/>
        <StatusCell label="Action" value={output.actionStatus}/>
        <StatusCell label="Outcome" value={output.outcomeStatus}/>
        <StatusCell label="Learning" value={output.learningStatus}/>
      </section>
      <ReportIntelligencePanel report={report} />

      <section className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[9px] font-black tracking-[.12em] text-primary-700">GOVERNED DECISIONS</div>
            <h2 className="mt-1 text-lg font-black text-ink-950">القرارات المقترحة والتنفيذ المرتبط بهذا المصدر</h2>
            <p className="mt-1 text-[10px] leading-5 text-ink-500">المسار المحكوم: مقترح → موافقة → عنصر عمل → بدء → إغلاق بدليل. لا يوجد تنفيذ تلقائي ولا انتقال صامت بين الحالات.</p>
          </div>
          <span className="rounded-full bg-ink-50 px-2.5 py-1 text-[9px] font-black text-ink-600">{formatNumber(decisions.length)}</span>
        </div>

        <div className="mt-4 space-y-3">
          {decisions.length ? decisions.map((decision) => (
            <article key={decision.id} className="rounded-xl border border-ink-200 bg-ink-50/70 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-ink-900">{decision.signalTitle ?? decision.decisionKey}</span>
                    <span className="rounded-full bg-white px-2 py-1 text-[9px] font-bold text-ink-600">{stateLabel(decision.status)}</span>
                    {decision.workItemStatus && <span className="rounded-full bg-primary-50 px-2 py-1 text-[9px] font-bold text-primary-800">Work: {decision.workItemStatus}</span>}
                    {decision.outcomeStatus && <span className="rounded-full bg-success-50 px-2 py-1 text-[9px] font-bold text-success-800">Outcome: {decision.outcomeStatus}</span>}
                  </div>
                  <p className="mt-1 text-[10px] leading-5 text-ink-600">{decision.signalMessage ?? 'إشارة مصدرية مرتبطة بهذا القرار.'}</p>
                  {(decision.actualImpact != null || decision.expectedImpact != null || decision.outcomeStatus) && (
                    <div className="mt-2 flex flex-wrap gap-3 text-[9px] text-ink-500">
                      <span>المتوقع: {decision.expectedImpact == null ? 'غير متاح' : formatNumber(decision.expectedImpact)}</span>
                      <span>الفعلي: {decision.actualImpact == null ? 'غير متاح' : formatNumber(decision.actualImpact)}</span>
                      <span>التعلم: {decision.outcomeStatus ?? 'غير مسجل'}</span>
                      {decision.outcomeQuality != null && <span>جودة النتيجة: {formatNumber(decision.outcomeQuality)}</span>}
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2 text-[8px] text-ink-400">
                    <span className="font-mono">decision={decision.id}</span>
                    {decision.workItemId && <span className="font-mono">work={decision.workItemId}</span>}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  {decision.status === 'PROPOSED' && decision.approvalStatus !== 'PENDING' && (
                    <button type="button" disabled={decisionAction[decision.id] === 'saving'} onClick={() => requestApproval(decision)} className="btn-primary text-[10px] disabled:opacity-50" data-testid={'request-approval-' + decision.id}>
                      {decisionAction[decision.id] === 'saving' ? 'جارٍ طلب الموافقة...' : decisionAction[decision.id] === 'requested' ? 'تم طلب الموافقة' : 'طلب الموافقة'}
                    </button>
                  )}

                  {decision.status === 'PROPOSED' && decision.approvalStatus === 'PENDING' && (
                    currentUserId === decision.approvalRequestedBy ? (
                      <span className="rounded-lg border border-warning-200 bg-warning-50 px-2.5 py-2 text-[9px] font-black text-warning-900">PENDING · بانتظار صاحب صلاحية آخر — يمنع الاعتماد الذاتي</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => decideApproval(decision, true)} disabled={!decision.approvalId || decisionAction[decision.id] === 'approving'} className="btn-primary text-[10px] disabled:opacity-50" data-testid={'approve-decision-' + decision.id}>
                          {decisionAction[decision.id] === 'approving' ? 'جارٍ الاعتماد...' : 'اعتماد القرار'}
                        </button>
                        <button type="button" onClick={() => decideApproval(decision, false)} disabled={!decision.approvalId || decisionAction[decision.id] === 'rejecting'} className="btn-secondary text-[10px] disabled:opacity-50" data-testid={'reject-decision-' + decision.id}>
                          {decisionAction[decision.id] === 'rejecting' ? 'جارٍ الرفض...' : 'رفض القرار'}
                        </button>
                      </div>
                    )
                  )}

                  {decision.status === 'APPROVED' && !decision.workItemId && (
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-ink-200 bg-white px-2.5 text-[9px] font-bold text-ink-600">
                        الموعد
                        <input
                          type="date"
                          value={workDueAt[decision.id] ?? ''}
                          onChange={(event) => setWorkDueAt((current) => ({ ...current, [decision.id]: event.target.value }))}
                          className="bg-transparent outline-none"
                          aria-label="موعد عنصر العمل"
                        />
                      </label>
                      <button type="button" disabled={decisionAction[decision.id] === 'creating-work'} onClick={() => createWorkItem(decision)} className="btn-primary text-[10px] disabled:opacity-50" data-testid={'create-work-' + decision.id}>
                        {decisionAction[decision.id] === 'creating-work' ? 'جارٍ إنشاء عنصر العمل...' : 'إنشاء عنصر عمل لي'}
                      </button>
                    </div>
                  )}

                  {decision.workItemStatus === 'OPEN' && decision.workItemId && (
                    <button type="button" disabled={decisionAction[decision.id] === 'starting-work'} onClick={() => startWorkItem(decision)} className="btn-secondary text-[10px] disabled:opacity-50" data-testid={'start-work-' + decision.id}>
                      {decisionAction[decision.id] === 'starting-work' ? 'جارٍ بدء التنفيذ...' : 'بدء التنفيذ'}
                    </button>
                  )}

                  {decision.workItemStatus === 'IN_PROGRESS' && decision.workItemId && (
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        inputMode="decimal"
                        value={actualImpact[decision.id] ?? ''}
                        onChange={(event) => setActualImpact((current) => ({ ...current, [decision.id]: event.target.value }))}
                        placeholder="الأثر الفعلي (اختياري)"
                        aria-label="الأثر الفعلي"
                        className="min-h-9 w-44 rounded-lg border border-ink-200 bg-white px-2.5 text-[10px] outline-none focus:border-primary-400"
                      />
                      <button type="button" disabled={decisionAction[decision.id] === 'completing-work'} onClick={() => completeWorkItem(decision)} className="btn-primary text-[10px] disabled:opacity-50" data-testid={'complete-work-' + decision.id}>
                        {decisionAction[decision.id] === 'completing-work' ? 'جارٍ إغلاق التنفيذ...' : 'إغلاق التنفيذ'}
                      </button>
                    </div>
                  )}

                  {decision.workItemStatus === 'COMPLETED' && (
                    <span className="rounded-lg bg-success-50 px-2.5 py-2 text-[9px] font-black text-success-800">اكتمل التنفيذ والنتيجة مسجلة</span>
                  )}
                </div>
              </div>

              {decisionAction[decision.id] === 'start-error' && <div className="mt-3 text-[9px] font-bold text-danger-700">تعذر بدء التنفيذ؛ تحقق من المكلّف وحالة القرار.</div>}
              {decisionAction[decision.id] === 'impact-error' && <div className="mt-3 text-[9px] font-bold text-danger-700">الأثر الفعلي يجب أن يكون رقمًا صالحًا.</div>}
              {decisionAction[decision.id] === 'complete-error' && <div className="mt-3 text-[9px] font-bold text-danger-700">تعذر إغلاق التنفيذ؛ يحتاج المسار إلى قرار معتمد ودليل مصدر صالح.</div>}
              {decisionAction[decision.id] === 'work-error' && <div className="mt-3 text-[9px] font-bold text-danger-700">تعذر إنشاء عنصر العمل؛ تحقق من الصلاحية وأن القرار معتمد.</div>}
              {decisionAction[decision.id] === 'error' && <div role="alert" className="mt-3 text-[9px] font-bold text-danger-700">تعذر طلب الموافقة؛ الصلاحية أو حالة القرار تحتاج مراجعة.</div>}
              {decisionAction[decision.id] === 'approval-error' && <div role="alert" className="mt-3 text-[9px] font-bold text-danger-700">تعذر اعتماد/رفض القرار؛ تحقق من الصلاحية وحالة الموافقة.</div>}
              {decision.status === 'REJECTED' && <div className="mt-3 rounded-lg border border-danger-200 bg-danger-50 p-3 text-[9px] font-bold text-danger-800">REJECTED · القرار لم ينتقل إلى التنفيذ.</div>}
              {decision.workItemStatus === 'IN_PROGRESS' && (
                <div className="mt-3 rounded-lg border border-warning-200 bg-warning-50 p-3 text-[9px] leading-5 text-warning-900">
                  دليل الإغلاق المرتبط بهذا التقرير: {report.sourceAnalysis?.id ?? 'غير متاح'} — لا يمكن إغلاق المهمة دون دليل مقبول.
                </div>
              )}
            </article>
          )) : (
            <div className="rounded-xl border border-ink-200 bg-ink-50 p-4 text-[10px] text-ink-600">لا توجد قرارات مصدرية محفوظة بعد لهذا المصدر.</div>
          )}
        </div>
      </section>

      <section id="decision-evidence-inspector" className="rounded-[18px] border border-primary-200 bg-primary-50/40 p-5 shadow-sm" aria-label="مفتش القرار والدليل">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="section-kicker">EVIDENCE / DECISION INSPECTOR</div>
            <h3 className="mt-1 text-lg font-black text-ink-950">سلسلة التتبع الكاملة</h3>
            <p className="mt-1 text-[10px] leading-5 text-ink-600">كل عقدة هنا تأتي من سجل canonical مرتبط بنفس المصدر والمستأجر؛ عند غياب العقدة تظهر كغير متاح بدل إنشاء قيمة بديلة.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={'/reports/smart/' + report.jobId + '?sourceHash=' + encodeURIComponent(report.sourceHash)} className="btn-secondary text-[9px]">فتح المصدر</Link>
            <Link to={'/decision-experience?reportJobId=' + report.jobId + '&sourceHash=' + encodeURIComponent(report.sourceHash) + '&stage=evidence'} className="btn-primary text-[9px]">فتح تجربة القرار</Link>
          </div>
        </div>

        {decisions[0] ? (() => {
          const traced = decisions[0];
          const nodes = [
            {
              key: 'source',
              label: 'Source Report',
              value: report.sourceHash.slice(0, 24) + '…',
              detail: report.sourceAnalysis?.id ? 'Evidence Snapshot: ' + report.sourceAnalysis.id : 'Evidence Snapshot: غير متاح',
              tone: report.sourceAnalysis?.id ? 'success' : 'warning',
            },
            {
              key: 'recommendation',
              label: 'Recommendation',
              value: traced.recommendationTitle ?? traced.recommendationId ?? 'غير متاح',
              detail: traced.recommendationId
                ? 'id=' + traced.recommendationId + ' · ' + (traced.recommendationStatus ?? 'غير متاح')
                : 'لا يوجد Recommendation مرتبط',
              tone: traced.recommendationId ? 'success' : 'warning',
            },
            {
              key: 'decision',
              label: 'Decision',
              value: traced.signalTitle ?? traced.decisionKey,
              detail: 'id=' + traced.id + ' · ' + traced.status,
              tone: 'primary',
            },
            {
              key: 'approval',
              label: 'Approval',
              value: traced.approvalStatus ?? 'غير متاح',
              detail: traced.approvalId ? 'id=' + traced.approvalId : 'لم يُطلب اعتماد بعد',
              tone: traced.approvalStatus === 'APPROVED' ? 'success' : traced.approvalStatus === 'PENDING' ? 'warning' : 'neutral',
            },
            {
              key: 'work',
              label: 'Action / Work',
              value: traced.workItemStatus ?? 'غير متاح',
              detail: traced.workItemId ? 'id=' + traced.workItemId : 'لا يوجد عنصر عمل',
              tone: traced.workItemStatus === 'COMPLETED' ? 'success' : traced.workItemStatus === 'IN_PROGRESS' ? 'primary' : 'neutral',
            },
            {
              key: 'outcome',
              label: 'Outcome',
              value: traced.outcomeStatus ?? 'NOT AVAILABLE',
              detail: traced.outcomeId
                ? 'id=' + traced.outcomeId + ' · Evidence: ' + (traced.outcomeEvidenceSnapshotId ?? 'غير متاح')
                : 'لا توجد نتيجة محفوظة بعد',
              tone: traced.outcomeStatus === 'positive' ? 'success' : traced.outcomeStatus === 'negative' ? 'danger' : traced.outcomeStatus ? 'warning' : 'neutral',
            },
          ] as const;

          return (
            <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {nodes.map((node) => (
                <article key={node.key} className="rounded-xl border border-ink-200 bg-white p-3">
                  <div className="flex items-center gap-2">
                    <span className={'h-2 w-2 rounded-full ' + (
                      node.tone === 'success' ? 'bg-success-500' :
                      node.tone === 'warning' ? 'bg-warning-500' :
                      node.tone === 'danger' ? 'bg-danger-500' :
                      node.tone === 'primary' ? 'bg-primary-500' :
                      'bg-ink-300'
                    )}/>
                    <span className="text-[9px] font-black text-ink-500">{node.label}</span>
                  </div>
                  <div className="mt-2 break-words text-[11px] font-black text-ink-900">{node.value}</div>
                  <div className="mt-1 break-all text-[9px] leading-5 text-ink-500">{node.detail}</div>
                </article>
              ))}
            </div>
          );
        })() : (
          <div className="mt-4 rounded-xl border border-dashed border-ink-200 bg-white p-5 text-center text-[10px] text-ink-500">
            لا يوجد Decision مرتبط بهذا المصدر حتى الآن؛ تبقى السلسلة عند Evidence ولا يتم اختراع Recommendation أو Action.
          </div>
        )}
      </section>

      <section className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck size={19} className="mt-0.5 text-primary-700"/>
          <div>
            <div className="text-[9px] font-black tracking-[.12em] text-primary-700">DECISION EVIDENCE</div>
            <h2 className="mt-1 text-xl font-black">مسار القرار لهذا التقرير فقط</h2>
            <p className="mt-2 text-sm leading-7 text-ink-600">
              القرار الحالي: <strong>{stateLabel(output.decisionStatus)}</strong>. الموافقة: <strong>{stateLabel(output.approvalStatus)}</strong>. التنفيذ: <strong>{stateLabel(output.actionStatus)}</strong>. النتيجة: <strong>{stateLabel(output.outcomeStatus)}</strong>.
            </p>
            <p className="mt-2 text-xs leading-6 text-ink-500">لن تظهر توصيات أو تنبيهات عامة للشركة هنا ما لم يوجد ارتباط مصدرّي مثبت بها.</p>
          </div>
        </div>
      </section>
      <section className="grid gap-3 sm:grid-cols-2">
        <StatusCell label="Learning" value={output.learningStatus}/>
        <StatusCell label="Replay" value={output.replayStatus}/>
        <StatusCell label="Benchmark" value={output.benchmarkStatus}/>
        <StatusCell label="Evidence" value={report.evidenceStatus}/>
      </section>
      <Link to={'/decision-experience?reportJobId=' + report.jobId + '&sourceHash=' + encodeURIComponent(report.sourceHash) + '&stage=evidence'} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-ink-950 px-4 text-xs font-black text-white">فتح مسار القرار <ArrowLeft size={13}/></Link>
      <section className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-sm" aria-label="سجل نشاط القرار">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[9px] font-black tracking-[.12em] text-primary-700">ACTIVITY / AUDIT</div>
            <h3 className="mt-1 text-lg font-black text-ink-950">سجل ما حدث للقرار</h3>
            <p className="mt-1 text-[10px] leading-5 text-ink-500">الخط الزمني يقرأ من audit_logs للقرار والموافقة والعمل والنتيجة؛ لا يصنع نشاطًا محليًا بديلًا.</p>
          </div>
          <button type="button" onClick={() => decisions[0] && void refreshAudit(decisions[0])} disabled={auditLoading} className="btn-secondary text-[10px] disabled:opacity-50">
            {auditLoading ? 'جارٍ القراءة...' : 'تحديث السجل'}
          </button>
        </div>
        {auditTrace.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-ink-200 bg-ink-50/60 p-4 text-[10px] text-ink-500">لا يوجد نشاط تدقيق متاح لهذا المسار حتى الآن.</div>
        ) : (
          <ol className="mt-4 space-y-2">
            {auditTrace.slice(-12).reverse().map((event) => (
              <li key={event.id} className="rounded-xl border border-ink-100 bg-ink-50/60 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-2 py-1 text-[9px] font-black text-ink-700">{event.action}</span>
                  <span className="text-[9px] text-ink-400">{event.entityType}</span>
                  <span className="mr-auto text-[9px] text-ink-400">{new Date(event.createdAt).toLocaleString('ar-YE')}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-2 text-[9px] text-ink-500">
                  <span>المصدر: {event.source ?? 'غير متاح'}</span>
                  <span>الفاعل: {event.userLabel ?? 'غير متاح'}</span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}

function WorkMode({ report }: { report: SmartReportDetail }) {
  const lastStage = report.stages.length ? report.stages[report.stages.length - 1] : null;
  return (
    <>
      <ReportIntelligencePanel report={report} />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatusCell label="Job" value={report.checkpointStage ?? lastStage?.status}/>
        <StatusCell label="Action" value={report.renderedOutput.actionStatus}/>
        <StatusCell label="Outcome" value={report.renderedOutput.outcomeStatus}/>
        <StatusCell label="Learning" value={report.renderedOutput.learningStatus}/>
      </section>
      <section className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-sm">
        <div className="text-[9px] font-black tracking-[.12em] text-primary-700">DURABLE LIFECYCLE</div>
        <div className="mt-4 space-y-2">
          {report.stages.length ? report.stages.map((stage) => {
            const completed = stage.status === 'completed';
            const failed = stage.status === 'failed';
            return <div key={stage.ordinal} className="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50/50 p-3">
              {completed ? <CheckCircle2 size={16} className="shrink-0 text-success-700"/> : failed ? <XCircle size={16} className="shrink-0 text-danger-700"/> : <Clock3 size={16} className="shrink-0 text-ink-400"/>}
              <div className="min-w-0 flex-1"><div className="text-xs font-black">{stage.ordinal}. {STAGE_LABELS[stage.stage] ?? stage.stage}</div><div className="text-[10px] text-ink-500">{stage.status} · attempt {stage.attempt}</div></div>
              <div className="text-[10px] text-ink-400">{stage.completedAt ? new Date(stage.completedAt).toLocaleString('ar-YE') : 'غير مكتمل'}</div>
            </div>;
          }) : <div className="rounded-xl border border-warning-200 bg-warning-50 p-4 text-xs text-warning-900">لا توجد مراحل محفوظة لهذا التقرير.</div>}
        </div>
      </section>
      <section className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2"><FileSearch size={17} className="text-primary-700"/><h2 className="text-lg font-black">حد التنفيذ</h2></div>
        <p className="mt-2 text-xs leading-6 text-ink-600">اكتمال مراحل استيراد التقرير لا يعني وجود Action أو Outcome. التنفيذ التجاري يحتاج سجلًا مستقلًا؛ غيابه يبقى معلنًا.</p>


      </section>
    </>
  );
}

export function SourceBoundReportSurface({ mode, jobId, expectedSourceHash }: { mode: SourceBoundReportMode; jobId: string; expectedSourceHash?: string | null }) {
  const [report, setReport] = useState<SmartReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchSmartReport(jobId);
      if (!next) throw new Error('REPORT_SOURCE_NOT_FOUND');
      if (expectedSourceHash && next.sourceHash !== expectedSourceHash) throw new Error('REPORT_SOURCE_HASH_MISMATCH');
      setReport(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  }, [jobId, expectedSourceHash]);

  useEffect(() => {
    let active = true;
    void fetchSmartReport(jobId).then((next) => {
      if (!active) return;
      if (!next) throw new Error('REPORT_SOURCE_NOT_FOUND');
      if (expectedSourceHash && next.sourceHash !== expectedSourceHash) throw new Error('REPORT_SOURCE_HASH_MISMATCH');
      setReport(next);
    }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : String(cause));
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [jobId, expectedSourceHash]);

  const body = useMemo(() => {
    if (!report) return null;
    if (mode === 'executive') return <ExecutiveMode report={report}/>;
    if (mode === 'trust') return <TrustMode report={report}/>;
    if (mode === 'decision') return <DecisionMode report={report}/>;
    return <WorkMode report={report}/>;
  }, [mode, report]);

  if (loading) return <div dir="rtl"><LoadingState message="جارٍ تحميل النتيجة المصدرية..." /></div>;
  if (error) return <div dir="rtl"><ErrorState message={error} onRetry={() => void loadReport()} /></div>;
  if (!report) return null;

  return (
    <div dir="rtl" className="space-y-5 animate-fade-in pb-10">
      <SourceHeader report={report}/>
      {body}
    </div>
  );
}