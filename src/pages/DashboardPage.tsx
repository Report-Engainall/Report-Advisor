import { useCallback, useEffect, useState } from 'react';
import {
  ArrowUpLeft, BarChart3, Brain, CalendarRange, CheckCircle2, CircleAlert, Database,
  FileSearch, Package, Receipt, RefreshCw, Sparkles, TrendingUp, Upload, Users, Wallet
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { KPICard } from '@/components/ui/KPICard';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge, PriorityBadge, SeverityBadge } from '@/components/ui/Badge';
import { LoadingState, ErrorState, TruthRail } from '@/components/ui/States';
import { TrendChart, CategoryPieChart, HorizontalBarChart } from '@/components/ui/Charts';
import { fetchDashboardSnapshot, fetchDashboardIntelligence } from '@/lib/dashboard-canonical';
import { formatCurrency, relativeTime } from '@/lib/format';
import type { Recommendation, Alert } from '@/lib/types';
import type { DashboardKPIs, MonthlyTrend, TopEntity, CategoryBreakdown, AgingDashboard } from '@/lib/dashboard-canonical';

const TREND_RANGES = [{ value: 3, label: '3 أشهر' }, { value: 6, label: '6 أشهر' }, { value: 12, label: '12 شهرًا' }] as const;
const metricStatus = (value: number | null): 'CONFIRMED' | 'INSUFFICIENT_DATA' => value === null ? 'INSUFFICIENT_DATA' : 'CONFIRMED';

export function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [trend, setTrend] = useState<MonthlyTrend[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopEntity[]>([]);
  const [topProducts, setTopProducts] = useState<TopEntity[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [aging, setAging] = useState<AgingDashboard | null>(null);
  const [trendMonths, setTrendMonths] = useState(6);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true); else setLoading(true);
      setError(null);
      const [{ kpis: nextKpis, trend: nextTrend, topCustomers: customers, topProducts: products, categories: nextCategories, aging: nextAging }, intelligence] =
        await Promise.all([fetchDashboardSnapshot(trendMonths), fetchDashboardIntelligence()]);
      setKpis(nextKpis);
      setTrend(nextTrend);
      setTopCustomers(customers.slice(0, 5));
      setTopProducts(products.slice(0, 5));
      setCategories(nextCategories);
      setAging(nextAging);
      setRecommendations(intelligence.recommendations);
      setAlerts(intelligence.alerts);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'فشل تحميل لوحة التحكم');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [trendMonths]);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <LoadingState message="جارٍ بناء الصورة التنفيذية من المصدر..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!kpis || !aging) return null;

  const confirmed = [kpis.totalSales, kpis.grossProfit, kpis.totalReceivables, kpis.inventoryValue, kpis.totalCustomers, kpis.totalProducts, kpis.invoiceCount, kpis.collectionRate].filter(value => value !== null).length;
  const coverage = Math.round((confirmed / 8) * 100);
  const liveRecommendations = recommendations.filter(row => row.status === 'new' || row.status === 'accepted').slice(0, 4);
  const liveAlerts = alerts.slice(0, 4);

  return (
    <div dir="rtl" className="animate-fade-in space-y-6 pb-10">
      <section className="relative overflow-hidden rounded-[2rem] bg-ink-950 p-6 text-white shadow-elevated lg:p-8">
        <div className="soft-grid absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full bg-primary-600/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-20 right-1/3 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl" aria-hidden="true" />
        <div className="relative grid gap-8 lg:grid-cols-[1.45fr_.8fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-300/20 bg-primary-500/10 px-3 py-1.5 text-xs font-bold text-primary-100"><Sparkles size={14}/> الصورة التنفيذية</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300"><Database size={13}/> {kpis.status === 'INSUFFICIENT_DATA' ? 'بعض المؤشرات غير مكتملة' : 'المؤشرات محسوبة من المصدر'}</span>
            </div>
            <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-tight lg:text-[2.6rem]">من البيانات إلى القرار التجاري — في شاشة واحدة.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 lg:text-base">الأغبري لا يعرض أرقامًا للزينة. يعرض ما يمكن إثباته، يوضح ما يحتاج مراجعة، ثم يربط المؤشر بالإجراء والقرار والتقرير.</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link to="/command-center" className="btn bg-white text-ink-950 hover:bg-slate-100"><Brain size={16}/> فتح مركز القيادة</Link>
              <Link to="/import" className="btn border border-white/10 bg-white/5 text-white hover:bg-white/10"><Upload size={16}/> إدخال مصدر جديد</Link>
              <Link to="/reports/executive" className="btn border border-white/10 bg-transparent text-slate-200 hover:bg-white/5"><FileSearch size={16}/> التقرير التنفيذي</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 self-end">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"><div className="text-[11px] text-slate-400">تغطية المؤشرات</div><div className="mt-1 text-2xl font-black">{coverage}%</div><div className="mt-1 text-[10px] text-slate-500">من 8 مؤشرات أساسية</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"><div className="text-[11px] text-slate-400">تنبيهات</div><div className="mt-1 text-2xl font-black">{alerts.length}</div><div className="mt-1 text-[10px] text-slate-500">مركز الانتباه</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"><div className="text-[11px] text-slate-400">توصيات</div><div className="mt-1 text-2xl font-black">{liveRecommendations.length}</div><div className="mt-1 text-[10px] text-slate-500">قابلة للمراجعة</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"><div className="text-[11px] text-slate-400">الحالة</div><div className="mt-1 flex items-center gap-2 text-sm font-bold">{kpis.status === 'INSUFFICIENT_DATA' ? <CircleAlert size={16} className="text-warning-400"/> : <CheckCircle2 size={16} className="text-success-400"/>}{kpis.status === 'INSUFFICIENT_DATA' ? 'مراجعة مطلوبة' : 'صورة صالحة'}</div><div className="mt-1 text-[10px] text-slate-500">لا توجد قيم مفترضة</div></div>
          </div>
        </div>
      </section>

      <TruthRail status={kpis.status === 'INSUFFICIENT_DATA' ? 'limited' : liveAlerts.length > 0 ? 'review' : 'live'} period={`نطاق التحليل · آخر ${trendMonths} أشهر`} />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <KPICard label="إجمالي المبيعات" value={kpis.totalSales} format="currency" icon={<TrendingUp size={16}/>} status={metricStatus(kpis.totalSales)} to="/reports/sales" evidenceTo="/metrics?metric=metric.net_sales" />
        <KPICard label="إجمالي الربح" value={kpis.grossProfit} format="currency" icon={<BarChart3 size={16}/>} status={metricStatus(kpis.grossProfit)} hint={kpis.grossMargin === null ? undefined : 'الهامش ' + kpis.grossMargin.toFixed(1) + '%'} to="/reports/profitability" evidenceTo="/metrics?metric=metric.gross_profit" />
        <KPICard label="الذمم المدينة" value={kpis.totalReceivables} format="currency" icon={<Receipt size={16}/>} status={metricStatus(kpis.totalReceivables)} to="/reports/receivables" evidenceTo="/metrics?metric=metric.receivables" />
        <KPICard label="قيمة المخزون" value={kpis.inventoryValue} format="currency" icon={<Package size={16}/>} status={metricStatus(kpis.inventoryValue)} to="/inventory" evidenceTo="/metrics?metric=metric.inventory_value" />
        <KPICard label="العملاء" value={kpis.totalCustomers} format="number" icon={<Users size={16}/>} status={metricStatus(kpis.totalCustomers)} to="/customers" evidenceTo="/metrics?metric=metric.customer_activity" />
        <KPICard label="المنتجات" value={kpis.totalProducts} format="number" icon={<Package size={16}/>} status={metricStatus(kpis.totalProducts)} to="/products" evidenceTo="/metrics?metric=metric.inventory_velocity" />
        <KPICard label="الفواتير" value={kpis.invoiceCount} format="number" icon={<Receipt size={16}/>} status={metricStatus(kpis.invoiceCount)} to="/reports/sales" evidenceTo="/metrics?metric=metric.net_sales" />
        <KPICard label="معدل التحصيل" value={kpis.collectionRate} format="percent" icon={<Wallet size={16}/>} status={metricStatus(kpis.collectionRate)} to="/reports/receivables" evidenceTo="/metrics?metric=metric.receivables" />
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-lg font-black text-ink-950">لوحة الإثبات والتحليل</h2><p className="mt-1 text-xs text-ink-500">اتجاهات فعلية مع التحكم في الفترة الزمنية.</p></div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-ink-200 bg-white p-1 shadow-sm"><CalendarRange size={15} className="mx-2 text-ink-400"/>{TREND_RANGES.map(item => <button type="button" key={item.value} onClick={() => setTrendMonths(item.value)} className={'rounded-lg px-3 py-1.5 text-xs font-bold ' + (trendMonths === item.value ? 'bg-ink-950 text-white' : 'text-ink-500 hover:bg-ink-50')} aria-pressed={trendMonths === item.value}>{item.label}</button>)}</div>
          <button type="button" onClick={() => void load(true)} disabled={refreshing} className="btn-secondary"><RefreshCw size={15}/><span className="hidden sm:inline">تحديث</span></button>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.45fr_.75fr]">
        <Card><CardHeader title="اتجاه المبيعات والربح" subtitle={'آخر ' + trendMonths + ' أشهر'} action={<Badge variant="primary">مُثبت</Badge>}/><CardBody>{trend.some(item => item.status === 'CALCULATED') ? <TrendChart data={trend}/> : <div className="py-14 text-center text-sm text-ink-400">لا توجد بيانات اتجاه قابلة للحساب.</div>}</CardBody></Card>
        <Card><CardHeader title="توزيع النشاط" subtitle="التصنيف القادم من المصدر الكانوني"/><CardBody>{categories.length ? <CategoryPieChart data={categories.map(item => ({ ...item, name: item.categoryStatus === 'UNKNOWN' ? 'UNKNOWN' : item.name ?? 'UNKNOWN' }))}/> : <div className="py-14 text-center text-sm text-ink-400">لا توجد بيانات فئات.</div>}</CardBody></Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="مركز الانتباه" subtitle="ما يستحق التحقق أو التدخل الآن"/>
          <CardBody>
            <div className="space-y-3">
              {liveAlerts.map(alert => <div key={alert.id} className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-ink-50/70 p-4"><SeverityBadge severity={alert.severity}/><div className="min-w-0 flex-1"><div className="text-sm font-bold text-ink-800">{alert.title}</div>{alert.description && <p className="mt-1 text-xs leading-5 text-ink-500">{alert.description}</p>}</div><span className="shrink-0 text-[10px] text-ink-400">{relativeTime(alert.created_at)}</span></div>)}
              {liveAlerts.length === 0 && <div className="py-10 text-center text-sm text-ink-400">لا توجد تنبيهات نشطة.</div>}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="طابور القرار" subtitle="توصيات مشتقة من البيانات الحالية"/>
          <CardBody>
            <div className="space-y-3">
              {liveRecommendations.map(row => <Link key={row.id} to={`/decision-experience?stage=evidence&recommendationId=${encodeURIComponent(row.id)}`} className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4 transition hover:border-primary-200 hover:bg-primary-50/30"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><Brain size={17}/></span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink-800">{row.title}<PriorityBadge priority={row.priority}/></span>{row.description && <span className="mt-1 block text-xs leading-5 text-ink-500">{row.description}</span>}</span><ArrowUpLeft size={16} className="shrink-0 text-ink-300"/></Link>)}
              {liveRecommendations.length === 0 && <div className="py-10 text-center text-sm text-ink-400">لا توجد توصيات قابلة للمراجعة الآن.</div>}
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card><CardHeader title="أفضل العملاء" subtitle="بحسب البيانات الحالية"/><CardBody>{topCustomers.length ? <HorizontalBarChart data={topCustomers} dataKey="value" nameKey="name" height={230}/> : <div className="py-12 text-center text-sm text-ink-400">لا توجد بيانات.</div>}</CardBody></Card>
        <Card><CardHeader title="أفضل المنتجات" subtitle="القيمة/الحركة من المصدر"/><CardBody>{topProducts.length ? <HorizontalBarChart data={topProducts} dataKey="value" nameKey="name" height={230}/> : <div className="py-12 text-center text-sm text-ink-400">لا توجد بيانات.</div>}</CardBody></Card>
        <Card><CardHeader title="أعمار الذمم" subtitle={aging.status === 'CALCULATED' && aging.totalAmount !== null ? 'الإجمالي: ' + formatCurrency(aging.totalAmount) : aging.status === 'NO_DATA' ? 'لا توجد بيانات ذمم' : 'بيانات غير كافية'}/><CardBody><div className="space-y-1">{aging.rows.map(bucket => <div key={bucket.bucket} className="flex items-center justify-between border-b border-ink-100 py-2.5"><span className="text-xs font-semibold text-ink-600">{bucket.bucket}</span><span className="text-xs text-ink-500">{bucket.amount === null ? 'UNKNOWN' : formatCurrency(bucket.amount)} · {bucket.count} فاتورة</span></div>)}{aging.unknownRows > 0 && <div className="pt-3 text-[11px] text-ink-400">UNKNOWN: {aging.unknownRows} فاتورة بلا تاريخ استحقاق.</div>}</div></CardBody></Card>
      </section>

      <section>
        <div className="mb-3"><h2 className="text-lg font-black text-ink-950">مسارات العمل</h2><p className="mt-1 text-xs text-ink-500">أهم المسارات للوصول إلى النتيجة المطلوبة دون تشعب.</p></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { path: '/work-center', label: 'مركز العمل', text: 'الحالات والاستثناءات والتنفيذ', icon: CheckCircle2 },
            { path: '/import', label: 'إدخال البيانات', text: 'من المصدر إلى الدورة الحاكمة', icon: Upload },
            { path: '/intelligence', label: 'مركز الذكاء', text: 'التفسير والتوصيات والتنبؤ', icon: Brain },
            { path: '/reports/executive', label: 'التقرير التنفيذي', text: 'قصة القرار والأثر', icon: FileSearch },
          ].map(action => { const Icon = action.icon; return <Link key={action.path} to={action.path} className="card card-hover flex items-center gap-3 p-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700"><Icon size={19}/></span><span className="min-w-0 flex-1"><span className="block text-sm font-black text-ink-800">{action.label}</span><span className="mt-1 block text-[11px] text-ink-400">{action.text}</span></span><ArrowUpLeft size={16} className="text-ink-300"/></Link>; })}
        </div>
      </section>
    </div>
  );
}
