import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, BarChart3, ShieldCheck, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { fetchDashboardSnapshot } from '@/lib/dashboard-canonical';
import { fetchImportRecords, type ImportRecord } from '@/lib/queries';
import { formatNumber } from '@/lib/format';

function Metric({ label, value }: { label: string; value: number | null }) {
  return <div className="rounded-xl border border-ink-100 bg-white p-3"><div className="text-[11px] text-ink-400">{label}</div><div className="mt-1 text-lg font-semibold text-ink-900">{value == null ? 'غير متاح' : formatNumber(value)}</div></div>;
}

export function ImportImpactPanel({ onReset }: { onReset?: () => void }) {
  const [latest, setLatest] = useState<ImportRecord | null>(null);
  const [kpis, setKpis] = useState<Awaited<ReturnType<typeof fetchDashboardSnapshot>>['kpis'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [imports, snapshot] = await Promise.all([fetchImportRecords(), fetchDashboardSnapshot(6)]);
      setLatest(imports.find(item => item.status === 'completed') ?? null);
      setKpis(snapshot.kpis);
    } catch (e: any) { setError(e?.message || 'تعذر قراءة اللقطة القانونية الحالية'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return <Card>
    <CardHeader title="الأثر التشغيلي بعد الاستيراد" subtitle="قراءة مباشرة من أحدث عملية مكتملة ومن اللقطة القانونية الحالية — بدون اختلاق فروقات" />
    <CardBody>
      {loading ? <div className="py-8 text-center text-sm text-ink-500">جارٍ تحديث الواقع التشغيلي...</div> : error ? <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger-700 flex gap-2"><AlertCircle size={16}/>{error}</div> : <>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge variant="success"><ShieldCheck size={12}/> المصدر القانوني</Badge>
          {latest ? <Badge variant="success">آخر استيراد: {formatNumber(latest.valid_rows ?? 0)} صف صالح</Badge> : <Badge variant="neutral">لا توجد عملية مكتملة متاحة</Badge>}
          {kpis && <Badge variant={kpis.status === 'CONFIRMED' ? 'success' : kpis.status === 'CALCULATED' ? 'warning' : 'neutral'}>{kpis.status === 'CONFIRMED' ? 'بيانات مؤكدة' : kpis.status === 'CALCULATED' ? 'محسوبة' : 'بيانات غير كافية'}</Badge>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric label="المبيعات" value={kpis?.totalSales ?? null}/><Metric label="الربح الإجمالي" value={kpis?.grossProfit ?? null}/><Metric label="الذمم" value={kpis?.totalReceivables ?? null}/><Metric label="قيمة المخزون" value={kpis?.inventoryValue ?? null}/>
          <Metric label="العملاء" value={kpis?.totalCustomers ?? null}/><Metric label="المنتجات" value={kpis?.totalProducts ?? null}/><Metric label="الفواتير" value={kpis?.invoiceCount ?? null}/><Metric label="نسبة التحصيل" value={kpis?.collectionRate ?? null}/>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => void refresh()} className="btn-secondary text-xs"><RefreshCw size={14}/> تحديث الواقع</button>
          <Link to="/" className="btn-primary text-xs"><BarChart3 size={14}/> لوحة القيادة</Link>
          {onReset && <button onClick={onReset} className="btn-secondary text-xs">استيراد آخر</button>}
        </div>
      </>}
    </CardBody>
  </Card>;
}
