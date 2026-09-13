import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { PageHeader, LoadingState, ErrorState, EmptyState } from '@/components/ui/States';
import { fetchProfitabilitySnapshot, type ProfitabilitySnapshot } from '@/lib/dashboard-canonical';
import { formatCurrency } from '@/lib/format';

export function CanonicalScenariosPage() {
  const [snapshot, setSnapshot] = useState<ProfitabilitySnapshot | null>(null);
  const [priceChange, setPriceChange] = useState(5);
  const [volumeChange, setVolumeChange] = useState(10);
  const [costChange, setCostChange] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      setSnapshot(await fetchProfitabilitySnapshot());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'تعذر تحميل بيانات الربحية');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!snapshot || snapshot.status !== 'CALCULATED' || snapshot.revenue == null || snapshot.cost == null) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="محاكاة السيناريوهات" subtitle="اختبر تأثير التغييرات على الأداء المالي" />
        <Card>
          <CardBody>
            <EmptyState
              icon={<AlertTriangle size={32} />}
              title="بيانات غير كافية للمحاكاة"
              message={snapshot?.reasons?.length ? snapshot.reasons.join(' • ') : 'INSUFFICIENT_DATA: لا تتوفر بيانات ربحية موثوقة كافية للمحاكاة.'}
            />
          </CardBody>
        </Card>
      </div>
    );
  }

  const baseRevenue = snapshot.revenue;
  const baseCost = snapshot.cost;
  const baseProfit = snapshot.gross_profit;
  if (baseProfit == null || !Number.isFinite(baseRevenue) || !Number.isFinite(baseCost) || !Number.isFinite(baseProfit) || baseProfit <= 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="محاكاة السيناريوهات" subtitle="اختبر تأثير التغييرات على الأداء المالي" />
        <Card><CardBody><EmptyState icon={<AlertTriangle size={32} />} title="بيانات غير كافية للمحاكاة" message="INSUFFICIENT_DATA: لا يمكن حساب تغير الربح من بيانات الربحية الحالية." /></CardBody></Card>
      </div>
    );
  }

  const newRevenue = baseRevenue * (1 + volumeChange / 100) * (1 + priceChange / 100);
  const newCost = baseCost * (1 + costChange / 100) * (1 + volumeChange / 100);
  const newProfit = newRevenue - newCost;
  const profitChange = ((newProfit - baseProfit) / baseProfit) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="محاكاة السيناريوهات" subtitle="اختبر تأثير التغييرات على الأداء المالي" />
      <div className="rounded-xl border border-success-100 bg-success-50 px-4 py-3 text-sm text-success-700 flex items-center gap-2">
        <CheckCircle2 size={16} />
        البيانات الأساسية من لقطة الربحية القانونية للشركة، وليست قيماً تجريبية.
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="محددات السيناريو" />
          <CardBody>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-ink-700 mb-2 flex items-center justify-between"><span>تغيير السعر</span><span className={`font-bold ${priceChange >= 0 ? 'text-success-600' : 'text-danger-600'}`}>{priceChange > 0 ? '+' : ''}{priceChange}%</span></label>
                <input type="range" min="-20" max="20" value={priceChange} onChange={e => setPriceChange(Number(e.target.value))} className="w-full accent-primary-600" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink-700 mb-2 flex items-center justify-between"><span>تغيير حجم المبيعات</span><span className={`font-bold ${volumeChange >= 0 ? 'text-success-600' : 'text-danger-600'}`}>{volumeChange > 0 ? '+' : ''}{volumeChange}%</span></label>
                <input type="range" min="-30" max="30" value={volumeChange} onChange={e => setVolumeChange(Number(e.target.value))} className="w-full accent-primary-600" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink-700 mb-2 flex items-center justify-between"><span>تغيير التكلفة</span><span className={`font-bold ${costChange >= 0 ? 'text-danger-600' : 'text-success-600'}`}>{costChange > 0 ? '+' : ''}{costChange}%</span></label>
                <input type="range" min="-15" max="15" value={costChange} onChange={e => setCostChange(Number(e.target.value))} className="w-full accent-primary-600" />
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="النتائج المتوقعة" subtitle={`آخر لقطة: ${snapshot.as_of}`} />
          <CardBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-ink-50"><div className="text-xs text-ink-500">الإيرادات الحالية</div><div className="text-lg font-bold text-ink-800">{formatCurrency(baseRevenue)}</div></div>
                <div className="p-3 rounded-lg bg-primary-50"><div className="text-xs text-primary-600">الإيرادات الجديدة</div><div className="text-lg font-bold text-primary-700">{formatCurrency(newRevenue)}</div></div>
                <div className="p-3 rounded-lg bg-ink-50"><div className="text-xs text-ink-500">التكلفة الحالية</div><div className="text-lg font-bold text-ink-800">{formatCurrency(baseCost)}</div></div>
                <div className="p-3 rounded-lg bg-warning-50"><div className="text-xs text-warning-600">التكلفة الجديدة</div><div className="text-lg font-bold text-warning-700">{formatCurrency(newCost)}</div></div>
              </div>
              <div className={`p-4 rounded-lg ${profitChange >= 0 ? 'bg-success-50' : 'bg-danger-50'}`}>
                <div className="flex items-center justify-between">
                  <div><div className={`text-xs ${profitChange >= 0 ? 'text-success-600' : 'text-danger-600'}`}>تغيير الربح</div><div className={`text-2xl font-bold ${profitChange >= 0 ? 'text-success-700' : 'text-danger-700'}`}>{profitChange > 0 ? '+' : ''}{profitChange.toFixed(1)}%</div></div>
                  <div className="text-left"><div className="text-xs text-ink-500">الربح الجديد</div><div className="text-lg font-bold text-ink-800">{formatCurrency(newProfit)}</div></div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
