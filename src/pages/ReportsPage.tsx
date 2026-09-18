import { lazy, Suspense, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FileBarChart, ShoppingCart, Package, Receipt, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader, LoadingState, ErrorState } from '@/components/ui/States';
import { TruthContextStrip } from '@/components/TruthContextStrip';
import { DataTable } from '@/components/ui/DataTable';
const TrendChart = lazy(async () => ({ default: (await import('@/components/ui/Charts')).TrendChart }));
const HorizontalBarChart = lazy(async () => ({ default: (await import('@/components/ui/Charts')).HorizontalBarChart }));
const CategoryPieChart = lazy(async () => ({ default: (await import('@/components/ui/Charts')).CategoryPieChart }));
import { fetchDashboardSnapshot, fetchInventoryReportSnapshot } from '@/lib/dashboard-canonical';
import { fetchSalesInvoices, fetchPurchaseInvoices, fetchPurchaseSummary, fetchSalesExportRows, fetchPurchaseExportRows, fetchInventoryExportRows, fetchReceivablesExportRows } from '@/lib/queries';
import { formatCurrency, formatNumber, formatDate } from '@/lib/format';
import { downloadReportArtifact } from '@/lib/report-execution/download';
import type { SalesInvoice, PurchaseInvoice } from '@/lib/types';
import type { DashboardKPIs, MonthlyTrend, TopEntity, CategoryBreakdown, AgingBucket, InventoryReportRow } from '@/lib/dashboard-canonical';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
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

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSnapshot(await fetchDashboardSnapshot(6));
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <LoadingState message="جارٍ بناء مخرجات القرار من اللقطة الكانونية..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!snapshot) return null;

  const { kpis, asOf, months } = snapshot;
  const coverageValues = [
    kpis.totalSales,
    kpis.grossProfit,
    kpis.totalReceivables,
    kpis.inventoryValue,
    kpis.totalCustomers,
    kpis.totalProducts,
    kpis.invoiceCount,
    kpis.collectionRate,
  ];
  const coverage = Math.round((coverageValues.filter(value => value !== null).length / coverageValues.length) * 100);
  const decisionCards = [
    { label: 'المبيعات', value: kpis.totalSales, path: '/reports/sales', hint: 'الحركة التجارية والفواتير والعملاء والمنتجات.' },
    { label: 'الربحية', value: kpis.grossProfit, path: '/reports/profitability', hint: 'الإيراد والتكلفة والهامش قبل القرار.' },
    { label: 'الذمم', value: kpis.totalReceivables, path: '/reports/receivables', hint: 'التعرض المالي ومسار التحصيل.' },
    { label: 'المخزون', value: kpis.inventoryValue, path: '/reports/inventory-intelligence', hint: 'القيمة والتغطية وحالات البيانات غير المكتملة.' },
  ];

  return <div dir="rtl" className="space-y-5 animate-fade-in pb-10">
    <PageHeader
      title="مركز التقارير"
      subtitle="مخرجات قرار مرتبطة باللقطة الكانونية؛ التقرير يبدأ من حالة المال والدليل ثم يفتح التفصيل."
      actions={<button type="button" onClick={() => void load()} className="btn-secondary text-xs">تحديث الصورة</button>}
    />

    <TruthContextStrip months={months} status={kpis.status} asOf={asOf} />

    <section className="rounded-[14px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
      <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <div>
          <div className="section-kicker">بيانات → دليل → قرار → نتيجة</div>
          <h1 className="mt-1 text-[22px] font-black tracking-tight text-ink-950 lg:text-[28px]">ابدأ من السؤال التجاري، وليس من نوع التقرير.</h1>
          <p className="mt-2 max-w-3xl text-[11px] leading-5 text-ink-500">
            هذه المساحة تعكس الحالة الحالية من المصدر الكانوني، ثم تفتح المسار المختص. لا يتم تعويض الرقم المفقود بصفر ولا تُفترض سببية غير موجودة في الدليل.
          </p>
        </div>
        <div className="rounded-[12px] border border-primary-100 bg-primary-50/60 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.12em] text-primary-700">درجة اكتمال الصورة</div>
          <div className="mt-2 text-3xl font-black tabular-nums text-primary-900">{coverage}%</div>
          <div className="mt-1 text-[10px] leading-5 text-primary-800/70">٨ مؤشرات أساسية جرى التحقق من وجود قيمة موثوقة لها في اللقطة الحالية.</div>
          <a href="/data-quality" className="mt-3 inline-flex text-xs font-bold text-primary-700 hover:text-primary-900">فحص حدود الدليل ←</a>
        </div>
      </div>
    </section>

    <section aria-label="مخرجات القرار الحالية" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {decisionCards.map(card => (
        <Link key={card.path} to={card.path} className="group rounded-[14px] border border-ink-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-ink-500">{card.label}</span>
            <span className="text-[10px] font-bold text-primary-600 transition group-hover:translate-x-0.5">فتح المسار ←</span>
          </div>
          <div className="mt-3 text-xl font-black tabular-nums text-ink-950">{formatCurrency(card.value)}</div>
          <p className="mt-2 text-[10px] leading-5 text-ink-400">{card.hint}</p>
          <div className="mt-3 border-t border-ink-100 pt-2 text-[10px] font-semibold text-ink-400">الحالة: {kpis.status === 'CONFIRMED' ? 'مصدر مؤكد' : kpis.status === 'CALCULATED' ? 'محسوب من المصدر' : 'بيانات غير كافية'}</div>
        </Link>
      ))}
    </section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {reportCards.map((r) => <Link key={r.path} to={r.path} className="group">
        <Card className="h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
          <CardBody>
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${r.iconClass}`}><r.icon size={20}/></div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-ink-50 px-2.5 py-1 text-[10px] font-bold text-ink-500">{r.stage}</span>
                  <span className="text-xs text-ink-400 group-hover:text-primary-600">فتح التقرير ←</span>
                </div>
                <h3 className="text-base font-bold text-ink-900">{r.title}</h3>
                <p className="mt-1 text-xs leading-6 text-ink-500">{r.desc}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </Link>)}
    </section>
  </div>;
}

export function SalesReportPage(){const [snapshot,setSnapshot]=useState<Awaited<ReturnType<typeof fetchDashboardSnapshot>>|null>(null);const [invoices,setInvoices]=useState<SalesInvoice[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState<string|null>(null);const load=useCallback(async()=>{try{setLoading(true);const [snap,inv]=await Promise.all([fetchDashboardSnapshot(6),fetchSalesInvoices(0,20)]);setSnapshot(snap);setInvoices(inv.data);}catch(e){setError(errorMessage(e));}finally{setLoading(false);}},[]);useEffect(()=>{void load();},[load]);if(loading)return <LoadingState/>;if(error)return <ErrorState message={error} onRetry={load}/>;if(!snapshot)return null;const {kpis,trend,topCustomers,topProducts,categories}=snapshot;const exportSales=async()=>{const rows=await fetchSalesExportRows();downloadReportArtifact('sales-report','تقرير المبيعات',['رقم الفاتورة','العميل','التاريخ','الإجمالي','المدفوع','الحالة'],rows.map(r=>({'رقم الفاتورة':r.invoice_number,'العميل':r.customer,'التاريخ':r.invoice_date,'الإجمالي':r.total,'المدفوع':r.paid_amount,'الحالة':r.status})));};return <div dir="rtl" className="report-page space-y-5 animate-fade-in"><PageHeader title="تقرير المبيعات" subtitle="تحليل شامل لأداء المبيعات" actions={<div className="flex items-center gap-2"><button onClick={()=>void exportSales()} className="btn-secondary text-xs">تصدير XLSX</button><button type="button" onClick={()=>window.print()} className="btn-primary print-hide text-xs">طباعة</button></div>}/><div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Card><CardBody><div className="text-xs text-ink-500 mb-1">إجمالي المبيعات</div><div className="text-xl font-bold text-ink-900">{formatCurrency(kpis.totalSales)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">عدد الفواتير</div><div className="text-xl font-bold text-ink-900">{formatNumber(kpis.invoiceCount)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">متوسط قيمة الفاتورة</div><div className="text-xl font-bold text-ink-900">{formatCurrency(kpis.avgInvoiceValue)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">معدل التحصيل</div><div className="text-xl font-bold text-ink-900">{kpis.collectionRate==null?'—':`${kpis.collectionRate.toFixed(1)}%`}</div></CardBody></Card></div><div className="grid grid-cols-1 lg:grid-cols-3 gap-4"><Card className="lg:col-span-2"><CardHeader title="اتجاه المبيعات" subtitle="آخر 6 أشهر"/><CardBody><Suspense fallback={<div className="flex h-[280px] items-center justify-center text-xs text-ink-400">جارٍ تحميل الرسم...</div>}><TrendChart data={trend}/></Suspense></CardBody></Card><Card><CardHeader title="المبيعات حسب الفئة"/><CardBody><Suspense fallback={<div className="flex h-[280px] items-center justify-center text-xs text-ink-400">جارٍ تحميل الرسم...</div>}><CategoryPieChart data={categories}/></Suspense></CardBody></Card></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><Card><CardHeader title="أفضل العملاء"/><CardBody><Suspense fallback={<div className="flex h-[300px] items-center justify-center text-xs text-ink-400">جارٍ تحميل الرسم...</div>}><HorizontalBarChart data={topCustomers.slice(0,10)} dataKey="value" nameKey="name" height={300}/></Suspense></CardBody></Card><Card><CardHeader title="أفضل المنتجات"/><CardBody><Suspense fallback={<div className="flex h-[300px] items-center justify-center text-xs text-ink-400">جارٍ تحميل الرسم...</div>}><HorizontalBarChart data={topProducts.slice(0,10)} dataKey="value" nameKey="name" height={300}/></Suspense></CardBody></Card></div><Card><CardHeader title="آخر الفواتير" subtitle="20 فاتورة الأخيرة"/><DataTable columns={[{key:'invoice_number',label:'رقم الفاتورة',render:(r:SalesInvoice)=><span className="font-medium text-primary-600">{r.invoice_number}</span>},{key:'customer',label:'العميل',render:(r:SalesInvoice)=>r.customer?.name||'—'},{key:'invoice_date',label:'التاريخ',render:(r:SalesInvoice)=>formatDate(r.invoice_date)},{key:'total',label:'الإجمالي',align:'right',render:(r:SalesInvoice)=>formatCurrency(r.total)},{key:'paid_amount',label:'المدفوع',align:'right',render:(r:SalesInvoice)=>formatCurrency(r.paid_amount)},{key:'status',label:'الحالة',align:'center',render:(r:SalesInvoice)=>{const map:Record<string,{variant:'success'|'primary'|'neutral';label:string}>={paid:{variant:'success',label:'مدفوعة'},confirmed:{variant:'primary',label:'مؤكدة'},draft:{variant:'neutral',label:'مسودة'}};const status=map[r.status]??{variant:'neutral',label:r.status};return <Badge variant={status.variant}>{status.label}</Badge>;}}]} data={invoices}/></Card></div>;}

export function PurchasesReportPage(){const [purchases,setPurchases]=useState<PurchaseInvoice[]>([]);const [summary,setSummary]=useState<{total:number|null;count:number;supplier_count:number;average:number|null}>({total:null,count:0,supplier_count:0,average:null});const [loading,setLoading]=useState(true);const [error,setError]=useState<string|null>(null);useEffect(()=>{Promise.all([fetchPurchaseInvoices(0,20),fetchPurchaseSummary()]).then(([rows,agg])=>{setPurchases(rows.data);setSummary(agg);setLoading(false);}).catch(e=>{setError(errorMessage(e));setLoading(false);});},[]);if(loading)return <LoadingState/>;if(error)return <ErrorState message={error} onRetry={()=>window.location.reload()}/>;const exportPurchases=async()=>{const rows=await fetchPurchaseExportRows();downloadReportArtifact('purchase-report','تقرير المشتريات',['رقم الفاتورة','المورد','التاريخ','الإجمالي','المدفوع','الحالة'],rows.map(r=>({'رقم الفاتورة':r.invoice_number,'المورد':r.supplier,'التاريخ':r.invoice_date,'الإجمالي':r.total,'المدفوع':r.paid_amount,'الحالة':r.status})));};return <div dir="rtl" className="report-page space-y-5 animate-fade-in"><PageHeader title="تقرير المشتريات" subtitle="تحليل المشتريات والموردين" actions={<div className="flex items-center gap-2"><button onClick={()=>void exportPurchases()} className="btn-secondary text-xs">تصدير XLSX</button><button type="button" onClick={()=>window.print()} className="btn-primary print-hide text-xs">طباعة</button></div>}/><div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Card><CardBody><div className="text-xs text-ink-500 mb-1">إجمالي المشتريات</div><div className="text-xl font-bold text-ink-900">{formatCurrency(summary.total)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">عدد الفواتير</div><div className="text-xl font-bold text-ink-900">{formatNumber(summary.count)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">الموردين النشطين</div><div className="text-xl font-bold text-ink-900">{formatNumber(summary.supplier_count)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">متوسط الفاتورة</div><div className="text-xl font-bold text-ink-900">{formatCurrency(summary.average)}</div></CardBody></Card></div><Card><CardHeader title="آخر فواتير المشتريات"/><DataTable columns={[{key:'invoice_number',label:'رقم الفاتورة',render:(r:PurchaseInvoice)=><span className="font-medium text-primary-600">{r.invoice_number}</span>},{key:'supplier',label:'المورد',render:(r:PurchaseInvoice)=>r.supplier?.name||'—'},{key:'invoice_date',label:'التاريخ',render:(r:PurchaseInvoice)=>formatDate(r.invoice_date)},{key:'total',label:'الإجمالي',align:'right',render:(r:PurchaseInvoice)=>formatCurrency(r.total)},{key:'paid_amount',label:'المدفوع',align:'right',render:(r:PurchaseInvoice)=>formatCurrency(r.paid_amount)}]} data={purchases}/></Card></div>;}

export function InventoryReportPage(){const [snapshot,setSnapshot]=useState<Awaited<ReturnType<typeof fetchInventoryReportSnapshot>>|null>(null);const [loading,setLoading]=useState(true);const [error,setError]=useState<string|null>(null);useEffect(()=>{fetchInventoryReportSnapshot(0,25).then(snap=>{setSnapshot(snap);setLoading(false);}).catch(e=>{setError(errorMessage(e));setLoading(false);});},[]);if(loading)return <LoadingState/>;if(error)return <ErrorState message={error} onRetry={()=>window.location.reload()}/>;if(!snapshot)return null;const exportInventory=async()=>{const rows=await fetchInventoryExportRows();downloadReportArtifact('inventory-report','تقرير المخزون',['المنتج','المستودع','الكمية','التكلفة','القيمة'],rows.map(r=>({'المنتج':r.product,'المستودع':r.warehouse,'الكمية':r.quantity,'التكلفة':r.unit_cost,'القيمة':r.value})));};return <div dir="rtl" className="report-page space-y-5 animate-fade-in"><PageHeader title="تقرير المخزون" subtitle="حالة المخزون والتقييم" actions={<div className="flex items-center gap-2"><button onClick={()=>void exportInventory()} className="btn-secondary text-xs">تصدير XLSX</button><button type="button" onClick={()=>window.print()} className="btn-primary print-hide text-xs">طباعة</button></div>}/><div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Card><CardBody><div className="text-xs text-ink-500 mb-1">قيمة المخزون</div><div className="text-xl font-bold text-ink-900">{snapshot.totalValue==null?'—':formatCurrency(snapshot.totalValue)}</div>{snapshot.dataStatus==='INSUFFICIENT_DATA'&&<div className="text-xs text-warning-600 mt-1">بيانات غير كافية للتقييم</div>}</CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">عدد الأصناف</div><div className="text-xl font-bold text-ink-900">{formatNumber(snapshot.totalRows)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">مخزون منخفض</div><div className="text-xl font-bold text-warning-600">{formatNumber(snapshot.lowStock)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">نفد المخزون</div><div className="text-xl font-bold text-danger-600">{formatNumber(snapshot.outOfStock)}</div></CardBody></Card></div>{snapshot.unknownRows != null && snapshot.unknownRows > 0 && <div className="rounded-lg border border-warning-200 bg-warning-50 p-3 text-sm text-warning-800">هناك {formatNumber(snapshot.unknownRows)} صفوف مخزون ببيانات كمية/تكلفة غير مكتملة؛ لا تدخل هذه الحالة ضمن تقييمات مؤكدة.</div>}{snapshot.unknownRows == null && snapshot.dataStatus === 'INSUFFICIENT_DATA' && <div className="rounded-lg border border-warning-200 bg-warning-50 p-3 text-sm text-warning-800">يوجد نقص في بيانات المخزون، لكن عدد الصفوف غير متاح من المصدر؛ لا يتم تصنيع رقم بديل.</div>}<Card><CardHeader title="تفاصيل المخزون" subtitle={`الصفحة ${snapshot.page+1} — ${snapshot.totalRows == null ? 'إجمالي غير متاح' : `${formatNumber(snapshot.totalRows)} إجمالي`}`} /><DataTable columns={[{key:'product',label:'المنتج',render:(r:InventoryReportRow)=>r.product?.name||'—'},{key:'warehouse',label:'المستودع',render:(r:InventoryReportRow)=>r.warehouse?.name||'—'},{key:'quantity',label:'الكمية',align:'right',render:(r:InventoryReportRow)=>r.quantity==null?'غير متاح':formatNumber(r.quantity)},{key:'unit_cost',label:'التكلفة',align:'right',render:(r:InventoryReportRow)=>r.unit_cost==null?'غير متاح':formatCurrency(r.unit_cost)},{key:'value',label:'القيمة',align:'right',render:(r:InventoryReportRow)=>r.value==null?'غير متاح':formatCurrency(r.value)},{key:'status',label:'الحالة',align:'center',render:(r:InventoryReportRow)=>{if(r.quantity==null||r.unit_cost==null)return <Badge variant="neutral">بيانات ناقصة</Badge>;if(r.quantity<=0)return <Badge variant="danger">نفد</Badge>;if(r.product?.reorder_point!=null&&r.quantity<=r.product.reorder_point)return <Badge variant="warning">منخفض</Badge>;return <Badge variant="success">متاح</Badge>;}}]} data={snapshot.rows} pageSize={25}/></Card></div>;}

export function ReceivablesReportPage(){const [aging,setAging]=useState<AgingBucket[]>([]); const [agingStatus,setAgingStatus]=useState<'NO_DATA'|'CALCULATED'|'INSUFFICIENT_DATA'>('NO_DATA');const [invoices,setInvoices]=useState<SalesInvoice[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState<string|null>(null);useEffect(()=>{Promise.all([fetchDashboardSnapshot(6),fetchSalesInvoices(0,50)]).then(([snap,inv])=>{setAging(snap.aging.rows);setAgingStatus(snap.aging.status);setInvoices(inv.data.filter(i=>i.total!=null&&i.paid_amount!=null&&i.total-i.paid_amount>0));setLoading(false);}).catch(e=>{setError(errorMessage(e));setLoading(false);});},[]);if(loading)return <LoadingState/>;if(error)return <ErrorState message={error} onRetry={()=>window.location.reload()}/>;const totalOutstanding=agingStatus==='CALCULATED'?aging.reduce((s,b)=>s+(b.amount??0),0):null;const exportReceivables=async()=>{const rows=await fetchReceivablesExportRows();downloadReportArtifact('receivables-report','تقرير الذمم والتحصيل',['رقم الفاتورة','العميل','تاريخ الفاتورة','تاريخ الاستحقاق','الإجمالي','المدفوع','المتبقي'],rows.map(r=>({'رقم الفاتورة':r.invoice_number,'العميل':r.customer,'تاريخ الفاتورة':r.invoice_date,'تاريخ الاستحقاق':r.due_date,'الإجمالي':r.total,'المدفوع':r.paid_amount,'المتبقي':r.balance})));};return <div dir="rtl" className="report-page space-y-5 animate-fade-in"><PageHeader title="تقرير الذمم والتحصيل" subtitle="تحليل الذمم المدينة وأعمار الفواتير" actions={<div className="flex items-center gap-2"><button onClick={()=>void exportReceivables()} className="btn-secondary text-xs">تصدير XLSX</button><button type="button" onClick={()=>window.print()} className="btn-primary print-hide text-xs">طباعة</button></div>}/><div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Card><CardBody><div className="text-xs text-ink-500 mb-1">إجمالي الذمم</div><div className="text-xl font-bold text-ink-900">{formatCurrency(totalOutstanding)}</div></CardBody></Card>{aging.map(b=><Card key={b.bucket}><CardBody><div className="text-xs text-ink-500 mb-1">{b.bucket} يوم</div><div className="text-lg font-bold text-ink-900">{formatCurrency(b.amount)}</div><div className="text-xs text-ink-400 mt-1">{b.count} فاتورة</div></CardBody></Card>)}</div><Card><CardHeader title="الفواتير المستحقة" subtitle="الفواتير غير المدفوعة بالكامل"/><DataTable columns={[{key:'invoice_number',label:'رقم الفاتورة',render:(r:SalesInvoice)=><span className="font-medium text-primary-600">{r.invoice_number}</span>},{key:'customer',label:'العميل',render:(r:SalesInvoice)=>r.customer?.name||'—'},{key:'invoice_date',label:'تاريخ الفاتورة',render:(r:SalesInvoice)=>formatDate(r.invoice_date)},{key:'due_date',label:'تاريخ الاستحقاق',render:(r:SalesInvoice)=>formatDate(r.due_date)},{key:'total',label:'الإجمالي',align:'right',render:(r:SalesInvoice)=>formatCurrency(r.total)},{key:'paid_amount',label:'المدفوع',align:'right',render:(r:SalesInvoice)=>formatCurrency(r.paid_amount)},{key:'balance',label:'المتبقي',align:'right',render:(r:SalesInvoice)=><span className="font-semibold text-danger-600">{r.total==null||r.paid_amount==null?'—':formatCurrency(r.total-r.paid_amount)}</span>}]} data={invoices}/></Card></div>;}

export function ProfitabilityReportPage(){const [snapshot,setSnapshot]=useState<Awaited<ReturnType<typeof fetchDashboardSnapshot>>|null>(null);const [loading,setLoading]=useState(true);const [error,setError]=useState<string|null>(null);useEffect(()=>{fetchDashboardSnapshot(6).then(setSnapshot).catch(e=>setError(errorMessage(e))).finally(()=>setLoading(false));},[]);if(loading)return <LoadingState/>;if(error)return <ErrorState message={error} onRetry={()=>window.location.reload()}/>;if(!snapshot)return null;const {kpis,categories}=snapshot;const exportProfitability=()=>downloadReportArtifact('profitability-report','تقرير الأرباح والربحية',['الفئة','المبيعات','الربح','الهامش','الكمية'],categories.map(category=>({'الفئة':category.name,'المبيعات':category.sales,'الربح':category.profit,'الهامش':category.sales>0?`${((category.profit/category.sales)*100).toFixed(1)}%`:null,'الكمية':category.quantity})));return <div dir="rtl" className="report-page space-y-5 animate-fade-in"><PageHeader title="تقرير الأرباح والربحية" subtitle="تحليل الربحية حسب الفئة والمنتج" actions={<div className="flex items-center gap-2"><button onClick={exportProfitability} className="btn-secondary text-xs">تصدير XLSX</button><button type="button" onClick={()=>window.print()} className="btn-primary print-hide text-xs">طباعة</button></div>}/><div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Card><CardBody><div className="text-xs text-ink-500 mb-1">إجمالي المبيعات</div><div className="text-xl font-bold text-ink-900">{formatCurrency(kpis.totalSales)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">إجمالي التكلفة</div><div className="text-xl font-bold text-ink-900">{formatCurrency(kpis.totalCost)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">إجمالي الربح</div><div className="text-xl font-bold text-success-600">{formatCurrency(kpis.grossProfit)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">هامش الربح</div><div className="text-xl font-bold text-success-600">{kpis.grossMargin==null?'—':`${kpis.grossMargin.toFixed(1)}%`}</div></CardBody></Card></div><Card><CardHeader title="الربحية حسب الفئة"/><DataTable columns={[{key:'name',label:'الفئة'},{key:'sales',label:'المبيعات',align:'right',render:(r:CategoryBreakdown)=>formatCurrency(r.sales)},{key:'profit',label:'الربح',align:'right',render:(r:CategoryBreakdown)=>formatCurrency(r.profit)},{key:'margin',label:'الهامش',align:'right',render:(r:CategoryBreakdown)=>r.sales>0?`${((r.profit/r.sales)*100).toFixed(1)}%`:'—'},{key:'quantity',label:'الكمية',align:'right',render:(r:CategoryBreakdown)=>formatNumber(r.quantity)}]} data={categories}/></Card></div>;}
