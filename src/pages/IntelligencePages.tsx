import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'طھط¹ط°ط± طھط­ظ…ظٹظ„ ط§ظ„طھظˆطµظٹط§طھ'); }
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
      setError(e instanceof Error ? e.message : 'طھط¹ط°ط± طھط­ط¯ظٹط« ط­ط§ظ„ط© ط§ظ„طھظˆطµظٹط©');
    } finally {
      setPendingId(null);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return <div dir="rtl" className="space-y-6">
    <section className="ag-intelligence-hero rounded-3xl bg-ink-950 p-6 text-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3">
          <Brain className="text-primary-300" />
          <div><h1 className="text-2xl font-bold">ط§ظ„طھظˆطµظٹط§طھ</h1><p className="mt-1 text-sm text-ink-300">ط­ظˆظ‘ظ„ ط§ظ„طھظˆطµظٹط© ط§ظ„ظ…طµط¯ط±ظٹط© ط¥ظ„ظ‰ ظ‚ط±ط§ط± ظ‚ط§ط¨ظ„ ظ„ظ„ظ…ط±ط§ط¬ط¹ط© ط¯ظˆظ† ط§ط®طھظ„ط§ظ‚ ط­ط§ظ„ط© طھظ†ظپظٹط°.</p></div>
        </div>
        <div className="mr-auto flex flex-wrap gap-2">
          <button type="button" onClick={() => setFilter('all')} className={`rounded-xl px-3 py-2 text-xs font-semibold ${filter === 'all' ? 'bg-white text-ink-900' : 'border border-ink-700 text-ink-200'}`}>ط§ظ„ظƒظ„ ({items.length})</button>
          <button type="button" onClick={() => setFilter('new')} className={`rounded-xl px-3 py-2 text-xs font-semibold ${filter === 'new' ? 'bg-white text-ink-900' : 'border border-ink-700 text-ink-200'}`}>ط¬ط¯ظٹط¯ط© ({items.filter(item => item.status === 'new').length})</button>
          <button type="button" onClick={() => setFilter('accepted')} className={`rounded-xl px-3 py-2 text-xs font-semibold ${filter === 'accepted' ? 'bg-white text-ink-900' : 'border border-ink-700 text-ink-200'}`}>ظ…ظ‚ط¨ظˆظ„ط© ({items.filter(item => item.status === 'accepted').length})</button>
          <button type="button" onClick={() => setFilter('rejected')} className={`rounded-xl px-3 py-2 text-xs font-semibold ${filter === 'rejected' ? 'bg-white text-ink-900' : 'border border-ink-700 text-ink-200'}`}>ظ…ط±ظپظˆط¶ط© ({items.filter(item => item.status === 'rejected').length})</button>
          <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink-900"><RefreshCw size={16}/> طھط­ط¯ظٹط«</button>
        </div>
      </div>
    </section>
    <Card>
      <CardHeader title="ط§ظ„طھظˆطµظٹط§طھ ط§ظ„ظ…طھط§ط­ط©" subtitle={`${visibleItems.length} ظ…ظ† ${items.length} طھظˆطµظٹط© ظ…طµط¯ط±ظٹط©`} />
      <CardBody>
        {visibleItems.length ? <div className="space-y-3">{visibleItems.map(item => (
          <article key={item.id} className="rounded-2xl border border-ink-100 bg-white p-4 transition hover:border-primary-200 hover:shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-ink-900">{item.title}</h2>
                  <span className="text-xs text-ink-500">{item.priority}</span>
                  <ConfidenceBadge confidence={item.confidence}/>
                  <span className="rounded-full bg-ink-50 px-2.5 py-1 text-[11px] font-medium text-ink-600">{item.status === 'new' ? 'ط¬ط¯ظٹط¯ط©' : item.status === 'accepted' ? 'ظ…ظ‚ط¨ظˆظ„ط©' : item.status === 'rejected' ? 'ظ…ط±ظپظˆط¶ط©' : item.status}</span>
                </div>
                {item.description && <p className="mt-2 text-sm leading-6 text-ink-500">{item.description}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {item.status === 'new' && <>
                  <button type="button" disabled={pendingId === item.id} onClick={() => void handleStatus(item.id, 'accepted')} className="btn-primary text-xs"><CheckCircle2 size={14}/> ظ‚ط¨ظˆظ„</button>
                  <button type="button" disabled={pendingId === item.id} onClick={() => void handleStatus(item.id, 'rejected')} className="btn-secondary text-xs"><XCircle size={14}/> ط±ظپط¶</button>
                </>}
                <Link to={`/decision-experience?stage=evidence&recommendationId=${encodeURIComponent(item.id)}`} className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-ink-50">ظ…ط³ط§ط­ط© ط§ظ„ط¯ظ„ظٹظ„ <ArrowLeft size={14}/></Link>
              </div>
            </div>
          </article>
        ))}</div> : <EmptyState title="ظ„ط§ طھظˆط¬ط¯ طھظˆطµظٹط§طھ ظپظٹ ظ‡ط°ط§ ط§ظ„ظ…ط±ط´ط­" message="ظ„ظ† ظٹطھظ… ط¥ظ†ط´ط§ط، طھظˆطµظٹط© طھظ‚ط¯ظٹط±ظٹط© ط¹ظ†ط¯ ط؛ظٹط§ط¨ ط§ظ„ط¨ظٹط§ظ†ط§طھ ط§ظ„ظ…طµط¯ط±ظٹط©."/>}
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
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'طھط¹ط°ط± طھط­ظ…ظٹظ„ ط§ظ„طھظ†ط¨ط¤ط§طھ'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  const company = items.filter(item => item.entity_type === 'company');
  const labels = ['ظٹظ†ط§ظٹط±','ظپط¨ط±ط§ظٹط±','ظ…ط§ط±ط³','ط£ط¨ط±ظٹظ„','ظ…ط§ظٹظˆ','ظٹظˆظ†ظٹظˆ','ظٹظˆظ„ظٹظˆ','ط£ط؛ط³ط·ط³','ط³ط¨طھظ…ط¨ط±','ط£ظƒطھظˆط¨ط±','ظ†ظˆظپظ…ط¨ط±','ط¯ظٹط³ظ…ط¨ط±'];
  const chart = company.map(item => { const date = new Date(item.period); return { label: labels[date.getMonth()] ?? item.period, forecast_value: item.forecast_value, upper_bound: item.upper_bound, lower_bound: item.lower_bound }; });
  return <div dir="rtl" className="space-y-6">
    <section className="ag-intelligence-hero rounded-3xl bg-ink-950 p-6 text-white"><div className="flex items-center gap-3"><TrendingUp className="text-primary-300"/><div><h1 className="text-2xl font-bold">ط§ظ„طھظ†ط¨ط¤ط§طھ</h1><p className="mt-1 text-sm text-ink-300">طھظ†ط¨ط¤ط§طھ ظ…طµط¯ط±ظٹط© ظپظ‚ط·ط› ظ„ط§ ظٹطھظ… ط§ط®طھظ„ط§ظ‚ ظ…ظ†ط­ظ†ظ‰ ط¹ظ†ط¯ ط؛ظٹط§ط¨ ط§ظ„ط¨ظٹط§ظ†ط§طھ.</p></div><button type="button" onClick={() => void load()} className="mr-auto inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink-900"><RefreshCw size={16}/> طھط­ط¯ظٹط«</button></div></section>
    <Card><CardHeader title="ظ…ظ†ط­ظ†ظ‰ ط§ظ„طھظ†ط¨ط¤" subtitle={`${items.length} طھظ†ط¨ط¤ ظ†ط´ط·`} action={<ConfidenceBadge confidence="FORECAST"/>}/><CardBody>{chart.length ? <ForecastChart data={chart}/> : <EmptyState title="ظ„ط§ طھظˆط¬ط¯ طھظ†ط¨ط¤ط§طھ ظ…طµط¯ط±ظٹط©" message="ظ„ظ† ظٹطھظ… ط¥ظ†ط´ط§ط، ظ…ظ†ط­ظ†ظ‰ طھظ‚ط¯ظٹط±ظٹ ط¯ظˆظ† ط¨ظٹط§ظ†ط§طھ ظ…ظˆط«ظ‚ط©."/>}</CardBody></Card>
  </div>;
}