import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, ArrowUpLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ErrorState, LoadingState, PageHeader } from '@/components/ui/States';
import { resolveCurrentCompanyId, supabase } from '@/lib/supabase';
import { formatDateTime, formatNumber } from '@/lib/format';
import { classifyReport, type ReportKind } from '@/lib/import-pipeline/report-type-classifier';

type GenericRecord = {
  id: string;
  row_number: number;
  semantic_domain: string;
  source_hash: string;
  import_job_id: string;
  data: Record<string, unknown>;
  provenance: Record<string, unknown>;
};

type ImportJob = {
  id: string;
  file_name: string;
  file_size: number;
  source_type: string;
  status: string;
  total_rows: number | null;
  valid_rows: number | null;
  invalid_rows: number | null;
  created_at: string;
  result_summary: Record<string, unknown> | null;
};

const KIND_LABELS: Record<ReportKind, string> = {
  sales: 'مبيعات', purchases: 'مشتريات', inventory: 'مخزون', customers: 'عملاء', suppliers: 'موردون',
  items: 'أصناف', receivables: 'ذمم مدينة', payables: 'ذمم دائنة', movement: 'حركة مخزون', unknown: 'غير محدد',
};

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value.replace(/,/g, ''));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function inferDomainPath(kind: ReportKind): string {
  if (kind === 'sales') return '/reports/sales';
  if (kind === 'purchases' || kind === 'payables' || kind === 'suppliers') return '/reports/purchases';
  if (kind === 'inventory' || kind === 'items' || kind === 'movement') return '/reports/inventory';
  if (kind === 'receivables' || kind === 'customers') return '/reports/receivables';
  return '/reports';
}

function buildSignals(kind: ReportKind, records: GenericRecord[]) {
  const rows = records.map(record => record.data);
  const first = rows[0] ?? {};
  const keys = Object.keys(first);
  const numberColumn = (...names: string[]) => names.find(name => rows.some(row => asNumber(row[name]) !== null));
  const sum = (field: string | undefined) => field ? rows.reduce((total, row) => {
    const n = asNumber(row[field]);
    return n === null ? total : total + n;
  }, 0) : null;
  const signals: Array<{ title: string; detail: string; evidenceCount: number; tone: 'success' | 'warning' | 'neutral' }> = [];

  const balanceField = numberColumn('balance', 'remaining', 'outstanding', 'total', 'netAmount', 'net_amount');
  const quantityField = numberColumn('currentStock', 'current_stock', 'quantity', 'stock');
  const totalField = numberColumn('total', 'netAmount', 'net_amount', 'grossAmount', 'subtotal');

  if ((kind === 'receivables' || kind === 'customers') && balanceField) {
    signals.push({
      title: 'رصيد العملاء المستخرج',
      detail: 'المجموع العددي للحقل ' + balanceField + ' عبر الصفوف المثبتة = ' + String(sum(balanceField)),
      evidenceCount: rows.filter(row => asNumber(row[balanceField!]) !== null).length,
      tone: 'warning',
    });
  } else if (kind === 'inventory' && quantityField) {
    const emptyCount = rows.filter(row => {
      const n = asNumber(row[quantityField!]);
      return n !== null && n <= 0;
    }).length;
    signals.push({
      title: 'أصناف بكمية صفرية أو سالبة',
      detail: formatNumber(emptyCount) + ' صفًا من البيانات المثبتة يحقق هذا الشرط.',
      evidenceCount: emptyCount,
      tone: emptyCount > 0 ? 'warning' : 'success',
    });
  } else if ((kind === 'sales' || kind === 'purchases') && totalField) {
    signals.push({
      title: 'إجمالي ' + (kind === 'sales' ? 'المبالغ المباعة' : 'المبالغ المشتراة'),
      detail: 'المجموع العددي للحقل ' + totalField + ' عبر الصفوف المثبتة = ' + String(sum(totalField)),
      evidenceCount: rows.filter(row => asNumber(row[totalField!]) !== null).length,
      tone: 'neutral',
    });
  }

  if (!signals.length && keys.length) {
    signals.push({
      title: 'البيانات مثبتة لكن الإشارة التجارية غير كافية',
      detail: 'تم حفظ الصفوف وبصمتها، لكن الحقول الحالية لا تدعم قرارًا تجاريًا موثوقًا دون تخمين.',
      evidenceCount: records.length,
      tone: 'neutral',
    });
  }
  return signals;
}

export function ImportedReportResultPage() {
  const { importId } = useParams<{ importId: string }>();
  const [job, setJob] = useState<ImportJob | null>(null);
  const [records, setRecords] = useState<GenericRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!importId) { setError('IMPORT_ID_REQUIRED'); setLoading(false); return; }
      setLoading(true);
      setError(null);
      try {
        const companyId = await resolveCurrentCompanyId();
        if (!companyId) throw new Error('TENANT_CONTEXT_REQUIRED');
        const [{ data: jobRow, error: jobError }, { data: recordRows, error: recordError }] = await Promise.all([
          supabase.from('import_jobs').select('id,file_name,file_size,source_type,status,total_rows,valid_rows,invalid_rows,created_at,result_summary').eq('id', importId).eq('company_id', companyId).single(),
          supabase.from('canonical_dataset_records').select('id,row_number,semantic_domain,source_hash,import_job_id,data,provenance').eq('import_job_id', importId).order('row_number', { ascending: true }).limit(50000),
        ]);
        if (jobError) throw jobError;
        if (recordError) throw recordError;
        if (!jobRow) throw new Error('IMPORT_JOB_NOT_FOUND');
        if (cancelled) return;
        setJob(jobRow as ImportJob);
        setRecords((recordRows ?? []) as GenericRecord[]);
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : 'تعذر تحميل تقرير المصدر');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [importId]);

  const headers = useMemo(() => {
    const set = new Set<string>();
    for (const record of records.slice(0, 5000)) for (const key of Object.keys(record.data)) set.add(key);
    return [...set];
  }, [records]);

  const classification = useMemo(() => classifyReport(headers), [headers]);
  const signals = useMemo(() => buildSignals(classification.kind, records), [classification.kind, records]);
  const sourceHash = records[0]?.source_hash ?? null;
  const summary = job?.result_summary ?? {};
  const semanticConfidence = asNumber(summary.semantic_understanding_confidence);
  const trustState = job?.status === 'completed' && records.length > 0 && records.every(record => record.source_hash === sourceHash) ? 'VERIFIED' : records.length ? 'PARTIAL' : 'INSUFFICIENT_DATA';

  if (loading) return <LoadingState message="جارٍ بناء تقرير المصدر من الصفوف الكانونية المثبتة..." />;
  if (error || !job) return <ErrorState message={error ?? 'تعذر العثور على تقرير المصدر'} onRetry={() => window.location.reload()} />;

  const domainPath = inferDomainPath(classification.kind);
  const reportQuality = semanticConfidence;

  return <div className="space-y-6" dir="rtl">
    <PageHeader title={'تقرير المصدر — ' + job.file_name} subtitle="نتيجة مصدرية مستقلة مرتبطة ببصمة الملف والصفوف الكانونية؛ لا تُخلط تلقائيًا مع أرقام ERP غير التابعة للمصدر." />
    <div className="flex flex-wrap gap-2">
      <Badge variant={trustState === 'VERIFIED' ? 'success' : trustState === 'PARTIAL' ? 'warning' : 'danger'}><ShieldCheck size={13}/> الحقيقة: {trustState}</Badge>
      <Badge variant="neutral">التخصص: {KIND_LABELS[classification.kind]}</Badge>
      <Badge variant={classification.confidence >= 0.5 ? 'success' : 'warning'}>ثقة التصنيف: {Math.round(classification.confidence * 100)}%</Badge>
      {reportQuality !== null && <Badge variant={reportQuality >= 75 ? 'success' : reportQuality >= 50 ? 'warning' : 'danger'}>ثقة الفهم: {Math.round(reportQuality)}%</Badge>}
    </div>

    <Card><CardHeader title="Executive Report" subtitle="ملخص القرار من المصدر نفسه" /><CardBody><div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="rounded-xl bg-ink-50 p-4"><div className="text-xs text-ink-400">الصفوف الكانونية</div><b className="text-xl">{formatNumber(records.length)}</b></div>
      <div className="rounded-xl bg-ink-50 p-4"><div className="text-xs text-ink-400">الأعمدة المكتشفة</div><b className="text-xl">{formatNumber(headers.length)}</b></div>
      <div className="rounded-xl bg-ink-50 p-4"><div className="text-xs text-ink-400">الصفوف الصالحة عند الاعتماد</div><b className="text-xl">{formatNumber(job.valid_rows ?? 0)}</b></div>
      <div className="rounded-xl bg-ink-50 p-4"><div className="text-xs text-ink-400">حالة الاعتماد</div><b className="text-xl">{job.status}</b></div>
    </div></CardBody></Card>

    <Card><CardHeader title="Evidence Passport" subtitle="هوية المصدر وسلسلة الإثبات" /><CardBody><div className="grid gap-3 md:grid-cols-2 text-xs">
      <div><span className="text-ink-400">اسم الملف</span><div className="font-semibold break-all">{job.file_name}</div></div>
      <div><span className="text-ink-400">النوع</span><div className="font-semibold">{job.source_type}</div></div>
      <div><span className="text-ink-400">البصمة SHA-256</span><div className="font-mono break-all">{sourceHash ?? 'غير متاحة'}</div></div>
      <div><span className="text-ink-400">Snapshot ID</span><div className="font-mono break-all">{String(summary.snapshot_id ?? 'غير متاح')}</div></div>
      <div><span className="text-ink-400">Import Job</span><div className="font-mono break-all">{job.id}</div></div>
      <div><span className="text-ink-400">تاريخ الاعتماد</span><div>{formatDateTime(job.created_at)}</div></div>
    </div></CardBody></Card>

    <Card><CardHeader title="Domain Report" subtitle={'التخصص المكتشف: ' + KIND_LABELS[classification.kind]} /><CardBody><div className="space-y-3">
      {classification.evidence.map(item => <div key={item} className="flex items-start gap-2 text-xs"><CheckCircle2 size={15} className="mt-0.5 text-success-600"/><span>{item}</span></div>)}
      {signals.map(signal => <div key={signal.title} className={'rounded-xl p-4 ' + (signal.tone === 'warning' ? 'bg-warning-50' : signal.tone === 'success' ? 'bg-success-50' : 'bg-ink-50')}><div className="font-bold text-sm">{signal.title}</div><div className="mt-1 text-xs leading-5 text-ink-600">{signal.detail}</div><div className="mt-2 text-[10px] text-ink-400">Evidence rows: {formatNumber(signal.evidenceCount)}</div></div>)}
    </div></CardBody></Card>

    <Card><CardHeader title="Decision Surface / Work Center" subtitle="إجراء مقترح فقط عندما يدعمه دليل المصدر" /><CardBody><div className="space-y-3">
      {signals.map(signal => <div key={signal.title} className="flex items-start justify-between gap-3 rounded-xl border border-ink-100 p-4"><div><b className="text-sm">{signal.title}</b><p className="mt-1 text-xs text-ink-500">{signal.detail}</p></div><span className="shrink-0 rounded-full bg-ink-50 px-3 py-1 text-[10px] font-bold">PROPOSED</span></div>)}
      <div className="rounded-xl border border-warning-200 bg-warning-50 p-4 text-xs text-warning-900"><AlertCircle size={14} className="inline-block ml-1"/> لا يوجد Outcome/Learning للمصدر حتى الآن؛ لا يتم اختراع نتيجة بعد الاعتماد.</div>
    </div></CardBody></Card>

    <Card><CardHeader title="Benchmark / Learning" subtitle="حالة العينة المرجعية" /><CardBody><div className="rounded-xl border border-warning-200 bg-warning-50 p-4"><div className="font-black">INSUFFICIENT_SAMPLE</div><p className="mt-1 text-xs leading-5 text-warning-900">لا توجد عينة peer موثقة مرتبطة بهذا المصدر تسمح بمقارنة معيارية دون تضخيم الثقة.</p></div></CardBody></Card>

    <Card><CardHeader title="ربط التقرير ببقية التطبيق" subtitle="كل الروابط تحفظ نطاق المنتج منفصلًا عن الحقيقة المصدرية" /><CardBody><div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      <Link className="btn-primary text-xs justify-center" to={domainPath}><ArrowUpLeft size={14}/> تقرير المجال</Link>
      <Link className="btn-secondary text-xs justify-center" to="/reports/executive">التقرير التنفيذي العام</Link>
      <Link className="btn-secondary text-xs justify-center" to="/trust">الثقة والأدلة</Link>
      <Link className="btn-secondary text-xs justify-center" to="/decision-experience">التجربة القرارّية</Link>
      <Link className="btn-secondary text-xs justify-center" to="/work-center">مركز العمل</Link>
      <Link className="btn-secondary text-xs justify-center" to="/data-quality">جودة البيانات</Link>
    </div></CardBody></Card>
  </div>;
}
