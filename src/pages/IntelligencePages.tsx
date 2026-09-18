import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Brain, CheckCircle2, RefreshCw, TrendingUp, XCircle } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { ConfidenceBadge } from '@/components/ui/Badge';
import { ForecastChart } from '@/components/ui/Charts';
import { fetchForecasts, fetchRecommendations, updateRecommendationStatus } from '@/lib/queries';
import type { Forecast, Recommendation } from '@/lib/types';

export function RecommendationsPage() {
  const [items, setItems] = useState<Recommendation[]>([]);
  const [filter, setFilter] = useState<'all' | 'new' | 'accepted' | 'rejected'>('all');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { setLoading(true); setError(null); setItems(await fetchRecommendations()); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'تعذر تحميل التوصيات'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const visibleItems = filter === 'all' ? items : items.filter(item => item.status === filter);

  const handleStatus = async (id: string, status: 'accepted' | 'rejected') => {
    try {
      setPendingId(id);
      await updateRecommendationStatus(id, status);
      setItems(current => current.map(item => item.id === id ? { ...item, status } : item));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'تعذر تحديث حالة التوصية');
    } finally {
      setPendingId(null);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return <div dir="rtl" className="space-y-6">
    <section className="rounded-3xl bg-ink-950 p-6 text-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3">
          <Brain className="text-primary-300" />
          <div><h1 className="text-2xl font-bold">التوصيات</h1><p className="mt-1 text-sm text-ink-300">حوّل التوصية المصدرية إلى قرار قابل للمراجعة دون اختلاق حالة تنفيذ.</p></div>
        </div>
        <div className="mr-auto flex flex-wrap gap-2">
          <button type="button" onClick={() => setFilter('all')} className={`rounded-xl px-3 py-2 text-xs font-semibold ${filter === 'all' ? 'bg-white text-ink-900' : 'border border-ink-700 text-ink-200'}`}>الكل ({items.length})</button>
          <button type="button" onClick={() => setFilter('new')} className={`rounded-xl px-3 py-2 text-xs font-semibold ${filter === 'new' ? 'bg-white text-ink-900' : 'border border-ink-700 text-ink-200'}`}>جديدة ({items.filter(item => item.status === 'new').length})</button>
          <button type="button" onClick={() => setFilter('accepted')} className={`rounded-xl px-3 py-2 text-xs font-semibold ${filter === 'accepted' ? 'bg-white text-ink-900' : 'border border-ink-700 text-ink-200'}`}>مقبولة ({items.filter(item => item.status === 'accepted').length})</button>
          <button type="button" onClick={() => setFilter('rejected')} className={`rounded-xl px-3 py-2 text-xs font-semibold ${filter === 'rejected' ? 'bg-white text-ink-900' : 'border border-ink-700 text-ink-200'}`}>مرفوضة ({items.filter(item => item.status === 'rejected' ? true : false).length})</button>
          <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink-900"><RefreshCw size={16}/> تحديث</button>
        </div>
      </div>
    </section>
    <Card>
      <CardHeader title="التوصيات المتاحة" subtitle={`${visibleItems.length} من ${items.length} توصية مصدرية`} />
      <CardBody>
        {visibleItems.length ? <div className="space-y-3">{visibleItems.map(item => (
          <article key={item.id} className="rounded-2xl border border-ink-100 bg-white p-4 transition hover:border-primary-200 hover:shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-ink-900">{item.title}</h2>
                  <span className="text-xs text-ink-500">{item.priority}</span>
                  <ConfidenceBadge confidence={item.confidence}/>
                  <span className="rounded-full bg-ink-50 px-2.5 py-1 text-[11px] font-medium text-ink-600">{item.status === 'new' ? 'جديدة' : item.status === 'accepted' ? 'مقبولة' : item.status === 'rejected' ? 'مرفوضة' : item.status}</span>
                </div>
                {item.description && <p className="mt-2 text-sm leading-6 text-ink-500">{item.description}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {item.status === 'new' && <>
                  <button type="button" disabled={pendingId === item.id} onClick={() => void handleStatus(item.id, 'accepted')} className="btn-primary text-xs"><CheckCircle2 size={14}/> قبول</button>
                  <button type="button" disabled={pendingId === item.id} onClick={() => void handleStatus(item.id, 'rejected')} className="btn-secondary text-xs"><XCircle size={14}/> رفض</button>
                </>}
                <Link to={`/decision-experience?stage=evidence&recommendationId=${encodeURIComponent(item.id)}`} className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-ink-50">مساحة الدليل <ArrowLeft size={14}/></Link>
              </div>
            </div>
          </article>
        ))}</div> : <EmptyState title="لا توجد توصيات في هذا المرشح" message="لن يتم إنشاء توصية تقديرية عند غياب البيانات المصدرية."/>}
      </CardBody>
    </Card>
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
