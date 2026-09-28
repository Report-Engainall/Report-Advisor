import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Scale, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { fetchDashboardSnapshot, type DashboardKPIs } from '@/lib/dashboard-canonical';
import { formatCurrency } from '@/lib/format';

export function BenchmarkPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [asOf, setAsOf] = useState('غير متاح');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { const snapshot = await fetchDashboardSnapshot(6); setKpis(snapshot.kpis); setAsOf(snapshot.asOf); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر تحميل مؤشرات المقارنة'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const candidates = kpis ? [
    ['المبيعات', kpis.totalSales == null ? null : formatCurrency(kpis.totalSales)],
    ['الهامش', kpis.grossMargin == null ? null : String(kpis.grossMargin.toFixed(1)) + '%'],
    ['التحصيل', kpis.collectionRate == null ? null : String(kpis.collectionRate.toFixed(1)) + '%'],
  ] : [];
  return <div dir="rtl" className="space-y-5 animate-fade-in pb-10">
    <section className="rounded-[20px] border border-ink-200 bg-ink-950 p-5 text-white shadow-elevated lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><div className="flex items-center gap-2 text-[10px] font-black tracking-[.14em] text-primary-200"><Scale size={15}/> BENCHMARK NETWORK</div><h1 className="mt-2 text-2xl font-black lg:text-[30px]">شبكة المقارنة</h1><p className="mt-2 max-w-3xl text-[11px] leading-6 text-ink-300">المؤشر الحالي ظاهر كمرجع داخلي فقط. المقارنة مع نظراء لا تُعرض حتى تتوفر عينة نظيرة موثوقة ومتوافقة مع المقياس.</p></div>
        <button type="button" onClick={() => void load()} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 text-[10px] font-black text-white hover:bg-white/15"><RefreshCw size={14}/> تحديث</button>
      </div>
    </section>
    {loading && <LoadingState message="جارٍ قراءة المؤشرات الكانونية..." />}
    {error && <ErrorState message={error} onRetry={() => void load()} />}
    {!loading && !error && <><section className="rounded-2xl border border-warning-200 bg-warning-50/70 p-4"><div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning-100 text-warning-800"><Scale size={17}/></div><div><div className="text-[12px] font-black text-warning-950">INSUFFICIENT SAMPLE</div><p className="mt-1 text-[10px] leading-5 text-warning-900/80">لا توجد حاليًا عينة نظيرة محفوظة ومثبتة تكفي لإخراج ترتيب أو درجة مقارنة. لذلك لا يتم حساب peer gap أو ranking.</p></div></div></section>
      <section className="ag-decision-strip" aria-label="المؤشرات المرجعية">{candidates.map(([label, value]) => <div key={label} className="ag-decision-cell"><span className="ag-decision-label">{label}</span><span className="ag-decision-value">{value ?? 'غير متاح'}</span></div>)}<div className="ag-decision-cell"><span className="ag-decision-label">As of</span><span className="ag-decision-value">{asOf}</span></div></section>
      <Card><CardBody><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 text-primary-700" size={18}/><div><div className="text-sm font-black text-ink-950">بوابة الأهلية</div><p className="mt-1 text-[10px] leading-5 text-ink-500">سيُفتح العرض المقارن فقط عندما يثبت النظام كفاية العينة وتوافق الوحدة والفترة والتعريف. غياب peer evidence يبقى INSUFFICIENT SAMPLE.</p><div className="mt-3 flex flex-wrap gap-2"><Link to="/trust" className="btn-secondary text-[10px]">راجع الدليل</Link><Link to="/reports/executive" className="btn-primary text-[10px]">العودة للتقرير التنفيذي</Link></div></div></div></CardBody></Card>
    </>}
  </div>;
}