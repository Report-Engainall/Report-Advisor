import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileBarChart, ShoppingCart, Package, Receipt, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader, LoadingState, ErrorState } from '@/components/ui/States';
import { DataTable } from '@/components/ui/DataTable';
import { fetchDashboardKPIs, fetchSalesInvoices, fetchPurchaseInvoices, type DashboardKPIs } from '@/lib/queries';
import { fetchPurchaseReportSummary, fetchInventoryReportSnapshot } from '@/lib/report-truth';
import { fetchProfitabilityTruth, type ProfitabilityCategory } from '@/lib/report-profitability-truth';
import { formatCurrency, formatNumber, formatDate } from '@/lib/format';
import { downloadReportArtifact } from '@/lib/report-execution/download';
import { ReceivablesReportPageCanonical } from '@/pages/ReceivablesReportPageCanonical';
import type { SalesInvoice, PurchaseInvoice } from '@/lib/types';
import type { InventoryReportRow } from '@/lib/report-truth';

const reportCards = [
  { path: '/reports/sales', title: 'تقرير المبيعات', desc: 'تحليل تفصيلي للمبيعات', icon: ShoppingCart },
  { path: '/reports/purchases', title: 'تقرير المشتريات', desc: 'تحليل المشتريات والموردين', icon: FileBarChart },
  { path: '/reports/inventory', title: 'تقرير المخزون', desc: 'حالة المخزون والتقييم', icon: Package },
  { path: '/reports/receivables', title: 'تقرير الذمم والتحصيل', desc: 'الذمم وأعمار الفواتير', icon: Receipt },
  { path: '/reports/profitability', title: 'تقرير الأرباح والربحية', desc: 'الربحية من المصدر المالي الموثوق', icon: TrendingUp },
];

function errorMessage(error: unknown): string { return error instanceof Error ? error.message : 'تعذر تحميل التقرير'; }

export function ReportsCenterPage() {
  return <div className="space-y-6 animate-fade-in"><PageHeader title="مركز التقارير" subtitle="تقارير شاملة قابلة للتصدير والتحليل" /><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{reportCards.map((r) => <Link key={r.path} to={r.path}><Card hover className="h-full"><CardBody><div className="flex items-start gap-3"><div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center"><r.icon size={20} /></div><div><h3 className="font-semibold text-ink-800 text-sm">{r.title}</h3><p className="text-xs text-ink-500 mt-1">{r.desc}</p></div></div></CardBody></Card></Link>)}</div></div>;
}

export function SalesReportPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    Promise.all([fetchDashboardKPIs(), fetchSalesInvoices(0, 20)]).then(([summary, result]) => { setKpis(summary); setInvoices(result.data); setLoading(false); }).catch((cause) => { setError(errorMessage(cause)); setLoading(false); });
  }, []);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  const exportSales = () => downloadReportArtifact('sales-report-page', 'تقرير المبيعات (الصفحة الحالية)', ['رقم الفاتورة', 'العميل', 'التاريخ', 'الإجمالي', 'المدفوع', 'الحالة'], invoices.map((invoice) => ({ 'رقم الفاتورة': invoice.invoice_number, 'العميل': invoice.customer?.name ?? null, 'التاريخ': invoice.invoice_date, 'الإجمالي': invoice.total, 'المدفوع': invoice.paid_amount, 'الحالة': invoice.status })));
  return <div className="space-y-6 animate-fade-in"><PageHeader title="تقرير المبيعات" subtitle="الأرقام التجارية من المصدر الخادمي؛ الجدول صفحة عرض فقط" actions={<button onClick={exportSales} className="btn-secondary text-xs">تصدير الصفحة</button>} /><div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Card><CardBody><div className="text-xs text-ink-500">إجمالي المبيعات</div><div className="text-xl font-bold">{formatCurrency(kpis?.totalSales)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500">عدد الفواتير</div><div className="text-xl font-bold">{formatNumber(kpis?.invoiceCount)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500">متوسط الفاتورة</div><div className="text-xl font-bold">{formatCurrency(kpis?.avgInvoiceValue)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500">التحصيل</div><div className="text-xl font-bold">{kpis?.collectionRate == null ? '—' : String(kpis.collectionRate.toFixed(1)) + '%'}</div></CardBody></Card></div><Card><CardHeader title="آخر الفواتير" subtitle="تصدير الصفحة الحالية فقط" /><DataTable columns={[{ key: 'invoice_number', label: 'رقم الفاتورة', render: (r: SalesInvoice) => <span className="font-medium text-primary-600">{r.invoice_number}</span> }, { key: 'customer', label: 'العميل', render: (r: SalesInvoice) => r.customer?.name || '—' }, { key: 'invoice_date', label: 'التاريخ', render: (r: SalesInvoice) => formatDate(r.invoice_date) }, { key: 'total', label: 'الإجمالي', align: 'right', render: (r: SalesInvoice) => formatCurrency(r.total) }, { key: 'paid_amount', label: 'المدفوع', align: 'right', render: (r: SalesInvoice) => formatCurrency(r.paid_amount) }, { key: 'status', label: 'الحالة', align: 'center', render: (r: SalesInvoice) => <Badge variant="neutral">{r.status}</Badge> }]} data={invoices} /></Card></div>;
}

export function PurchasesReportPage() {
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof fetchPurchaseReportSummary>> | null>(null);
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { Promise.all([fetchPurchaseReportSummary(), fetchPurchaseInvoices(0, 20)]).then(([s, result]) => { setSummary(s); setPurchases(result.data); setLoading(false); }).catch((cause) => { setError(errorMessage(cause)); setLoading(false); }); }, []);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  const exportPurchases = () => downloadReportArtifact('purchase-report-page', 'تقرير المشتريات (الصفحة الحالية)', ['رقم الفاتورة', 'المورد', 'التاريخ', 'الإجمالي', 'المدفوع'], purchases.map((purchase) => ({ 'رقم الفاتورة': purchase.invoice_number, 'المورد': purchase.supplier?.name ?? null, 'التاريخ': purchase.invoice_date, 'الإجمالي': purchase.total, 'المدفوع': purchase.paid_amount })));
  return <div className="space-y-6 animate-fade-in"><PageHeader title="تقرير المشتريات" subtitle="الإجمالي من التجميع الخادمي؛ الجدول للعرض فقط" actions={<button onClick={exportPurchases} className="btn-secondary text-xs">تصدير الصفحة</button>} /><div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Card><CardBody><div className="text-xs text-ink-500">إجمالي المشتريات</div><div className="text-xl font-bold">{formatCurrency(summary?.totalPurchases)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500">الفواتير</div><div className="text-xl font-bold">{formatNumber(summary?.invoiceCount)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500">الموردون</div><div className="text-xl font-bold">{formatNumber(summary?.supplierCount)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500">المتوسط</div><div className="text-xl font-bold">{formatCurrency(summary?.averagePurchase)}</div></CardBody></Card></div><Card><CardHeader title="آخر فواتير المشتريات" /><DataTable columns={[{ key: 'invoice_number', label: 'رقم الفاتورة' }, { key: 'supplier', label: 'المورد', render: (r: PurchaseInvoice) => r.supplier?.name || '—' }, { key: 'invoice_date', label: 'التاريخ', render: (r: PurchaseInvoice) => formatDate(r.invoice_date) }, { key: 'total', label: 'الإجمالي', align: 'right', render: (r: PurchaseInvoice) => formatCurrency(r.total) }, { key: 'paid_amount', label: 'المدفوع', align: 'right', render: (r: PurchaseInvoice) => formatCurrency(r.paid_amount) }]} data={purchases} /></Card></div>;
}

export function InventoryReportPage() {
  const [snapshot, setSnapshot] = useState<Awaited<ReturnType<typeof fetchInventoryReportSnapshot>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { fetchInventoryReportSnapshot(0, 25).then((value) => { setSnapshot(value); setLoading(false); }).catch((cause) => { setError(errorMessage(cause)); setLoading(false); }); }, []);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!snapshot) return <ErrorState message="تعذر تحميل تقرير المخزون" />;
  const exportInventory = () => downloadReportArtifact('inventory-report-page', 'تقرير المخزون (الصفحة الحالية)', ['المنتج', 'المستودع', 'الكمية', 'التكلفة', 'القيمة'], snapshot.rows.map((row: InventoryReportRow) => ({ 'المنتج': row.product?.name ?? null, 'المستودع': row.warehouse?.name ?? null, 'الكمية': row.quantity, 'التكلفة': row.unit_cost, 'القيمة': row.quantity == null || row.unit_cost == null ? null : row.quantity * row.unit_cost })));
  return <div className="space-y-6 animate-fade-in"><PageHeader title="تقرير المخزون" subtitle={snapshot.status === 'CALCULATED' ? 'الحقيقة من التجميع الخادمي' : 'البيانات غير كافية لإثبات قيمة المخزون'} actions={<button onClick={exportInventory} className="btn-secondary text-xs">تصدير الصفحة</button>} /><div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Card><CardBody><div className="text-xs text-ink-500">قيمة المخزون</div><div className="text-xl font-bold">{formatCurrency(snapshot.totalValue)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500">عدد الصفوف</div><div className="text-xl font-bold">{formatNumber(snapshot.totalRows)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500">منخفض</div><div className="text-xl font-bold">{formatNumber(snapshot.lowStockRows)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500">نفد</div><div className="text-xl font-bold">{formatNumber(snapshot.outOfStockRows)}</div></CardBody></Card></div>{snapshot.incompleteRows > 0 && <div role="alert" className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-800">يوجد {formatNumber(snapshot.incompleteRows)} صف ناقص؛ القيمة التجارية غير مثبتة.</div>}<Card><CardHeader title="تفاصيل المخزون" subtitle={'عرض ' + String(snapshot.rows.length) + ' من ' + String(snapshot.totalRows) + ' صف'} /><DataTable columns={[{ key: 'product', label: 'المنتج', render: (r: InventoryReportRow) => r.product?.name || '—' }, { key: 'warehouse', label: 'المستودع', render: (r: InventoryReportRow) => r.warehouse?.name || '—' }, { key: 'quantity', label: 'الكمية', align: 'right', render: (r: InventoryReportRow) => formatNumber(r.quantity) }, { key: 'unit_cost', label: 'التكلفة', align: 'right', render: (r: InventoryReportRow) => formatCurrency(r.unit_cost) }, { key: 'value', label: 'القيمة', align: 'right', render: (r: InventoryReportRow) => formatCurrency(r.quantity == null || r.unit_cost == null ? null : r.quantity * r.unit_cost) }]} data={snapshot.rows} pageSize={25} /></Card></div>;
}

export function ReceivablesReportPage() { return <ReceivablesReportPageCanonical />; }

export function ProfitabilityReportPage() {
  const [truth, setTruth] = useState<Awaited<ReturnType<typeof fetchProfitabilityTruth>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { fetchProfitabilityTruth().then((value) => { setTruth(value); setLoading(false); }).catch((cause) => { setError(errorMessage(cause)); setLoading(false); }); }, []);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!truth) return <ErrorState message="تعذر تحميل حقيقة الربحية" />;
  const exportProfitability = () => downloadReportArtifact('profitability-report', 'تقرير الأرباح والربحية', ['الفئة', 'المبيعات', 'التكلفة', 'الربح', 'الهامش', 'الكمية'], truth.categories.map((category) => ({ 'الفئة': category.name, 'المبيعات': category.revenue, 'التكلفة': category.costOfSales, 'الربح': category.grossProfit, 'الهامش': category.marginPct == null ? null : String(category.marginPct.toFixed(1)) + '%', 'الكمية': category.quantity })));
  return <div className="space-y-6 animate-fade-in"><PageHeader title="تقرير الأرباح والربحية" subtitle={truth.status === 'CALCULATED' ? 'الحقيقة المالية من المصدر الخادمي' : 'البيانات المالية غير كافية لإثبات الربحية'} actions={<button onClick={exportProfitability} className="btn-secondary text-xs">تصدير XLSX</button>} /><div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Card><CardBody><div className="text-xs text-ink-500">المبيعات</div><div className="text-xl font-bold">{formatCurrency(truth.revenue)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500">التكلفة</div><div className="text-xl font-bold">{formatCurrency(truth.costOfSales)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500">الربح</div><div className="text-xl font-bold">{formatCurrency(truth.grossProfit)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500">الهامش</div><div className="text-xl font-bold">{truth.marginPct == null ? '—' : String(truth.marginPct.toFixed(1)) + '%'}</div></CardBody></Card></div>{truth.incompleteRows > 0 && <div role="alert" className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-800">هناك {formatNumber(truth.incompleteRows)} سطرًا ناقصًا؛ لم تُحوّل البيانات المفقودة إلى صفر.</div>}{truth.currencyCount > 1 && <div role="alert" className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-800">توجد عدة عملات؛ لا تُعرض ربحية مركبة غير مثبتة.</div>}<Card><CardHeader title="الربحية حسب الفئة" /><DataTable columns={[{ key: 'name', label: 'الفئة' }, { key: 'revenue', label: 'المبيعات', align: 'right', render: (r: ProfitabilityCategory) => formatCurrency(r.revenue) }, { key: 'costOfSales', label: 'التكلفة', align: 'right', render: (r: ProfitabilityCategory) => formatCurrency(r.costOfSales) }, { key: 'grossProfit', label: 'الربح', align: 'right', render: (r: ProfitabilityCategory) => formatCurrency(r.grossProfit) }, { key: 'marginPct', label: 'الهامش', align: 'right', render: (r: ProfitabilityCategory) => r.marginPct == null ? '—' : String(r.marginPct.toFixed(1)) + '%' }, { key: 'quantity', label: 'الكمية', align: 'right', render: (r: ProfitabilityCategory) => formatNumber(r.quantity) }]} data={truth.categories} /></Card></div>;
}
