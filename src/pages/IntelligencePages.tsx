import { useCallback, useEffect, useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/ui/States';
import { ConfidenceBadge, PriorityBadge, SeverityBadge } from '@/components/ui/Badge';
import { ForecastChart } from '@/components/ui/Charts';
import { fetchRecommendations, fetchAlerts, fetchForecasts, updateRecommendationStatus } from '@/lib/queries';
import type { Recommendation, Alert, Forecast } from '@/lib/types';

export function RecommendationsPage() {
  const [items, setItems] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try { setLoading(true); setError(null); setItems(await fetchRecommendations()); }
    catch (e) { setError(e instanceof Error ? e.message : 'تعذر تحميل التوصيات'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  return <div dir="rtl" className="space-y-6"><PageHeader title="التوصيات" subtitle="توصيات مصدرية قابلة للمراجعة والإجراء" />
    <Card><CardBody>{items.length === 0 ? <EmptyState title="لا توجد توصيات مصدرية حاليًا" /> : <div className="space-y-3">{items.map(item =>
      <article key={item.id} className="rounded-xl border border-ink-100 p-4"><div className="flex flex-wrap items-center gap-2"><b>{item.title}</b><PriorityBadge priority={item.priority}/><ConfidenceBadge confidence={item.confidence}/></div>
      {item.description && <p className="mt-2 text-sm text-ink-500">{item.description}</p>}
      {item.status === 'new' && <div className="mt-3 flex gap-2"><button className="btn-primary text-xs" onClick={async()=>{await updateRecommendationStatus(item.id,'accepted'); await load();}}>قبول</button><button className="btn-secondary text-xs" onClick={async()=>{await updateRecommendationStatus(item.id,'rejected'); await load();}}>رفض</button></div>}</article>)}</div>}</CardBody></Card>
  </div>;
}

export function ForecastsPage() {
  const [items, setItems] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try { setLoading(true); setError(null); setItems(await fetchForecasts()); }
    catch (e) { setError(e instanceof Error ? e.message : 'تعذر تحميل التنبؤات'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  const chartData = items.filter(item => item.entity_type === 'company').map(item => { const d = new Date(item.period); const labels = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']; return { label: labels[d.getMonth()], forecast_value: item.forecast_value, upper_bound: item.upper_bound, lower_bound: item.lower_bound }; });
  return <div dir="rtl" className="space-y-6"><PageHeader title="التنبؤات" subtitle="تنبؤات مصدرية مع حدود الثقة، دون تحويل الغياب إلى أرقام" />
    <Card><CardHeader title="منحنى التنبؤ" subtitle="بيانات الشركة المتاحة من المصدر" action={<ConfidenceBadge confidence="FORECAST"/>}/><CardBody>{chartData.length ? <ForecastChart data={chartData}/> : <EmptyState title="لا توجد تنبؤات مصدرية" message="لن يتم إنشاء منحنى تقديري دون بيانات موثقة."/>}</CardBody></Card>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">{items.slice(0,10).map(item => <Card key={item.id}><CardBody><div className="flex items-center gap-2"><b>{item.entity_name ?? item.entity_type}</b><SeverityBadge severity={item.status === 'confirmed' ? 'low' : 'medium'} /></div><div className="mt-2 text-sm">الفترة: {item.period}</div><div className="mt-1 text-sm">القيمة: {item.forecast_value}</div></CardBody></Card>)}</div>
  </div>;
}

export function IntelligenceAlertsPage() {
  const [items, setItems] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { void fetchAlerts().then(setItems).finally(() => setLoading(false)); }, []);
  if (loading) return <LoadingState />;
  return <div dir="rtl" className="space-y-6"><PageHeader title="تنبيهات الذكاء" subtitle="التنبيهات المصدرية التي تحتاج انتباهًا" /><Card><CardBody>{items.length ? items.map(item => <article key={item.id} className="border-b border-ink-100 py-3 last:border-0"><SeverityBadge severity={item.severity}/><b className="mr-2">{item.title}</b>{item.description && <p className="mt-1 text-sm text-ink-500">{item.description}</p>}</article>) : <EmptyState title="لا توجد تنبيهات مصدرية حاليًا"/>}</CardBody></Card></div>;
}
