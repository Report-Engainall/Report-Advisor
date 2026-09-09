import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, FileText, Printer, RefreshCw, ShieldCheck, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchDashboardIntelligence, fetchDashboardSnapshot, type DashboardKPIs, type MonthlyTrend } from '@/lib/dashboard-canonical';
import type { Alert, Recommendation } from '@/lib/types';
import { formatCurrency, formatNumber } from '@/lib/format';

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return <div className="rounded-2xl border border-ink-100 bg-ink-50/70 p-4">
    <p className="text-xs font-medium text-ink-500">{label}</p>
    <p className="mt-1 text-xl font-black tracking-tight text-ink-950">{value}</p>
    <p className="mt-1 text-[11px] text-ink-400">{hint}</p>
  </div>;
}

function TrendStrip({ trend }: { trend: MonthlyTrend[] }) {
  const points = trend.slice(-6);
  const max = Math.max(...points.map(p => Number(p.sales) || 0), 1);
  return <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
    {points.map((point, index) => {
      const sales = Number(point.sales) || 0;
      const height = Math.max(10, Math.round((sales / max) * 100));
      return <div key={`${point.month}-${index}`} className="min-w-0">
        <div className="flex h-24 items-end rounded-xl bg-ink-50 p-2">
          <div className="w-full rounded-lg bg-primary-500/80" style={{ height: `${height}%` }} title={formatCurrency(sales)} />
        </div>
        <p className="mt-2 truncate text-center text-[11px] text-ink-500">{point.month}</p>
      </div>;
    })}
  </div>;
}

export function ExecutiveReportPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [trend, setTrend] = useState<MonthlyTrend[]>([]);
  const [data, setData] = useState<{ alerts: Alert[]; recommendations: Recommendation[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [snapshot, intelligence] = await Promise.all([fetchDashboardSnapshot(6), fetchDashboardIntelligence()]);
      setKpis(snapshot.kpis);
      setTrend(snapshot.trend);
      setData(intelligence);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر تحميل التقرير التنفيذي.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return <div dir="rtl" className="space-y-5 pb-10 print:space-y-3">
    <header className="overflow-hidden rounded-3xl bg-ink-950 p-6 text-white shadow-sm lg:p-8 print:bg-white print:text-black print:border print:border-ink-200">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-primary-300"><FileText size={17} /> Executive Reporting</div>
          <h1 className="mt-2 text-2xl font-black lg:text-4xl">التقرير التنفيذي</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-ink-300 print:text-ink-600">من المؤشر إلى القرار: ملخص تشغيلي مبني على المصادر المعتمدة، مع إبقاء أي فجوة بيانات معلنة بدل اختلاق قيمة.</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/15 disabled:opacity-60"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> تحديث</button>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-ink-900"><Printer size={17} /> طباعة / PDF</button>
        </div>
      </div>
    </header>

    {loading && <div role="status" className="rounded-2xl border border-ink-200 bg-white p-6 text-sm text-ink-600">جارٍ بناء التقرير من المصادر المعتمدة…</div>}
    {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">{error}<button type="button" onClick={() => void load()} className="mr-3 rounded-lg border border-red-300 bg-white px-3 py-1 font-semibold">إعادة المحاولة</button></div>}

    {!loading && !error && <>
      <section className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-primary-600">Executive Summary</p><h2 className="mt-1 text-lg font-black">لقطة الإدارة الحالية</h2></div><span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">مصدر البيانات: canonical</span></div>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric label="إجمالي المبيعات" value={kpis?.totalSales == null ? 'غير متاح' : formatCurrency(kpis.totalSales)} hint="الفترة المعتمدة في المصدر" />
          <Metric label="الهامش الإجمالي" value={kpis?.grossMargin == null ? 'غير متاح' : `${kpis.grossMargin.toFixed(1)}%`} hint="لا يعرض عند نقص المصدر" />
          <Metric label="معدل التحصيل" value={kpis?.collectionRate == null ? 'غير متاح' : `${kpis.collectionRate.toFixed(1)}%`} hint="مؤشر التحصيل" />
          <Metric label="الذمم المتأخرة" value={kpis?.overdueReceivables == null ? 'غير متاح' : formatCurrency(kpis.overdueReceivables)} hint="رصيد يحتاج متابعة" />
        </div>
      </section>

      <section className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2"><TrendingUp size={18} className="text-primary-600" /><div><h2 className="text-lg font-black">نبض المبيعات</h2><p className="text-xs text-ink-500">آخر 6 أشهر من المصدر المعتمد</p></div></div>
        <div className="mt-5">{trend.length ? <TrendStrip trend={trend} /> : <p className="rounded-xl bg-ink-50 p-4 text-sm text-ink-500">لا توجد سلسلة زمنية كافية للعرض.</p>}</div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><div><p className="text-xs font-bold text-red-600">ATTENTION</p><h2 className="mt-1 text-lg font-black">أهم التنبيهات</h2></div><span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">{formatNumber(data?.alerts.length ?? 0)}</span></div>
          <div className="mt-4 space-y-3">{(data?.alerts ?? []).slice(0, 6).map((alert) => <article key={alert.id} className="rounded-xl border border-ink-100 p-4"><p className="font-bold text-ink-900">{alert.title}</p><Link to="/decision-experience?stage=decision" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary-700">فتح سياق القرار <ArrowLeft size={13} /></Link></article>)}{!(data?.alerts?.length) && <p className="rounded-xl bg-ink-50 p-4 text-sm text-ink-500">لا توجد تنبيهات مصدرية حاليًا.</p>}</div>
        </div>
        <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><div><p className="text-xs font-bold text-primary-600">ACTION</p><h2 className="mt-1 text-lg font-black">التوصيات النشطة</h2></div><span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-700">{formatNumber(data?.recommendations.length ?? 0)}</span></div>
          <div className="mt-4 space-y-3">{(data?.recommendations ?? []).slice(0, 6).map((rec, index) => <article key={rec.id ?? index} className="rounded-xl border border-ink-100 p-4"><p className="font-bold text-ink-900">{rec.title}</p><Link to="/decision-experience" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary-700">فتح مساحة القرار <ArrowLeft size={13} /></Link></article>)}{!(data?.recommendations?.length) && <p className="rounded-xl bg-ink-50 p-4 text-sm text-ink-500">لا توجد توصيات مصدرية حاليًا.</p>}</div>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-center gap-2 text-amber-900"><Target size={18} /><h2 className="font-black">Evidence Boundary</h2></div>
        <p className="mt-2 text-sm leading-7 text-amber-900">المصدر والحساب والموثوقية التشغيلية تحتاج runtime evidence موثق. هذا التقرير لا يحول غياب الدليل إلى PASS ولا يدعي تنفيذ قرار أو نتيجة فعلية.</p>
      </section>

      <section className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-primary-600" /><h2 className="text-lg font-black">القرار والمساءلة والنتيجة</h2></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-ink-50 p-4"><p className="text-xs text-ink-500">Decision</p><p className="mt-1 font-bold">يحتاج authority runtime</p></div><div className="rounded-xl bg-ink-50 p-4"><p className="text-xs text-ink-500">Actual Outcome</p><p className="mt-1 font-bold">Awaiting actual outcome</p></div><div className="rounded-xl bg-ink-50 p-4"><p className="text-xs text-ink-500">Learning</p><p className="mt-1 font-bold">Not yet verified</p></div></div>
        <Link to="/decision-experience" className="mt-4 inline-flex rounded-xl bg-ink-950 px-4 py-2.5 text-xs font-bold text-white">فتح Decision Workspace</Link>
      </section>
    </>}
  </div>;
}
