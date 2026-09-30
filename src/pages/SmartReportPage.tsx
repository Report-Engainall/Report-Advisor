import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, FileSearch, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState, LoadingState, PageHeader } from '@/components/ui/States';
import { fetchSmartReport, type SmartReportDetail } from '@/lib/report-smart';
import { formatNumber } from '@/lib/format';

function textValue(value: unknown): string {
  if (value == null || value === '') return 'غير متاح';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

function stateLabel(value: string | null): string {
  const labels: Record<string, string> = {
    TRUSTED: 'موثوق',
    REVIEW: 'مراجعة',
    BLOCKED: 'محظور',
    VERIFIED: 'موثق',
    AWAITING_EVIDENCE_SNAPSHOT: 'بانتظار لقطة الدليل',
    AVAILABLE_FROM_CANONICAL_ANALYSIS: 'متاح من التحليل الكانوني',
    NOT_COMMITTED: 'غير معتمد',
    NO_DECISION_COMMITTED: 'لا قرار معتمد',
    NO_ACTION_COMMITTED: 'لا إجراء معتمد',
    NOT_AVAILABLE: 'غير متاح',
    INSUFFICIENT_SAMPLE: 'عينة غير كافية',
  };
  return value ? (labels[value] ?? value) : 'غير متاح';
}

function statusTone(value: string | null): string {
  if (value === 'TRUSTED' || value === 'VERIFIED') return 'border-success-200 bg-success-50 text-success-900';
  if (value === 'REVIEW' || value === 'AWAITING_EVIDENCE_SNAPSHOT') return 'border-warning-200 bg-warning-50 text-warning-900';
  return 'border-ink-200 bg-ink-50 text-ink-700';
}

export function SmartReportPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [report, setReport] = useState<SmartReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    void fetchSmartReport(jobId ?? '').then((next) => {
      if (active) setReport(next);
    }).catch((reason) => {
      if (active) setError(reason instanceof Error ? reason.message : String(reason));
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [jobId]);

  const dataset = useMemo(() => {
    const first = report?.sourceAnalysis?.datasets?.[0];
    return first && typeof first === 'object' ? first as Record<string, unknown> : null;
  }, [report]);

  const previewRows = useMemo(() => {
    const preview = dataset?.preview;
    return Array.isArray(preview) ? preview.slice(0, 10).filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object') : [];
  }, [dataset]);

  const columns = useMemo(() => {
    const first = previewRows[0];
    return first ? Object.keys(first).slice(0, 8) : [];
  }, [previewRows]);

  if (loading) return <div dir="rtl"><LoadingState message="جارٍ بناء التقرير الذكي من المصدر الحقيقي..." /></div>;
  if (error) return <div dir="rtl" className="space-y-5"><PageHeader title="التقرير الذكي" subtitle="تعذر قراءة نتيجة التقرير المربوطة بالمصدر." /><ErrorState message={error} onRetry={() => window.location.reload()} /></div>;
  if (!report) return <div dir="rtl" className="space-y-5"><PageHeader title="التقرير الذكي" subtitle="التقرير المطلوب غير موجود أو غير مكتمل." /><div className="rounded-2xl border border-warning-200 bg-warning-50 p-5 text-sm text-warning-900">لا توجد مخرجات ذكية مثبتة لهذا التقرير.</div></div>;

  const output = report.renderedOutput;
  const outputs = Array.isArray(output.outputs) ? output.outputs.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object') : [];
  const surfaceLinks = outputs.filter((item) => typeof item.path === 'string');
  const decisionKeys = ['recommendationStatus','decisionStatus','approvalStatus','actionStatus','outcomeStatus','learningStatus','benchmarkStatus','replayStatus'];

  return <div dir="rtl" className="report-page space-y-5 animate-fade-in pb-10">
    <PageHeader
      title={report.sourcePath}
      subtitle="تقرير ذكي مربوط بالبصمة الأصلية، وليس نسخة تجريبية أو تقريرًا عامًا."
      actions={<Link to="/reports" className="btn-secondary inline-flex items-center gap-2 text-xs"><ArrowLeft size={14}/> مركز التقارير</Link>}
    />

    <section className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl bg-ink-950 p-4 text-white"><div className="text-[9px] font-black tracking-[.12em] text-primary-200">TRUST</div><div className="mt-2 text-xl font-black">{stateLabel(report.trustState)}</div><div className="mt-1 text-[10px] text-ink-300">جودة: {report.qualityScore == null ? 'غير متاح' : report.qualityScore + '%'}</div></div>
        <div className="rounded-2xl bg-ink-50 p-4"><div className="text-[9px] font-black tracking-[.12em] text-ink-500">SOURCE</div><div className="mt-2 font-black text-ink-950">{report.sourceHash.slice(0, 24)}…</div><div className="mt-1 text-[10px] text-ink-500">نوع الملف: {report.sourceAnalysis?.sourceFormat ?? 'غير متاح'}</div></div>
        <div className="rounded-2xl bg-ink-50 p-4"><div className="text-[9px] font-black tracking-[.12em] text-ink-500">ROWS</div><div className="mt-2 text-xl font-black text-ink-950">{report.rowCount == null ? 'غير متاح' : formatNumber(report.rowCount)}</div><div className="mt-1 text-[10px] text-ink-500">الحالة: {report.checkpointStage ?? 'غير متاح'}</div></div>
        <div className="rounded-2xl bg-ink-50 p-4"><div className="text-[9px] font-black tracking-[.12em] text-ink-500">SPECIALTY</div><div className="mt-2 text-xl font-black text-ink-950">{report.specialty ?? 'عام'}</div><div className="mt-1 text-[10px] text-ink-500">التخصص يظهر فقط عند توفر دليل كافٍ من المصدر.</div></div>
      </div>
    </section>

    <section className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
      <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-primary-600"/><div><div className="section-kicker">TRUTH → EVIDENCE → SIGNAL → INTELLIGENCE</div><h2 className="mt-1 text-lg font-black text-ink-950">حالة التقرير الذكي</h2></div></div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {(['evidenceStatus','signalStatus','intelligenceStatus'] as const).map((key) => {
          const value = output[key] == null ? null : String(output[key]);
          return <div key={key} className={'rounded-xl border p-4 ' + statusTone(value)}><div className="text-[10px] font-black">{key}</div><div className="mt-2 text-sm font-bold">{stateLabel(value)}</div></div>;
        })}
      </div>
    </section>

    <section className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
      <div className="flex items-center gap-2"><FileSearch size={18} className="text-primary-600"/><div><div className="section-kicker">DECISION → ACTION → OUTCOME → LEARNING → BENCHMARK</div><h2 className="mt-1 text-lg font-black">ما الذي ثبت وما الذي لم يُثبت</h2></div></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {decisionKeys.map((key) => <div key={key} className="rounded-xl border border-ink-100 bg-ink-50/70 p-4"><div className="text-[10px] font-black text-ink-500">{key}</div><div className="mt-2 text-sm font-bold text-ink-900">{stateLabel(output[key] == null ? null : String(output[key]))}</div></div>)}
      </div>
    </section>

    <section className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
      <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-primary-600"/><div><div className="section-kicker">RENDERED SURFACES</div><h2 className="mt-1 text-lg font-black">الأسطح التي أنشأها مسار التقرير</h2></div></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {surfaceLinks.map((surface, index) => <Link key={String(surface.key ?? index)} to={String(surface.path)} className="rounded-xl border border-ink-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-sm">
          <div className="text-[9px] font-black tracking-[.12em] text-primary-700">{String(surface.stage ?? 'OUTPUT')}</div>
          <div className="mt-2 text-sm font-black text-ink-950">{String(surface.label ?? surface.key ?? 'سطح')}</div>
          <div className="mt-2 text-[10px] text-ink-500">sourceBound={String(surface.sourceBound)} · hash={String(surface.sourceHash).slice(0, 14)}…</div>
        </Link>)}
      </div>
    </section>

    <section className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
      <div className="flex items-center justify-between gap-3"><div><div className="section-kicker">CANONICAL SOURCE</div><h2 className="mt-1 text-lg font-black">عينة فعلية من التقرير</h2></div><div className="text-[10px] text-ink-500">{formatNumber(previewRows.length)} صفوف معروضة من العينة</div></div>
      {previewRows.length === 0 ? <div className="mt-4 rounded-xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-900">لا توجد عينة صفوف في لقطة التحليل؛ لا يتم اختلاقها.</div> : <div className="mt-4 overflow-x-auto rounded-xl border border-ink-200"><table className="min-w-full text-right text-[11px]"><thead className="bg-ink-50"><tr>{columns.map((column) => <th key={column} className="whitespace-nowrap px-3 py-2 font-black text-ink-600">{column}</th>)}</tr></thead><tbody>{previewRows.map((row, index) => <tr key={index} className="border-t border-ink-100">{columns.map((column) => <td key={column} className="max-w-[240px] truncate whitespace-nowrap px-3 py-2 text-ink-800">{textValue(row[column])}</td>)}</tr>)}</tbody></table></div>}
    </section>

    <section className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
      <div className="text-[9px] font-black tracking-[.12em] text-ink-500">PROVENANCE</div>
      <dl className="mt-3 grid gap-3 text-[11px] sm:grid-cols-2">
        <div><dt className="font-bold text-ink-500">Job</dt><dd className="mt-1 break-all font-mono text-ink-900">{report.jobId}</dd></div>
        <div><dt className="font-bold text-ink-500">Import</dt><dd className="mt-1 break-all font-mono text-ink-900">{report.importId ?? 'غير متاح'}</dd></div>
        <div><dt className="font-bold text-ink-500">Source hash</dt><dd className="mt-1 break-all font-mono text-ink-900">{report.sourceHash}</dd></div>
        <div><dt className="font-bold text-ink-500">Analysis snapshot</dt><dd className="mt-1 break-all font-mono text-ink-900">{report.sourceAnalysis?.id ?? 'غير متاح'}</dd></div>
      </dl>
    </section>
  </div>;
}
