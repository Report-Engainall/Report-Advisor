import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, Layers3, PackageSearch, TrendingUp, AlertTriangle } from 'lucide-react';
import { fetchInventoryIntelligenceSource } from '@/lib/free-toolbox/inventory-intelligence-canonical';
import { applyReportMode, type DetailReportRow, type ReportMode, type GroupedReportRow } from '@/lib/free-toolbox/grouped-report';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader, LoadingState, ErrorState } from '@/components/ui/States';
import { formatNumber } from '@/lib/format';

type Group = { id: string; name: string; members: string[] };

export function InventoryIntelligencePage() {
  const [mode, setMode] = useState<ReportMode>('grouped');
  const [rows, setRows] = useState<DetailReportRow[]>([]);
  const [groups, setGroups] = useState<Record<string, Group>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const source = await fetchInventoryIntelligenceSource();
      setGroups(source.groups);
      setRows(source.rows);
      setLoading(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'تعذر تحميل بيانات ذكاء المخزون');
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const projected = useMemo(() => applyReportMode(rows, mode, groups), [rows, mode, groups]);
  if (loading) return <LoadingState message="جارٍ بناء تحليل المخزون والمجموعات…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const grouped = projected as GroupedReportRow[];
  const detail = projected as DetailReportRow[];
  const groupedRows = mode === 'grouped' ? grouped : [];
  const covered = groupedRows.filter(r => Number.isFinite(r.daysOfCover));
  const missingDemand = groupedRows.filter(r => !Number.isFinite(r.dailyDemand));

  return <div dir="rtl" className="space-y-6 animate-fade-in">
    <PageHeader title="ذكاء المخزون والمجموعات" subtitle="عرض تفصيلي أو تجميعي للأصناف البديلة مع إعادة حساب التغطية على مستوى المجموعة" actions={<button onClick={() => void load()} className="btn-secondary"><RefreshCw size={15}/> تحديث</button>} />
    <div className="flex flex-wrap gap-2">
      <button onClick={() => setMode('detail')} className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === 'detail' ? 'bg-primary-600 text-white' : 'bg-white border border-ink-200 text-ink-600'}`}>عرض تفصيلي</button>
      <button onClick={() => setMode('grouped')} className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === 'grouped' ? 'bg-primary-600 text-white' : 'bg-white border border-ink-200 text-ink-600'}`}>عرض تجميعي</button>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card><CardBody><div className="text-xs text-ink-500">الصفوف المعروضة</div><div className="text-2xl font-bold mt-1">{formatNumber(projected.length)}</div></CardBody></Card>
      <Card><CardBody><div className="text-xs text-ink-500">المجموعات</div><div className="text-2xl font-bold mt-1">{formatNumber(Object.keys(groups).length)}</div></CardBody></Card>
      <Card><CardBody><div className="text-xs text-ink-500">تغطية محسوبة</div><div className="text-2xl font-bold mt-1">{formatNumber(covered.length)}</div></CardBody></Card>
      <Card><CardBody><div className="text-xs text-ink-500">بيانات الطلب غير المتاحة</div><div className="text-2xl font-bold mt-1">{formatNumber(missingDemand.length)}</div></CardBody></Card>
    </div>
    <Card><CardHeader title={mode === 'grouped' ? 'التجميع الحقيقي للمجموعات' : 'تفاصيل الأصناف'} subtitle={mode === 'grouped' ? 'المخزون والطلب والمبيعات والتغطية تُحسب على مستوى المجموعة' : 'كل SKU يظهر منفردًا مع ارتباطه بالمجموعة إن وجد'} /><CardBody><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-right text-ink-400">{mode === 'grouped' ? <><th className="p-3">المجموعة</th><th className="p-3">الأصناف</th><th className="p-3">الرصيد</th><th className="p-3">الطلب</th><th className="p-3">المبيعات</th><th className="p-3">أيام التغطية</th></> : <><th className="p-3">SKU</th><th className="p-3">الصنف</th><th className="p-3">المجموعة</th><th className="p-3">الرصيد</th></>}</tr></thead><tbody>{mode === 'grouped' ? groupedRows.map(r => <tr key={r.groupId} className="border-b border-ink-50"><td className="p-3 font-semibold"><Layers3 size={15} className="inline ml-1"/>{r.name}</td><td className="p-3">{r.memberSkus.join('، ')}</td><td className="p-3">{formatNumber(r.stockUnits)}</td><td className="p-3">{formatNumber(r.requestedUnits)}</td><td className="p-3">{formatNumber(r.netSalesUnits)}</td><td className="p-3">{Number.isFinite(r.daysOfCover) ? <Badge variant={r.daysOfCover < 7 ? 'danger' : r.daysOfCover < 14 ? 'warning' : 'success'}>{r.daysOfCover.toFixed(1)} يوم</Badge> : <Badge variant="neutral">لا توجد بيانات كافية</Badge>}</td></tr>) : detail.map(r => <tr key={r.sku} className="border-b border-ink-50"><td className="p-3 font-medium">{r.sku}</td><td className="p-3">{r.name}</td><td className="p-3">{r.groupId ? groups[r.groupId]?.name : 'غير مرتبط'}</td><td className="p-3">{formatNumber(r.stockUnits)}</td></tr>)}</tbody></table>{!projected.length && <div className="p-10 text-center text-ink-400"><PackageSearch size={30} className="mx-auto mb-2"/>لا توجد بيانات مخزون قابلة للتحليل.</div>}</div></CardBody></Card>
    <div className="grid lg:grid-cols-2 gap-4"><Card><CardBody><div className="flex gap-3"><TrendingUp className="text-primary-600" size={20}/><div><div className="font-semibold">قاعدة القرار</div><p className="text-xs text-ink-500 mt-1">لا يتم جمع أيام التغطية للأصناف؛ في الوضع التجميعي يعاد حسابها من رصيد المجموعة ÷ الطلب اليومي للمجموعة عندما تكون بيانات الطلب مكتملة.</p></div></div></CardBody></Card><Card><CardBody><div className="flex gap-3"><AlertTriangle className="text-warning-600" size={20}/><div><div className="font-semibold">حدود البيانات الحالية</div><p className="text-xs text-ink-500 mt-1">لا تُعرض تغطية أو طلبات افتراضية عند غياب البيانات الزمنية؛ القيم غير المتاحة تظهر كـ—.</p></div></div></CardBody></Card></div>
  </div>;
}
