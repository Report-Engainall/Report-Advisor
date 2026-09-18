import { useCallback, useEffect, useState } from 'react';
import {
  ArrowUpLeft, BarChart3, Brain, CalendarRange, CheckCircle2, CircleAlert, Database,
  FileSearch, Package, Receipt, RefreshCw, Sparkles, TrendingUp, Upload, Users, Wallet
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { TruthContextStrip } from '@/components/TruthContextStrip';
import { KPICard } from '@/components/ui/KPICard';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge, PriorityBadge, SeverityBadge } from '@/components/ui/Badge';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { TrendChart, CategoryPieChart, HorizontalBarChart } from '@/components/ui/Charts';
import { fetchDashboardSnapshot, fetchDashboardIntelligence } from '@/lib/dashboard-canonical';
import { formatCurrency, relativeTime } from '@/lib/format';
import type { Recommendation, Alert } from '@/lib/types';
import type { DashboardKPIs, MonthlyTrend, TopEntity, CategoryBreakdown, AgingDashboard } from '@/lib/dashboard-canonical';

const TREND_RANGES = [{ value: 3, label: '3 أشهر' }, { value: 6, label: '6 أشهر' }, { value: 12, label: '12 شهرًا' }] as const;
const metricStatus = (value: number | null, snapshotStatus: DashboardKPIs['status']): 'CONFIRMED' | 'CALCULATED' | 'INSUFFICIENT_DATA' => value === null ? 'INSUFFICIENT_DATA' : snapshotStatus === 'CONFIRMED' ? 'CONFIRMED' : 'CALCULATED';

export function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [snapshotAsOf, setSnapshotAsOf] = useState<string | null>(null);
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
      const [{ kpis: nextKpis, trend: nextTrend, topCustomers: customers, topProducts: products, categories: nextCategories, aging: nextAging, asOf: nextAsOf }, intelligence] =
        await Promise.all([fetchDashboardSnapshot(trendMonths), fetchDashboardIntelligence()]);
      setKpis(nextKpis);
      setSnapshotAsOf(nextAsOf);
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
      <section className="command-strip -mx-3 -mt-3 mb-1 sm:-mx-4 lg:-mx-5 2xl:-mx-6">
        <div className="px-4 py-4 lg:px-5 2xl:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0"><div className="section-kicker">مؤشرات أساسية · اليوم</div><h1 className="mt-1 text-[22px] font-black tracking-tight text-ink-950">صورة العمل الآن</h1><p className="mt-1 max-w-2xl text-[11px] leading-5 text-ink-500">من البيانات إلى القرار التجاري — في شاشة واحدة. المبيعات، النقد، المخزون والتنبيهات في مسار واحد، مع إبقاء حدود الدليل واضحة.</p></div>
            <div className="flex flex-wrap gap-1.5"><Link to="/import" className="btn-primary text-xs"><Upload size={14}/> استيراد</Link><Link to="/command-center" className="btn-secondary text-xs"><Brain size={14}/> مركز القيادة</Link><Link to="/reports/executive" className="btn-ghost text-xs"><FileSearch size={14}/> التقرير التنفيذي</Link><Link to="/decision-experience" className="btn-ghost text-xs">قرار اليوم</Link></div>
          </div>
        </div>
      </section>
      <TruthContextStrip months={trendMonths} status={kpis.status} asOf={snapshotAsOf ?? 'غير متاح'} />

      <section className="overflow-hidden rounded-[1.75rem] border border-primary-200/70 bg-gradient-to-br from-primary-50 via-white to-accent-50/40 shadow-card">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_1fr_1fr]">
          <div className="border-b border-primary-100 p-5 lg:border-b-0 lg:border-l">
            <div className="flex items-center gap-2 text-xs font-black text-primary-700"><Brain size={15}/> ملخص القرار في دقيقة</div>
            <div className="mt-2 text-lg font-black text-ink-950">{kpis.status === 'INSUFFICIENT_DATA' ? 'الصورة تحتاج إكمال الدليل' : 'الصورة التنفيذية قابلة للاستخدام الآن'}</div>
            <p className="mt-1.5 text-xs leading-6 text-ink-500">يُبنى هذا الملخص من المؤشرات والتنبيهات والتوصيات الحالية فقط — دون توليد رقم جديد.</p>
          </div>
          <div className="border-b border-primary-100 p-5 lg:border-b-0 lg:border-l">
            <div className="text-[11px] font-bold text-ink-400">أهم إشارة</div>
            <div className="mt-2 text-sm font-black text-ink-900">{liveAlerts[0]?.title ?? 'لا توجد تنبيهات نشطة الآن'}</div>
            <div className="mt-2 text-[11px] leading-5 text-ink-500">{liveAlerts[0]?.description ?? 'يمكن الانتقال مباشرة إلى التحليل أو إدخال مصدر جديد عندما تتغير الصورة.'}</div>
          </div>
          <div className="p-5">
            <div className="text-[11px] font-bold text-ink-400">الخطوة التالية</div>
            <div className="mt-2 text-sm font-black text-ink-900">{liveRecommendations[0]?.title ?? 'راجع صحة البيانات أو افتح التقرير التنفيذي'}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to={liveRecommendations[0] ? '/decision-experience' : '/reports/executive'} className="btn-primary text-xs">انتقل إلى الإجراء <ArrowUpLeft size={14}/></Link>
              <span className="inline-flex items-center rounded-lg bg-white/80 px-2.5 py-2 text-[10px] font-bold text-ink-500">تغطية {coverage}% · {snapshotAsOf ?? 'as-of غير متاح'}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-4">
        <KPICard label="إجمالي المبيعات" value={kpis.totalSales} format="currency" icon={<TrendingUp size={16}/>} status={metricStatus(kpis.totalSales,kpis.status)}/>
        <KPICard label="إجمالي الربح" value={kpis.grossProfit} format="currency" icon={<BarChart3 size={16}/>} status={metricStatus(kpis.grossProfit,kpis.status)} hint={kpis.grossMargin===null?undefined:'الهامش '+kpis.grossMargin.toFixed(1)+'%'}/>
        <KPICard label="الذمم المدينة" value={kpis.totalReceivables} format="currency" icon={<Receipt size={16}/>} status={metricStatus(kpis.totalReceivables,kpis.status)}/>
        <KPICard label="قيمة المخزون" value={kpis.inventoryValue} format="currency" icon={<Package size={16}/>} status={metricStatus(kpis.inventoryValue,kpis.status)}/>
      </section>
      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-ink-200 bg-ink-200 sm:grid-cols-4">
        {[['العملاء',kpis.totalCustomers],['المنتجات',kpis.totalProducts],['الفواتير',kpis.invoiceCount],['معدل التحصيل',kpis.collectionRate]].map(([label,value])=><div key={label} className="bg-white px-3.5 py-3"><div className="text-[10px] font-semibold text-ink-400">{label}</div><div className="mt-1 text-[15px] font-black tabular-nums text-ink-900">{value===null?'غير متاح':String(value)+(label==='معدل التحصيل'?'%':'')}</div></div>)}
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
              {liveRecommendations.map(row => <Link key={row.id} to="/decision-experience" className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4 transition hover:border-primary-200 hover:bg-primary-50/30"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><Brain size={17}/></span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink-800">{row.title}<PriorityBadge priority={row.priority}/></span>{row.description && <span className="mt-1 block text-xs leading-5 text-ink-500">{row.description}</span>}</span><ArrowUpLeft size={16} className="shrink-0 text-ink-300"/></Link>)}
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
