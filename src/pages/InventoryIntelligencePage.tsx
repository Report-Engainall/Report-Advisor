import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowDownToLine, Boxes, CalendarClock, CheckCircle2, PackageSearch, RefreshCw, TrendingUp, Zap } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge, PriorityBadge } from '@/components/ui/Badge';
import { PageHeader, LoadingState, ErrorState } from '@/components/ui/States';
import { fetchInventoryBalances, fetchInventorySales90d } from '@/lib/queries';
import { buildInventoryInsights, type InventoryInsight } from '@/lib/inventory-intelligence';
import { formatCurrency, formatNumber } from '@/lib/format';

const liquidityLabels = ['الكل', 'متحرك', 'متوسط', 'راكد', 'نفد'] as const;

export function InventoryIntelligencePage() {
  const [rows, setRows] = useState<InventoryInsight[]>([]);
  const [filter, setFilter] = useState<(typeof liquidityLabels)[number]>('الكل');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const [balances, sales] = await Promise.all([fetchInventoryBalances(), fetchInventorySales90d()]);
      setRows(buildInventoryInsights(balances, sales.invoices, sales.items));
    } catch (e: any) { setError(e?.message || 'تعذر تحميل ذكاء المخزون'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => filter === 'الكل' ? rows : rows.filter(r => r.liquidity === filter), [rows, filter]);
  const critical = rows.filter(r => r.priority === 'حرج').length;
  const moving = rows.filter(r => r.liquidity === 'متحرك').length;
  const stagnant = rows.filter(r => r.liquidity === 'راكد').length;
  const suggestedUnits = rows.reduce((s, r) => s + r.suggestedOrder, 0);
  const stockValue = rows.reduce((s, r) => s + r.inventoryValue, 0);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="ذكاء المخزون" subtitle="السيولة والسرعة وإعادة الطلب وتاريخ نفاد المخزون"
        action={<button onClick={load} className="btn-secondary text-xs"><RefreshCw size={14} /> تحديث</button>} />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Kpi icon={<Boxes size={18} />} label="قيمة المخزون" value={formatCurrency(stockValue)} />
        <Kpi icon={<TrendingUp size={18} />} label="أصناف متحركة" value={formatNumber(moving)} />
        <Kpi icon={<PackageSearch size={18} />} label="أصناف راكدة" value={formatNumber(stagnant)} />
        <Kpi icon={<AlertTriangle size={18} />} label="تحتاج إجراء" value={formatNumber(critical)} danger />
        <Kpi icon={<ArrowDownToLine size={18} />} label="كمية طلب مقترحة" value={formatNumber(suggestedUnits)} />
      </div>

      <Card className="border-primary-100 bg-gradient-to-br from-primary-50/70 to-white">
        <CardBody>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary-700 font-semibold"><Zap size={17} /> لوحة القرار</div>
              <p className="text-sm text-ink-600 mt-1">الأولوية ليست للأصناف الأكثر مبيعاً فقط؛ بل لما قد ينفد قريباً وما يجمّد رأس المال.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white rounded-lg border border-ink-100 px-3 py-2"><span className="text-ink-400">نفاد قريب</span><div className="font-bold text-danger-600">{rows.filter(r => r.daysOfStock !== null && r.daysOfStock <= 14).length}</div></div>
              <div className="bg-white rounded-lg border border-ink-100 px-3 py-2"><span className="text-ink-400">طلب مقترح</span><div className="font-bold text-primary-700">{formatNumber(suggestedUnits)}</div></div>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="flex gap-2 flex-wrap">
        {liquidityLabels.map(label => (
          <button key={label} onClick={() => setFilter(label)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${filter === label ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-ink-600 border-ink-200 hover:bg-ink-50'}`}>
            {label} <span className="opacity-60">({label === 'الكل' ? rows.length : rows.filter(r => r.liquidity === label).length})</span>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader title="مصفوفة السيولة وإعادة الطلب" subtitle="الحسابات مبنية على حركة البيع الفعلية لآخر 90 يوماً" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead><tr className="border-b border-ink-100 bg-ink-50/60">
              {['الصنف','الحالة','المخزون','بيع/يوم','تغطية','تاريخ النفاد','نقطة الطلب','طلب مقترح','الأولوية','الإجراء'].map(h => <th key={h} className="px-4 py-3 text-[11px] font-semibold text-ink-500 text-right whitespace-nowrap">{h}</th>)}
            </tr></thead>
            <tbody>{filtered.map(row => <InventoryRow key={row.productId} row={row} />)}</tbody>
          </table>
          {!filtered.length && <div className="p-10 text-center text-sm text-ink-400">لا توجد أصناف ضمن هذا التصنيف.</div>}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <InsightCard title="الأكثر إلحاحاً" icon={<AlertTriangle size={17} />} rows={rows.filter(r => r.priority === 'حرج').slice(0, 5)} empty="لا توجد حالات حرجة." />
        <InsightCard title="الأسرع حركة" icon={<TrendingUp size={17} />} rows={[...rows].sort((a,b)=>b.dailyVelocity-a.dailyVelocity).slice(0,5)} empty="لا توجد حركة بيع كافية." />
        <InsightCard title="رأس مال مجمد" icon={<PackageSearch size={17} />} rows={rows.filter(r=>r.liquidity==='راكد').sort((a,b)=>b.inventoryValue-a.inventoryValue).slice(0,5)} empty="لا توجد أصناف راكدة." />
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, danger = false }: { icon: React.ReactNode; label: string; value: string; danger?: boolean }) {
  return <Card><CardBody><div className="flex items-center gap-2 text-ink-400">{icon}<span className="text-[11px]">{label}</span></div><div className={`mt-2 text-xl font-bold ${danger ? 'text-danger-600' : 'text-ink-900'}`}>{value}</div></CardBody></Card>;
}

function InventoryRow({ row }: { row: InventoryInsight }) {
  const status = row.liquidity === 'متحرك' ? 'success' : row.liquidity === 'راكد' ? 'warning' : row.liquidity === 'نفد' ? 'danger' : 'neutral';
  return <tr className="border-b border-ink-50 hover:bg-ink-50/50 transition">
    <td className="px-4 py-3"><div className="font-medium text-sm text-ink-800">{row.name}</div><div className="text-[10px] text-ink-400">{row.sku} · {row.unit}</div></td>
    <td className="px-4 py-3"><Badge variant={status as any}>{row.liquidity}</Badge></td>
    <td className="px-4 py-3 text-sm font-semibold">{formatNumber(row.stock)}</td>
    <td className="px-4 py-3 text-sm">{formatNumber(row.dailyVelocity)}</td>
    <td className="px-4 py-3 text-sm">{row.daysOfStock === null ? '—' : `${formatNumber(row.daysOfStock)} يوم`}</td>
    <td className="px-4 py-3 text-xs">{row.stockoutDate ? <span className={row.daysOfStock !== null && row.daysOfStock <= 14 ? 'text-danger-600 font-semibold' : 'text-ink-600'}><CalendarClock size={12} className="inline ml-1" />{row.stockoutDate}</span> : 'لا يمكن التنبؤ'}</td>
    <td className="px-4 py-3 text-sm">{formatNumber(row.reorderPoint)}</td>
    <td className="px-4 py-3 text-sm font-bold text-primary-700">{row.suggestedOrder ? formatNumber(row.suggestedOrder) : '—'}</td>
    <td className="px-4 py-3"><PriorityBadge priority={row.priority === 'حرج' ? 'critical' : row.priority === 'مرتفع' ? 'high' : row.priority === 'متوسط' ? 'medium' : 'low'} /></td>
    <td className="px-4 py-3 text-xs text-ink-600">{row.action}</td>
  </tr>;
}

function InsightCard({ title, icon, rows, empty }: { title: string; icon: React.ReactNode; rows: InventoryInsight[]; empty: string }) {
  return <Card><CardHeader title={title} action={<span className="text-primary-600">{icon}</span>} /><CardBody><div className="space-y-2">{rows.map(row => <div key={row.productId} className="flex items-center gap-2 p-2 rounded-lg bg-ink-50/60"><CheckCircle2 size={14} className={row.priority === 'حرج' ? 'text-danger-500' : 'text-success-500'} /><div className="flex-1 min-w-0"><div className="text-xs font-medium truncate">{row.name}</div><div className="text-[10px] text-ink-400">{row.dailyVelocity ? `${formatNumber(row.dailyVelocity)} وحدة/يوم` : `${formatCurrency(row.inventoryValue)} قيمة`}</div></div><span className="text-[10px] font-semibold">{row.daysOfStock === null ? 'راكد' : `${formatNumber(row.daysOfStock)} يوم`}</span></div>)}{!rows.length && <div className="text-xs text-ink-400 text-center py-5">{empty}</div>}</div></CardBody></Card>;
}
