import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { PageHeader, LoadingState, ErrorState, DataUnavailableState } from '@/components/ui/States';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';
import { fetchCanonicalSourceReport, fetchReportExecutionTasks, fetchReceivablesReportPage, fetchReceivablesExportRows, type ReceivablesReportPage, type ReceivablesReportRow, type CanonicalSourceReport } from '@/lib/queries';
import { downloadReportArtifact } from '@/lib/report-execution/download';

type SourceReceivablesRow = {
  id:string;
  row_number:number;
  customer_id:string|number|null;
  customer_name:string|null;
  currency:string|null;
  outstanding_balance:number|null;
  age_0_30:number|null;
  age_31_60:number|null;
  age_61_90:number|null;
  age_91_120:number|null;
  age_over_120:number|null;
  local_amount:number|null;
  [key:string]: unknown;
};

function SourceReceivablesReport({ importId }: { importId: string }) {
  const [report,setReport]=useState<CanonicalSourceReport|null>(null);
  const [tasks,setTasks]=useState<Awaited<ReturnType<typeof fetchReportExecutionTasks>>>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const load=useCallback(async()=>{
    try{
      setLoading(true); setError(null);
      const next=await fetchCanonicalSourceReport(importId);
      const nextTasks=next.executionJobId?await fetchReportExecutionTasks(next.executionJobId):[];
      setReport(next); setTasks(nextTasks);
    }catch(e:unknown){setError(e instanceof Error?e.message:'تعذر تحميل نتيجة المصدر');}
    finally{setLoading(false);}
  },[importId]);
  useEffect(()=>{void load();},[load]);

  const rows=useMemo<SourceReceivablesRow[]>(()=>((report?.canonicalRows??[]) as Array<{id:string;row_number:number;data:Record<string,unknown>}>).map(row=>({
    id:row.id,
    row_number:row.row_number,
    customer_id:row.data.customer_id==null?null:(row.data.customer_id as string|number),
    customer_name:row.data.customer_name==null?null:String(row.data.customer_name),
    currency:row.data.currency==null?null:String(row.data.currency),
    outstanding_balance:row.data.outstanding_balance==null?null:Number(row.data.outstanding_balance),
    age_0_30:row.data.age_0_30==null?null:Number(row.data.age_0_30),
    age_31_60:row.data.age_31_60==null?null:Number(row.data.age_31_60),
    age_61_90:row.data.age_61_90==null?null:Number(row.data.age_61_90),
    age_91_120:row.data.age_91_120==null?null:Number(row.data.age_91_120),
    age_over_120:row.data.age_over_120==null?null:Number(row.data.age_over_120),
    local_amount:row.data.local_amount==null?null:Number(row.data.local_amount),
  })),[report]);

  const expected=['queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered'];
  const verified=Boolean(report?.status==='completed' && tasks.length===expected.length && tasks.every((task,index)=>task.ordinal===index+1 && task.stage===expected[index] && task.status==='completed'));
  const totalOutstanding=rows.reduce((sum,row)=>sum+(row.outstanding_balance??0),0);
  const availableBuckets=([
    ['0-30','age_0_30'],
    ['31-60','age_31_60'],
    ['61-90','age_61_90'],
    ['91-120','age_91_120'],
    ['>120','age_over_120'],
  ] as const).filter(([,key])=>rows.some(row=>row[key]!=null));

  if(loading&&!report)return <LoadingState message="جارٍ بناء تقرير الذمم من السجل الكانوني..." />;
  if(error&&!report)return <ErrorState message={error} onRetry={load}/>;
  if(!report)return <DataUnavailableState title="نتيجة المصدر غير متاحة" message="لا توجد نتيجة ذمم موثوقة لهذا المصدر." action={<Link to="/reports" className="btn-primary text-[11px]">مركز التقارير</Link>} />;

  return <div dir="rtl" className="report-page space-y-5 animate-fade-in pb-10">
    <PageHeader title="تقرير الذمم والتحصيل" subtitle={report.fileName} actions={<div className="flex gap-2"><button type="button" onClick={()=>void load()} disabled={loading} className="btn-secondary text-xs">{loading?'جارٍ التحديث':'تحديث'}</button><Link to={`/reports/source/${encodeURIComponent(importId)}`} className="btn-secondary text-xs">تقرير المصدر</Link></div>}/>
    <section className="rounded-2xl border border-primary-200 bg-primary-50/60 p-4" role="status" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><div className="text-[9px] font-black tracking-[.12em] text-primary-700">SOURCE-BOUND RECEIVABLES</div><div className="mt-1 text-sm font-black text-ink-950">حالة التقرير: {verified?'VERIFIED':'REVIEW'}</div><div className="mt-1 text-[11px] leading-5 text-ink-600">التخصص: {report.specialtyLabel} · الثقة: {report.specialtyConfidence??'غير متاحة'}%</div></div>
        <span className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[10px] font-black">{report.sourceHash??'البصمة غير متاحة'}</span>
      </div>
    </section>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Card><CardBody><div className="surface-label">إجمالي الذمم المستخرجة</div><div className="display-number mt-1">{formatCurrency(totalOutstanding)}</div></CardBody></Card>
      <Card><CardBody><div className="surface-label">عدد السجلات</div><div className="display-number mt-1">{formatNumber(rows.length)}</div></CardBody></Card>
      <Card><CardBody><div className="surface-label">العملة</div><div className="display-number mt-1 text-2xl">{rows.find(row=>row.currency)?.currency??'غير متاح'}</div></CardBody></Card>
      <Card><CardBody><div className="surface-label">المصدر</div><div className="mt-2 break-all text-[10px] font-mono text-ink-500">{report.fileName}</div></CardBody></Card>
    </section>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {(availableBuckets.length?availableBuckets:[['غير متاح','none'] as const]).map(([label,key])=>{
        const amount=key==='none'?null:rows.reduce((sum,row)=>sum+((row[key] as number|null)??0),0);
        return <Card key={label}><CardBody><div className="surface-label">{label} يوم</div><div className="mt-2 text-lg font-black">{formatCurrency(amount)}</div>{amount==null&&<div className="mt-1 text-[10px] text-ink-400">لا توجد بيانات مؤكدة لهذا القطاع</div>}</CardBody></Card>;
      })}
    </section>
    {error&&<div role="alert" className="danger-callout text-xs font-semibold text-danger-800">{error}</div>}
    <Card><CardHeader title="عملاء الذمم" subtitle="السجلات العامة المعتمدة من نفس المصدر"/></Card>
    <Card><DataTable columns={[
      {key:'row_number',label:'#',align:'center',render:(r:SourceReceivablesRow)=>formatNumber(r.row_number)},
      {key:'customer_id',label:'رقم العميل',render:(r:SourceReceivablesRow)=>r.customer_id==null?'—':String(r.customer_id)},
      {key:'customer_name',label:'العميل',render:(r:SourceReceivablesRow)=>r.customer_name??'—'},
      {key:'currency',label:'العملة',render:(r:SourceReceivablesRow)=>r.currency??'—'},
      {key:'outstanding_balance',label:'الرصيد المستحق',align:'right',render:(r:SourceReceivablesRow)=>formatCurrency(r.outstanding_balance)},
      {key:'age_0_30',label:'0-30',align:'right',render:(r:SourceReceivablesRow)=>formatCurrency(r.age_0_30)},
      {key:'age_over_120',label:'>120',align:'right',render:(r:SourceReceivablesRow)=>formatCurrency(r.age_over_120)},
    ]} data={rows} emptyMessage="لا توجد سجلات ذمم مثبتة"/></Card>
    <div className="rounded-xl border border-warning-200 bg-warning-50 p-4 text-[10px] leading-5 text-warning-900"><div className="font-black">Benchmark: INSUFFICIENT SAMPLE</div><div className="mt-1">هذا المصدر وحده لا يكوّن peer sample صالحًا للمقارنة المرجعية.</div></div>
  </div>;
}

export function ReceivablesReportCanonicalPage() {
  const [searchParams] = useSearchParams();
  const importId = searchParams.get('importId')?.trim() || '';
  if (importId) return <SourceReceivablesReport importId={importId} />;
  const [snapshot, setSnapshot] = useState<ReceivablesReportPage | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 25;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try { setLoading(true); setError(null); setSnapshot(await fetchReceivablesReportPage(page, pageSize)); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'تعذر تحميل الذمم'); }
    finally { setLoading(false); }
  }, [page]);
  useEffect(() => { void load(); }, [load]);
  if (loading && !snapshot) return <LoadingState />;
  if (error && !snapshot) return <ErrorState message={error} onRetry={load} />;
  if (!snapshot) return <DataUnavailableState title="تقرير الذمم ينتظر البيانات" message="لم تصل صورة موثوقة للذمم بعد. لا يتم تحويل غياب البيانات إلى صفر أو تقرير فارغ." action={<Link to="/import" className="btn-primary text-[11px]">إضافة مصدر</Link>} />;
  const truthStatus = snapshot.status === 'CALCULATED' ? 'VERIFIED' : 'INSUFFICIENT DATA';
  const truthMessage = snapshot.status === 'CALCULATED'
    ? 'الإجماليات والصفوف مشتقة من المسار المالي المعتمد.'
    : 'لا توجد سجلات ذمم مثبتة حاليًا؛ القيم غير المتاحة تبقى غير متاحة ولا تتحول إلى صفر.';
  if (snapshot.status === 'NO_DATA') return <div dir="rtl" className="report-page space-y-5 animate-fade-in"><PageHeader title="تقرير الذمم والتحصيل" subtitle="المصدر لم يثبت بيانات قابلة للحساب في السياق الحالي." actions={<button type="button" onClick={() => void load()} className="btn-secondary text-xs">تحديث</button>} /><DataUnavailableState title="لا توجد ذمم مثبتة بعد" message="لا يتم عرض إجمالي أو رصيد بديل عند غياب السجلات. أضف مصدرًا موثوقًا ثم أعد المحاولة." action={<Link to="/import" className="btn-primary text-[11px]">إضافة مصدر</Link>} /></div>;
  const totalPages = Math.max(1, Math.ceil(snapshot.total_rows / pageSize));
  const exportRows = async () => {

    const rows = await fetchReceivablesExportRows();
    downloadReportArtifact('receivables-report', 'تقرير الذمم والتحصيل', ['رقم الفاتورة','العميل','تاريخ الفاتورة','تاريخ الاستحقاق','الإجمالي','المدفوع','المتبقي'], rows.map(r => ({ 'رقم الفاتورة': r.invoice_number, 'العميل': r.customer, 'تاريخ الفاتورة': r.invoice_date, 'تاريخ الاستحقاق': r.due_date, 'الإجمالي': r.total, 'المدفوع': r.paid_amount, 'المتبقي': r.balance })));
  };
  return <div dir="rtl" className="report-page space-y-5 animate-fade-in">
    <PageHeader title="تقرير الذمم والتحصيل" subtitle="الإجماليات والصفحات مشتقة من نفس الحقيقة المعتمدة على الخادم." actions={<div className="flex items-center gap-2"><button type="button" onClick={() => void load()} disabled={loading} className="btn-secondary inline-flex items-center gap-2 text-xs disabled:cursor-wait disabled:opacity-60" aria-label="تحديث تقرير الذمم">{loading ? 'جارٍ التحديث' : 'تحديث'}</button>{snapshot.status === 'CALCULATED' && <><button onClick={() => void exportRows()} className="btn-secondary text-xs">تصدير XLSX</button><button type="button" onClick={() => window.print()} className="btn-primary print-hide text-xs">طباعة</button></>}</div>} />
    <section className="rounded-2xl border border-primary-200 bg-primary-50/60 p-4" role="status" aria-live="polite" aria-busy={loading}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><div className="text-[9px] font-black tracking-[.12em] text-primary-700">TRUTH CONTEXT</div><div className="mt-1 text-sm font-black text-ink-950">حالة التقرير: {truthStatus}</div><div className="mt-1 text-[11px] leading-5 text-ink-600">{truthMessage}</div></div>
        <Link to={snapshot.status === 'CALCULATED' ? '/trust' : '/import'} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-ink-950 px-3 py-2 text-[10px] font-black text-white">{snapshot.status === 'CALCULATED' ? 'فحص الثقة' : 'إضافة مصدر'}</Link>
      </div>
    </section>
    {error && <div role="alert" className="danger-callout text-xs font-semibold text-danger-800">{error}</div>}
    <section className="grid gap-3 md:grid-cols-2">
      <Card className="hero-surface"><CardBody><div className="surface-label">إجمالي الذمم</div><div className="display-number mt-1">{formatCurrency(snapshot.total_outstanding)}</div><div className="mt-1 text-[11px] text-ink-400">المتبقي المستخرج من السجلات المعتمدة</div></CardBody></Card>
      <Card><CardBody><div className="surface-label">الفواتير المستحقة</div><div className="display-number mt-1">{formatNumber(snapshot.total_rows)}</div><div className="mt-1 text-[11px] text-ink-400">إجمالي الصفوف المتاحة في التقرير</div></CardBody></Card>
    </section>
    <div className="report-meta"><span>صفحة {snapshot.page + 1} من {totalPages}</span><span>المصدر: المسار المالي المعتمد</span><span>العملة والسياق حسب بيانات المستأجر</span></div>
    <Card><CardHeader title="الفواتير المستحقة" subtitle={`صفحة ${snapshot.page + 1} من ${totalPages}`} /><DataTable columns={[{key:'invoice_number',label:'رقم الفاتورة',render:(r:ReceivablesReportRow)=><span className="font-medium text-primary-600">{r.invoice_number}</span>},{key:'customer',label:'العميل',render:(r:ReceivablesReportRow)=>r.customer?.name||'—'},{key:'invoice_date',label:'تاريخ الفاتورة',render:(r:ReceivablesReportRow)=>formatDate(r.invoice_date)},{key:'due_date',label:'تاريخ الاستحقاق',render:(r:ReceivablesReportRow)=>r.due_date?formatDate(r.due_date):'—'},{key:'total',label:'الإجمالي',align:'right',render:(r:ReceivablesReportRow)=>formatCurrency(r.total)},{key:'paid_amount',label:'المدفوع',align:'right',render:(r:ReceivablesReportRow)=>formatCurrency(r.paid_amount)},{key:'balance',label:'المتبقي',align:'right',render:(r:ReceivablesReportRow)=>formatCurrency(r.balance)},{key:'status',label:'الحالة',align:'center',render:(r:ReceivablesReportRow)=><Badge variant={r.status==='paid'?'success':'warning'}>{r.status||'غير محدد'}</Badge>}]} data={snapshot.rows} emptyMessage="لا توجد ذمم مستحقة" /></Card>
    <div className="flex items-center justify-between"><span className="text-xs text-ink-500">عرض {snapshot.rows.length} من {formatNumber(snapshot.total_rows)}</span><div className="flex gap-2"><button disabled={page===0} onClick={() => setPage(p => Math.max(0,p-1))} className="px-3 py-1.5 rounded-lg border border-ink-200 text-xs disabled:opacity-40">السابق</button><button disabled={page+1>=totalPages} onClick={() => setPage(p => p+1)} className="px-3 py-1.5 rounded-lg border border-ink-200 text-xs disabled:opacity-40">التالي</button></div></div>
  </div>;
}
