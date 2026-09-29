import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowUpLeft, BarChart3, BrainCircuit, Database, ShieldCheck, Target, Workflow } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { PageHeader, LoadingState, ErrorState, DataUnavailableState } from '@/components/ui/States';
import { formatCurrency, formatNumber } from '@/lib/format';
import { fetchCanonicalSourceReport, fetchReportExecutionTasks, type CanonicalSourceReport, type ReportExecutionTask } from '@/lib/queries';

type SourceRow = { id: string; row_number: number; data: Record<string, unknown> };

const CONFIG: Record<string, { title: string; metricFields: Array<{ key: string; label: string; currency?: boolean }>; tablePriority: string[] }> = {
  sales: {
    title: 'تقرير المجال — المبيعات',
    metricFields: [
      { key: 'net_sales', label: 'صافي المبيعات', currency: true },
      { key: 'sales_amount', label: 'مبلغ المبيعات', currency: true },
      { key: 'total', label: 'الإجمالي', currency: true },
      { key: 'quantity', label: 'الكمية' },
    ],
    tablePriority: ['invoice_number','date','invoice_date','customer_name','customer_id','invoice_type','currency','sales_amount','net_sales','total','discount','tax_amount','quantity','sku','name'],
  },
  purchases: {
    title: 'تقرير المجال — المشتريات',
    metricFields: [
      { key: 'local_amount', label: 'إجمالي الشراء المحلي', currency: true },
      { key: 'total', label: 'الإجمالي', currency: true },
      { key: 'outstanding_balance', label: 'الرصيد المستحق', currency: true },
      { key: 'quantity', label: 'الكمية' },
    ],
    tablePriority: ['supplier_id','supplier_name','date','currency','local_amount','total','outstanding_balance','quantity','sku','name','unit'],
  },
  inventory: {
    title: 'تقرير المجال — المخزون',
    metricFields: [
      { key: 'available_quantity', label: 'الكمية المتوفرة' },
      { key: 'quantity', label: 'الكمية' },
      { key: 'average_cost', label: 'متوسط التكلفة', currency: true },
      { key: 'price', label: 'السعر', currency: true },
    ],
    tablePriority: ['sku','name','warehouse','unit','available_quantity','quantity','average_cost','price','min_price','max_price','currency'],
  },
  payments: {
    title: 'تقرير المجال — الحركات المالية',
    metricFields: [
      { key: 'debit', label: 'مدين', currency: true },
      { key: 'credit', label: 'دائن', currency: true },
      { key: 'balance', label: 'الرصيد', currency: true },
    ],
    tablePriority: ['date','document_type','document_no','description','reference_no','currency','debit','credit','balance'],
  },
  receivables: {
    title: 'تقرير المجال — الذمم والتحصيل',
    metricFields: [
      { key: 'outstanding_balance', label: 'إجمالي الذمم', currency: true },
      { key: 'local_amount', label: 'المبلغ المحلي', currency: true },
      { key: 'age_0_30', label: '0–30', currency: true },
      { key: 'age_31_60', label: '31–60', currency: true },
      { key: 'age_61_90', label: '61–90', currency: true },
      { key: 'age_91_120', label: '91–120', currency: true },
      { key: 'age_over_120', label: '>120', currency: true },
    ],
    tablePriority: ['customer_id','customer_name','currency','outstanding_balance','local_amount','age_0_30','age_31_60','age_61_90','age_91_120','age_over_120'],
  },
  products: {
    title: 'تقرير المجال — المنتجات',
    metricFields: [
      { key: 'selling_price', label: 'سعر البيع', currency: true },
      { key: 'cost_price', label: 'التكلفة', currency: true },
      { key: 'available_quantity', label: 'الكمية المتوفرة' },
      { key: 'min_price', label: 'الحد الأدنى', currency: true },
      { key: 'max_price', label: 'الحد الأعلى', currency: true },
    ],
    tablePriority: ['sku','name','name_en','unit','pack_size','base_unit','item_type','category','cost_price','selling_price','min_price','max_price','available_quantity','currency'],
  },
  customers: {
    title: 'تقرير المجال — العملاء',
    metricFields: [
      { key: 'credit_limit', label: 'حد الائتمان', currency: true },
      { key: 'opening_balance', label: 'الرصيد الافتتاحي', currency: true },
      { key: 'balance', label: 'الرصيد', currency: true },
    ],
    tablePriority: ['customer_id','customer_name','phone','city','branch_id','segment','status','currency','credit_limit','opening_balance','balance'],
  },
  other: {
    title: 'تقرير المجال — مصدر عام',
    metricFields: [],
    tablePriority: [],
  },
};

function num(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value.replace(/,/g, ''));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function SourceDomainReportPage() {
  const { importId = '' } = useParams();
  const [report, setReport] = useState<CanonicalSourceReport | null>(null);
  const [tasks, setTasks] = useState<ReportExecutionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!importId) { setError('IMPORT_JOB_ID_REQUIRED'); setLoading(false); return; }
    try {
      setLoading(true); setError(null);
      const next = await fetchCanonicalSourceReport(importId);
      const nextTasks = next.executionJobId ? await fetchReportExecutionTasks(next.executionJobId) : [];
      setReport(next); setTasks(nextTasks);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'تعذر بناء تقرير المجال المصدر');
    } finally {
      setLoading(false);
    }
  }, [importId]);

  useEffect(() => { void load(); }, [load]);

  const config = CONFIG[report?.specialty && CONFIG[report.specialty] ? report.specialty : 'other'];
  const rows = useMemo<SourceRow[]>(() => (report?.canonicalRows ?? []).map(row => ({ id: row.id, row_number: row.row_number, data: row.data ?? {} })), [report]);
  const verified = Boolean(
    report?.status === 'completed' &&
    tasks.length === 9 &&
    tasks.every((task, index) => task.ordinal === index + 1 && task.status === 'completed' && task.stage === ['queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered'][index]),
  );

  const metricValues = useMemo(() => config.metricFields
    .filter(metric => rows.some(row => num(row.data[metric.key]) != null))
    .map(metric => ({
      ...metric,
      value: rows.reduce((sum, row) => sum + (num(row.data[metric.key]) ?? 0), 0),
    })), [config.metricFields, rows]);

  const keys = useMemo(() => {
    const present = new Set(rows.flatMap(row => Object.keys(row.data)));
    const selected = config.tablePriority.filter(key => present.has(key));
    const extra = [...present].filter(key => !selected.includes(key)).slice(0, 6);
    return [...selected, ...extra].slice(0, 8);
  }, [config.tablePriority, rows]);

  if (loading) return <LoadingState message="جارٍ بناء المخرج المجالّي من الحقيقة الكانونية للمصدر..." />;
  if (error) return <div dir="rtl" className="space-y-5"><PageHeader title="تقرير المجال المصدر" subtitle="تعذر قراءة النتيجة المصدرية." /><ErrorState message={error} onRetry={load} /></div>;
  if (!report) return <DataUnavailableState title="تقرير المجال غير متاح" message="لا توجد نتيجة مصدرية صالحة للعرض." action={<Link to="/reports" className="btn-primary text-[11px]">مركز التقارير</Link>} />;

  return <div dir="rtl" className="report-page space-y-5 animate-fade-in pb-10">
    <PageHeader
      title={config.title}
      subtitle="مخرج source-bound مشتق من نفس canonical_dataset_records الخاصة بهذا Report Job."
      actions={<div className="flex flex-wrap gap-2"><Link to={'/reports/source/' + encodeURIComponent(importId)} className="btn-secondary text-[11px]">تقرير المصدر</Link><Link to="/reports" className="btn-secondary text-[11px]">مركز التقارير</Link></div>}
    />
    <section className="rounded-[20px] border border-ink-800 bg-ink-950 p-5 text-white shadow-elevated">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black tracking-[.14em] text-primary-300"><Database size={15} /> SOURCE-BOUND DOMAIN REPORT</div>
          <h1 className="mt-2 text-2xl font-black">{report.fileName}</h1>
          <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-ink-300"><span>{report.specialtyLabel}</span><span>·</span><span>{report.specialtyConfidence == null ? 'الثقة غير متاحة' : 'الثقة ' + report.specialtyConfidence + '%'}</span><span>·</span><span>{verified ? 'VERIFIED' : 'REVIEW'}</span></div>
        </div>
        <div className="rounded-xl bg-white/10 px-3 py-2 font-mono text-[10px] break-all">{report.sourceHash ?? 'source hash unavailable'}</div>
      </div>
    </section>

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Card><CardBody><div className="surface-label">السجلات المصدرية</div><div className="display-number mt-1">{formatNumber(report.canonicalRowsTotal)}</div></CardBody></Card>
      <Card><CardBody><div className="surface-label">الصالحة</div><div className="display-number mt-1">{report.validRows == null ? 'غير متاح' : formatNumber(report.validRows)}</div></CardBody></Card>
      <Card><CardBody><div className="surface-label">المخرجات</div><div className="mt-2 text-sm font-black">الذكاء + الإدارة + القرار</div></CardBody></Card>
      <Card><CardBody><div className="surface-label">Benchmark</div><div className="mt-2 text-sm font-black text-warning-700">INSUFFICIENT SAMPLE</div></CardBody></Card>
    </section>

    {metricValues.length ? <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metricValues.slice(0, 8).map(metric => <Card key={metric.key}><CardBody><div className="surface-label">{metric.label}</div><div className="display-number mt-1">{metric.currency ? formatCurrency(metric.value) : formatNumber(metric.value)}</div><div className="mt-1 text-[10px] text-ink-400">حساب حتمي من صفوف المصدر.</div></CardBody></Card>)}
    </section> : <Card><CardBody><div className="text-sm font-black">لا توجد مؤشرات رقمية مؤكدة من هذا المصدر.</div><div className="mt-1 text-[10px] text-ink-500">لا يتم تحويل UNKNOWN/UNAVAILABLE إلى صفر.</div></CardBody></Card>}

    <Card>
      <CardHeader title="البيانات المجالّية من المصدر" subtitle="كل صف هنا يعود إلى نفس Report Job والبصمة المصدرية." />
      {rows.length ? <DataTable
        columns={[
          { key: 'row_number', label: '#', align: 'center', render: (row: SourceRow) => formatNumber(row.row_number) },
          ...keys.map(key => ({ key, label: key, render: (row: SourceRow) => {
            const value = row.data[key];
            if (value == null || value === '') return '—';
            const n = num(value);
            return n != null && typeof value !== 'string' ? formatNumber(n) : String(value);
          }})),
        ]}
        data={rows}
        pageSize={25}
        emptyMessage="لا توجد سجلات مصدرية للعرض"
      /> : <CardBody><div className="text-sm font-black">لا توجد سجلات مصدرية محفوظة للعرض.</div></CardBody>}
    </Card>

    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <Link to="/trust" className="card card-hover p-4"><ShieldCheck size={18} className="text-primary-700" /><div className="mt-3 text-sm font-black">الثقة والأدلة</div><div className="mt-1 text-[10px] text-ink-500">البصمة والحقيقة.</div><span className="mt-3 inline-flex gap-1 text-[10px] font-black text-primary-700">فتح <ArrowUpLeft size={13} /></span></Link>
      <Link to="/reports/executive" className="card card-hover p-4"><BarChart3 size={18} className="text-primary-700" /><div className="mt-3 text-sm font-black">التقرير التنفيذي</div><div className="mt-1 text-[10px] text-ink-500">المؤشرات المثبتة.</div><span className="mt-3 inline-flex gap-1 text-[10px] font-black text-primary-700">فتح <ArrowUpLeft size={13} /></span></Link>
      <Link to="/intelligence" className="card card-hover p-4"><BrainCircuit size={18} className="text-primary-700" /><div className="mt-3 text-sm font-black">مركز الذكاء</div><div className="mt-1 text-[10px] text-ink-500">الإشارات المقيدة بالدليل.</div><span className="mt-3 inline-flex gap-1 text-[10px] font-black text-primary-700">فتح <ArrowUpLeft size={13} /></span></Link>
      <Link to="/decision-experience?stage=decision" className="card card-hover p-4"><Target size={18} className="text-primary-700" /><div className="mt-3 text-sm font-black">مساحة القرار</div><div className="mt-1 text-[10px] text-ink-500">القرار منفصل عن الحقيقة.</div><span className="mt-3 inline-flex gap-1 text-[10px] font-black text-primary-700">فتح <ArrowUpLeft size={13} /></span></Link>
      <Link to="/work-center" className="card card-hover p-4"><Workflow size={18} className="text-primary-700" /><div className="mt-3 text-sm font-black">مركز العمل</div><div className="mt-1 text-[10px] text-ink-500">الإجراء بعد الدليل.</div><span className="mt-3 inline-flex gap-1 text-[10px] font-black text-primary-700">فتح <ArrowUpLeft size={13} /></span></Link>
    </section>
  </div>;
}
