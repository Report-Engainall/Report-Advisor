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
    PENDING_EVIDENCE: 'بانتظار الدليل',
    GAP_DETECTED: 'فجوة اعتماد مكتشفة',
  };
  return value ? (labels[value] ?? value) : 'غير متاح';
}

type SmartColumn = {
  name?: string;
  dataType?: string;
  nullCount?: number;
  mappingConfidence?: number;
  statistics?: { sum?: number; mean?: number; min?: number; max?: number; count?: number };
  mappedField?: string | null;
};

function numberValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value.replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeKey(value: unknown): string {
  return String(value ?? '').trim().toLowerCase().normalize('NFKC').replace(/[\s_\-]+/g, '');
}

function formatMetric(value: number | null): string {
  return value == null ? 'غير متاح' : new Intl.NumberFormat('ar-YE', { maximumFractionDigits: 2 }).format(value);
}

function buildSmartAnalysis(report: SmartReportDetail | null) {
  const dataset = report?.sourceAnalysis?.datasets?.[0];
  const objectDataset = dataset && typeof dataset === 'object' ? dataset as Record<string, unknown> : null;
  const columns = Array.isArray(objectDataset?.columns)
    ? objectDataset.columns.filter((row): row is SmartColumn => Boolean(row) && typeof row === 'object')
    : [];
  const preview = Array.isArray(objectDataset?.preview)
    ? objectDataset.preview.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object')
    : [];

  const numeric = columns
    .map(column => ({ column, sum: numberValue(column.statistics?.sum), mean: numberValue(column.statistics?.mean) }))
    .filter(item => item.sum != null || item.mean != null);

  const completeness = report?.rowCount && columns.length
    ? Math.round(
        Math.max(0, 100 - (
          columns.reduce((sum, column) => sum + Math.min(report.rowCount ?? 0, Math.max(0, Number(column.nullCount ?? 0))), 0)
          / Math.max(1, (report.rowCount ?? 0) * columns.length)
        ) * 100)
      )
    : null;

  const findColumn = (...names: string[]) =>
    columns.find(column => {
      const key = normalizeKey(column.mappedField ?? column.name);
      return names.some(name => key.includes(normalizeKey(name)));
    });

  const amountColumn = findColumn('outstanding_balance', 'local_amount', 'total_amount', 'total', 'net_amount', 'amount', 'value');
  const age120Column = findColumn('age_over_120', 'over_120');
  const age30Column = findColumn('age_0_30', '0_30', 'age030');
  const paidColumn = findColumn('paid_amount', 'paid');
  const quantityColumn = findColumn('quantity', 'qty', 'stock', 'current_stock');
  const customerColumn = findColumn('customer_name', 'customer', 'client');
  const productColumn = findColumn('product_name', 'product', 'item', 'sku');

  const topRows = preview
    .map(row => ({
      name: String(row[customerColumn?.name ?? ''] ?? row[productColumn?.name ?? ''] ?? row.name ?? 'غير مسمى'),
      value: numberValue(
        row[amountColumn?.name ?? ''] ??
        row.outstanding_balance ??
        row.local_amount ??
        row.total ??
        row.amount ??
        row.value
      ),
    }))
    .filter(row => row.value != null)
    .sort((a, b) => Number(b.value) - Number(a.value))
    .slice(0, 5);

  const metrics = [
    {
      label: report?.specialty === 'receivables' ? 'إجمالي الرصيد المستحق' : 'أهم قيمة مالية',
      value: formatMetric(amountColumn?.statistics?.sum == null ? null : Number(amountColumn.statistics.sum)),
      detail: amountColumn?.mappedField ?? amountColumn?.name ?? 'غير متاح',
    },
    {
      label: 'عدد الصفوف',
      value: formatMetric(report?.rowCount == null ? null : report.rowCount),
      detail: 'المصدر الكانوني',
    },
    {
      label: 'اكتمال البيانات',
      value: completeness == null ? 'غير متاح' : `${completeness}%`,
      detail: 'محسوب من القيم غير الفارغة',
    },
    {
      label: report?.specialty === 'receivables' ? 'أكثر من 120 يومًا' : 'مؤشر عددي رئيسي',
      value: formatMetric(age120Column?.statistics?.sum == null ? (numeric[0]?.sum ?? null) : Number(age120Column.statistics.sum)),
      detail: age120Column?.mappedField ?? age120Column?.name ?? (numeric[0]?.column.mappedField ?? numeric[0]?.column.name ?? 'غير متاح'),
    },
  ];

  if (report?.specialty === 'receivables' && age30Column) {
    metrics.push({
      label: '0–30 يومًا',
      value: formatMetric(numberValue(age30Column.statistics?.sum)),
      detail: age30Column.mappedField ?? age30Column.name ?? 'age_0_30',
    });
  } else if (report?.specialty === 'inventory' && quantityColumn) {
    metrics.push({
      label: 'الكمية',
      value: formatMetric(numberValue(quantityColumn.statistics?.sum)),
      detail: quantityColumn.mappedField ?? quantityColumn.name ?? 'quantity',
    });
  } else if (paidColumn) {
    metrics.push({
      label: 'المدفوع',
      value: formatMetric(numberValue(paidColumn.statistics?.sum)),
      detail: paidColumn.mappedField ?? paidColumn.name ?? 'paid_amount',
    });
  }

  return { columns, preview, numeric, completeness, metrics, topRows };
}

function reportVerificationLabel(value: string): string {
  if (value === 'VERIFIED') return 'Verified';
  if (value === 'GAP_DETECTED') return 'Gap Detected';
  return 'Pending Evidence';
}

function EvidenceInspector({ report }: { report: SmartReportDetail }) {
  const gap = report.canonicalCommitGap ?? 0;
  const verification = report.reportVerificationState;
  const verificationClass = verification === 'VERIFIED'
    ? 'border-success-200 bg-success-50 text-success-900'
    : verification === 'GAP_DETECTED'
      ? 'border-danger-200 bg-danger-50 text-danger-900'
      : 'border-warning-200 bg-warning-50 text-warning-900';
  return (
    <section className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="section-kicker">EVIDENCE INSPECTOR</div>
          <h2 className="mt-1 text-lg font-black text-ink-950">سلسلة الثقة لهذا التقرير</h2>
          <p className="mt-1 text-xs leading-6 text-ink-500">Trusted Source لا تعني Verified Report. الاعتماد الكانوني دليل تغطية للبيانات، وليس قبولًا نهائيًا للدليل.</p>
        </div>
        <span className={`rounded-full border px-3 py-1.5 text-[10px] font-black ${verificationClass}`}>{reportVerificationLabel(verification)}</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl bg-ink-50 p-4"><div className="text-[9px] font-black text-ink-500">SOURCE</div><div className="mt-2 text-sm font-black">{report.sourcePath}</div><div className="mt-1 text-[10px] text-ink-500">Trust: {stateLabel(report.sourceTrustState ?? report.trustState)}</div></div>
        <div className="rounded-xl bg-ink-50 p-4"><div className="text-[9px] font-black text-ink-500">FINGERPRINT</div><div className="mt-2 break-all font-mono text-[10px]">{report.sourceHash}</div></div>
        <div className="rounded-xl bg-ink-50 p-4"><div className="text-[9px] font-black text-ink-500">CANONICAL COMMIT</div><div className="mt-2 text-sm font-black">{formatNumber(report.canonicalCommitCount)} / {report.authoritativeCurrentRowCount == null ? 'غير متاح' : formatNumber(report.authoritativeCurrentRowCount)}</div><div className="mt-1 text-[10px] text-ink-500">{gap > 0 ? `Gap: ${formatNumber(gap)}` : 'No canonical coverage gap'}</div></div>
        <div className="rounded-xl bg-ink-50 p-4"><div className="text-[9px] font-black text-ink-500">ANALYSIS</div><div className="mt-2 text-sm font-black">{report.sourceAnalysis?.analysisStatus ?? 'غير متاح'}</div><div className="mt-1 text-[10px] text-ink-500">{report.sourceAnalysis?.rowCount == null ? 'غير متاح' : formatNumber(report.sourceAnalysis.rowCount)} rows</div></div>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-ink-200 bg-ink-50/60 p-4"><div className="text-[9px] font-black text-ink-500">EVIDENCE</div><div className="mt-2 text-sm font-black">{stateLabel(report.evidenceStatus)}</div><div className="mt-1 text-[10px] text-ink-500">Evidence snapshot authority is separate from canonical commit.</div></div>
        <div className={`rounded-xl border p-4 ${verificationClass}`}><div className="text-[9px] font-black">VERIFICATION STATE</div><div className="mt-2 text-sm font-black">{reportVerificationLabel(verification)}</div><div className="mt-1 text-[10px]">Source trust: {stateLabel(report.sourceTrustState ?? report.trustState)} · Report verification: {reportVerificationLabel(verification)}</div></div>
      </div>
    </section>
  );
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

  const smartAnalysis = useMemo(() => buildSmartAnalysis(report), [report]);

  if (loading) return <div dir="rtl"><LoadingState message="جارٍ بناء التقرير الذكي من المصدر الحقيقي..." /></div>;
  if (error) return <div dir="rtl" className="space-y-5"><PageHeader title="التقرير الذكي" subtitle="تعذر قراءة نتيجة التقرير المربوطة بالمصدر." /><ErrorState message={error} onRetry={() => window.location.reload()} /></div>;
  if (!report) return <div dir="rtl" className="space-y-5"><PageHeader title="التقرير الذكي" subtitle="التقرير المطلوب غير موجود أو غير مكتمل." /><div className="rounded-2xl border border-warning-200 bg-warning-50 p-5 text-sm text-warning-900">لا توجد مخرجات ذكية مثبتة لهذا التقرير.</div></div>;

  const output = report.renderedOutput;
  const outputs = Array.isArray(output.outputs) ? output.outputs.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object') : [];
  const surfaceLinks = outputs.filter((item) => typeof item.path === 'string');
  const decisionKeys = ['recommendationStatus','decisionStatus','approvalStatus','actionStatus','outcomeStatus','learningStatus','benchmarkStatus','replayStatus'];
  const sourceIsVerified = report.reportVerificationState === 'VERIFIED';
  const businessSummary = report.specialty === 'receivables'
    ? 'هذا المصدر هو تقرير ذمم مدينة. تمت قراءة أرصدة العملاء وشرائح الأعمار من المصدر الكانوني؛ القرارات والتحصيل الفعلي لا تُنسب للمصدر ما لم توجد معاملة موثقة.'
    : report.specialty === 'inventory'
      ? 'هذا المصدر هو تقرير مخزون. المؤشرات المستخرجة تعكس الكميات والقيم التي ظهرت في المصدر، مع فصل البيانات الناقصة عن القيم المؤكدة.'
      : report.specialty === 'sales'
        ? 'هذا المصدر هو تقرير مبيعات. المؤشرات المستخرجة مرتبطة بالمصدر نفسه ولا تعني توقعًا أو نتيجة مستقبلية.'
        : report.specialty === 'purchases'
          ? 'هذا المصدر هو تقرير مشتريات. التحليل يعرض ما ثبت في المصدر، مع إبقاء أثر القرار والتنفيذ منفصلًا.'
          : 'هذا المصدر تم تحليله من بنيته وبياناته الفعلية، وتبقى المخرجات مربوطة بالمصدر دون اختلاق حقائق غير موجودة.';

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
        <div className="rounded-2xl bg-ink-50 p-4"><div className="text-[9px] font-black tracking-[.12em] text-ink-500">ROWS</div><div className="mt-2 text-xl font-black text-ink-950">{report.rowCount == null ? 'غير متاح' : formatNumber(report.rowCount)}</div><div className="mt-1 text-[10px] text-ink-500">المعتمد: {report.authoritativeCurrentRowCount == null ? 'غير متاح' : formatNumber(report.authoritativeCurrentRowCount)} · الحالة: {report.checkpointStage ?? 'غير متاح'}</div></div>
        <div className="rounded-2xl bg-ink-50 p-4"><div className="text-[9px] font-black tracking-[.12em] text-ink-500">SPECIALTY</div><div className="mt-2 text-xl font-black text-ink-950">{report.specialty ?? 'عام'}</div><div className="mt-1 text-[10px] text-ink-500">التخصص يظهر فقط عند توفر دليل كافٍ من المصدر.</div></div>
      </div>
    </section>

    <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
      <div className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
        <div className="section-kicker">EXECUTIVE BRIEF</div>
        <h2 className="mt-1 text-xl font-black text-ink-950">ماذا يقول هذا التقرير فعليًا؟</h2>
        <p className="mt-3 text-sm leading-7 text-ink-600">{businessSummary}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
          <span className="rounded-full border border-ink-200 bg-ink-50 px-3 py-1.5 font-bold">التخصص: {report.specialty ?? 'عام'}</span>
          <span className="rounded-full border border-ink-200 bg-ink-50 px-3 py-1.5 font-bold">الصفوف: {formatNumber(report.rowCount ?? 0)}</span>
          <span className={'badge ' + (sourceIsVerified ? 'badge-success' : 'badge-warning')}>{sourceIsVerified ? 'التقرير موثق' : report.reportVerificationState === 'GAP_DETECTED' ? 'فجوة اعتماد' : 'بانتظار الدليل'}</span>
        </div>
      </div>
      <div className="rounded-[18px] border border-ink-200 bg-ink-950 p-5 text-white shadow-card lg:p-6">
        <div className="section-kicker text-primary-200">NEXT ACTION</div>
        <h2 className="mt-1 text-lg font-black">ما الذي يمكن فعله الآن؟</h2>
        <p className="mt-3 text-[12px] leading-6 text-ink-300">
          {report.renderedOutput.actionStatus === 'NO_ACTION_COMMITTED' ? 'لا توجد عملية تنفيذية موثقة نُفذت بعد؛ يمكن استخدام التقرير كمدخل لمراجعة القرار.' : stateLabel(String(report.renderedOutput.actionStatus ?? null))}
        </p>
        <Link to="/decision-experience?stage=evidence" className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2.5 text-xs font-black text-ink-950">افتح مسار القرار الموثق ←</Link>
      </div>
    </section>

    <EvidenceInspector report={report}/>

    <section className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
      <div className="section-kicker">REAL BUSINESS METRICS</div>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-lg font-black text-ink-950">مؤشرات مستخرجة من هذا المصدر</h2>
        <span className="text-[10px] text-ink-500">{smartAnalysis.columns.length} أعمدة · {smartAnalysis.numeric.length} مؤشرات رقمية</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {smartAnalysis.metrics.map(metric => (
          <div key={metric.label} className="rounded-2xl border border-ink-100 bg-ink-50 p-4">
            <div className="text-[10px] font-bold text-ink-500">{metric.label}</div>
            <div className="mt-2 text-xl font-black text-ink-950">{metric.value}</div>
            <div className="mt-1 truncate text-[9px] text-ink-400">{metric.detail}</div>
          </div>
        ))}
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
        {surfaceLinks.map((surface, index) => <Link key={String(surface.key ?? index)} to={String(surface.path) + '?reportJobId=' + encodeURIComponent(report.jobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash)} className="rounded-xl border border-ink-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-sm">
          <div className="text-[9px] font-black tracking-[.12em] text-primary-700">{String(surface.stage ?? 'OUTPUT')}</div>
          <div className="mt-2 text-sm font-black text-ink-950">{String(surface.label ?? surface.key ?? 'سطح')}</div>
          <div className="mt-2 text-[10px] text-ink-500">sourceBound={String(surface.sourceBound)} · hash={String(surface.sourceHash).slice(0, 14)}…</div>
        </Link>)}
      </div>
    </section>

    {smartAnalysis.topRows.length > 0 && (
      <section className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
        <div className="section-kicker">{report.specialty === 'receivables' ? 'TOP EXPOSURES' : 'TOP SOURCE ITEMS'}</div>
        <h2 className="mt-1 text-lg font-black">أعلى البنود الظاهرة في العينة</h2>
        <div className="mt-4 grid gap-2">
          {smartAnalysis.topRows.map((row, index) => (
            <div key={row.name + index} className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 bg-ink-50 px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[10px] font-black">{index + 1}</span>
                <span className="truncate text-xs font-bold text-ink-900">{row.name}</span>
              </div>
              <span className="shrink-0 text-xs font-black text-ink-950">{formatMetric(row.value)}</span>
            </div>
          ))}
        </div>
      </section>
    )}

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
