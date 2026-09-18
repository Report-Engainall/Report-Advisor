import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, FileText, Printer, RefreshCw, ShieldCheck, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchDashboardIntelligence, fetchDashboardSnapshot, type DashboardKPIs, type MonthlyTrend } from '@/lib/dashboard-canonical';
import type { Alert, Recommendation } from '@/lib/types';
import { formatCurrency, formatNumber } from '@/lib/format';
import { TruthContextStrip } from '@/components/TruthContextStrip';
import { CommercialOpportunityRadar } from '@/components/CommercialOpportunityRadar';
import { buildCommercialOpportunityRadar } from '@/lib/commercial-opportunity-radar';
import { SectorReportLens } from '@/components/SectorReportLens';
import { resolveCurrentCompanyId, supabase } from '@/lib/supabase';

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return <div className="rounded-2xl border border-ink-100 bg-ink-50/70 p-4">
    <p className="text-xs font-medium text-ink-500">{label}</p>
    <p className="mt-1 text-xl font-black tracking-tight text-ink-950">{value}</p>
    <p className="mt-1 text-[11px] text-ink-400">{hint}</p>
  </div>;
}

function TrendStrip({ trend }: { trend: MonthlyTrend[] }) {
  const points = trend.slice(-6);
  const values = points.map((point) => typeof point.sales === 'number' && Number.isFinite(point.sales) ? point.sales : null);
  const finiteSales = values.filter((value): value is number => value !== null);
  const max = Math.max(...finiteSales, 1);
  return <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
    {points.map((point, index) => {
      const sales = values[index];
      const height = sales == null ? 0 : Math.max(10, Math.round((sales / max) * 100));
      return <div key={`${point.month}-${index}`} className="min-w-0">
        <div className="flex h-24 items-end rounded-xl bg-ink-50 p-2">
          <div className="w-full rounded-lg bg-primary-500/80" style={{ height: `${height}%` }} title={sales == null ? undefined : formatCurrency(sales)} />
        </div>
        <p className="mt-2 truncate text-center text-[11px] text-ink-500">{point.month}</p>
      </div>;
    })}
  </div>;
}

export function ExecutiveReportPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [trend, setTrend] = useState<MonthlyTrend[]>([]);
  const [topCustomers, setTopCustomers] = useState<Awaited<ReturnType<typeof fetchDashboardSnapshot>>['topCustomers']>([]);
  const [topProducts, setTopProducts] = useState<Awaited<ReturnType<typeof fetchDashboardSnapshot>>['topProducts']>([]);
  const [categories, setCategories] = useState<Awaited<ReturnType<typeof fetchDashboardSnapshot>>['categories']>([]);
  const [aging, setAging] = useState<Awaited<ReturnType<typeof fetchDashboardSnapshot>>['aging']>({ rows: [], totalAmount: null, unknownRows: 0, status: 'NO_DATA' });
  const [asOf, setAsOf] = useState<string>('غير متاح');
  const [industry, setIndustry] = useState<string | null>(null);
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
      setTopCustomers(snapshot.topCustomers);
      setTopProducts(snapshot.topProducts);
      setCategories(snapshot.categories);
      setAging(snapshot.aging);
      setAsOf(snapshot.asOf);
      setData(intelligence);
      try {
        const companyId = await resolveCurrentCompanyId();
        if (companyId) {
          const { data: company } = await supabase.from('companies').select('industry').eq('id', companyId).single();
          setIndustry(typeof company?.industry === 'string' ? company.industry : null);
        }
      } catch {
        setIndustry(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر تحميل التقرير التنفيذي.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const commercialSignals = kpis
    ? buildCommercialOpportunityRadar({ kpis, trend, topCustomers, topProducts, categories, aging, months: 6 })
    : [];
  const finiteSales = trend.filter(point => typeof point.sales === 'number' && Number.isFinite(point.sales));
  const firstSales = finiteSales[0]?.sales ?? null;
  const lastSales = finiteSales.at(-1)?.sales ?? null;
  const salesDelta = firstSales != null && firstSales > 0 && lastSales != null ? ((lastSales - firstSales) / firstSales) * 100 : null;

  return <div dir="rtl" className="report-page space-y-5 pb-10 print:space-y-3">
    <header className="overflow-hidden rounded-[14px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.14em] text-primary-700"><FileText size={15}/> EXECUTIVE REPORTING</div>
          <h1 className="mt-1.5 text-[24px] font-black tracking-tight text-ink-950 lg:text-[30px]">التقرير التنفيذي</h1>
          <p className="mt-2 max-w-3xl text-[11px] leading-5 text-ink-500">من المؤشر إلى القرار: ملخص تشغيلي مبني على المصادر المعتمدة، مع إبقاء أي فجوة بيانات معلنة بدل اختلاق قيمة.</p>
        </div>
        <div className="print-hide flex gap-2">
          <button type="button" onClick={() => void load()} disabled={loading} className="btn-secondary text-xs disabled:opacity-60"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> تحديث</button>
          <button type="button" onClick={() => window.print()} className="btn-primary text-xs"><Printer size={17} /> طباعة / PDF</button>
        </div>
      </div>
    </header>

    {loading && <div role="status" className="rounded-2xl border border-ink-200 bg-white p-6 text-sm text-ink-600">جارٍ بناء التقرير من المصادر المعتمدة…</div>}
    {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">{error}<button type="button" onClick={() => void load()} className="mr-3 rounded-lg border border-red-300 bg-white px-3 py-1 font-semibold">إعادة المحاولة</button></div>}

    {!loading && !error && <>
      <TruthContextStrip months={6} status={kpis?.status ?? 'INSUFFICIENT_DATA'} asOf={asOf} rangeLabel="النطاق: آخر 6 أشهر" />

      <SectorReportLens industry={industry} kpis={kpis} />

      <section className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold tracking-wider text-primary-600">الملخص التنفيذي</p><h2 className="mt-1 text-lg font-black">لقطة الإدارة الحالية</h2></div><span className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-[11px] font-bold text-primary-700">المصدر: بيانات قانونية</span></div>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric label="إجمالي المبيعات" value={kpis?.totalSales == null ? 'غير متاح' : formatCurrency(kpis.totalSales)} hint="الفترة المعتمدة في المصدر" />
          <Metric label="الهامش الإجمالي" value={kpis?.grossMargin == null ? 'غير متاح' : `${kpis.grossMargin.toFixed(1)}%`} hint="لا يعرض عند نقص المصدر" />
          <Metric label="معدل التحصيل" value={kpis?.collectionRate == null ? 'غير متاح' : `${kpis.collectionRate.toFixed(1)}%`} hint="مؤشر التحصيل" />
          <Metric label="الذمم المتأخرة" value={kpis?.overdueReceivables == null ? 'غير متاح' : formatCurrency(kpis.overdueReceivables)} hint="رصيد يحتاج متابعة" />
        </div>
      </section>

      <section className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold tracking-wider text-primary-600">قصة الإدارة</p><h2 className="mt-1 text-lg font-black">ماذا تقول اللقطة الحالية؟</h2><p className="mt-1 max-w-3xl text-xs leading-6 text-ink-500">هذه قراءة وصفية مشتقة من الأرقام نفسها؛ لا تحوّل الارتباط إلى سبب جذري، ولا تستنتج تنفيذًا غير مثبت.</p></div><span className="rounded-full bg-ink-100 px-3 py-1 text-[10px] font-black text-ink-600">حتى {asOf}</span></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="الصورة المالية" value={kpis?.grossProfit == null ? 'غير متاحة' : formatCurrency(kpis.grossProfit)} hint={kpis?.grossMargin == null ? 'الهامش غير متاح' : 'هامش إجمالي ' + kpis.grossMargin.toFixed(1) + '%'} />
          <Metric label="زخم الحركة" value={salesDelta == null ? 'غير متاح' : (salesDelta >= 0 ? '+' : '') + salesDelta.toFixed(1) + '%'} hint="أول قيمة مبيعات متاحة → آخر قيمة" />
          <Metric label="ضغط التحصيل" value={kpis?.overdueReceivables == null ? 'غير متاح' : formatCurrency(kpis.overdueReceivables)} hint={kpis?.collectionRate == null ? 'معدل التحصيل غير متاح' : 'معدل التحصيل ' + kpis.collectionRate.toFixed(1) + '%'} />
          <Metric label="حالة الدليل" value={kpis?.status === 'CONFIRMED' ? 'مصدر مؤكد' : kpis?.status === 'CALCULATED' ? 'محسوب من المصدر' : 'بيانات غير كافية'} hint="الحالة لا تثبت وحدها السبب أو نتيجة القرار" />
        </div>
      </section>

      <CommercialOpportunityRadar signals={commercialSignals} />

      <section className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2"><TrendingUp size={18} className="text-primary-600" /><div><h2 className="text-lg font-black">نبض المبيعات</h2><p className="text-xs text-ink-500">آخر 6 أشهر من المصدر المعتمد</p></div></div>
        <div className="mt-5">{trend.length ? <TrendStrip trend={trend} /> : <p className="rounded-xl bg-ink-50 p-4 text-sm text-ink-500">لا توجد سلسلة زمنية كافية للعرض.</p>}</div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><div><p className="text-xs font-bold text-danger-600">الانتباه</p><h2 className="mt-1 text-lg font-black">أهم التنبيهات</h2></div><span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">{formatNumber(data?.alerts.length ?? 0)}</span></div>
          <div className="mt-4 space-y-3">{(data?.alerts ?? []).slice(0, 6).map((alert) => <article key={alert.id} className="rounded-xl border border-ink-100 p-4"><p className="font-bold text-ink-900">{alert.title}</p><Link to="/decision-experience?stage=decision" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary-700">فتح سياق القرار <ArrowLeft size={13} /></Link></article>)}{!(data?.alerts?.length) && <p className="rounded-xl bg-ink-50 p-4 text-sm text-ink-500">لا توجد تنبيهات مصدرية حاليًا.</p>}</div>
        </div>
        <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><div><p className="text-xs font-bold text-primary-600">الإجراء</p><h2 className="mt-1 text-lg font-black">التوصيات النشطة</h2></div><span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-700">{formatNumber(data?.recommendations.length ?? 0)}</span></div>
          <div className="mt-4 space-y-3">{(data?.recommendations ?? []).slice(0, 6).map((rec, index) => <article key={rec.id ?? index} className="rounded-xl border border-ink-100 p-4"><p className="font-bold text-ink-900">{rec.title}</p><Link to="/decision-experience" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary-700">فتح مساحة القرار <ArrowLeft size={13} /></Link></article>)}{!(data?.recommendations?.length) && <p className="rounded-xl bg-ink-50 p-4 text-sm text-ink-500">لا توجد توصيات مصدرية حاليًا.</p>}</div>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-center gap-2 text-amber-900"><Target size={18} /><h2 className="font-black">حدود الدليل</h2></div>
        <p className="mt-2 text-sm leading-7 text-amber-900">المصدر والحساب والموثوقية التشغيلية تحتاج دليلًا تشغيليًا موثقًا. هذا التقرير لا يحول غياب الدليل إلى نجاح ولا يدعي تنفيذ قرار أو نتيجة فعلية.</p>
      </section>

      <section className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-primary-600" /><h2 className="text-lg font-black">القرار والمساءلة والنتيجة</h2></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-ink-50 p-4"><p className="text-xs text-ink-500">Decision</p><p className="mt-1 font-bold">يحتاج authority runtime</p></div><div className="rounded-xl bg-ink-50 p-4"><p className="text-xs text-ink-500">Actual Outcome</p><p className="mt-1 font-bold">بانتظار النتيجة الفعلية</p></div><div className="rounded-xl bg-ink-50 p-4"><p className="text-xs text-ink-500">Learning</p><p className="mt-1 font-bold">غير مثبت بعد</p></div></div>
        <Link to="/decision-experience" className="mt-4 inline-flex rounded-xl bg-ink-950 px-4 py-2.5 text-xs font-bold text-white">فتح مساحة القرار</Link>
      </section>
    </>}
  </div>;
}
