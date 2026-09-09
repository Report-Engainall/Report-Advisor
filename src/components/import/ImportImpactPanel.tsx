import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, BarChart3, ShieldCheck, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { fetchDashboardSnapshot, type DashboardKPIs } from '@/lib/dashboard-canonical';
import { formatNumber } from '@/lib/format';

type Props = { importId: string; importedRows: number; onReset: () => void };

function Metric({ label, value }: { label: string; value: number | null }) {
  return <div className="rounded-xl border border-ink-100 bg-white p-3"><div className="text-[11px] text-ink-400">{label}</div><div className="mt-1 text-lg font-semibold text-ink-900">{value == null ? 'غير متاح' : formatNumber(value)}</div></div>;
}

export function ImportImpactPanel({ importId, importedRows, onReset }: Props) {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try { setKpis((await fetchDashboardSnapshot(6)).kpis); }
    catch (e: any) { setError(e?.message || 'تعذر قراءة اللقطة القانونية الحالية'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return <Card>
    <CardHeader title="الأثر التشغيلي الآن" subtitle={`تم اعتماد ${formatNumber(importedRows)} صف — المصدر التالي هو اللقطة القانونية للحساب`} />
    <CardBody>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant="success"><ShieldCheck size={12}/> مصدر قانوني</Badge>
        {kpis && <Badge variant={kpis.status === 'CONFIRMED' ? 'success' : kpis.status === 'CALCULATED' ? 'warning' : 'neutral'}>{kpis.status === 'CONFIRMED' ? 'بيانات مؤكدة' : kpis.status === 'CALCULATED' ? 'محسوبة' : 'بيانات غير كافية'}</Badge>}
        <span className="text-[11px] text-ink-400">Import ID: {importId}</span>
      </div>
      {loading ? <div className="py-8 text-center text-sm text-ink-500">جارٍ تحديث اللقطة القانونية...</div> : error ? <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger-700 flex gap-2"><AlertCircle size={16}/>{error}</div> : kpis ? <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric label="المبيعات" value={kpis.totalSales}/><Metric label="الربح الإجمالي" value={kpis.grossProfit}/><Metric label="الذمم" value={kpis.totalReceivables}/><Metric label="قيمة المخزون" value={kpis.inventoryValue}/>
          <Metric label="العملاء" value={kpis.totalCustomers}/><Metric label="المنتجات" value={kpis.totalProducts}/><Metric label="الفواتير" value={kpis.invoiceCount}/><Metric label="نسبة التحصيل" value={kpis.collectionRate}/>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => void refresh()} className="btn-secondary text-xs"><RefreshCw size={14}/> تحديث اللقطة</button>
          <Link to="/" className="btn-primary text-xs"><BarChart3 size={14}/> لوحة القيادة</Link>
          <button onClick={onReset} className="btn-secondary text-xs">استيراد آخر</button>
        </div>
      </> : null}
    </CardBody>
  </Card>;
}
