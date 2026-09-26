import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FileBarChart, ShoppingCart, Package, Receipt, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader, LoadingState, ErrorState, DataUnavailableState } from '@/components/ui/States';
import { DataTable } from '@/components/ui/DataTable';
import { TrendChart, HorizontalBarChart, CategoryPieChart } from '@/components/ui/Charts';
import { fetchDashboardSnapshot, fetchInventoryReportSnapshot } from '@/lib/dashboard-canonical';
import { fetchSalesInvoices, fetchPurchaseInvoices, fetchPurchaseSummary, fetchSalesExportRows, fetchPurchaseExportRows, fetchInventoryExportRows, fetchReceivablesExportRows } from '@/lib/queries';
import { formatCurrency, formatNumber, formatDate } from '@/lib/format';
import { downloadReportArtifact } from '@/lib/report-execution/download';
import type { SalesInvoice, PurchaseInvoice } from '@/lib/types';
import type { DashboardKPIs, MonthlyTrend, TopEntity, CategoryBreakdown, AgingBucket, InventoryReportRow } from '@/lib/dashboard-canonical';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function ReportTruthBar({ status, asOf, period, note }: { status: string; asOf?: string; period: string; note?: string }) {
  const normalized = status === 'CONFIRMED' || status === 'CALCULATED' ? status : 'INSUFFICIENT DATA';
  const tone = normalized === 'CONFIRMED'
    ? 'border-success-200 bg-success-50 text-success-800'
    : normalized === 'CALCULATED'
      ? 'border-primary-200 bg-primary-50 text-primary-800'
      : 'border-warning-200 bg-warning-50 text-warning-900';
  return <section aria-label="سياق حقيقة التقرير" className={'flex flex-wrap items-center gap-2 rounded-[12px] border px-3 py-2.5 text-[10px] ' + tone}>
    <span className="font-black">{normalized}</span>
    <span>الفترة: {period}</span>
    {asOf && <span>As-of: {asOf}</span>}
    {note && <span className="text-current/70">{note}</span>}
    <span className="mr-auto font-semibold">القيم غير المتاحة تبقى غير متاحة ولا تُستبدل بتقديرات.</span>
  </section>;
}

const reportCards = [
  { path:'/reports/sales', title:'المبيعات', stage:'قياس', desc:'حركة المبيعات والفواتير والعملاء والمنتجات.', icon:ShoppingCart, iconClass:'bg-primary-50 text-primary-600' },
  { path:'/reports/purchases', title:'المشتريات', stage:'مصدر', desc:'المشتريات والموردون والتدفقات الداخلة.', icon:FileBarChart, iconClass:'bg-accent-50 text-accent-600' },
  { path:'/reports/inventory', title:'المخزون', stage:'دليل', desc:'الكمية والتكلفة والقيمة والحالات غير المكتملة.', icon:Package, iconClass:'bg-success-50 text-success-600' },
  { path:'/reports/receivables', title:'الذمم والتحصيل', stage:'قرار', desc:'الذمم وأعمار الاستحقاق ومتابعة التحصيل.', icon:Receipt, iconClass:'bg-warning-50 text-warning-600' },
  { path:'/reports/profitability', title:'الربحية', stage:'قرار', desc:'هوامش الربحية حسب المنتج والعميل والفئة.', icon:TrendingUp, iconClass:'bg-primary-50 text-primary-600' },
];

export function ReportsCenterPage() {
  const [snapshot, setSnapshot] = useState<Awaited<ReturnType<typeof fetchDashboardSnapshot>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true); else setLoading(true);
      setError(null);
      setSnapshot(await fetchDashboardSnapshot(6));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
      const reportEvidenceState = reportCount === 0 ? 'EMPTY' : reportHasUnverifiedData ? 'REVIEW' : 'VERIFIED';
  const reportEvidenceLabel = reportEvidenceState === 'VERIFIED' ? 'موثّق' : reportEvidenceState === 'REVIEW' ? 'مراجعة مطلوبة' : 'لا توجد بيانات';

return (
      <div dir="rtl" className="ag-reports-center-surface space-y-5 animate-fade-in pb-10">
        <PageHeader title="مركز التقارير" subtitle="لقطة موثقة من مسار التقارير التنفيذي." />
        <section aria-label="حالة دليل التقارير" className="rounded-[18px] border border-ink-200 bg-white p-6 shadow-card">
          <div className="text-sm font-bold text-ink-800">جارٍ تحميل اللقطة التجارية...</div>
          <div className="mt-2 text-[11px] text-ink-500">لا تُعرض أرقام تقديرية أثناء التحميل.</div>
        </section>
      </div>
    );
  }
  if (error) {
    return <div dir="rtl" className="ag-reports-center-surface space-y-5 animate-fade-in pb-10"><PageHeader title="مركز التقارير" subtitle="تعذر تحميل اللقطة الحالية." actions={<button type="button" onClick={() => void load()} className="btn-secondary text-xs">إعادة المحاولة</button>} /><ErrorState message={error} onRetry={() => void load()} /></div>;
  }
  if (!snapshot) return <DataUnavailableState title="مركز التقارير ينتظر اللقطة" message="لم تصل اللقطة الكانونية الحالية؛ لا يتم عرض مركز فارغ أو أرقام غير مثبتة." action={<Link to="/import" className="btn-primary text-[11px]">إضافة مصدر</Link>} />;

  const { kpis, aging, asOf, months, quality } = snapshot;
  const qualityValues = [quality.badInvoiceRows, quality.badSaleItemRows, quality.badPurchaseRows, quality.badInventoryRows, quality.salesCurrencyMismatchRows, quality.purchaseCurrencyMismatchRows];
  const qualityIssueTotal = qualityValues.every(value => value !== null) ? qualityValues.reduce((sum, value) => sum + (value ?? 0), 0) : null;
  const truthLabel = kpis.status === 'CONFIRMED' ? 'VERIFIED' : kpis.status === 'CALCULATED' ? 'CALCULATED' : 'INSUFFICIENT DATA';
  const truthClass = kpis.status === 'CONFIRMED' ? 'badge-success' : kpis.status === 'CALCULATED' ? 'badge-primary' : 'badge-warning';
  const nextPath = kpis.status === 'INSUFFICIENT_DATA' || aging.status === 'INSUFFICIENT_DATA' ? '/data-quality' : '/reports/executive';
  const nextLabel = kpis.status === 'INSUFFICIENT_DATA' || aging.status === 'INSUFFICIENT_DATA' ? 'افحص جودة البيانات' : 'افتح التقرير التنفيذي';

  return <div dir="rtl" className="ag-reports-center-surface space-y-5 animate-fade-in pb-10">
    <PageHeader
      title="مركز التقارير"
      subtitle="منظومة التقارير التنفيذية: كل رقم يعود إلى مصدره، وكل تفسير يبقى منفصلًا عن حقيقة البيانات."
      actions={<div className="flex items-center gap-2"><span className={`badge ${truthClass}`}>{truthLabel}</span><button type="button" onClick={() => void load(true)} disabled={refreshing} className="btn-secondary inline-flex items-center gap-2 text-xs">{refreshing ? 'جارٍ التحديث' : 'تحديث اللقطة'}</button></div>}
    />

    <section className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-card lg:p-6" aria-label="اللقطة التنفيذية الحالية">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-stretch xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="section-kicker">لقطة تجارية موثقة · آخر {months} أشهر</div>
          <div className="mt-2 flex flex-wrap items-end gap-x-6 gap-y-2">
            <div>
              <div className="text-[10px] font-bold text-ink-400">المبيعات</div>
              <div className="mt-1 text-2xl font-black tracking-tight text-ink-950">{formatCurrency(kpis.totalSales)}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-ink-400">الذمم</div>
              <div className="mt-1 text-xl font-black tracking-tight text-ink-950">{formatCurrency(kpis.totalReceivables)}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-ink-400">قيمة المخزون</div>
              <div className="mt-1 text-xl font-black tracking-tight text-ink-950">{formatCurrency(kpis.inventoryValue)}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-ink-400">الفواتير</div>
              <div className="mt-1 text-xl font-black tracking-tight text-ink-950">{formatNumber(kpis.invoiceCount)}</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] text-ink-500">
            <span>As of: {asOf}</span>
            <span>•</span>
            <span>أعمار الذمم: {aging.status === 'CALCULATED' ? 'قابلة للحساب' : aging.status === 'NO_DATA' ? 'لا توجد بيانات' : 'بيانات غير كافية'}</span>
            {aging.unknownRows != null && aging.unknownRows > 0 && <><span>•</span><span className="font-semibold text-warning-700">{formatNumber(aging.unknownRows)} صفوف خارج الحكم</span></>}
            {qualityIssueTotal != null && <><span>•</span><span className={qualityIssueTotal > 0 ? 'font-semibold text-warning-700' : 'text-success-700'}>ضغط الجودة: {formatNumber(qualityIssueTotal)}</span></>}
          </div>
        </div>
        <div className="flex min-w-[220px] flex-col justify-between rounded-2xl bg-ink-950 p-4 text-white">
          <div>
            <div className="text-[9px] font-black tracking-[.12em] text-primary-200">NEXT ACTION</div>
            <div className="mt-2 text-sm font-black">{nextLabel}</div>
            <p className="mt-2 text-[10px] leading-5 text-ink-300">المؤشرات المعروضة تعكس اللقطة الحالية فقط؛ غياب القيمة يبقى ظاهرًا ولا يُستبدل بتقدير.</p>
          </div>
          <Link to={nextPath} className="mt-4 inline-flex items-center justify-center rounded-xl bg-white px-3 py-2 text-xs font-bold text-ink-950 transition hover:bg-ink-100">{nextLabel} ←</Link>
        </div>
      </div>
    </section>

    <section className="grid gap-4 lg:grid-cols-[1.4fr_.6fr] items-end">
      <div className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
        <div className="section-kicker">بيانات → دليل → قرار</div>
        <h1 className="mt-1 text-[22px] font-black tracking-tight text-ink-950 lg:text-[28px]">التقرير ليس شاشة أرقام؛ إنه حزمة أدلة قابلة للمراجعة.</h1>
        <p className="mt-2 max-w-3xl text-[11px] leading-5 text-ink-500">استخدم التقارير لتفسير الحالة الحالية، مع الحفاظ على مؤشرات نقص البيانات والحالات غير القابلة للحساب بدل إخفائها.</p>
      </div>
      <div className="rounded-[18px] border border-ink-200 bg-ink-50 p-4 text-sm shadow-sm">
        <div className="font-semibold">قاعدة العرض</div>
        <div className="mt-2 text-[10px] leading-5 text-ink-500">مصدر واضح · حالة بيانات واضحة · لا رقم بديل عند غياب المصدر</div>
      </div>
    </section>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {reportCards.map((r) => {
        const reportStatus =
          r.path === '/reports/inventory' ? (kpis.inventoryValue == null ? 'INSUFFICIENT DATA' : truthLabel) :
          r.path === '/reports/receivables' ? (kpis.totalReceivables == null ? 'INSUFFICIENT DATA' : truthLabel) :
          (kpis.status === 'CONFIRMED' ? 'VERIFIED' : kpis.status === 'CALCULATED' ? 'CALCULATED' : 'INSUFFICIENT DATA');
        const statusTone = reportStatus === 'VERIFIED' ? 'badge-success' : reportStatus === 'CALCULATED' ? 'badge-primary' : 'badge-warning';
        return <Link key={r.path} to={r.path} className="group">
          <Card className="ag-report-card h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
            <CardBody>
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${r.iconClass}`}><r.icon size={20}/></div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-ink-50 px-2.5 py-1 text-[10px] font-bold text-ink-500">{r.stage}</span>
                    <span className={`badge ${statusTone}`}>{reportStatus}</span>
                  </div>
                  <h3 className="text-base font-bold text-ink-900">{r.title}</h3>
                  <p className="mt-1 text-xs leading-6 text-ink-500">{r.desc}</p>
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-ink-100 pt-2.5">
                    <span className="text-[10px] font-semibold text-ink-400">{reportStatus === 'INSUFFICIENT DATA' ? 'لا تتخذ قرارًا قبل استكمال المصدر' : 'اللقطة الحالية قابلة للفحص'}</span>
                    <span className="text-xs font-black text-primary-700 group-hover:translate-x-0.5 transition-transform">فتح التقرير ←</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Link>;
      })}
    </div>

    <section className="grid gap-4 lg:grid-cols-3">
      <Link to="/reports/executive" className="card card-hover p-4">
        <div className="text-[9px] font-black tracking-[.12em] text-primary-700">DECISION OUTPUT</div>
        <h3 className="mt-2 text-sm font-black text-ink-900">تقارير القرار والتوصية</h3>
        <p className="mt-1 text-[10px] leading-5 text-ink-500">استخدم التقرير التنفيذي كسطح مخرجات القرار الحالي، مع بقاء الدليل والسياق ظاهرين.</p>
      </Link>
      <Link to="/data-quality" className="card card-hover p-4">
        <div className="text-[9px] font-black tracking-[.12em] text-primary-700">AUDIT OUTPUT</div>
        <h3 className="mt-2 text-sm font-black text-ink-900">جودة البيانات والتدقيق</h3>
        <p className="mt-1 text-[10px] leading-5 text-ink-500">مسار الجودة هو المصدر الحالي لمراجعة الحالات بدل إنشاء تقرير تدقيق منفصل ببيانات مكررة.</p>
      </Link>
      <div className="card p-4 border-warning-200 bg-warning-50/35">
        <div className="text-[9px] font-black tracking-[.12em] text-warning-800">NOT AVAILABLE</div>
        <h3 className="mt-2 text-sm font-black text-ink-900">Report Builder</h3>
        <p className="mt-1 text-[10px] leading-5 text-warning-900">لا توجد شاشة بناء تقارير مستقلة مثبتة في المسار الحالي؛ لا يتم محاكاة محرر لا يملك مسارًا حقيقيًا.</p>
      </div>
    </section>
  </div>;
}
export function SalesReportPage(){const [snapshot,setSnapshot]=useState<Awaited<ReturnType<typeof fetchDashboardSnapshot>>|null>(null);const [invoices,setInvoices]=useState<SalesInvoice[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState<string|null>(null);const load=useCallback(async()=>{try{setLoading(true);const [snap,inv]=await Promise.all([fetchDashboardSnapshot(6),fetchSalesInvoices(0,20)]);setSnapshot(snap);setInvoices(inv.data);}catch(e){setError(errorMessage(e));}finally{setLoading(false);}},[]);useEffect(()=>{void load();},[load]);if(loading)return <LoadingState/>;if(error)return <ErrorState message={error} onRetry={load}/>;if(!snapshot)return <DataUnavailableState title="تقرير المبيعات ينتظر البيانات" message="لم تصل صورة مبيعات موثوقة من المصدر الحالي؛ لا يتم عرض تقرير فارغ أو قيم بديلة." action={<Link to="/import" className="btn-primary text-[11px]">إضافة مصدر</Link>}/>;const {kpis,trend,topCustomers,topProducts,categories}=snapshot;const exportSales=async()=>{const rows=await fetchSalesExportRows();downloadReportArtifact('sales-report','تقرير المبيعات',['رقم الفاتورة','العميل','التاريخ','الإجمالي','المدفوع','الحالة'],rows.map(r=>({'رقم الفاتورة':r.invoice_number,'العميل':r.customer,'التاريخ':r.invoice_date,'الإجمالي':r.total,'المدفوع':r.paid_amount,'الحالة':r.status})));};return <div dir="rtl" className="report-page space-y-5 animate-fade-in"><PageHeader title="تقرير المبيعات" subtitle="تحليل شامل لأداء المبيعات" actions={<div className="flex items-center gap-2"><button onClick={()=>void exportSales()} className="btn-secondary text-xs">تصدير XLSX</button><button type="button" onClick={()=>window.print()} className="btn-primary print-hide text-xs">طباعة</button></div>}/><ReportTruthBar status={kpis.status} asOf={snapshot.asOf} period={`آخر ${snapshot.months} أشهر`} note="المبيعات تقرأ من اللقطة الكانونية الحالية."/><div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Card><CardBody><div className="text-xs text-ink-500 mb-1">إجمالي المبيعات</div><div className="text-xl font-bold text-ink-900">{formatCurrency(kpis.totalSales)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">عدد الفواتير</div><div className="text-xl font-bold text-ink-900">{formatNumber(kpis.invoiceCount)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">متوسط قيمة الفاتورة</div><div className="text-xl font-bold text-ink-900">{formatCurrency(kpis.avgInvoiceValue)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">معدل التحصيل</div><div className="text-xl font-bold text-ink-900">{kpis.collectionRate==null?'—':`${kpis.collectionRate.toFixed(1)}%`}</div></CardBody></Card></div><div className="grid grid-cols-1 lg:grid-cols-3 gap-4"><Card className="lg:col-span-2"><CardHeader title="اتجاه المبيعات" subtitle="آخر 6 أشهر"/><CardBody><TrendChart data={trend}/></CardBody></Card><Card><CardHeader title="المبيعات حسب الفئة"/><CardBody><CategoryPieChart data={categories}/></CardBody></Card></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><Card><CardHeader title="أفضل العملاء"/><CardBody><HorizontalBarChart data={topCustomers.slice(0,10)} dataKey="value" nameKey="name" height={300}/></CardBody></Card><Card><CardHeader title="أفضل المنتجات"/><CardBody><HorizontalBarChart data={topProducts.slice(0,10)} dataKey="value" nameKey="name" height={300}/></CardBody></Card></div><Card><CardHeader title="آخر الفواتير" subtitle="20 فاتورة الأخيرة"/><DataTable columns={[{key:'invoice_number',label:'رقم الفاتورة',render:(r:SalesInvoice)=><span className="font-medium text-primary-600">{r.invoice_number}</span>},{key:'customer',label:'العميل',render:(r:SalesInvoice)=>r.customer?.name||'—'},{key:'invoice_date',label:'التاريخ',render:(r:SalesInvoice)=>formatDate(r.invoice_date)},{key:'total',label:'الإجمالي',align:'right',render:(r:SalesInvoice)=>formatCurrency(r.total)},{key:'paid_amount',label:'المدفوع',align:'right',render:(r:SalesInvoice)=>formatCurrency(r.paid_amount)},{key:'status',label:'الحالة',align:'center',render:(r:SalesInvoice)=>{const map:Record<string,{variant:'success'|'primary'|'neutral';label:string}>={paid:{variant:'success',label:'مدفوعة'},confirmed:{variant:'primary',label:'مؤكدة'},draft:{variant:'neutral',label:'مسودة'}};const status=map[r.status]??{variant:'neutral',label:r.status};return <Badge variant={status.variant}>{status.label}</Badge>;}}]} data={invoices}/></Card></div>;}

export function PurchasesReportPage(){const [purchases,setPurchases]=useState<PurchaseInvoice[]>([]);const [summary,setSummary]=useState<{total:number|null;count:number;supplier_count:number;average:number|null}>({total:null,count:0,supplier_count:0,average:null});const [snapshot,setSnapshot]=useState<Awaited<ReturnType<typeof fetchDashboardSnapshot>>|null>(null);const [loading,setLoading]=useState(true);const [error,setError]=useState<string|null>(null);const load=useCallback(async()=>{try{setLoading(true);setError(null);const [rows,agg,snap]=await Promise.all([fetchPurchaseInvoices(0,20),fetchPurchaseSummary(),fetchDashboardSnapshot(6)]);setPurchases(rows.data);setSummary(agg);setSnapshot(snap);}catch(e){setError(errorMessage(e));}finally{setLoading(false);}},[]);useEffect(()=>{void load();},[load]);if(loading)return <LoadingState/>;if(error)return <ErrorState message={error} onRetry={load}/>;const exportPurchases=async()=>{const rows=await fetchPurchaseExportRows();downloadReportArtifact('purchase-report','تقرير المشتريات',['رقم الفاتورة','المورد','التاريخ','الإجمالي','المدفوع','الحالة'],rows.map(r=>({'رقم الفاتورة':r.invoice_number,'المورد':r.supplier,'التاريخ':r.invoice_date,'الإجمالي':r.total,'المدفوع':r.paid_amount,'الحالة':r.status})));};return <div dir="rtl" className="report-page space-y-5 animate-fade-in"><PageHeader title="تقرير المشتريات" subtitle="تحليل المشتريات والموردين" actions={<div className="flex items-center gap-2"><button onClick={()=>void exportPurchases()} className="btn-secondary text-xs">تصدير XLSX</button><button type="button" onClick={()=>window.print()} className="btn-primary print-hide text-xs">طباعة</button></div>}/><ReportTruthBar status={snapshot?.kpis.status ?? (summary.total == null ? 'INSUFFICIENT_DATA' : 'CALCULATED')} asOf={snapshot?.asOf} period={snapshot ? `آخر ${snapshot.months} أشهر` : 'غير محدد'} note="المشتريات تعرض أرقامها من سجلات الشراء مع سياق اللقطة الكانونية الحالية؛ لا يتم اعتبار غياب الإجمالي صفرًا."/><div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Card><CardBody><div className="text-xs text-ink-500 mb-1">إجمالي المشتريات</div><div className="text-xl font-bold text-ink-900">{formatCurrency(summary.total)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">عدد الفواتير</div><div className="text-xl font-bold text-ink-900">{formatNumber(summary.count)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">الموردين النشطين</div><div className="text-xl font-bold text-ink-900">{formatNumber(summary.supplier_count)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">متوسط الفاتورة</div><div className="text-xl font-bold text-ink-900">{formatCurrency(summary.average)}</div></CardBody></Card></div><Card><CardHeader title="آخر فواتير المشتريات"/><DataTable columns={[{key:'invoice_number',label:'رقم الفاتورة',render:(r:PurchaseInvoice)=><span className="font-medium text-primary-600">{r.invoice_number}</span>},{key:'supplier',label:'المورد',render:(r:PurchaseInvoice)=>r.supplier?.name||'—'},{key:'invoice_date',label:'التاريخ',render:(r:PurchaseInvoice)=>formatDate(r.invoice_date)},{key:'total',label:'الإجمالي',align:'right',render:(r:PurchaseInvoice)=>formatCurrency(r.total)},{key:'paid_amount',label:'المدفوع',align:'right',render:(r:PurchaseInvoice)=>formatCurrency(r.paid_amount)}]} data={purchases}/></Card></div>;}

export function InventoryReportPage(){const [snapshot,setSnapshot]=useState<Awaited<ReturnType<typeof fetchInventoryReportSnapshot>>|null>(null);const [loading,setLoading]=useState(true);const [error,setError]=useState<string|null>(null);const load=useCallback(async()=>{try{setLoading(true);setError(null);setSnapshot(await fetchInventoryReportSnapshot(0,25));}catch(e){setError(errorMessage(e));}finally{setLoading(false);}},[]);useEffect(()=>{void load();},[load]);if(loading)return <LoadingState/>;if(error)return <ErrorState message={error} onRetry={load}/>;if(!snapshot)return <DataUnavailableState title="تقرير المخزون ينتظر البيانات" message="لم تصل صورة موثوقة للمخزون؛ لا يتم تحويل غياب البيانات إلى أرقام صفرية أو صفحة فارغة." action={<Link to="/import" className="btn-primary text-[11px]">إضافة مصدر</Link>}/>;const exportInventory=async()=>{const rows=await fetchInventoryExportRows();downloadReportArtifact('inventory-report','تقرير المخزون',['المنتج','المستودع','الكمية','التكلفة','القيمة'],rows.map(r=>({'المنتج':r.product,'المستودع':r.warehouse,'الكمية':r.quantity,'التكلفة':r.unit_cost,'القيمة':r.value})));};return <div dir="rtl" className="report-page space-y-5 animate-fade-in"><PageHeader title="تقرير المخزون" subtitle="حالة المخزون والتقييم" actions={<div className="flex items-center gap-2"><button onClick={()=>void exportInventory()} className="btn-secondary text-xs">تصدير XLSX</button><button type="button" onClick={()=>window.print()} className="btn-primary print-hide text-xs">طباعة</button></div>}/><ReportTruthBar status={snapshot.dataStatus} period={`صفحة ${snapshot.page + 1}`} note="حالة التقييم مشتقة من صورة المخزون الحالية."/><div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Card><CardBody><div className="text-xs text-ink-500 mb-1">قيمة المخزون</div><div className="text-xl font-bold text-ink-900">{snapshot.totalValue==null?'—':formatCurrency(snapshot.totalValue)}</div>{snapshot.dataStatus==='INSUFFICIENT_DATA'&&<div className="text-xs text-warning-600 mt-1">بيانات غير كافية للتقييم</div>}</CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">عدد الأصناف</div><div className="text-xl font-bold text-ink-900">{formatNumber(snapshot.totalRows)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">مخزون منخفض</div><div className="text-xl font-bold text-warning-600">{formatNumber(snapshot.lowStock)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">نفد المخزون</div><div className="text-xl font-bold text-danger-600">{formatNumber(snapshot.outOfStock)}</div></CardBody></Card></div>{snapshot.unknownRows != null && snapshot.unknownRows > 0 && <div className="rounded-lg border border-warning-200 bg-warning-50 p-3 text-sm text-warning-800">هناك {formatNumber(snapshot.unknownRows)} صفوف مخزون ببيانات كمية/تكلفة غير مكتملة؛ لا تدخل هذه الحالة ضمن تقييمات مؤكدة.</div>}{snapshot.unknownRows == null && snapshot.dataStatus === 'INSUFFICIENT_DATA' && <div className="rounded-lg border border-warning-200 bg-warning-50 p-3 text-sm text-warning-800">يوجد نقص في بيانات المخزون، لكن عدد الصفوف غير متاح من المصدر؛ لا يتم تصنيع رقم بديل.</div>}<Card><CardHeader title="تفاصيل المخزون" subtitle={`الصفحة ${snapshot.page+1} — ${snapshot.totalRows == null ? 'إجمالي غير متاح' : `${formatNumber(snapshot.totalRows)} إجمالي`}`} /><DataTable columns={[{key:'product',label:'المنتج',render:(r:InventoryReportRow)=>r.product?.name||'—'},{key:'warehouse',label:'المستودع',render:(r:InventoryReportRow)=>r.warehouse?.name||'—'},{key:'quantity',label:'الكمية',align:'right',render:(r:InventoryReportRow)=>r.quantity==null?'غير متاح':formatNumber(r.quantity)},{key:'unit_cost',label:'التكلفة',align:'right',render:(r:InventoryReportRow)=>r.unit_cost==null?'غير متاح':formatCurrency(r.unit_cost)},{key:'value',label:'القيمة',align:'right',render:(r:InventoryReportRow)=>r.value==null?'غير متاح':formatCurrency(r.value)},{key:'status',label:'الحالة',align:'center',render:(r:InventoryReportRow)=>{if(r.quantity==null||r.unit_cost==null)return <Badge variant="neutral">بيانات ناقصة</Badge>;if(r.quantity<=0)return <Badge variant="danger">نفد</Badge>;if(r.product?.reorder_point!=null&&r.quantity<=r.product.reorder_point)return <Badge variant="warning">منخفض</Badge>;return <Badge variant="success">متاح</Badge>;}}]} data={snapshot.rows} pageSize={25}/></Card></div>;}

export function ReceivablesReportPage(){const [aging,setAging]=useState<AgingBucket[]>([]); const [agingStatus,setAgingStatus]=useState<'NO_DATA'|'CALCULATED'|'INSUFFICIENT_DATA'>('NO_DATA');const [invoices,setInvoices]=useState<SalesInvoice[]>([]); const [reportContext,setReportContext]=useState<{asOf:string;months:number}>({asOf:'',months:6});const [loading,setLoading]=useState(true);const [error,setError]=useState<string|null>(null);const load=useCallback(async()=>{try{setLoading(true);setError(null);const [snap,inv]=await Promise.all([fetchDashboardSnapshot(6),fetchSalesInvoices(0,50)]);setReportContext({asOf:snap.asOf,months:snap.months});setAging(snap.aging.rows);setAgingStatus(snap.aging.status);setInvoices(inv.data.filter(i=>i.total!=null&&i.paid_amount!=null&&i.total-i.paid_amount>0));}catch(e){setError(errorMessage(e));}finally{setLoading(false);}},[]);useEffect(()=>{void load();},[load]);if(loading)return <LoadingState/>;if(error)return <ErrorState message={error} onRetry={load}/>;const totalOutstanding=agingStatus==='CALCULATED'?aging.reduce((s,b)=>s+(b.amount??0),0):null;const exportReceivables=async()=>{const rows=await fetchReceivablesExportRows();downloadReportArtifact('receivables-report','تقرير الذمم والتحصيل',['رقم الفاتورة','العميل','تاريخ الفاتورة','تاريخ الاستحقاق','الإجمالي','المدفوع','المتبقي'],rows.map(r=>({'رقم الفاتورة':r.invoice_number,'العميل':r.customer,'تاريخ الفاتورة':r.invoice_date,'تاريخ الاستحقاق':r.due_date,'الإجمالي':r.total,'المدفوع':r.paid_amount,'المتبقي':r.balance})));};return <div dir="rtl" className="report-page space-y-5 animate-fade-in"><PageHeader title="تقرير الذمم والتحصيل" subtitle="تحليل الذمم المدينة وأعمار الفواتير" actions={<div className="flex items-center gap-2"><button onClick={()=>void exportReceivables()} className="btn-secondary text-xs">تصدير XLSX</button><button type="button" onClick={()=>window.print()} className="btn-primary print-hide text-xs">طباعة</button></div>}/><ReportTruthBar status={agingStatus === 'CALCULATED' ? 'CALCULATED' : 'INSUFFICIENT_DATA'} asOf={reportContext.asOf || undefined} period={`آخر ${reportContext.months} أشهر`} note="أعمار الذمم تبقى غير محسوبة عندما لا تكفي البيانات."/><div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Card><CardBody><div className="text-xs text-ink-500 mb-1">إجمالي الذمم</div><div className="text-xl font-bold text-ink-900">{formatCurrency(totalOutstanding)}</div></CardBody></Card>{aging.map(b=><Card key={b.bucket}><CardBody><div className="text-xs text-ink-500 mb-1">{b.bucket} يوم</div><div className="text-lg font-bold text-ink-900">{formatCurrency(b.amount)}</div><div className="text-xs text-ink-400 mt-1">{b.count} فاتورة</div></CardBody></Card>)}</div><Card><CardHeader title="الفواتير المستحقة" subtitle="الفواتير غير المدفوعة بالكامل"/><DataTable columns={[{key:'invoice_number',label:'رقم الفاتورة',render:(r:SalesInvoice)=><span className="font-medium text-primary-600">{r.invoice_number}</span>},{key:'customer',label:'العميل',render:(r:SalesInvoice)=>r.customer?.name||'—'},{key:'invoice_date',label:'تاريخ الفاتورة',render:(r:SalesInvoice)=>formatDate(r.invoice_date)},{key:'due_date',label:'تاريخ الاستحقاق',render:(r:SalesInvoice)=>formatDate(r.due_date)},{key:'total',label:'الإجمالي',align:'right',render:(r:SalesInvoice)=>formatCurrency(r.total)},{key:'paid_amount',label:'المدفوع',align:'right',render:(r:SalesInvoice)=>formatCurrency(r.paid_amount)},{key:'balance',label:'المتبقي',align:'right',render:(r:SalesInvoice)=><span className="font-semibold text-danger-600">{r.total==null||r.paid_amount==null?'—':formatCurrency(r.total-r.paid_amount)}</span>}]} data={invoices}/></Card></div>;}

export function ProfitabilityReportPage(){const [snapshot,setSnapshot]=useState<Awaited<ReturnType<typeof fetchDashboardSnapshot>>|null>(null);const [loading,setLoading]=useState(true);const [error,setError]=useState<string|null>(null);const load=useCallback(async()=>{try{setLoading(true);setError(null);setSnapshot(await fetchDashboardSnapshot(6));}catch(e){setError(errorMessage(e));}finally{setLoading(false);}},[]);useEffect(()=>{void load();},[load]);if(loading)return <LoadingState/>;if(error)return <ErrorState message={error} onRetry={load}/>;if(!snapshot)return <DataUnavailableState title="تقرير الربحية ينتظر البيانات" message="لا يمكن عرض الربحية دون صورة بيانات موثوقة؛ لا يتم اختلاق تكلفة أو هامش عند غياب المصدر." action={<Link to="/import" className="btn-primary text-[11px]">إضافة مصدر</Link>}/>;const {kpis,categories}=snapshot;const exportProfitability=()=>downloadReportArtifact('profitability-report','تقرير الأرباح والربحية',['الفئة','المبيعات','الربح','الهامش','الكمية'],categories.map(category=>({'الفئة':category.name,'المبيعات':category.sales,'الربح':category.profit,'الهامش':category.sales>0?`${((category.profit/category.sales)*100).toFixed(1)}%`:null,'الكمية':category.quantity})));return <div dir="rtl" className="report-page space-y-5 animate-fade-in"><PageHeader title="تقرير الأرباح والربحية" subtitle="تحليل الربحية حسب الفئة والمنتج" actions={<div className="flex items-center gap-2"><button onClick={exportProfitability} className="btn-secondary text-xs">تصدير XLSX</button><button type="button" onClick={()=>window.print()} className="btn-primary print-hide text-xs">طباعة</button></div>}/><ReportTruthBar status={kpis.status} asOf={snapshot.asOf} period={`آخر ${snapshot.months} أشهر`} note="الربحية تعتمد على تكلفة مثبتة في اللقطة؛ لا يتم تعويض النقص."/><div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Card><CardBody><div className="text-xs text-ink-500 mb-1">إجمالي المبيعات</div><div className="text-xl font-bold text-ink-900">{formatCurrency(kpis.totalSales)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">إجمالي التكلفة</div><div className="text-xl font-bold text-ink-900">{formatCurrency(kpis.totalCost)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">إجمالي الربح</div><div className="text-xl font-bold text-success-600">{formatCurrency(kpis.grossProfit)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">هامش الربح</div><div className="text-xl font-bold text-success-600">{kpis.grossMargin==null?'—':`${kpis.grossMargin.toFixed(1)}%`}</div></CardBody></Card></div><Card><CardHeader title="الربحية حسب الفئة"/><DataTable columns={[{key:'name',label:'الفئة'},{key:'sales',label:'المبيعات',align:'right',render:(r:CategoryBreakdown)=>formatCurrency(r.sales)},{key:'profit',label:'الربح',align:'right',render:(r:CategoryBreakdown)=>formatCurrency(r.profit)},{key:'margin',label:'الهامش',align:'right',render:(r:CategoryBreakdown)=>r.sales>0?`${((r.profit/r.sales)*100).toFixed(1)}%`:'—'},{key:'quantity',label:'الكمية',align:'right',render:(r:CategoryBreakdown)=>formatNumber(r.quantity)}]} data={categories}/></Card></div>;}
