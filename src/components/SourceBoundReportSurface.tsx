import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock3, FileSearch, ShieldCheck, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ErrorState, LoadingState } from '@/components/ui/States';
import { fetchSmartReport, type SmartReportDetail } from '@/lib/report-smart';
import { formatCurrency, formatNumber } from '@/lib/format';

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
            <span>الدليل: {stateLabel(report.evidenceStatus)}</span>
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
        <StatusCell label="Truth" value={report.trustState}/>
        <StatusCell label="Evidence" value={report.evidenceStatus}/>
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
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatusCell label="Truth" value={report.trustState}/>
        <StatusCell label="Evidence" value={report.evidenceStatus}/>
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
            <div className="rounded-xl border border-warning-200 bg-warning-50 p-3 text-xs text-warning-900">وجود المصدر وحده لا يعني وجود قرار أو تنفيذ أو نتيجة لاحقة.</div>
            <div className="rounded-xl border border-ink-200 bg-ink-50 p-3 text-xs text-ink-700">Benchmark: {stateLabel(report.renderedOutput.benchmarkStatus)} — لا يتم اختلاق مقارنة عند نقص العينة.</div>
          </div>
        </div>
      </section>
    </>
  );
}

function DecisionMode({ report }: { report: SmartReportDetail }) {
  const output = report.renderedOutput;
  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatusCell label="Decision" value={output.decisionStatus}/>
        <StatusCell label="Approval" value={output.approvalStatus}/>
        <StatusCell label="Action" value={output.actionStatus}/>
        <StatusCell label="Outcome" value={output.outcomeStatus}/>
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
    </>
  );
}

function WorkMode({ report }: { report: SmartReportDetail }) {
  const lastStage = report.stages.length ? report.stages[report.stages.length - 1] : null;
  return (
    <>
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

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
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
  if (error) return <div dir="rtl"><ErrorState message={error} onRetry={() => window.location.reload()} /></div>;
  if (!report) return null;

  return (
    <div dir="rtl" className="space-y-5 animate-fade-in pb-10">
      <SourceHeader report={report}/>
      {body}
    </div>
  );
}
