import { useEffect, useState, useCallback } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Users, Package, AlertTriangle, Brain, ArrowLeftRight, Wallet, Receipt, Lightbulb, RefreshCw, CalendarRange, CheckCircle2 } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge, SeverityBadge, PriorityBadge } from '@/components/ui/Badge';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { TrendChart, CategoryPieChart, HorizontalBarChart } from '@/components/ui/Charts';
import { fetchDashboardSnapshot, fetchDashboardIntelligence } from '@/lib/dashboard-canonical';
import { formatCurrency, relativeTime } from '@/lib/format';
import type { Recommendation, Alert } from '@/lib/types';
import type { DashboardKPIs, MonthlyTrend, TopEntity, CategoryBreakdown, AgingBucket } from '@/lib/dashboard-canonical';
import { Link } from 'react-router-dom';

const TREND_RANGES = [
  { value: 3, label: '3 أشهر' }, { value: 6, label: '6 أشهر' }, { value: 12, label: '12 شهرًا' },
] as const;

export function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [trend, setTrend] = useState<MonthlyTrend[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopEntity[]>([]);
  const [topProducts, setTopProducts] = useState<TopEntity[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [aging, setAging] = useState<AgingBucket[]>([]);
  const [trendMonths, setTrendMonths] = useState(6);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true); else setLoading(true);
      setError(null);
      const [{ kpis: k, trend: t, topCustomers: tc, topProducts: tp, categories: cat, aging: ag }, intelligence] = await Promise.all([
        fetchDashboardSnapshot(trendMonths), fetchDashboardIntelligence(),
      ]);
      setKpis(k); setTrend(t); setTopCustomers(tc.slice(0, 5)); setTopProducts(tp.slice(0, 5)); setCategories(cat);
      setRecommendations(intelligence.recommendations); setAlerts(intelligence.alerts); setAging(ag);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'فشل تحميل البيانات');
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, [trendMonths]);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <LoadingState message="جارٍ تحميل لوحة القيادة..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!kpis) return null;

  const totalAging = aging.reduce((sum, bucket) => sum + bucket.amount, 0);
  const dataStatusLabel = kpis.status === 'INSUFFICIENT_DATA' ? 'بيانات غير كافية' : 'بيانات محسوبة من المصدر';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-ink-900">لوحة القيادة</h1><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${kpis.status === 'INSUFFICIENT_DATA' ? 'bg-ink-100 text-ink-500' : 'bg-success-50 text-success-700'}`}><CheckCircle2 size={13} /> {dataStatusLabel}</span></div><p className="mt-1 text-sm text-ink-500">نظرة تنفيذية على الأداء والذمم والمخزون والأولويات</p></div>
        <div className="flex flex-wrap items-center gap-2"><div className="flex items-center gap-1 rounded-xl border border-ink-200 bg-white p-1" aria-label="الفترة الزمنية للرسم"><CalendarRange size={16} className="mx-2 text-ink-400" />{TREND_RANGES.map(range => <button key={range.value} type="button" onClick={() => setTrendMonths(range.value)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${trendMonths === range.value ? 'bg-primary-600 text-white' : 'text-ink-500 hover:bg-ink-50'}`} aria-pressed={trendMonths === range.value}>{range.label}</button>)}</div><button type="button" onClick={() => void load(true)} disabled={refreshing} className="btn-secondary" title="تحديث البيانات"><RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /><span className="hidden sm:inline">تحديث</span></button></div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard label="إجمالي المبيعات" value={kpis.totalSales} format="currency" icon={<DollarSign size={16} />} status={kpis.status} />
        <KPICard label="إجمالي الربح" value={kpis.grossProfit} format="currency" icon={<TrendingUp size={16} />} status={kpis.status} hint={kpis.grossMargin === null ? undefined : `هامش: ${kpis.grossMargin.toFixed(1)}%`} />
        <KPICard label="الذمم المدينة" value={kpis.totalReceivables} format="currency" icon={<Receipt size={16} />} status={kpis.status} hint={kpis.overdueReceivables === null ? undefined : `متأخرة: ${formatCurrency(kpis.overdueReceivables)}`} />
        <KPICard label="قيمة المخزون" value={kpis.inventoryValue} format="currency" icon={<Package size={16} />} status={kpis.status} />
        <KPICard label="عدد العملاء" value={kpis.totalCustomers} format="number" icon={<Users size={16} />} status="CONFIRMED" />
        <KPICard label="عدد المنتجات" value={kpis.totalProducts} format="number" icon={<Package size={16} />} status="CONFIRMED" />
        <KPICard label="عدد الفواتير" value={kpis.invoiceCount} format="number" icon={<ShoppingCart size={16} />} status={kpis.status} />
        <KPICard label="معدل التحصيل" value={kpis.collectionRate} format="percent" icon={<Wallet size={16} />} status={kpis.status} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><Card className="lg:col-span-2"><CardHeader title="اتجاه المبيعات والربح" subtitle={`آخر ${trendMonths} أشهر`} action={<Badge variant="primary">تفاعلي</Badge>} /><CardBody><TrendChart data={trend} /></CardBody></Card><Card><CardHeader title="توزيع المبيعات حسب الفئة" subtitle="اضغط على الفئة للتعمق في التحليل" /><CardBody><CategoryPieChart data={categories} /></CardBody></Card></div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><Card><CardHeader title="مركز الانتباه" subtitle="التنبيهات والقضايا التي تتطلب إجراء" action={<Link to="/intelligence" className="text-xs font-medium text-primary-600 hover:text-primary-700">عرض الكل</Link>} /><CardBody><div className="space-y-3">{alerts.slice(0, 4).map(alert => <div key={alert.id} className="flex items-start gap-3 rounded-lg bg-ink-50/50 p-3 transition-colors hover:bg-ink-50"><div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${alert.severity === 'critical' ? 'bg-danger-50 text-danger-600' : alert.severity === 'warning' ? 'bg-warning-50 text-warning-600' : 'bg-primary-50 text-primary-600'}`}>{alert.severity === 'critical' ? <AlertTriangle size={16} /> : <Lightbulb size={16} />}</div><div className="min-w-0 flex-1"><div className="mb-0.5 flex flex-wrap items-center gap-2"><span className="text-sm font-medium text-ink-800">{alert.title}</span><SeverityBadge severity={alert.severity} /></div>{alert.description && <p className="truncate text-xs text-ink-500">{alert.description}</p>}</div><span className="whitespace-nowrap text-[11px] text-ink-400">{relativeTime(alert.created_at)}</span></div>)}{alerts.length === 0 && <p className="py-4 text-center text-sm text-ink-400">لا توجد تنبيهات</p>}</div></CardBody></Card><Card><CardHeader title="التوصيات النشطة" subtitle="إجراءات مقترحة مبنية على البيانات" action={<Link to="/intelligence/recommendations" className="text-xs font-medium text-primary-600 hover:text-primary-700">عرض الكل</Link>} /><CardBody><div className="space-y-3">{recommendations.filter(r => r.status === 'new' || r.status === 'accepted').slice(0, 4).map(rec => <div key={rec.id} className="flex items-start gap-3 rounded-lg bg-ink-50/50 p-3 transition-colors hover:bg-ink-50"><div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600"><Brain size={16} /></div><div className="min-w-0 flex-1"><div className="mb-0.5 flex flex-wrap items-center gap-2"><span className="text-sm font-medium text-ink-800">{rec.title}</span><PriorityBadge priority={rec.priority} /></div>{rec.description && <p className="line-clamp-1 text-xs text-ink-500">{rec.description}</p>}{rec.expected_impact !== undefined && rec.expected_impact !== null && <div className="mt-1 text-xs font-medium text-success-600">الأثر المتوقع: {formatCurrency(rec.expected_impact)}</div>}</div></div>)}{recommendations.length === 0 && <p className="py-4 text-center text-sm text-ink-400">لا توجد توصيات</p>}</div></CardBody></Card></div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><Card><CardHeader title="أفضل العملاء" subtitle="حسب إجمالي المبيعات" /><CardBody><HorizontalBarChart data={topCustomers} dataKey="value" nameKey="name" height={220} /></CardBody></Card><Card><CardHeader title="أفضل المنتجات" subtitle="حسب المبيعات" /><CardBody><HorizontalBarChart data={topProducts} dataKey="value" nameKey="name" height={220} /></CardBody></Card><Card><CardHeader title="تحليل أعمار الذمم" subtitle={`الإجمالي: ${formatCurrency(totalAging)}`} /><CardBody><div className="mt-2 space-y-3">{aging.map((bucket, index) => { const pct = totalAging > 0 ? (bucket.amount / totalAging) * 100 : 0; const colors = ['bg-success-500', 'bg-primary-500', 'bg-warning-500', 'bg-danger-500']; return <div key={bucket.bucket}><div className="mb-1 flex items-center justify-between"><span className="text-xs font-medium text-ink-600">{bucket.bucket} يوم</span><span className="tabular-nums text-xs text-ink-500">{formatCurrency(bucket.amount)}</span></div><div className="h-2 overflow-hidden rounded-full bg-ink-100"><div className={`h-full rounded-full ${colors[index % colors.length]} transition-all duration-500`} style={{ width: `${pct}%` }} /></div><div className="mt-0.5 text-[11px] text-ink-400">{bucket.count} فاتورة</div></div>; })}{totalAging === 0 && <p className="py-4 text-center text-sm text-ink-400">لا توجد ذمم مستحقة</p>}</div></CardBody></Card></div>

      <Card><CardHeader title="إجراءات سريعة" subtitle="ابدأ المهمة المطلوبة مباشرة" /><CardBody><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{[['/import', ArrowLeftRight, 'استيراد بيانات'], ['/reports', Receipt, 'عرض التقارير'], ['/analytics', TrendingUp, 'التحليلات'], ['/intelligence', Brain, 'المساعد الذكي'], ['/customers', Users, 'العملاء'], ['/inventory', Package, 'المخزون']].map(([path, Icon, label]) => { const ActionIcon = Icon as typeof ArrowLeftRight; return <Link key={path as string} to={path as string} className="group flex flex-col items-center gap-2 rounded-lg border border-ink-100 p-4 transition-all hover:border-primary-300 hover:bg-primary-50/30"><ActionIcon className="text-ink-400 group-hover:text-primary-500" size={20} /><span className="text-xs font-medium text-ink-600">{label as string}</span></Link>; })}</div></CardBody></Card>
    </div>
  );
}
