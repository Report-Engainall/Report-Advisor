import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Lightbulb, Target, XCircle, Zap } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge, ConfidenceBadge, PriorityBadge, StatusBadge } from '@/components/ui/Badge';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/ui/States';
import { ForecastChart } from '@/components/ui/Charts';
import { fetchForecasts, fetchRecommendations, updateRecommendationStatus } from '@/lib/queries';
import { formatCurrency, formatDate, relativeTime } from '@/lib/format';
import type { Forecast, Recommendation } from '@/lib/types';

export function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRecommendations();
      setRecommendations(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'تعذر تحميل التوصيات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleAction = async (id: string, status: string) => {
    if (actionId) return;
    try {
      setActionId(id);
      setActionError(null);
      await updateRecommendationStatus(id, status);
      setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : 'تعذر تحديث حالة التوصية');
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const filtered = filter === 'all' ? recommendations : recommendations.filter(r => r.status === filter);
  const filters = [
    { v: 'all', l: 'الكل' }, { v: 'new', l: 'جديدة' }, { v: 'accepted', l: 'مقبولة' },
    { v: 'in_progress', l: 'قيد التنفيذ' }, { v: 'done', l: 'تم التنفيذ' }, { v: 'rejected', l: 'مرفوضة' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="التوصيات" subtitle="إجراءات مقترحة لتحسين الأداء" />
      {actionError && <div role="alert" className="rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700">{actionError}</div>}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button key={f.v} type="button" onClick={() => setFilter(f.v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f.v ? 'bg-primary-600 text-white' : 'bg-white text-ink-600 border border-ink-200 hover:bg-ink-50'}`}>
            {f.l}<span className="mr-1 opacity-60">({f.v === 'all' ? recommendations.length : recommendations.filter(r => r.status === f.v).length})</span>
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map(rec => (
          <Card key={rec.id}><CardBody><div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3"><div className="w-10 h-10 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center flex-shrink-0"><Lightbulb size={18} /></div><div><h3 className="font-semibold text-ink-800 text-sm">{rec.title}</h3>{rec.description && <p className="text-xs text-ink-500 mt-1">{rec.description}</p>}</div></div>
              <div className="flex items-center gap-2 flex-shrink-0"><PriorityBadge priority={rec.priority} /><ConfidenceBadge confidence={rec.confidence} /><StatusBadge status={rec.status} /></div>
            </div>
            {rec.expected_impact && <div className="flex items-center gap-2 text-sm"><Target size={14} className="text-success-500" /><span className="text-ink-600">الأثر المتوقع: <span className="font-semibold text-success-600">{formatCurrency(rec.expected_impact)}</span></span><span className="text-ink-400">•</span><span className="text-ink-500">{relativeTime(rec.created_at)}</span></div>}
            {rec.status === 'new' && <div className="flex gap-2"><button type="button" disabled={actionId !== null} onClick={() => void handleAction(rec.id, 'accepted')} className="btn-primary text-xs disabled:opacity-50"><CheckCircle2 size={14} /> {actionId === rec.id ? 'جارٍ الحفظ...' : 'قبول'}</button><button type="button" disabled={actionId !== null} onClick={() => void handleAction(rec.id, 'rejected')} className="btn-secondary text-xs disabled:opacity-50"><XCircle size={14} /> {actionId === rec.id ? 'جارٍ الحفظ...' : 'رفض'}</button></div>}
            {rec.status === 'accepted' && <button type="button" disabled={actionId !== null} onClick={() => void handleAction(rec.id, 'done')} className="btn-primary text-xs disabled:opacity-50"><CheckCircle2 size={14} /> {actionId === rec.id ? 'جارٍ الحفظ...' : 'تم التنفيذ'}</button>}
            {rec.status === 'done' && rec.impact_result && <div className="p-2 rounded-lg bg-success-50 text-success-700 text-xs"><Zap size={12} className="inline ml-1" /> النتيجة: {rec.impact_result}</div>}
          </div></CardBody></Card>
        ))}
        {filtered.length === 0 && <EmptyState icon={<Lightbulb size={32} />} title="لا توجد توصيات" message="لا توجد توصيات في هذه الفئة" />}
      </div>
    </div>
  );
}

export function ForecastsPage() {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setForecasts(await fetchForecasts());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'تعذر تحميل التنبؤات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const companyForecasts = forecasts.filter(f => f.entity_type === 'company');
  const labels = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const chartData = companyForecasts.map(f => ({ label: labels[new Date(f.period).getMonth()], forecast_value: f.forecast_value, upper_bound: f.upper_bound, lower_bound: f.lower_bound }));

  return <div className="space-y-6 animate-fade-in"><PageHeader title="التنبؤات" subtitle="توقعات الأداء المستقبلي" /><Card><CardBody><div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold text-ink-800">تنبؤ المبيعات الشهري</h2><p className="text-xs text-ink-500 mt-1">مع نطاق الثقة</p></div><ConfidenceBadge confidence="FORECAST" /></div><ForecastChart data={chartData} /></CardBody></Card><Card><CardBody><h2 className="font-semibold text-ink-800 mb-4">تفاصيل التنبؤات</h2><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-ink-100 bg-ink-50/50"><th className="px-4 py-3 text-xs font-semibold text-ink-500 text-right">الكيان</th><th className="px-4 py-3 text-xs font-semibold text-ink-500 text-right">الفترة</th><th className="px-4 py-3 text-xs font-semibold text-ink-500 text-right">القيمة المتوقعة</th><th className="px-4 py-3 text-xs font-semibold text-ink-500 text-right">الحد الأدنى</th><th className="px-4 py-3 text-xs font-semibold text-ink-500 text-right">الحد الأعلى</th><th className="px-4 py-3 text-xs font-semibold text-ink-500 text-center">النموذج</th><th className="px-4 py-3 text-xs font-semibold text-ink-500 text-center">الدقة</th></tr></thead><tbody>{forecasts.map(f => <tr key={f.id} className="border-b border-ink-50"><td className="px-4 py-3 text-sm text-ink-700">{f.entity_name}</td><td className="px-4 py-3 text-sm text-ink-500">{formatDate(f.period)}</td><td className="px-4 py-3 text-sm font-semibold text-ink-800">{formatCurrency(f.forecast_value)}</td><td className="px-4 py-3 text-sm text-warning-600">{formatCurrency(f.lower_bound)}</td><td className="px-4 py-3 text-sm text-success-600">{formatCurrency(f.upper_bound)}</td><td className="px-4 py-3 text-center"><Badge variant="neutral">{f.model_name}</Badge></td><td className="px-4 py-3 text-center text-sm text-ink-600">{f.quality_score ? `${(f.quality_score * 100).toFixed(0)}%` : '—'}</td></tr>)}</tbody></table></div></CardBody></Card></div>;
}
