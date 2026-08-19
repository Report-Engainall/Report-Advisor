import { useEffect, useState, useCallback } from 'react';
import {
  Brain, Lightbulb, TrendingUp, AlertTriangle, CheckCircle2,
  Clock, XCircle, ArrowRight, Sparkles, Target, Zap,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge, SeverityBadge, PriorityBadge, ConfidenceBadge, StatusBadge } from '@/components/ui/Badge';
import { PageHeader, LoadingState, ErrorState, EmptyState } from '@/components/ui/States';
import { ForecastChart } from '@/components/ui/Charts';
import {
  fetchRecommendations, fetchAlerts, fetchForecasts,
  updateRecommendationStatus, markAlertRead,
} from '@/lib/queries';
import { formatCurrency, formatNumber, relativeTime, formatDate } from '@/lib/format';
import type { Recommendation, Alert, Forecast } from '@/lib/types';

export function IntelligenceCenterPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [recs, alts, fc] = await Promise.all([fetchRecommendations(), fetchAlerts(), fetchForecasts()]);
      setRecommendations(recs); setAlerts(alts); setForecasts(fc);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const newRecs = recommendations.filter(r => r.status === 'new').length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.is_read).length;
  const companyForecasts = forecasts.filter(f => f.entity_type === 'company');

  const forecastChartData = companyForecasts.map(f => {
    const d = new Date(f.period);
    const labels = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return { label: labels[d.getMonth()], forecast_value: f.forecast_value, upper_bound: f.upper_bound, lower_bound: f.lower_bound };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="مركز الذكاء" subtitle="توصيات وتنبؤات ومحاكاة السيناريوهات" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
          <CardBody>
            <Brain size={24} className="mb-3 text-primary-200" />
            <div className="text-3xl font-bold">{newRecs}</div>
            <div className="text-sm text-primary-200 mt-1">توصيات جديدة</div>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-danger-500 to-danger-700 text-white">
          <CardBody>
            <AlertTriangle size={24} className="mb-3 text-danger-200" />
            <div className="text-3xl font-bold">{criticalAlerts}</div>
            <div className="text-sm text-danger-200 mt-1">تنبيهات حرجة</div>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-accent-500 to-accent-700 text-white">
          <CardBody>
            <TrendingUp size={24} className="mb-3 text-accent-200" />
            <div className="text-3xl font-bold">{forecasts.length}</div>
            <div className="text-sm text-accent-200 mt-1">تنبؤات نشطة</div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="تنبؤ المبيعات" subtitle="توقعات آخر 6 أشهر" action={<ConfidenceBadge confidence="FORECAST" />} />
        <CardBody><ForecastChart data={forecastChartData} /></CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="أحدث التنبيهات" />
          <CardBody>
            <div className="space-y-3">
              {alerts.slice(0, 5).map(alert => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-ink-50/50">
                  <SeverityBadge severity={alert.severity} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink-800">{alert.title}</div>
                    {alert.description && <div className="text-xs text-ink-500 mt-0.5">{alert.description}</div>}
                  </div>
                  <span className="text-[11px] text-ink-400">{relativeTime(alert.created_at)}</span>
                </div>
              ))}
              {alerts.length === 0 && <EmptyState title="لا توجد تنبيهات" />}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="التوصيات النشطة" />
          <CardBody>
            <div className="space-y-3">
              {recommendations.filter(r => r.status === 'new').slice(0, 5).map(rec => (
                <div key={rec.id} className="flex items-start gap-3 p-3 rounded-lg bg-ink-50/50">
                  <div className="w-8 h-8 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center flex-shrink-0">
                    <Lightbulb size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink-800">{rec.title}</div>
                    {rec.expected_impact && <div className="text-xs text-success-600 mt-0.5">الأثر: {formatCurrency(rec.expected_impact)}</div>}
                  </div>
                  <PriorityBadge priority={rec.priority} />
                </div>
              ))}
              {recommendations.length === 0 && <EmptyState title="لا توجد توصيات" />}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const load = useCallback(async () => {
    const data = await fetchRecommendations();
    setRecommendations(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id: string, status: string) => {
    await updateRecommendationStatus(id, status);
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  if (loading) return <LoadingState />;

  const filtered = filter === 'all' ? recommendations : recommendations.filter(r => r.status === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="التوصيات" subtitle="إجراءات مقترحة لتحسين الأداء" />

      <div className="flex gap-2 flex-wrap">
        {[
          { v: 'all', l: 'الكل' },
          { v: 'new', l: 'جديدة' },
          { v: 'accepted', l: 'مقبولة' },
          { v: 'in_progress', l: 'قيد التنفيذ' },
          { v: 'done', l: 'تم التنفيذ' },
          { v: 'rejected', l: 'مرفوضة' },
        ].map(f => (
          <button
            key={f.v}
            onClick={() => setFilter(f.v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f.v ? 'bg-primary-600 text-white' : 'bg-white text-ink-600 border border-ink-200 hover:bg-ink-50'
            }`}
          >
            {f.l}
            <span className="mr-1 opacity-60">({f.v === 'all' ? recommendations.length : recommendations.filter(r => r.status === f.v).length})</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(rec => (
          <Card key={rec.id}>
            <CardBody>
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center flex-shrink-0">
                      <Lightbulb size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink-800 text-sm">{rec.title}</h3>
                      {rec.description && <p className="text-xs text-ink-500 mt-1">{rec.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <PriorityBadge priority={rec.priority} />
                    <ConfidenceBadge confidence={rec.confidence} />
                    <StatusBadge status={rec.status} />
                  </div>
                </div>

                {rec.expected_impact && (
                  <div className="flex items-center gap-2 text-sm">
                    <Target size={14} className="text-success-500" />
                    <span className="text-ink-600">الأثر المتوقع: <span className="font-semibold text-success-600">{formatCurrency(rec.expected_impact)}</span></span>
                    <span className="text-ink-400">•</span>
                    <span className="text-ink-500">{relativeTime(rec.created_at)}</span>
                  </div>
                )}

                {rec.status === 'new' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(rec.id, 'accepted')} className="btn-primary text-xs">
                      <CheckCircle2 size={14} /> قبول
                    </button>
                    <button onClick={() => handleAction(rec.id, 'rejected')} className="btn-secondary text-xs">
                      <XCircle size={14} /> رفض
                    </button>
                  </div>
                )}
                {rec.status === 'accepted' && (
                  <button onClick={() => handleAction(rec.id, 'done')} className="btn-primary text-xs">
                    <CheckCircle2 size={14} /> تم التنفيذ
                  </button>
                )}
                {rec.status === 'done' && rec.impact_result && (
                  <div className="p-2 rounded-lg bg-success-50 text-success-700 text-xs">
                    <Zap size={12} className="inline ml-1" /> النتيجة: {rec.impact_result}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
        {filtered.length === 0 && <EmptyState icon={<Lightbulb size={32} />} title="لا توجد توصيات" message="لا توجد توصيات في هذه الفئة" />}
      </div>
    </div>
  );
}

export function ForecastsPage() {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForecasts().then(data => { setForecasts(data); setLoading(false); });
  }, []);

  if (loading) return <LoadingState />;

  const companyForecasts = forecasts.filter(f => f.entity_type === 'company');
  const labels = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const chartData = companyForecasts.map(f => ({
    label: labels[new Date(f.period).getMonth()],
    forecast_value: f.forecast_value,
    upper_bound: f.upper_bound,
    lower_bound: f.lower_bound,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="التنبؤات" subtitle="توقعات الأداء المستقبلي" />

      <Card>
        <CardHeader title="تنبؤ المبيعات الشهري" subtitle="مع نطاق الثقة" action={<ConfidenceBadge confidence="FORECAST" />} />
        <CardBody><ForecastChart data={chartData} /></CardBody>
      </Card>

      <Card>
        <CardHeader title="تفاصيل التنبؤات" />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/50">
                <th className="px-4 py-3 text-xs font-semibold text-ink-500 text-right">الكيان</th>
                <th className="px-4 py-3 text-xs font-semibold text-ink-500 text-right">الفترة</th>
                <th className="px-4 py-3 text-xs font-semibold text-ink-500 text-right">القيمة المتوقعة</th>
                <th className="px-4 py-3 text-xs font-semibold text-ink-500 text-right">الحد الأدنى</th>
                <th className="px-4 py-3 text-xs font-semibold text-ink-500 text-right">الحد الأعلى</th>
                <th className="px-4 py-3 text-xs font-semibold text-ink-500 text-center">النموذج</th>
                <th className="px-4 py-3 text-xs font-semibold text-ink-500 text-center">الدقة</th>
              </tr>
            </thead>
            <tbody>
              {forecasts.map(f => (
                <tr key={f.id} className="border-b border-ink-50">
                  <td className="px-4 py-3 text-sm text-ink-700">{f.entity_name}</td>
                  <td className="px-4 py-3 text-sm text-ink-500">{formatDate(f.period)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-ink-800">{formatCurrency(f.forecast_value)}</td>
                  <td className="px-4 py-3 text-sm text-warning-600">{formatCurrency(f.lower_bound)}</td>
                  <td className="px-4 py-3 text-sm text-success-600">{formatCurrency(f.upper_bound)}</td>
                  <td className="px-4 py-3 text-center"><Badge variant="neutral">{f.model_name}</Badge></td>
                  <td className="px-4 py-3 text-center text-sm text-ink-600">{f.quality_score ? `${(f.quality_score * 100).toFixed(0)}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function ScenariosPage() {
  const [priceChange, setPriceChange] = useState(5);
  const [volumeChange, setVolumeChange] = useState(10);
  const [costChange, setCostChange] = useState(0);

  const baseRevenue = 450000;
  const baseCost = 315000;
  const baseProfit = baseRevenue - baseCost;

  const newRevenue = baseRevenue * (1 + volumeChange / 100) * (1 + priceChange / 100);
  const newCost = baseCost * (1 + costChange / 100) * (1 + volumeChange / 100);
  const newProfit = newRevenue - newCost;
  const profitChange = ((newProfit - baseProfit) / baseProfit) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="محاكاة السيناريوهات" subtitle="اختبر تأثير التغييرات على الأداء المالي" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="محددات السيناريو" />
          <CardBody>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-ink-700 mb-2 flex items-center justify-between">
                  <span>تغيير السعر</span>
                  <span className={`font-bold ${priceChange >= 0 ? 'text-success-600' : 'text-danger-600'}`}>{priceChange > 0 ? '+' : ''}{priceChange}%</span>
                </label>
                <input type="range" min="-20" max="20" value={priceChange} onChange={e => setPriceChange(Number(e.target.value))} className="w-full accent-primary-600" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink-700 mb-2 flex items-center justify-between">
                  <span>تغيير حجم المبيعات</span>
                  <span className={`font-bold ${volumeChange >= 0 ? 'text-success-600' : 'text-danger-600'}`}>{volumeChange > 0 ? '+' : ''}{volumeChange}%</span>
                </label>
                <input type="range" min="-30" max="30" value={volumeChange} onChange={e => setVolumeChange(Number(e.target.value))} className="w-full accent-primary-600" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink-700 mb-2 flex items-center justify-between">
                  <span>تغيير التكلفة</span>
                  <span className={`font-bold ${costChange >= 0 ? 'text-danger-600' : 'text-success-600'}`}>{costChange > 0 ? '+' : ''}{costChange}%</span>
                </label>
                <input type="range" min="-15" max="15" value={costChange} onChange={e => setCostChange(Number(e.target.value))} className="w-full accent-primary-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="النتائج المتوقعة" />
          <CardBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-ink-50">
                  <div className="text-xs text-ink-500">الإيرادات الحالية</div>
                  <div className="text-lg font-bold text-ink-800">{formatCurrency(baseRevenue)}</div>
                </div>
                <div className="p-3 rounded-lg bg-primary-50">
                  <div className="text-xs text-primary-600">الإيرادات الجديدة</div>
                  <div className="text-lg font-bold text-primary-700">{formatCurrency(newRevenue)}</div>
                </div>
                <div className="p-3 rounded-lg bg-ink-50">
                  <div className="text-xs text-ink-500">التكلفة الحالية</div>
                  <div className="text-lg font-bold text-ink-800">{formatCurrency(baseCost)}</div>
                </div>
                <div className="p-3 rounded-lg bg-warning-50">
                  <div className="text-xs text-warning-600">التكلفة الجديدة</div>
                  <div className="text-lg font-bold text-warning-700">{formatCurrency(newCost)}</div>
                </div>
              </div>
              <div className={`p-4 rounded-lg ${profitChange >= 0 ? 'bg-success-50' : 'bg-danger-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-xs ${profitChange >= 0 ? 'text-success-600' : 'text-danger-600'}`}>تغيير الربح</div>
                    <div className={`text-2xl font-bold ${profitChange >= 0 ? 'text-success-700' : 'text-danger-700'}`}>{profitChange > 0 ? '+' : ''}{profitChange.toFixed(1)}%</div>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-ink-500">الربح الجديد</div>
                    <div className="text-lg font-bold text-ink-800">{formatCurrency(newProfit)}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
