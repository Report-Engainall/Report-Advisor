import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowUpLeft, BarChart3, Brain, CalendarRange, CheckCircle2, CircleAlert,
  FileSearch, Package, RefreshCw, Sparkles, TrendingUp, Upload, WalletCards
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PriorityBadge, SeverityBadge } from '@/components/ui/Badge';
import { LoadingState, ErrorState, EmptyState, DataUnavailableState } from '@/components/ui/States';
import { TrendChart } from '@/components/ui/Charts';
import { TruthContextStrip } from '@/components/TruthContextStrip';
import { fetchDashboardIntelligence, fetchDashboardSnapshot, type DashboardKPIs } from '@/lib/dashboard-canonical';
import { formatCurrency, relativeTime } from '@/lib/format';
import type { Alert, Recommendation } from '@/lib/types';

const PERIODS = [
  { value: 3, label: '3 أشهر' },
  { value: 6, label: '6 أشهر' },
  { value: 12, label: '12 شهرًا' },
] as const;

function MoneyMetric({
  label,
  value,
  note,
  icon,
}: {
  label: string;
  value: number | null;
  note?: string;
  icon: ReactNode;
}) {
  return (
    <div className="border-l border-ink-100 px-4 py-4 last:border-l-0">
      <div className="flex items-center gap-2 text-[10px] font-black text-ink-400">
        <span className="text-primary-700">{icon}</span>{label}
      </div>
      <div className="mt-2 text-[20px] font-black tabular-nums text-ink-950">{value === null ? 'غير متاح' : formatCurrency(value)}</div>
      {note && <div className="mt-1 text-[10px] text-ink-400">{note}</div>}
    </div>
  );
}

function AlertRow({ alert }: { alert: Alert }) {
  return (
    <article className="rounded-[14px] border border-ink-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-danger-50 text-danger-700"><CircleAlert size={17}/></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><SeverityBadge severity={alert.severity}/><span className="text-[10px] text-ink-400">{relativeTime(alert.created_at)}</span></div>
          <div className="mt-2 text-[13px] font-black text-ink-900">{alert.title}</div>
          {alert.description && <p className="mt-1 text-[11px] leading-5 text-ink-500">{alert.description}</p>}
          <div className="mt-3 flex gap-2"><Link to="/decision-experience" className="btn-secondary text-[11px]">افتح السياق <ArrowUpLeft size={13}/></Link><Link to="/metrics" className="btn-ghost text-[11px]">افحص القياس</Link></div>
        </div>
      </div>
    </article>
  );
}

function DecisionRow({ recommendation }: { recommendation: Recommendation }) {
  return (
    <article className="rounded-[14px] border border-primary-100 bg-primary-50/25 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700"><Sparkles size={17}/></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-black text-primary-700">توصية</span><PriorityBadge priority={recommendation.priority}/></div>
          <div className="mt-2 text-[13px] font-black text-ink-900">{recommendation.title}</div>
          {recommendation.description && <p className="mt-1 text-[11px] leading-5 text-ink-500">{recommendation.description}</p>}
          <div className="mt-3"><Link to="/decision-experience?stage=decision" className="btn-primary text-[11px]">فتح القرار <ArrowUpLeft size={13}/></Link></div>
        </div>
      </div>
    </article>
  );
}

export function ExecutiveCommandCenterPage() {
  const [months, setMonths] = useState(3);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [asOf, setAsOf] = useState<string | null>(null);
  const [trend, setTrend] = useState<Awaited<ReturnType<typeof fetchDashboardSnapshot>>['trend']>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true); else setLoading(true);
      setError(null);
      const [snapshot, intelligence] = await Promise.all([
        fetchDashboardSnapshot(months),
        fetchDashboardIntelligence(),
      ]);
      setKpis(snapshot.kpis);
      setAsOf(snapshot.asOf);
      setTrend(snapshot.trend);
      setAlerts(intelligence.alerts.filter((item) => !item.is_read).slice(0, 5));
      setRecommendations(intelligence.recommendations.filter((item) => item.status === 'new' || item.status === 'accepted').slice(0, 5));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تحميل مركز القيادة');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [months]);

  useEffect(() => { void load(); }, [load]);

  const coverage = useMemo(() => {
    if (!kpis) return 0;
    const fields = [kpis.totalSales, kpis.grossProfit, kpis.totalReceivables, kpis.inventoryValue, kpis.collectionRate];
    return Math.round((fields.filter((value) => value !== null).length / fields.length) * 100);
  }, [kpis]);

  if (loading) return <LoadingState message="جارٍ بناء مركز القيادة من المصدر..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!kpis) return <DataUnavailableState title="مركز القيادة ينتظر الحقيقة" message="لا توجد مؤشرات أساسية موثوقة تكفي لبناء صورة تنفيذية. راجع جودة المصدر قبل اتخاذ القرار." action={<Link to="/data-quality" className="btn-primary text-[11px]">مراجعة جودة البيانات</Link>} />;

  return (
    <div dir="rtl" className="space-y-5 animate-fade-in pb-10">
      <section className="rounded-[18px] border border-ink-200 bg-ink-950 p-5 text-white shadow-elevated lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-[11px] font-black text-primary-300"><WalletCards size={15}/> مركز القيادة</div>
            <h1 className="mt-2 text-[25px] font-black tracking-tight lg:text-[31px]">ما يؤثر على المال والعمل الآن</h1>
            <p className="mt-2 text-[12px] leading-6 text-ink-300">شاشة واحدة تجمع الصورة المالية، إشارات الانتباه، والقرارات المقترحة، مع بقاء المصدر وحالة الدليل ظاهرين.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-[10px] bg-white/10 p-1">
              {PERIODS.map((period) => <button key={period.value} type="button" onClick={() => setMonths(period.value)} className={'rounded-[8px] px-3 py-1.5 text-[10px] font-bold ' + (months === period.value ? 'bg-white text-ink-950' : 'text-ink-300 hover:bg-white/10')} aria-pressed={months === period.value}>{period.label}</button>)}
            </div>
            <button type="button" onClick={() => void load(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-[9px] border border-white/15 bg-white/10 px-3.5 py-2.5 text-[11px] font-bold text-white hover:bg-white/15 disabled:opacity-60"><RefreshCw size={14} className={refreshing ? 'animate-spin' : ''}/> تحديث</button>
          </div>
        </div>
      </section>

      <TruthContextStrip months={months} status={kpis.status} asOf={asOf ?? 'غير متاح'} />
      <div className="ag-decision-strip" aria-label="ملخص مركز القرار">
        <div className="ag-decision-cell">
          <span className="ag-decision-label">وضع الحقيقة</span>
          <span className="ag-decision-value">{kpis.status === 'INSUFFICIENT_DATA' ? 'بيانات غير كافية' : 'الصورة قابلة للاستخدام'}</span>
        </div>
        <div className="ag-decision-cell"><span className="ag-decision-label">تغطية القياسات</span><span className="ag-decision-value">{coverage}%</span></div>
        <div className="ag-decision-cell"><span className="ag-decision-label">إشارات مفتوحة</span><span className="ag-decision-value">{alerts.length}</span></div>
        <div className="ag-decision-cell"><span className="ag-decision-label">توصيات للمراجعة</span><span className="ag-decision-value">{recommendations.length}</span></div>
        <div className="ag-decision-cell"><span className="ag-decision-label">As-of</span><span className="ag-decision-value">{asOf ?? 'غير متاح'}</span></div>
      </div>
      <div className="ag-action-cluster">
        <Link to={alerts.length ? '/intelligence' : '/decision-experience?stage=decision'} className="btn-primary text-[11px]">
          {alerts.length ? 'فحص الإشارات' : 'فتح مساحة القرار'} <ArrowUpLeft size={13}/>
        </Link>
        <Link to="/data-quality" className="btn-secondary text-[11px]">مراجعة جودة البيانات</Link>
        <Link to="/reports/executive" className="btn-ghost text-[11px]">التقرير التنفيذي</Link>
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Link to="/reports/receivables" className="card card-hover p-4">
          <div className="flex items-center justify-between gap-3"><WalletCards size={18} className="text-primary-700"/><span className="rounded-full bg-success-50 px-2 py-1 text-[9px] font-black text-success-700">{kpis.totalReceivables === null ? 'INSUFFICIENT DATA' : 'بيانات الذمم متاحة'}</span></div>
          <div className="mt-3 text-sm font-black text-ink-900">Money Recovery</div>
          <p className="mt-1 text-[10px] leading-5 text-ink-500">ابدأ من الذمم والتحصيل للتحقق من الأموال القابلة للاسترداد؛ لا يتم احتساب فرصة مالية إضافية هنا دون ledger موثّق.</p>
        </Link>
        <div className="card p-4">
          <div className="flex items-center justify-between gap-3"><BarChart3 size={18} className="text-warning-700"/><span className="rounded-full bg-warning-50 px-2 py-1 text-[9px] font-black text-warning-800">INSUFFICIENT DATA</span></div>
          <div className="mt-3 text-sm font-black text-ink-900">Decision ROI</div>
          <p className="mt-1 text-[10px] leading-5 text-ink-500">لا يوجد في هذا السطح سجل نتائج مالي موثّق يسمح بحساب عائد القرار دون اختلاق أثر.</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between gap-3"><FileSearch size={18} className="text-ink-500"/><span className="rounded-full bg-ink-100 px-2 py-1 text-[9px] font-black text-ink-600">NOT AVAILABLE</span></div>
          <div className="mt-3 text-sm font-black text-ink-900">Business Replay</div>
          <p className="mt-1 text-[10px] leading-5 text-ink-500">إعادة التشغيل تحتاج snapshots وoutcomes تاريخية مثبتة؛ الواجهة لا تصنع سجلًا بديلًا.</p>
        </div>
        <Link to="/decision-experience?stage=outcome" className="card card-hover p-4">
          <div className="flex items-center justify-between gap-3"><CheckCircle2 size={18} className="text-primary-700"/><span className="rounded-full bg-primary-50 px-2 py-1 text-[9px] font-black text-primary-700">مسار القرار</span></div>
          <div className="mt-3 text-sm font-black text-ink-900">Outcome follow-up</div>
          <p className="mt-1 text-[10px] leading-5 text-ink-500">تابع نتيجة القرار من مساحة القرار مع الحفاظ على حالة الدليل وعدم تحويل التوصية إلى نجاح تلقائي.</p>
        </Link>
      </section>

      <section className="overflow-hidden rounded-[14px] border border-ink-200 bg-white shadow-card">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          <MoneyMetric label="المبيعات" value={kpis.totalSales} icon={<TrendingUp size={15}/>} note="الفترة الحالية"/>
          <MoneyMetric label="الربح الإجمالي" value={kpis.grossProfit} icon={<BarChart3 size={15}/>} note={kpis.grossMargin === null ? 'الهامش غير متاح' : 'الهامش ' + kpis.grossMargin.toFixed(1) + '%'}/>
          <MoneyMetric label="الذمم" value={kpis.totalReceivables} icon={<WalletCards size={15}/>} note={kpis.collectionRate === null ? 'التحصيل غير متاح' : 'التحصيل ' + kpis.collectionRate.toFixed(1) + '%'}/>
          <MoneyMetric label="المخزون" value={kpis.inventoryValue} icon={<Package size={15}/>} note="القيمة الحالية"/>
        </div>
      </section>

      {kpis.status === 'INSUFFICIENT_DATA' && (
        <div className="rounded-[14px] border border-warning-200 bg-warning-50 p-4 text-[11px] leading-5 text-warning-900">
          <div className="flex items-center gap-2 font-black"><CircleAlert size={15}/> لا يمكن إصدار كل الاستنتاجات بثقة</div>
          <div className="mt-1">التغطية الحالية للقياسات الرئيسية {coverage}%. البيانات غير الكافية تبقى ظاهرة كحالة، ولا تُستبدل بأصفار أو تقديرات مخفية.</div>
        </div>
      )}

      <section className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <Card>
          <CardHeader title="مركز الانتباه" subtitle="الإشارات التي تستحق فحصًا أو تدخلاً." action={<Link to="/intelligence" className="btn-ghost text-[11px]">الذكاء <Brain size={13}/></Link>}/>
          <CardBody>
            <div className="space-y-3">
              {alerts.map((alert) => <AlertRow key={alert.id} alert={alert}/>)}
              {alerts.length === 0 && <EmptyState title="لا توجد إشارات نشطة" message="لا يوجد تنبيه غير مقروء في المصدر الحالي." action={<Link to="/intelligence" className="btn-secondary text-[11px]">فحص مساحة الإشارات</Link>}/>} 
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="طابور القرار" subtitle="ما يمكن تحويله إلى قرار الآن." action={<Link to="/decision-experience" className="btn-ghost text-[11px]">مساحة القرار <ArrowUpLeft size={13}/></Link>}/>
          <CardBody>
            <div className="space-y-3">
              {recommendations.map((recommendation) => <DecisionRow key={recommendation.id} recommendation={recommendation}/>)}
              {recommendations.length === 0 && <EmptyState title="لا توجد توصيات قابلة للمراجعة" message="لن تتم صناعة بديل اصطناعي عند غياب الإشارة." action={<Link to="/data-quality" className="btn-secondary text-[11px]">مراجعة جودة البيانات</Link>}/>} 
            </div>
          </CardBody>
        </Card>
      </section>

      <Card>
        <CardHeader
          title="نبض الأعمال"
          subtitle="اتجاه المبيعات والربح ضمن الفترة المختارة."
          action={<span className="inline-flex items-center gap-1 text-[10px] font-bold text-ink-400"><CalendarRange size={13}/> {months} أشهر</span>}
        />
        <CardBody>
          {trend.some((item) => item.status === 'CALCULATED')
            ? <TrendChart data={trend}/>
            : <div className="rounded-[14px] border border-ink-100 bg-ink-50/60 py-10 text-center">
              <div className="text-sm font-black text-ink-700">لا توجد بيانات اتجاه قابلة للحساب.</div>
              <p className="mt-1 text-[10px] text-ink-400">راجع جودة المصدر قبل استخدام اتجاهات المبيعات والربح كإشارة قرار.</p>
              <Link to="/data-quality" className="mt-3 inline-flex btn-secondary text-[11px]">مراجعة جودة البيانات <ArrowUpLeft size={13}/></Link>
            </div>}
        </CardBody>
      </Card>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div><div className="section-kicker">ACTION SURFACES</div><h2 className="mt-1 text-lg font-black text-ink-950">انتقل من الرؤية إلى العمل</h2></div>
          <span className="text-[10px] text-ink-400">المسار يبقى مرتبطًا بسياق القرار</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/reports/receivables" className="card card-hover p-4"><WalletCards size={18} className="text-primary-700"/><div className="mt-3 text-sm font-black text-ink-900">التحصيل</div><div className="mt-1 text-[10px] text-ink-400">الذمم والأعمار والعملاء</div><ArrowUpLeft size={14} className="mt-3 text-ink-300"/></Link>
          <Link to="/reports/profitability" className="card card-hover p-4"><BarChart3 size={18} className="text-primary-700"/><div className="mt-3 text-sm font-black text-ink-900">الربحية</div><div className="mt-1 text-[10px] text-ink-400">الإيراد والتكلفة والهامش</div><ArrowUpLeft size={14} className="mt-3 text-ink-300"/></Link>
          <Link to="/inventory" className="card card-hover p-4"><Package size={18} className="text-primary-700"/><div className="mt-3 text-sm font-black text-ink-900">المخزون</div><div className="mt-1 text-[10px] text-ink-400">الحركة والقيمة والمنتجات</div><ArrowUpLeft size={14} className="mt-3 text-ink-300"/></Link>
          <Link to="/import" className="card card-hover p-4"><Upload size={18} className="text-primary-700"/><div className="mt-3 text-sm font-black text-ink-900">إدخال البيانات</div><div className="mt-1 text-[10px] text-ink-400">من المصدر إلى المسار الحاكم</div><ArrowUpLeft size={14} className="mt-3 text-ink-300"/></Link>
        </div>
      </section>

      <section className="rounded-[14px] border border-ink-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div><div className="text-[12px] font-black text-ink-900">خط الحقيقة</div><div className="mt-1 text-[10px] text-ink-400">المصدر → الدليل → البيانات → الإشارة → القرار → الإجراء → النتيجة.</div></div>
          <div className="flex flex-wrap gap-2">
            <Link to="/data-quality" className="btn-secondary text-[11px]">جودة البيانات <ArrowUpLeft size={13}/></Link>
            <Link to="/reports/executive" className="btn-secondary text-[11px]">التقرير التنفيذي <FileSearch size={13}/></Link>
            <Link to="/work-center" className="btn-primary text-[11px]">مركز العمل <ArrowUpLeft size={13}/></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
