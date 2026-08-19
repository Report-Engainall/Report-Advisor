import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FileBarChart, ShoppingCart, Package, Receipt, TrendingUp,
  Users, DollarSign, ArrowLeft, Download, Calendar,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader, LoadingState, ErrorState } from '@/components/ui/States';
import { DataTable } from '@/components/ui/DataTable';
import { TrendChart, SimpleBarChart, HorizontalBarChart, CategoryPieChart } from '@/components/ui/Charts';
import {
  fetchDashboardKPIs, fetchMonthlyTrend, fetchTopCustomers, fetchTopProducts,
  fetchCategoryBreakdown, fetchSalesInvoices, fetchPurchaseInvoices,
  fetchAgingBuckets, fetchInventoryBalances,
} from '@/lib/queries';
import { formatCurrency, formatNumber, formatDate } from '@/lib/format';
import type { SalesInvoice, PurchaseInvoice } from '@/lib/types';
import type { DashboardKPIs, MonthlyTrend, TopEntity, CategoryBreakdown, AgingBucket } from '@/lib/queries';

const reportCards = [
  { path: '/reports/sales', title: 'تقرير المبيعات', desc: 'تحليل تفصيلي للمبيعات حسب الفترة والعميل والمنتج', icon: ShoppingCart, color: 'primary' },
  { path: '/reports/purchases', title: 'تقرير المشتريات', desc: 'تحليل المشتريات حسب المورد والفترة', icon: FileBarChart, color: 'accent' },
  { path: '/reports/inventory', title: 'تقرير المخزون', desc: 'حالة المخزون والحركات والتقييم', icon: Package, color: 'success' },
  { path: '/reports/receivables', title: 'تقرير الذمم والتحصيل', desc: 'تحليل الذمم المدينة وأعمار الفواتير', icon: Receipt, color: 'warning' },
  { path: '/reports/profitability', title: 'تقرير الأرباح والربحية', desc: 'تحليل الربحية حسب المنتج والعميل والفئة', icon: TrendingUp, color: 'primary' },
];

export function ReportsCenterPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="مركز التقارير" subtitle="تقارير شاملة قابلة للتصدير والتحليل" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportCards.map((r) => (
          <Link key={r.path} to={r.path}>
            <Card hover className="h-full">
              <CardBody>
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-${r.color}-50 text-${r.color}-600 flex items-center justify-center flex-shrink-0`}>
                    <r.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink-800 text-sm">{r.title}</h3>
                    <p className="text-xs text-ink-500 mt-1">{r.desc}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SalesReportPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [trend, setTrend] = useState<MonthlyTrend[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopEntity[]>([]);
  const [topProducts, setTopProducts] = useState<TopEntity[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [k, t, tc, tp, cat, inv] = await Promise.all([
        fetchDashboardKPIs(),
        fetchMonthlyTrend(6),
        fetchTopCustomers(10),
        fetchTopProducts(10),
        fetchCategoryBreakdown(),
        fetchSalesInvoices(0, 20),
      ]);
      setKpis(k); setTrend(t); setTopCustomers(tc); setTopProducts(tp); setCategories(cat); setInvoices(inv.data);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="تقرير المبيعات" subtitle="تحليل شامل لأداء المبيعات" actions={
        <button className="btn-secondary text-xs"><Download size={14} /> تصدير</button>
      } />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardBody><div className="text-xs text-ink-500 mb-1">إجمالي المبيعات</div><div className="text-xl font-bold text-ink-900">{formatCurrency(kpis?.totalSales || 0)}</div></CardBody></Card>
        <Card><CardBody><div className="text-xs text-ink-500 mb-1">عدد الفواتير</div><div className="text-xl font-bold text-ink-900">{formatNumber(kpis?.invoiceCount || 0)}</div></CardBody></Card>
        <Card><CardBody><div className="text-xs text-ink-500 mb-1">متوسط قيمة الفاتورة</div><div className="text-xl font-bold text-ink-900">{formatCurrency(kpis?.avgInvoiceValue || 0)}</div></CardBody></Card>
        <Card><CardBody><div className="text-xs text-ink-500 mb-1">معدل التحصيل</div><div className="text-xl font-bold text-ink-900">{(kpis?.collectionRate || 0).toFixed(1)}%</div></CardBody></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2"><CardHeader title="اتجاه المبيعات" subtitle="آخر 6 أشهر" /><CardBody><TrendChart data={trend} /></CardBody></Card>
        <Card><CardHeader title="المبيعات حسب الفئة" /><CardBody><CategoryPieChart data={categories} /></CardBody></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CardHeader title="أفضل العملاء" /><CardBody><HorizontalBarChart data={topCustomers} dataKey="value" nameKey="name" height={300} /></CardBody></Card>
        <Card><CardHeader title="أفضل المنتجات" /><CardBody><HorizontalBarChart data={topProducts} dataKey="value" nameKey="name" height={300} /></CardBody></Card>
      </div>

      <Card>
        <CardHeader title="آخر الفواتير" subtitle="20 فاتورة الأخيرة" />
        <DataTable
          columns={[
            { key: 'invoice_number', label: 'رقم الفاتورة', render: (r: SalesInvoice) => <span className="font-medium text-primary-600">{r.invoice_number}</span> },
            { key: 'customer', label: 'العميل', render: (r: SalesInvoice) => r.customer?.name || '—' },
            { key: 'invoice_date', label: 'التاريخ', render: (r: SalesInvoice) => formatDate(r.invoice_date) },
            { key: 'total', label: 'الإجمالي', align: 'right', render: (r: SalesInvoice) => formatCurrency(r.total) },
            { key: 'paid_amount', label: 'المدفوع', align: 'right', render: (r: SalesInvoice) => formatCurrency(r.paid_amount) },
            { key: 'status', label: 'الحالة', align: 'center', render: (r: SalesInvoice) => {
              const map: any = { paid: { variant: 'success', label: 'مدفوعة' }, confirmed: { variant: 'primary', label: 'مؤكدة' }, draft: { variant: 'neutral', label: 'مسودة' } };
              const s = map[r.status] || { variant: 'neutral', label: r.status };
              return <Badge variant={s.variant}>{s.label}</Badge>;
            }},
          ]}
          data={invoices}
        />
      </Card>
    </div>
  );
}

export function PurchasesReportPage() {
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchaseInvoices(0, 20).then(res => { setPurchases(res.data); setLoading(false); });
  }, []);

  if (loading) return <LoadingState />;

  const totalPurchases = purchases.reduce((s, p) => s + Number(p.total), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="تقرير المشتريات" subtitle="تحليل المشتريات والموردين" actions={
        <button className="btn-secondary text-xs"><Download size={14} /> تصدير</button>
      } />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardBody><div className="text-xs text-ink-500 mb-1">إجمالي المشتريات</div><div className="text-xl font-bold text-ink-900">{formatCurrency(totalPurchases)}</div></CardBody></Card>
        <Card><CardBody><div className="text-xs text-ink-500 mb-1">عدد الفواتير</div><div className="text-xl font-bold text-ink-900">{formatNumber(purchases.length)}</div></CardBody></Card>
        <Card><CardBody><div className="text-xs text-ink-500 mb-1">الموردين النشطين</div><div className="text-xl font-bold text-ink-900">{new Set(purchases.map(p => p.supplier_id)).size}</div></CardBody></Card>
        <Card><CardBody><div className="text-xs text-ink-500 mb-1">متوسط الفاتورة</div><div className="text-xl font-bold text-ink-900">{formatCurrency(purchases.length > 0 ? totalPurchases / purchases.length : 0)}</div></CardBody></Card>
      </div>

      <Card>
        <CardHeader title="آخر فواتير المشتريات" />
        <DataTable
          columns={[
            { key: 'invoice_number', label: 'رقم الفاتورة', render: (r: PurchaseInvoice) => <span className="font-medium text-primary-600">{r.invoice_number}</span> },
            { key: 'supplier', label: 'المورد', render: (r: PurchaseInvoice) => r.supplier?.name || '—' },
            { key: 'invoice_date', label: 'التاريخ', render: (r: PurchaseInvoice) => formatDate(r.invoice_date) },
            { key: 'total', label: 'الإجمالي', align: 'right', render: (r: PurchaseInvoice) => formatCurrency(r.total) },
            { key: 'paid_amount', label: 'المدفوع', align: 'right', render: (r: PurchaseInvoice) => formatCurrency(r.paid_amount) },
          ]}
          data={purchases}
        />
      </Card>
    </div>
  );
}

export function InventoryReportPage() {
  const [balances, setBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventoryBalances().then(data => { setBalances(data as any[]); setLoading(false); });
  }, []);

  if (loading) return <LoadingState />;

  const totalValue = balances.reduce((s, b) => s + Number(b.quantity) * Number(b.unit_cost), 0);
  const lowStock = balances.filter(b => Number(b.quantity) <= Number(b.product?.reorder_point || 0));
  const outOfStock = balances.filter(b => Number(b.quantity) <= 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="تقرير المخزون" subtitle="حالة المخزون والتقييم" actions={
        <button className="btn-secondary text-xs"><Download size={14} /> تصدير</button>
      } />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardBody><div className="text-xs text-ink-500 mb-1">قيمة المخزون</div><div className="text-xl font-bold text-ink-900">{formatCurrency(totalValue)}</div></CardBody></Card>
        <Card><CardBody><div className="text-xs text-ink-500 mb-1">عدد الأصناف</div><div className="text-xl font-bold text-ink-900">{formatNumber(balances.length)}</div></CardBody></Card>
        <Card><CardBody><div className="text-xs text-ink-500 mb-1">مخزون منخفض</div><div className="text-xl font-bold text-warning-600">{formatNumber(lowStock.length)}</div></CardBody></Card>
        <Card><CardBody><div className="text-xs text-ink-500 mb-1">نفد المخزون</div><div className="text-xl font-bold text-danger-600">{formatNumber(outOfStock.length)}</div></CardBody></Card>
      </div>

      <Card>
        <CardHeader title="تفاصيل المخزون" />
        <DataTable
          columns={[
            { key: 'product', label: 'المنتج', render: (r: any) => r.product?.name || '—' },
            { key: 'warehouse', label: 'المستودع', render: (r: any) => r.warehouse?.name || '—' },
            { key: 'quantity', label: 'الكمية', align: 'right', render: (r: any) => formatNumber(r.quantity) },
            { key: 'unit_cost', label: 'التكلفة', align: 'right', render: (r: any) => formatCurrency(r.unit_cost) },
            { key: 'value', label: 'القيمة', align: 'right', render: (r: any) => formatCurrency(Number(r.quantity) * Number(r.unit_cost)) },
            { key: 'status', label: 'الحالة', align: 'center', render: (r: any) => {
              if (Number(r.quantity) <= 0) return <Badge variant="danger">نفد</Badge>;
              if (Number(r.quantity) <= Number(r.product?.reorder_point || 0)) return <Badge variant="warning">منخفض</Badge>;
              return <Badge variant="success">متاح</Badge>;
            }},
          ]}
          data={balances}
          pageSize={25}
        />
      </Card>
    </div>
  );
}

export function ReceivablesReportPage() {
  const [aging, setAging] = useState<AgingBucket[]>([]);
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAgingBuckets(), fetchSalesInvoices(0, 50)]).then(([ag, inv]) => {
      setAging(ag);
      setInvoices(inv.data.filter((i: SalesInvoice) => Number(i.total) - Number(i.paid_amount) > 0));
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState />;

  const totalOutstanding = aging.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="تقرير الذمم والتحصيل" subtitle="تحليل الذمم المدينة وأعمار الفواتير" actions={
        <button className="btn-secondary text-xs"><Download size={14} /> تصدير</button>
      } />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardBody><div className="text-xs text-ink-500 mb-1">إجمالي الذمم</div><div className="text-xl font-bold text-ink-900">{formatCurrency(totalOutstanding)}</div></CardBody></Card>
        {aging.map((b, i) => (
          <Card key={b.bucket}><CardBody>
            <div className="text-xs text-ink-500 mb-1">{b.bucket} يوم</div>
            <div className="text-lg font-bold text-ink-900">{formatCurrency(b.amount)}</div>
            <div className="text-xs text-ink-400 mt-1">{b.count} فاتورة</div>
          </CardBody></Card>
        ))}
      </div>

      <Card>
        <CardHeader title="الفواتير المستحقة" subtitle="الفواتير غير المدفوعة بالكامل" />
        <DataTable
          columns={[
            { key: 'invoice_number', label: 'رقم الفاتورة', render: (r: SalesInvoice) => <span className="font-medium text-primary-600">{r.invoice_number}</span> },
            { key: 'customer', label: 'العميل', render: (r: SalesInvoice) => r.customer?.name || '—' },
            { key: 'invoice_date', label: 'تاريخ الفاتورة', render: (r: SalesInvoice) => formatDate(r.invoice_date) },
            { key: 'due_date', label: 'تاريخ الاستحقاق', render: (r: SalesInvoice) => formatDate(r.due_date) },
            { key: 'total', label: 'الإجمالي', align: 'right', render: (r: SalesInvoice) => formatCurrency(r.total) },
            { key: 'paid_amount', label: 'المدفوع', align: 'right', render: (r: SalesInvoice) => formatCurrency(r.paid_amount) },
            { key: 'balance', label: 'المتبقي', align: 'right', render: (r: SalesInvoice) => <span className="font-semibold text-danger-600">{formatCurrency(Number(r.total) - Number(r.paid_amount))}</span> },
          ]}
          data={invoices}
        />
      </Card>
    </div>
  );
}

export function ProfitabilityReportPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchDashboardKPIs(), fetchCategoryBreakdown()]).then(([k, c]) => {
      setKpis(k); setCategories(c); setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="تقرير الأرباح والربحية" subtitle="تحليل الربحية حسب الفئة والمنتج" actions={
        <button className="btn-secondary text-xs"><Download size={14} /> تصدير</button>
      } />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardBody><div className="text-xs text-ink-500 mb-1">إجمالي المبيعات</div><div className="text-xl font-bold text-ink-900">{formatCurrency(kpis?.totalSales || 0)}</div></CardBody></Card>
        <Card><CardBody><div className="text-xs text-ink-500 mb-1">إجمالي التكلفة</div><div className="text-xl font-bold text-ink-900">{formatCurrency(kpis?.totalCost || 0)}</div></CardBody></Card>
        <Card><CardBody><div className="text-xs text-ink-500 mb-1">إجمالي الربح</div><div className="text-xl font-bold text-success-600">{formatCurrency(kpis?.grossProfit || 0)}</div></CardBody></Card>
        <Card><CardBody><div className="text-xs text-ink-500 mb-1">هامش الربح</div><div className="text-xl font-bold text-success-600">{(kpis?.grossMargin || 0).toFixed(1)}%</div></CardBody></Card>
      </div>

      <Card>
        <CardHeader title="الربحية حسب الفئة" />
        <DataTable
          columns={[
            { key: 'name', label: 'الفئة' },
            { key: 'sales', label: 'المبيعات', align: 'right', render: (r: CategoryBreakdown) => formatCurrency(r.sales) },
            { key: 'profit', label: 'الربح', align: 'right', render: (r: CategoryBreakdown) => formatCurrency(r.profit) },
            { key: 'margin', label: 'الهامش', align: 'right', render: (r: CategoryBreakdown) => r.sales > 0 ? `${((r.profit / r.sales) * 100).toFixed(1)}%` : '—' },
            { key: 'quantity', label: 'الكمية', align: 'right', render: (r: CategoryBreakdown) => formatNumber(r.quantity) },
          ]}
          data={categories}
        />
      </Card>
    </div>
  );
}
