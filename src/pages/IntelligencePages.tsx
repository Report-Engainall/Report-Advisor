import { useCallback, useEffect, useState } from 'react';
import { Brain, RefreshCw, TrendingUp } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { ConfidenceBadge } from '@/components/ui/Badge';
import { ForecastChart } from '@/components/ui/Charts';
import { fetchForecasts, fetchRecommendations } from '@/lib/queries';
import type { Forecast, Recommendation } from '@/lib/types';

export function RecommendationsPage() {
  const [items, setItems] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try { setLoading(true); setError(null); setItems(await fetchRecommendations()); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'تعذر تحميل التوصيات'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  return <div dir="rtl" className="space-y-6">
    <section className="rounded-3xl bg-ink-950 p-6 text-white"><div className="flex items-center gap-3"><Brain className="text-primary-300"/><div><h1 className="text-2xl font-bold">التوصيات</h1><p className="mt-1 text-sm text-ink-300">توصيات مصدرية قابلة للمراجعة والتنفيذ.</p></div><button type="button" onClick={() => void load()} className="mr-auto inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink-900"><RefreshCw size={16}/> تحديث</button></div></section>
    <Card><CardHeader title="التوصيات المتاحة" subtitle={`${items.length} توصية مصدرية`} /><CardBody>{items.length ? <div className="space-y-3">{items.map(item => <article key={item.id} className="rounded-xl border border-ink-100 p-4"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{item.title}</h2><span className="text-xs text-ink-500">{item.priority}</span><ConfidenceBadge confidence={item.confidence}/></div>{item.description && <p className="mt-2 text-sm text-ink-500">{item.description}</p>}</article>)}</div> : <EmptyState title="لا توجد توصيات مصدرية حاليًا" message="لن يتم إنشاء توصية تقديرية دون بيانات موثقة."/>}</CardBody></Card>
  </div>;
}

export function ForecastsPage() {
  const [items, setItems] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try { setLoading(true); setError(null); setItems(await fetchForecasts()); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'تعذر تحميل التنبؤات'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  const company = items.filter(item => item.entity_type === 'company');
  const labels = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const chart = company.map(item => { const date = new Date(item.period); return { label: labels[date.getMonth()] ?? item.period, forecast_value: item.forecast_value, upper_bound: item.upper_bound, lower_bound: item.lower_bound }; });
  return <div dir="rtl" className="space-y-6">
    <section className="rounded-3xl bg-ink-950 p-6 text-white"><div className="flex items-center gap-3"><TrendingUp className="text-primary-300"/><div><h1 className="text-2xl font-bold">التنبؤات</h1><p className="mt-1 text-sm text-ink-300">تنبؤات مصدرية فقط؛ لا يتم اختلاق منحنى عند غياب البيانات.</p></div><button type="button" onClick={() => void load()} className="mr-auto inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink-900"><RefreshCw size={16}/> تحديث</button></div></section>
    <Card><CardHeader title="منحنى التنبؤ" subtitle={`${items.length} تنبؤ نشط`} action={<ConfidenceBadge confidence="FORECAST"/>}/><CardBody>{chart.length ? <ForecastChart data={chart}/> : <EmptyState title="لا توجد تنبؤات مصدرية" message="لن يتم إنشاء منحنى تقديري دون بيانات موثقة."/>}</CardBody></Card>
  </div>;
}
