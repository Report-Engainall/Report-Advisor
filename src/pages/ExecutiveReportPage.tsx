import { useCallback, useEffect, useState } from 'react';
import { FileText, Printer, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { fetchDashboardIntelligence, fetchDashboardSnapshot, type DashboardKPIs } from '@/lib/dashboard-canonical';
import { formatCurrency } from '@/lib/format';
import type { Recommendation, Alert } from '@/lib/types';

function RuntimeNote({ children }: { children: string }) {
  return <div role="status" aria-live="polite" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{children}</div>;
}
function Section({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-ink-200 bg-white p-5 print:break-inside-avoid"><p className="text-[11px] font-bold tracking-[0.14em] text-ink-400">{eyebrow}</p><h2 className="mt-1 text-lg font-bold text-ink-950">{title}</h2><div className="mt-4">{children}</div></section>;
}
function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-ink-50 p-4"><p className="text-xs text-ink-500">{label}</p><p className="mt-1 text-xl font-bold text-ink-950">{value}</p></div>;
}

export function ExecutiveReportPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [snapshot, intelligence] = await Promise.all([fetchDashboardSnapshot(3), fetchDashboardIntelligence()]);
      setKpis(snapshot.kpis); setRecommendations(intelligence.recommendations); setAlerts(intelligence.alerts);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تحميل التقرير التنفيذي.');
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const printReport = () => window.print();
  return <div dir="rtl" className="space-y-5 pb-10 print:bg-white print:p-0">
    <header className="rounded-3xl bg-ink-950 p-6 text-white print:bg-white print:text-black print:border print:border-ink-200 lg:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div className="max-w-3xl"><div className="flex items-center gap-2 text-sm font-semibold text-primary-300 print:text-ink-600"><Sparkles size={17}/> Executive Reporting</div><h1 className="mt-2 text-2xl font-bold lg:text-3xl">تقرير تنفيذي مبني على دورة القرار</h1><p className="mt-3 text-sm leading-7 text-ink-300 print:text-ink-600">من صورة الأعمال إلى الدليل والتوصية والقرار والنتيجة. لا تُعرض بيانات غير موجودة في المصدر.</p></div><button type="button" onClick={printReport} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 print:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"><Printer size={17}/> Print / PDF</button></div>
    </header>
    {loading && <div role="status" aria-live="polite" className="rounded-2xl border border-ink-200 bg-white p-5 text-sm text-ink-500">جارٍ بناء التقرير من المصادر المعتمدة…</div>}
    {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"><div className="flex items-center gap-2 font-semibold"><RefreshCw size={17}/> تعذر تحميل التقرير</div><p className="mt-2">{error}</p><button type="button" onClick={() => void load()} className="mt-3 rounded-xl border border-red-300 bg-white px-3 py-2 text-xs font-semibold">إعادة المحاولة</button></div>}
    {!loading && !error && <>
      <Section title="Executive Summary" eyebrow="01 · WHAT HAPPENED?"><div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Metric label="المبيعات" value={kpis?.totalSales == null ? 'غير متاح' : formatCurrency(kpis.totalSales)}/><Metric label="الربحية الإجمالية" value={kpis?.grossMargin == null ? 'غير متاح' : `${kpis.grossMargin.toFixed(1)}%`}/><Metric label="التحصيل" value={kpis?.collectionRate == null ? 'غير متاح' : `${kpis.collectionRate.toFixed(1)}%`}/><Metric label="الذمم المتأخرة" value={kpis?.overdueReceivables == null ? 'غير متاح' : formatCurrency(kpis.overdueReceivables)}/></div></Section>
      <Section title="Why? · Critical Insights" eyebrow="02 · WHY DID IT HAPPEN?"><div className="space-y-3">{alerts.length === 0 && <p className="rounded-xl border border-dashed border-ink-300 p-4 text-sm text-ink-500">No critical alerts yet — لا توجد تنبيهات مصدرية حاليًا.</p>}{alerts.slice(0, 8).map(alert => <div key={alert.id} className="rounded-xl border border-ink-100 p-4"><div className="flex items-start justify-between gap-3"><p className="font-semibold">{alert.title}</p><span className="text-xs text-ink-400">{alert.is_read ? 'Read' : 'Action required'}</span></div></div>)}</div></Section>
      <Section title="Evidence" eyebrow="03 · EVIDENCE"><RuntimeNote>Evidence is shown only when supplied by the canonical runtime source. No evidence is fabricated by this report.</RuntimeNote></Section>
      <Section title="Recommendations" eyebrow="04 · WHAT SHOULD WE DO?"><div className="space-y-3">{recommendations.length === 0 && <p className="rounded-xl border border-dashed border-ink-300 p-4 text-sm text-ink-500">No recommendations yet — لم تصل توصيات مصدرية بعد.</p>}{recommendations.slice(0, 8).map(rec => <div key={rec.id} className="rounded-xl border border-ink-100 p-4"><p className="font-semibold">{rec.title}</p><p className="mt-1 text-xs text-ink-500">{rec.expected_impact == null ? 'Expected impact unavailable' : `Expected impact: ${formatCurrency(rec.expected_impact)}`}</p></div>)}</div></Section>
      <Section title="Decision & Accountability" eyebrow="05 · WHO OWNS IT?"><RuntimeNote>Decision approval, ownership, and execution status require authenticated runtime authority. This report does not imply that a decision or approval has occurred.</RuntimeNote><div className="mt-3 grid gap-3 sm:grid-cols-3"><Metric label="Decision" value="Awaiting authenticated runtime"/><Metric label="Owner" value="Not available"/><Metric label="Expected Impact" value="Source dependent"/></div></Section>
      <Section title="Actual Outcome & Learning" eyebrow="06 · WHAT DID WE LEARN?"><div className="grid gap-3 sm:grid-cols-2"><Metric label="Actual outcome" value="Awaiting actual outcome"/><Metric label="Delta" value="Not calculable yet"/></div><div className="mt-3 flex items-start gap-3 rounded-xl border border-ink-200 bg-ink-50 p-4"><ShieldCheck size={18} className="mt-0.5 shrink-0"/><p className="text-sm leading-6 text-ink-600">Repository learning signals are not runtime learning. No learning claim is made until an authenticated runtime provides an actual outcome and feedback.</p></div></Section>
      <div className="flex flex-wrap gap-2 print:hidden"><button type="button" onClick={printReport} className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"><FileText size={16}/> Print / Save PDF</button><button type="button" disabled className="rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-400" title="يتطلب canonical snapshot runtime">Snapshot</button><button type="button" disabled className="rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-400" title="يتطلب مقارنة snapshot موثقة">Diff</button><button type="button" disabled className="rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-400" title="يتطلب runtime report dataset">Board Pack</button></div>
    </>}
  </div>;
}
