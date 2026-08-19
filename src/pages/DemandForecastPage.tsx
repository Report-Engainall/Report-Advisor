import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowDown, ArrowUp, CalendarClock, RefreshCw, ShoppingCart, TrendingUp } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader, LoadingState, ErrorState } from '@/components/ui/States';
import { formatNumber } from '@/lib/format';
import { fetchInventoryBalances, fetchInventorySales90d } from '@/lib/queries';
import { buildDemandForecast, type DemandForecastRow } from '@/lib/demandForecast';

const priorityLabel = { critical: 'عاجل', high: 'مرتفع', medium: 'متوسط', normal: 'طبيعي' } as const;
const priorityClass = { critical: 'danger', high: 'warning', medium: 'neutral', normal: 'success' } as const;

export function DemandForecastPage() {
  const [rows, setRows] = useState<DemandForecastRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | DemandForecastRow['priority']>('all');

  const load = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const [balances, sales] = await Promise.all([fetchInventoryBalances(), fetchInventorySales90d()]);
      setRows(buildDemandForecast(balances, sales.invoices, sales.items));
    } catch (e) { setError(e instanceof Error ? e.message : 'تعذر حساب التنبؤ'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => filter === 'all' ? rows : rows.filter(r => r.priority === filter), [rows, filter]);
  const urgent = rows.filter(r => r.priority === 'critical').length;
  const high = rows.filter(r => r.priority === 'high').length;
  const accelerating = rows.filter(r => r.trendPct > 15).length;
  const suggested7d = rows.reduce((s, r) => s + r.order7d, 0);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return <div className="space-y-6 animate-fade-in">
    <PageHeader title="محرك التنبؤ والطلب" subtitle="توقع الطلب، تاريخ النفاد، وحدود إعادة الطلب من حركة البيع الفعلية" action={<button onClick={load} className="btn-secondary text-xs"><RefreshCw size={14} /> تحديث التحليل</button>} />

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card><CardBody><div className="text-xs text-ink-500">إعادة طلب عاجلة</div><div className="text-2xl font-bold text-danger-600 mt-1">{urgent}</div><div className="text-[11px] text-ink-400">نفاد خلال مهلة التوريد</div></CardBody></Card>
      <Card><CardBody><div className="text-xs text-ink-500">أولوية مرتفعة</div><div className="text-2xl font-bold text-warning-600 mt-1">{high}</div><div className="text-[11px] text-ink-400">تحتاج طلبًا قريبًا</div></CardBody></Card>
      <Card><CardBody><div className="text-xs text-ink-500">الطلب المتسارع</div><div className="text-2xl font-bold text-primary-600 mt-1">{accelerating}</div><div className="text-[11px] text-ink-400">نمو 30 يومًا مقابل 90 يومًا</div></CardBody></Card>
      <Card><CardBody><div className="text-xs text-ink-500">كمية مقترحة / 7 أيام</div><div className="text-2xl font-bold text-ink-800 mt-1">{formatNumber(suggested7d)}</div><div className="text-[11px] text-ink-400">بعد احتساب المخزون الحالي</div></CardBody></Card>
    </div>

    <Card className="border-primary-100 bg-primary-50/30"><CardBody><div className="flex items-start gap-3"><div className="w-9 h-9 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center"><TrendingUp size={18}/></div><div><div className="font-semibold text-ink-800">كيف يعمل المحرك؟</div><p className="text-xs text-ink-600 mt-1">يوازن متوسط الطلب لآخر 30 يومًا و90 يومًا، ثم يحسب التغطية، المخزون الآمن، نقطة إعادة الطلب، وتاريخ النفاد. النتائج حسابية وليست تخمينًا من نموذج لغوي.</p></div></div></CardBody></Card>

    <div className="flex gap-2 flex-wrap">
      {(['all','critical','high','medium','normal'] as const).map(v => <button key={v} onClick={() => setFilter(v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${filter === v ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-ink-600 border-ink-200 hover:bg-ink-50'}`}>{v === 'all' ? 'كل الأصناف' : priorityLabel[v]} <span className="mr-1 opacity-70">({v === 'all' ? rows.length : rows.filter(r => r.priority === v).length})</span></button>)}
    </div>

    <Card><CardHeader title="خطة الطلب" subtitle="الأصناف مرتبة حسب خطورة النفاد وسرعة الطلب" /><div className="overflow-x-auto"><table className="w-full min-w-[1050px]"><thead><tr className="border-b border-ink-100 bg-ink-50/60"><th className="px-4 py-3 text-right text-xs text-ink-500">الصنف</th><th className="px-4 py-3 text-right text-xs text-ink-500">المخزون</th><th className="px-4 py-3 text-right text-xs text-ink-500">الطلب/يوم</th><th className="px-4 py-3 text-right text-xs text-ink-500">الاتجاه</th><th className="px-4 py-3 text-right text-xs text-ink-500">التغطية</th><th className="px-4 py-3 text-right text-xs text-ink-500">النفاد المتوقع</th><th className="px-4 py-3 text-right text-xs text-ink-500">7 أيام</th><th className="px-4 py-3 text-right text-xs text-ink-500">15 يوم</th><th className="px-4 py-3 text-right text-xs text-ink-500">30 يوم</th><th className="px-4 py-3 text-right text-xs text-ink-500">الأولوية</th></tr></thead><tbody>{filtered.map(r => <tr key={r.productId} className="border-b border-ink-50 hover:bg-ink-50/40"><td className="px-4 py-3"><div className="font-medium text-sm text-ink-800">{r.name}</div><div className="text-[11px] text-ink-400">{r.sku} • {r.unit}</div></td><td className="px-4 py-3 text-sm font-semibold">{formatNumber(r.stock)}</td><td className="px-4 py-3 text-sm">{r.weightedDailyDemand.toFixed(2)}</td><td className={`px-4 py-3 text-xs font-medium ${r.trendPct > 0 ? 'text-success-600' : 'text-danger-600'}`}>{r.trendPct >= 0 ? <ArrowUp size={12} className="inline"/> : <ArrowDown size={12} className="inline"/>} {Math.abs(r.trendPct).toFixed(0)}%</td><td className="px-4 py-3 text-sm">{r.daysCover == null ? '—' : `${r.daysCover.toFixed(1)} يوم`}</td><td className="px-4 py-3 text-xs">{r.stockoutDate || 'غير محدد'}</td><td className="px-4 py-3 text-sm font-semibold">{r.order7d}</td><td className="px-4 py-3 text-sm">{r.order15d}</td><td className="px-4 py-3 text-sm">{r.order30d}</td><td className="px-4 py-3"><Badge variant={priorityClass[r.priority]}>{priorityLabel[r.priority]}</Badge></td></tr>)}</tbody></table></div></Card>

    {filtered.length > 0 && <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">{filtered.slice(0, 3).map(r => <Card key={`rec-${r.productId}`}><CardBody><div className="flex items-center gap-2 mb-3"><AlertTriangle size={15} className={r.priority === 'critical' ? 'text-danger-600' : 'text-warning-600'}/><span className="font-semibold text-sm">{r.name}</span></div><div className="text-xs text-ink-600">{r.recommendation}</div><div className="grid grid-cols-2 gap-2 mt-3 text-[11px]"><div className="p-2 rounded bg-ink-50"><CalendarClock size={12} className="inline ml-1"/> نفاد: {r.stockoutDate || '—'}</div><div className="p-2 rounded bg-ink-50"><ShoppingCart size={12} className="inline ml-1"/> طلب 7 أيام: {r.order7d}</div></div></CardBody></Card>)}</div>}
  </div>;
}
