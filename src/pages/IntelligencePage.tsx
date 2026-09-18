import { lazy, Suspense, useEffect, useMemo, useState, useCallback } from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle2, XCircle, Zap, RefreshCw, ArrowUpLeft, ShieldCheck, Radar } from 'lucide-react';
import { DeterministicIntelligenceAssistant } from '@/components/DeterministicIntelligenceAssistant';
import { TruthContextStrip } from '@/components/TruthContextStrip';
import type { InvestigationTarget } from '@/components/BusinessInvestigationDrawer';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { SeverityBadge, PriorityBadge, ConfidenceBadge, Badge } from '@/components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/States';
const ForecastChart = lazy(async () => ({ default: (await import('@/components/ui/Charts')).ForecastChart }));
import { fetchRecommendations, fetchAlerts, fetchForecasts, updateRecommendationStatus } from '@/lib/queries';
import { fetchDashboardSnapshot } from '@/lib/dashboard-canonical';
import { formatCurrency, relativeTime } from '@/lib/format';
import type { Recommendation, Alert, Forecast } from '@/lib/types';

const BusinessInvestigationDrawer = lazy(async () => ({ default: (await import('@/components/BusinessInvestigationDrawer')).BusinessInvestigationDrawer }));

export function IntelligenceCenterPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [investigation, setInvestigation] = useState<InvestigationTarget | null>(null);
  const [truthContext, setTruthContext] = useState<Awaited<ReturnType<typeof fetchDashboardSnapshot>> | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const [recs, alts, fc] = await Promise.all([fetchRecommendations(), fetchAlerts(), fetchForecasts()]);
      setRecommendations(recs); setAlerts(alts); setForecasts(fc);
      try {
        setTruthContext(await fetchDashboardSnapshot(6));
      } catch {
        setTruthContext(null);
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'تعذر تحميل مركز الذكاء'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const newRecs = recommendations.filter(r => r.status === 'new');
  const activeAlerts = alerts.filter(a => !a.is_read);
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
  const companyForecasts = forecasts.filter(f => f.entity_type === 'company');
  const forecastChartData = useMemo(() => companyForecasts.map(f => {
    const d = new Date(f.period); const labels = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    return { label: labels[d.getMonth()], forecast_value: f.forecast_value, upper_bound: f.upper_bound, lower_bound: f.lower_bound };
  }), [companyForecasts]);

  if (loading) return <LoadingState message="جارٍ تجميع الإشارات والتوصيات والتنبؤات..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const openAlert = (alert: Alert) => setInvestigation({
    title: alert.title, eyebrow: 'إشارة ذكاء · تحتاج تفسيرًا',
    severity: alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : alert.severity === 'opportunity' ? 'opportunity' : 'info',
    summary: alert.description || 'إشارة مصدرية متاحة في نظام الذكاء. لا يعني ظهورها أن السبب أو الأثر قد تم إثباتهما.',
    facts: [
      { label: 'التصنيف', value: alert.category || 'غير محدد' },
      { label: 'الحالة', value: alert.is_read ? 'مقروءة' : 'نشطة' },
      { label: 'القيمة', value: alert.metric_value == null ? 'غير متاح' : String(alert.metric_value) },
      { label: 'الزمن', value: relativeTime(alert.created_at) },
    ],
    confirmedReasons: [],
    missingEvidence: ['الفترة المرجعية والمقارنة التي أنتجت الإشارة.', 'السبب الجذري المؤكد.', 'الأثر المالي أو التشغيلي قبل اعتماد الإجراء.'],
    actions: [
      { label: 'افتح مركز التحقيق', path: '/analytics', hint: 'افتح التحليل للوصول إلى السياق التفصيلي.' },
      { label: 'افتح القرار', path: '/decision-experience?stage=decision', hint: 'حوّل الإشارة إلى قرار فقط بعد مراجعة الدليل.' },
      { label: 'افتح مركز العمل', path: '/work-center', hint: 'لا تنتقل للتنفيذ قبل ثبوت الإجراء.' },
    ],
    evidence: { source: 'get_dashboard_intelligence', asOf: alert.created_at, status: alert.is_read ? 'تمت القراءة' : 'إشارة نشطة', formula: alert.threshold == null ? undefined : 'القيمة ' + String(alert.metric_value ?? 'غير متاحة') + ' مقابل حد ' + String(alert.threshold) },
  });

  const openRecommendation = (rec: Recommendation) => setInvestigation({
    title: rec.title, eyebrow: 'توصية · مرشح قرار', severity: rec.priority === 'high' ? 'warning' : 'info',
    summary: rec.description || 'توصية متاحة من المصدر. قبولها أو رفضها لا يثبت وحده نتيجة تشغيلية.',
    facts: [
      { label: 'الأولوية', value: rec.priority || 'غير محددة' },
      { label: 'الثقة', value: rec.confidence || 'غير متاحة' },
      { label: 'الأثر المتوقع', value: rec.expected_impact == null ? 'غير متاح' : formatCurrency(rec.expected_impact) },
      { label: 'الحالة', value: rec.status || 'غير محددة' },
    ],
    confirmedReasons: [],
    missingEvidence: ['الدليل التفصيلي الذي يربط التوصية بالبيانات.', 'المسؤولية والصلاحية قبل الاعتماد.', 'النتيجة الفعلية بعد التنفيذ.'],
    actions: [
      { label: 'افتح تجربة القرار', path: '/decision-experience?stage=evidence&recommendationId=' + encodeURIComponent(rec.id), hint: 'افحص الدليل قبل قبول التوصية.' },
      { label: 'افتح التنبؤات', path: '/intelligence/forecasts', hint: 'قارن ما إذا كان التوقع يدعم القرار.' },
      { label: 'افتح مركز العمل', path: '/work-center', hint: 'انتقل للتنفيذ بعد الموافقة والمسار التشغيلي.' },
    ],
    evidence: { source: 'get_dashboard_intelligence', asOf: rec.created_at, status: rec.status || 'غير محددة' },
  });

  const openForecast = () => {
    const f: Forecast | undefined = companyForecasts[0];
    setInvestigation({
      title: 'نبض التنبؤ', eyebrow: 'Forecast · سياق مستقبلي', severity: 'info',
      summary: 'هذه قراءة مستقبلية مصدرية. لا يتم عرضها على أنها نتيجة حقيقية ولا تتحول إلى قرار تلقائي.',
      facts: [
        { label: 'عدد التنبؤات', value: String(companyForecasts.length) },
        { label: 'المدى', value: f ? String(f.lower_bound) + ' — ' + String(f.upper_bound) : 'غير متاح' },
        { label: 'النموذج', value: f?.model_name || 'غير متاح' },
        { label: 'الثقة', value: f?.confidence || 'غير متاحة' },
      ],
      confirmedReasons: [],
      missingEvidence: ['النتيجة الفعلية بعد الفترة المتنبأ بها.', 'جودة المعايرة عبر التشغيل الحقيقي.'],
      actions: [
        { label: 'افتح السيناريوهات', path: '/intelligence/scenarios', hint: 'استخدم التنبؤ داخل تجربة قرار منفصلة.' },
        { label: 'افتح القرار', path: '/decision-experience?stage=decision', hint: 'راجع الدليل قبل أي قرار.' },
      ],
      evidence: { source: 'forecast', asOf: f?.period || 'غير متاح', status: 'FORECAST' },
    });
  };

  return <div dir="rtl" className="space-y-6 animate-fade-in pb-10">
    <section className="hero-surface overflow-hidden p-5 lg:p-6"><div className="flex flex-wrap items-end justify-between gap-5"><div><div className="flex items-center gap-2 text-xs font-black text-primary-700"><Radar size={17}/> BUSINESS INTELLIGENCE CONTROL ROOM</div><h1 className="mt-1 text-[25px] font-black tracking-tight text-ink-950 lg:text-[29px]">مركز الإشارة والقرار</h1><p className="mt-2 max-w-3xl text-[12px] leading-6 text-ink-500">الذكاء هنا ليس معلومات أكثر. كل إشارة يجب أن تقود إلى سياق، وكل توصية إلى دليل، وكل قرار إلى نتيجة يمكن تتبعها.</p><div className="mt-4 flex flex-wrap gap-2"><Badge variant="primary">إشارة → سياق → دليل</Badge><Badge variant="neutral">التنبؤ ≠ حقيقة</Badge><Badge variant="neutral">التوصية ≠ تنفيذ</Badge></div></div><div className="flex gap-2"><button type="button" onClick={() => void load()} className="btn-secondary"><RefreshCw size={16}/> تحديث</button><Link to="/decision-experience" className="btn-primary">مساحة القرار <ArrowUpLeft size={16}/></Link></div></div></section>

    <section className="grid gap-3 lg:grid-cols-3">
      <button type="button" onClick={() => criticalAlerts[0] && openAlert(criticalAlerts[0])} className="card p-4 text-right transition hover:-translate-y-px hover:border-danger-200 hover:shadow-card-hover"><div className="flex items-center justify-between"><span className="text-[10px] font-black tracking-[0.12em] text-ink-400">ATTENTION</span><AlertTriangle size={17} className="text-danger-600"/></div><div className="mt-4 text-3xl font-black tabular-nums text-ink-950">{criticalAlerts.length}</div><div className="mt-1 text-sm font-bold text-ink-700">تنبيهات حرجة نشطة</div><p className="mt-1 text-[11px] text-ink-400">افتح أول إشارة لعرض حدود الدليل والمسار التالي.</p></button>
      <button type="button" onClick={() => newRecs[0] && openRecommendation(newRecs[0])} className="card p-4 text-right transition hover:-translate-y-px hover:border-primary-200 hover:shadow-card-hover"><div className="flex items-center justify-between"><span className="text-[10px] font-black tracking-[0.12em] text-ink-400">DECISIONS</span><Lightbulb size={17} className="text-primary-600"/></div><div className="mt-4 text-3xl font-black tabular-nums text-ink-950">{newRecs.length}</div><div className="mt-1 text-sm font-bold text-ink-700">توصيات تنتظر المراجعة</div><p className="mt-1 text-[11px] text-ink-400">فتحها لا يعني قبولًا أو تنفيذًا.</p></button>
      <button type="button" onClick={openForecast} className="card p-4 text-right transition hover:-translate-y-px hover:border-accent-200 hover:shadow-card-hover"><div className="flex items-center justify-between"><span className="text-[10px] font-black tracking-[0.12em] text-ink-400">FUTURE</span><TrendingUp size={17} className="text-accent-600"/></div><div className="mt-4 text-3xl font-black tabular-nums text-ink-950">{forecasts.length}</div><div className="mt-1 text-sm font-bold text-ink-700">تنبؤات مصدرية نشطة</div><p className="mt-1 text-[11px] text-ink-400">تظل موسومة كتنبؤ ولا تتحول إلى رقم حقيقي.</p></button>
    </section>

    <section className="rounded-[18px] border border-[#15372f] bg-[#0d2a24] p-4 text-white sm:p-5"><div className="grid gap-3 md:grid-cols-5">{[['01','إشارة','ما الذي تغيّر؟'],['02','سياق','أين حدث؟'],['03','دليل','هل يمكن الوثوق به؟'],['04','قرار','ما الإجراء المقترح؟'],['05','نتيجة','ماذا حدث بعد ذلك؟']].map(([n,title,textValue]) => <div key={n} className="rounded-2xl border border-white/10 bg-white/[.045] p-3"><div className="text-[10px] font-black text-white/40">{n}</div><div className="mt-3 text-sm font-black">{title}</div><div className="mt-1 text-[10px] text-white/55">{textValue}</div></div>)}</div></section>

    <DeterministicIntelligenceAssistant recommendationsCount={recommendations.length} activeAlertsCount={activeAlerts.length} forecastsCount={forecasts.length} />

    <Card hover onClick={openForecast}><CardHeader title="نبض التنبؤ" subtitle="المستقبل كمدى واحتمال، لا كحقيقة" action={<ConfidenceBadge confidence="FORECAST"/>}/><CardBody>{forecastChartData.length ? <Suspense fallback={<div className="flex h-[280px] items-center justify-center text-xs text-ink-400">جارٍ تحميل الرسم...</div>}><ForecastChart data={forecastChartData}/></Suspense> : <EmptyState title="لا توجد تنبؤات مصدرية" message="لن يتم إنشاء منحنى تقديري دون بيانات موثقة."/>}</CardBody></Card>

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><Card><CardHeader title="مركز الانتباه" subtitle="الإشارات أصبحت نقاط دخول للتحقيق"/><CardBody><div className="space-y-3">{alerts.slice(0,6).map(alert => <button key={alert.id} type="button" onClick={() => openAlert(alert)} className="flex w-full items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4 text-right transition hover:border-primary-200 hover:bg-primary-50/25"><SeverityBadge severity={alert.severity}/><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-ink-800">{alert.title}</span>{alert.description&&<span className="mt-1 block text-xs leading-5 text-ink-500">{alert.description}</span>}<span className="mt-2 block text-[10px] text-ink-400">{relativeTime(alert.created_at)}</span></span><ArrowUpLeft size={15} className="mt-1 shrink-0 text-ink-300"/></button>)}{alerts.length===0&&<EmptyState title="لا توجد تنبيهات مصدرية حاليًا" message="لا يتم إنشاء إشارات بديلة عند غياب المصدر."/>}</div></CardBody></Card>

    <Card><CardHeader title="طابور القرار" subtitle="افتح التوصية لفحصها قبل القبول"/><CardBody><div className="space-y-3">{newRecs.slice(0,6).map(rec => <div key={rec.id} className="rounded-2xl border border-ink-100 p-4"><button type="button" onClick={() => openRecommendation(rec)} className="flex w-full items-start gap-3 text-right"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><Lightbulb size={17}/></div><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold text-ink-800">{rec.title}</span><PriorityBadge priority={rec.priority}/><ConfidenceBadge confidence={rec.confidence}/></span>{rec.description&&<span className="mt-1 block text-xs leading-5 text-ink-500">{rec.description}</span>}{rec.expected_impact!=null&&<span className="mt-2 block text-xs font-semibold text-success-700">الأثر المتوقع: {formatCurrency(rec.expected_impact)}</span>}</span><ArrowUpLeft size={15} className="mt-1 shrink-0 text-ink-300"/></button><div className="mt-3 flex flex-wrap gap-2 border-t border-ink-100 pt-3"><button type="button" onClick={async () => { await updateRecommendationStatus(rec.id,'accepted'); await load(); }} className="btn-primary text-xs"><CheckCircle2 size={13}/> قبول</button><button type="button" onClick={async () => { await updateRecommendationStatus(rec.id,'rejected'); await load(); }} className="btn-secondary text-xs"><XCircle size={13}/> رفض</button><Link to={'/decision-experience?stage=evidence&recommendationId=' + encodeURIComponent(rec.id)} className="btn-secondary text-xs">فتح مسار الدليل</Link></div></div>)}{newRecs.length===0&&<EmptyState title="لا توجد توصيات مصدرية حاليًا" message="هذه المساحة لا تخلق توصيات تجريبية."/>}</div></CardBody></Card></div>

    <section className="grid gap-3 lg:grid-cols-[1.2fr_.8fr]"><Card><CardBody><div className="flex items-start gap-3"><ShieldCheck size={18} className="mt-0.5 text-success-700"/><div><div className="font-black text-ink-900">حدود الثقة</div><p className="mt-1 text-xs leading-6 text-ink-500">التنبؤ والتوصية والتنبيه تبقى موسومة بطبيعتها. النتيجة الفعلية لا تُسجل إلا من مسار تشغيل موثق.</p></div><Zap size={18} className="ms-auto text-accent-600"/></div></CardBody></Card><Link to="/data-quality" className="card card-hover flex items-center gap-3 p-4"><ShieldCheck size={19} className="text-primary-600"/><span className="min-w-0 flex-1"><span className="block text-sm font-black">افحص صحة البيانات</span><span className="mt-1 block text-[11px] text-ink-400">الذكاء الجيد يبدأ من مصدر يمكن الوثوق به.</span></span><ArrowUpLeft size={16} className="text-ink-300"/></Link></section>
    <Suspense fallback={null}><BusinessInvestigationDrawer target={investigation} onClose={() => setInvestigation(null)} /></Suspense>
  </div>;
}

export { RecommendationsPage, ForecastsPage } from '@/pages/IntelligencePages';
