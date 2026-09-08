import { useCallback, useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Database, Gauge, History, Sparkles } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { fetchDashboardSnapshot, type DashboardKPIs } from '@/lib/dashboard-canonical';
import { fetchDataQualitySnapshot, type DataQualitySnapshot } from '@/lib/data-quality-snapshot';
import { fetchImportRecords } from '@/lib/queries';
import { formatNumber } from '@/lib/format';

export function ImportIntelligenceCockpit() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [quality, setQuality] = useState<DataQualitySnapshot | null>(null);
  const [imports, setImports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async (initial = false) => {
    try {
      if (initial) setLoading(true);
      setError(null);
      const [snapshot, dq, history] = await Promise.all([fetchDashboardSnapshot(3), fetchDataQualitySnapshot(), fetchImportRecords()]);
      setKpis(snapshot.kpis); setQuality(dq); setImports(history.slice(0, 5));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر تحميل لوحة ذكاء الاستيراد');
    } finally { if (initial) setLoading(false); }
  }, []);
  useEffect(() => {
    void load(true);
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void load(false); }, 10000);
    const onVisible = () => { if (document.visibilityState === 'visible') void load(false); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [load]);
  if (loading) return <Card><CardBody><div className="py-8 text-center text-sm text-ink-500">جارٍ بناء صورة البيانات…</div></CardBody></Card>;
  if (error) return <Card><CardBody><div role="alert" className="flex items-center gap-2 text-sm text-warning-700"><AlertTriangle size={17}/>{error}</div></CardBody></Card>;
  const entities = quality?.entities ?? [];
  const records = entities.reduce((s, e) => s + e.total, 0);
  const issues = entities.reduce((s, e) => s + e.issues, 0);
  const health = records ? Math.max(0, Math.min(100, Math.round(((records - issues) / records) * 100))) : 0;
  const kpiStatus = kpis?.status === 'INSUFFICIENT_DATA' ? 'بيانات ناقصة' : 'مصدر محسوب';
  return <Card className="overflow-hidden"><CardHeader title="مركز ذكاء البيانات والاستيراد" subtitle="صورة حية لصحة البيانات وآخر عمليات الإدخال، مع تحديث تلقائي دون الحاجة لإعادة تحميل الشاشة" action={<Badge variant={health >= 90 ? 'success' : health >= 70 ? 'warning' : 'danger'}>{health}% صحة البيانات</Badge>} />
    <CardBody className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="rounded-xl bg-ink-50 p-4"><Database size={17}/><div className="mt-2 text-xs text-ink-500">السجلات الحالية</div><b className="text-lg">{formatNumber(records)}</b></div>
        <div className="rounded-xl bg-ink-50 p-4"><AlertTriangle size={17}/><div className="mt-2 text-xs text-ink-500">مشاكل البيانات</div><b className="text-lg">{formatNumber(issues)}</b></div>
        <div className="rounded-xl bg-ink-50 p-4"><Gauge size={17}/><div className="mt-2 text-xs text-ink-500">حالة المؤشرات</div><b className="text-sm">{kpiStatus}</b></div>
        <div className="rounded-xl bg-ink-50 p-4"><Activity size={17}/><div className="mt-2 text-xs text-ink-500">المبيعات 3 أشهر</div><b className="text-sm">{kpis?.totalSales == null ? 'غير متاح' : formatNumber(kpis.totalSales)}</b></div>
        <div className="rounded-xl bg-ink-50 p-4"><History size={17}/><div className="mt-2 text-xs text-ink-500">عمليات الاستيراد</div><b className="text-lg">{formatNumber(imports.length)}</b></div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <div><div className="flex items-center gap-2 mb-3"><Sparkles size={17}/><h3 className="font-semibold text-sm">ماذا يعني هذا؟</h3></div><div className="space-y-2">{entities.length === 0 ? <div className="rounded-xl border border-dashed p-4 text-sm text-ink-500">لا توجد بيانات تجارية بعد. يمكنك البدء بملف خارجي دون افتراض نموذج مسبق.</div> : entities.map(e => <div key={e.name} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3"><div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center"><CheckCircle2 size={16}/></div><div className="flex-1"><div className="text-sm font-medium">{e.name}</div><div className="text-xs text-ink-400">{formatNumber(e.total)} سجل · {formatNumber(e.issues)} مشكلة</div></div><Badge variant={e.score >= 90 ? 'success' : e.score >= 70 ? 'warning' : 'danger'}>{e.score}%</Badge></div>)}</div></div>
        <div><div className="flex items-center gap-2 mb-3"><History size={17}/><h3 className="font-semibold text-sm">آخر الاستيرادات</h3></div><div className="space-y-2">{imports.length === 0 ? <div className="rounded-xl border border-dashed p-4 text-sm text-ink-500">لا توجد عمليات سابقة.</div> : imports.map(item => <div key={item.id} className="rounded-xl border border-ink-100 p-3"><div className="flex items-center justify-between gap-2"><span className="text-sm font-medium truncate">{item.file_name}</span><Badge variant={item.status === 'completed' ? 'success' : item.status === 'failed' ? 'danger' : 'warning'}>{item.status}</Badge></div><div className="mt-1 text-xs text-ink-400">{formatNumber(item.total_rows ?? 0)} صف · {formatNumber(item.valid_rows ?? 0)} صالح</div></div>)}</div></div>
      </div>
    </CardBody>
  </Card>;
}
