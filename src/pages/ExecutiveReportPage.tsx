import { useCallback, useEffect, useState } from 'react';
import { FileText, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchDashboardIntelligence, fetchDashboardSnapshot, type DashboardKPIs } from '@/lib/dashboard-canonical';
import type { Alert, Recommendation } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { ExecutiveDecisionReportPanel } from '@/components/ExecutiveDecisionReportPanel';

export function ExecutiveReportPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [data, setData] = useState<{ alerts: Alert[]; recommendations: Recommendation[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [snapshot, intelligence] = await Promise.all([fetchDashboardSnapshot(3), fetchDashboardIntelligence()]);
      setKpis(snapshot.kpis); setData(intelligence);
    } catch (e) { setError(e instanceof Error ? e.message : 'تعذر تحميل التقرير التنفيذي.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  return <div dir="rtl" className="space-y-5 pb-10">
    <header className="rounded-3xl bg-ink-950 p-6 text-white lg:p-8 print:rounded-none print:p-0 print:bg-white print:text-ink-950">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><div className="flex items-center gap-2 text-sm text-primary-300 print:text-ink-600"><FileText size={17}/> Executive Reporting</div><h1 className="mt-2 text-2xl font-bold lg:text-3xl">القصة التنفيذية</h1><p className="mt-2 max-w-3xl text-sm leading-7 text-ink-300 print:text-ink-600">ما حدث، ولماذا، وما الدليل، وما القرار، وما النتيجة. كل دورة القرار أدناه تقرأ من read model محفوظ ومقيّد بالمستأجر.</p></div>
        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 print:hidden"><Printer size={17}/> Print / PDF</button>
      </div>
    </header>
    {loading && <div role="status" className="rounded-2xl border border-ink-200 bg-white p-5">جارٍ بناء التقرير من المصادر المعتمدة…</div>}
    {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">{error}<button type="button" onClick={() => void load()} className="mr-3 rounded-lg border border-red-300 bg-white px-3 py-1">إعادة المحاولة</button></div>}
    {!loading && !error && <>
      <section className="rounded-2xl border border-ink-200 bg-white p-5 print:border-0 print:p-0"><h2 className="text-lg font-bold">Executive Summary</h2><div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">{[['المبيعات', kpis?.totalSales == null ? 'غير متاح' : formatCurrency(kpis.totalSales)], ['الهامش', kpis?.grossMargin == null ? 'غير متاح' : `${kpis.grossMargin.toFixed(1)}%`], ['التحصيل', kpis?.collectionRate == null ? 'غير متاح' : `${kpis.collectionRate.toFixed(1)}%`], ['الذمم المتأخرة', kpis?.overdueReceivables == null ? 'غير متاح' : formatCurrency(kpis.overdueReceivables)]].map(([l, v]) => <div key={l} className="rounded-xl bg-ink-50 p-4 print:bg-transparent"><p className="text-xs text-ink-500">{l}</p><p className="mt-1 text-xl font-bold">{v}</p></div>)}</div></section>
      <section className="rounded-2xl border border-ink-200 bg-white p-5"><h2 className="text-lg font-bold">Critical Insights & Recommendations</h2><div className="mt-4 space-y-3">{(data?.alerts ?? []).slice(0, 8).map((a) => <article key={a.id} className="rounded-xl border border-ink-100 p-4"><p className="font-semibold">{a.title}</p><Link to="/decision-experience?stage=decision" className="mt-2 inline-block text-xs font-semibold underline print:hidden">فتح سياق القرار</Link></article>)}{(data?.recommendations ?? []).length === 0 && <p className="text-sm text-ink-500">لا توجد توصيات مصدرية حاليًا.</p>}</div></section>
      <ExecutiveDecisionReportPanel />
      <section className="rounded-2xl border border-ink-200 bg-white p-5 print:border-0 print:p-0"><h2 className="text-lg font-bold">مسار التشغيل</h2><p className="mt-2 text-sm leading-7 text-ink-600">التقرير التنفيذي لا ينشئ قرارًا أو موافقة أو نتيجة من نفسه. افتح مساحة القرار لإجراء العمليات المصرّح بها، ثم يعود التقرير لقراءة الحالة المحفوظة.</p><div className="mt-3 flex flex-wrap gap-2 print:hidden"><Link to="/decision-experience" className="rounded-xl bg-ink-950 px-4 py-2.5 text-xs font-bold text-white">فتح Decision Workspace</Link><Link to="/intelligence" className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-xs font-bold">فتح Intelligence</Link></div></section>
    </>}
  </div>;
}
