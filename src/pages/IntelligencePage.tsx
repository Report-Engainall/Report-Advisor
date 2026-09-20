import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AlertTriangle, ArrowUpLeft, Brain, CheckCircle2, CircleAlert, Lightbulb,
  RefreshCw, Sparkles, Target, TrendingUp, WalletCards, XCircle, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DeterministicIntelligenceAssistant } from '@/components/DeterministicIntelligenceAssistant';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { SeverityBadge, PriorityBadge, ConfidenceBadge } from '@/components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/States';
import { ForecastChart } from '@/components/ui/Charts';
import {
  fetchRecommendations,
  fetchAlerts,
  fetchForecasts,
  updateRecommendationStatus,
} from '@/lib/queries';
import { formatCurrency, relativeTime } from '@/lib/format';
import type { Recommendation, Alert, Forecast } from '@/lib/types';

function MetricStrip({
  label,
  value,
  note,
  icon,
}: {
  label: string;
  value: number;
  note: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[14px] border border-ink-200 bg-white p-4 shadow-card">
      <div className="flex items-center gap-2 text-[10px] font-black text-ink-400">
        <span className="text-primary-700">{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-[25px] font-black tabular-nums text-ink-950">{value}</div>
      <div className="mt-1 text-[10px] text-ink-400">{note}</div>
    </div>
  );
}

export function IntelligenceCenterPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const [recs, nextAlerts, nextForecasts] = await Promise.all([
        fetchRecommendations(),
        fetchAlerts(),
        fetchForecasts(),
      ]);
      setRecommendations(recs);
      setAlerts(nextAlerts);
      setForecasts(nextForecasts);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تحميل مركز الذكاء');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const newRecommendations = useMemo(
    () => recommendations.filter((item) => item.status === 'new'),
    [recommendations],
  );
  const activeAlerts = useMemo(
    () => alerts.filter((item) => !item.is_read),
    [alerts],
  );
  const companyForecasts = useMemo(
    () => forecasts.filter((item) => item.entity_type === 'company'),
    [forecasts],
  );

  const forecastChartData = useMemo(
    () => companyForecasts.map((forecast) => {
      const date = new Date(forecast.period);
      const labels = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      return {
        label: labels[date.getMonth()],
        forecast_value: forecast.forecast_value,
        upper_bound: forecast.upper_bound,
        lower_bound: forecast.lower_bound,
      };
    }),
    [companyForecasts],
  );

  if (loading) return <LoadingState message="جارٍ تجميع الإشارات والتوصيات والتنبؤات..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  return (
    <div dir="rtl" className="space-y-5 animate-fade-in pb-10">
      <section className="rounded-[18px] border border-ink-200 bg-ink-950 p-5 text-white shadow-elevated lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-[11px] font-black text-primary-300">
              <Brain size={15} />
              محلل الأعمال
            </div>
            <h1 className="mt-2 text-[25px] font-black tracking-tight lg:text-[31px]">الانتباه → الفهم → القرار</h1>
            <p className="mt-2 text-[12px] leading-6 text-ink-300">
              هذه المساحة لا تصنع أرقامًا جديدة. تجمع الإشارات المتاحة من المصدر، تشرح حدودها، ثم تدفعك إلى القرار أو التقرير المناسب.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void load(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-[9px] border border-white/15 bg-white/10 px-3.5 py-2.5 text-[11px] font-bold text-white hover:bg-white/15 disabled:opacity-60">
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              تحديث
            </button>
            <Link to="/decision-experience" className="btn-primary text-[11px]">مساحة القرار <ArrowUpLeft size={13} /></Link>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-ink-200">دليل قبل الاستنتاج</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-ink-200">التنبؤ موسوم بطبيعته</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-ink-200">لا قرار دون مسار قابل للمراجعة</span>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <MetricStrip label="إشارات نشطة" value={activeAlerts.length} note="تحتاج انتباهًا غير مقروء" icon={<AlertTriangle size={15} />} />
        <MetricStrip label="قرارات مقترحة" value={newRecommendations.length} note="بانتظار المراجعة" icon={<Lightbulb size={15} />} />
        <MetricStrip label="تنبؤات مصدرية" value={forecasts.length} note="المتاح من المصدر الحالي" icon={<TrendingUp size={15} />} />
      </section>

      <DeterministicIntelligenceAssistant
        recommendationsCount={recommendations.length}
        activeAlertsCount={activeAlerts.length}
        forecastsCount={forecasts.length}
      />

      <section className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <Card>
          <CardHeader
            title="ماذا يجب أن أراجع أولًا؟"
            subtitle="الإشارة أولًا، ثم السياق، ثم مسار القرار."
            action={<Link to="/command-center" className="btn-ghost text-[11px]">مركز القيادة <ArrowUpLeft size={13} /></Link>}
          />
          <CardBody>
            <div className="space-y-3">
              {activeAlerts.slice(0, 5).map((alert) => (
                <article key={alert.id} className="rounded-[14px] border border-ink-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-danger-50 text-danger-700">
                      <CircleAlert size={17} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <SeverityBadge severity={alert.severity} />
                        <span className="text-[10px] text-ink-400">{relativeTime(alert.created_at)}</span>
                      </div>
                      <div className="mt-2 text-[13px] font-black text-ink-900">{alert.title}</div>
                      {alert.description && <p className="mt-1 text-[11px] leading-5 text-ink-500">{alert.description}</p>}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link to="/command-center" className="btn-secondary text-[11px]">تحقيق الإشارة <ArrowUpLeft size={13} /></Link>
                        <Link to="/metrics" className="btn-ghost text-[11px]">فحص المؤشر</Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
              {activeAlerts.length === 0 && <EmptyState title="لا توجد إشارات نشطة حاليًا" message="لم يتم العثور على تنبيه مصدرّي يحتاج انتباهًا الآن." />}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="طابور القرار"
            subtitle="التوصية لا تتحول إلى نتيجة فعلية إلا عبر المسار التشغيلي الموثق."
            action={<Link to="/decision-experience" className="btn-ghost text-[11px]">فتح مساحة القرار <ArrowUpLeft size={13} /></Link>}
          />
          <CardBody>
            <div className="space-y-3">
              {newRecommendations.slice(0, 5).map((recommendation) => (
                <article key={recommendation.id} className="rounded-[14px] border border-primary-100 bg-primary-50/25 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                      <Sparkles size={17} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <PriorityBadge priority={recommendation.priority} />
                        <ConfidenceBadge confidence={recommendation.confidence} />
                      </div>
                      <div className="mt-2 text-[13px] font-black text-ink-900">{recommendation.title}</div>
                      {recommendation.description && <p className="mt-1 text-[11px] leading-5 text-ink-500">{recommendation.description}</p>}
                      {recommendation.expected_impact !== undefined && recommendation.expected_impact !== null && (
                        <div className="mt-2 text-[10px] font-bold text-success-700">الأثر المتوقع: {formatCurrency(recommendation.expected_impact)}</div>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={async () => { await updateRecommendationStatus(recommendation.id, 'accepted'); await load(true); }}
                          className="btn-primary text-[11px]"
                        >
                          <CheckCircle2 size={13} /> قبول
                        </button>
                        <button
                          type="button"
                          onClick={async () => { await updateRecommendationStatus(recommendation.id, 'rejected'); await load(true); }}
                          className="btn-secondary text-[11px]"
                        >
                          <XCircle size={13} /> رفض
                        </button>
                        <Link to="/decision-experience?stage=decision" className="btn-ghost text-[11px]">فتح القرار</Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
              {newRecommendations.length === 0 && <EmptyState title="لا توجد توصيات جديدة" message="لن يتم تصنيع توصية بديلة عند غياب إشارة مصدرية." />}
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.45fr_.55fr]">
        <Card>
          <CardHeader
            title="نبض التنبؤ"
            subtitle="عرض ما هو متاح من المصدر مع الحفاظ على طبيعته كتنبؤ."
            action={<ConfidenceBadge confidence="FORECAST" />}
          />
          <CardBody>
            {forecastChartData.length
              ? <ForecastChart data={forecastChartData} />
              : <EmptyState title="لا توجد تنبؤات مصدرية" message="لن يتم إنشاء منحنى تقديري دون بيانات موثقة." />}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="ماذا بعد؟" subtitle="أقصر طريق من الرؤية إلى الإجراء" />
          <CardBody>
            <div className="space-y-2.5">
              <Link to="/reports/receivables" className="flex items-center gap-3 rounded-xl border border-ink-100 p-3 hover:border-primary-200 hover:bg-primary-50/30">
                <WalletIcon />
                <span className="min-w-0 flex-1"><strong className="block text-[12px]">افحص التحصيل</strong><span className="text-[10px] text-ink-400">الذمم والأعمار والعملاء</span></span>
                <ArrowUpLeft size={13} className="text-ink-300" />
              </Link>
              <Link to="/reports/profitability" className="flex items-center gap-3 rounded-xl border border-ink-100 p-3 hover:border-primary-200 hover:bg-primary-50/30">
                <MarginIcon />
                <span className="min-w-0 flex-1"><strong className="block text-[12px]">افحص الربحية</strong><span className="text-[10px] text-ink-400">الإيراد والتكلفة والهامش</span></span>
                <ArrowUpLeft size={13} className="text-ink-300" />
              </Link>
              <Link to="/reports/inventory-intelligence" className="flex items-center gap-3 rounded-xl border border-ink-100 p-3 hover:border-primary-200 hover:bg-primary-50/30">
                <Target size={16} className="text-primary-700" />
                <span className="min-w-0 flex-1"><strong className="block text-[12px]">افحص المخزون</strong><span className="text-[10px] text-ink-400">الحركة وإعادة الطلب والتعرض</span></span>
                <ArrowUpLeft size={13} className="text-ink-300" />
              </Link>
            </div>
          </CardBody>
        </Card>
      </section>

      <Card>
        <CardHeader title="حدود الذكاء" subtitle="المنتج يوضح ما يعرفه وما لا يعرفه بدل تحويل الاحتمال إلى حقيقة." />
        <CardBody>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-success-50 p-4"><CheckCircle2 className="text-success-700" size={17} /><div className="mt-2 text-[12px] font-black text-success-900">مصدر مثبت</div><p className="mt-1 text-[10px] leading-5 text-success-800">تظهر البيانات المصدرية مع حالتها وسياقها.</p></div>
            <div className="rounded-xl bg-warning-50 p-4"><CircleAlert className="text-warning-700" size={17} /><div className="mt-2 text-[12px] font-black text-warning-900">مراجعة مطلوبة</div><p className="mt-1 text-[10px] leading-5 text-warning-800">الحالات الناقصة أو غير الكافية لا تتحول إلى أرقام مصطنعة.</p></div>
            <div className="rounded-xl bg-ink-50 p-4"><Zap className="text-ink-500" size={17} /><div className="mt-2 text-[12px] font-black text-ink-900">التوقع ليس نتيجة</div><p className="mt-1 text-[10px] leading-5 text-ink-600">التنبؤ والتوصية يظلان موسومين حتى تثبت النتيجة التشغيلية.</p></div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function WalletIcon() {
  return <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700"><WalletCards size={15} /></div>;
}

function MarginIcon() {
  return <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700"><TrendingUp size={15} /></div>;
}

export { RecommendationsPage, ForecastsPage } from '@/pages/IntelligencePages';
