import { useEffect, useMemo, useState } from 'react';
import { Activity, Bell, BrainCircuit, ChevronLeft, CircleAlert, Gauge, ShieldAlert, Sparkles, WalletCards } from 'lucide-react';
import { fetchCanonicalDashboardKPIs } from '../lib/canonicalFinancialQueries';
import type { DashboardKPIs } from '../lib/queries';
import { isCompleteDashboardKPIs, type CompleteDashboardKPIs } from '../lib/dashboard-kpi-guards';

type Status = 'good' | 'watch' | 'critical';
type CommandCard = { label: string; value: string; status: Status; icon: typeof WalletCards };
const formatNumber = (value: number) => new Intl.NumberFormat('ar-YE', { maximumFractionDigits: 1 }).format(value);
const formatPercent = (value: number) => `${formatNumber(value)}%`;
function getReceivableStatus(kpi: CompleteDashboardKPIs): Status { const overdueRate = kpi.totalReceivables > 0 ? (kpi.overdueReceivables / kpi.totalReceivables) * 100 : 0; if (kpi.totalReceivables <= 0) return 'good'; if (overdueRate >= 35) return 'critical'; if (overdueRate >= 15) return 'watch'; return 'good'; }
function getMarginStatus(m: number): Status { return m >= 20 ? 'good' : m >= 10 ? 'watch' : 'critical'; }
function getCollectionStatus(r: number): Status { return r >= 80 ? 'good' : r >= 60 ? 'watch' : 'critical'; }
function statusLabel(s: Status) { return s === 'good' ? 'مستقر' : s === 'watch' ? 'مراقبة' : 'حرج'; }

export function ExecutiveCommandCenterPage() {
  const [period, setPeriod] = useState('30');
  const [selected, setSelected] = useState(0);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetchCanonicalDashboardKPIs().then(data => { if (active) setKpis(data); }).catch(() => { if (active) setError('تعذر تحميل مؤشرات مركز القيادة.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [period]);

  const completeKpis = isCompleteDashboardKPIs(kpis) ? kpis : null;
  const cards = useMemo<CommandCard[]>(() => {
    if (!completeKpis) return [];
    return [
      { label: 'الذمم المستحقة', value: formatNumber(completeKpis.totalReceivables), status: getReceivableStatus(completeKpis), icon: WalletCards },
      { label: 'هامش الربح الإجمالي', value: formatPercent(completeKpis.grossMargin), status: getMarginStatus(completeKpis.grossMargin), icon: Gauge },
      { label: 'قيمة المخزون', value: formatNumber(completeKpis.inventoryValue), status: completeKpis.inventoryValue > 0 ? 'good' : 'watch', icon: Activity },
      { label: 'الذمم المتأخرة', value: formatNumber(completeKpis.overdueReceivables), status: getReceivableStatus(completeKpis), icon: ShieldAlert },
    ];
  }, [completeKpis]);

  const actions = useMemo(() => {
    if (!completeKpis) return [];
    const overdueRate = completeKpis.totalReceivables > 0 ? (completeKpis.overdueReceivables / completeKpis.totalReceivables) * 100 : 0;
    return [
      { title: overdueRate >= 15 ? 'رفع التحصيل من العملاء المتأخرين' : 'مواصلة متابعة التحصيل', impact: `${formatPercent(overdueRate)} من الذمم مستحقة ومتأخرة`, status: (overdueRate >= 35 ? 'critical' : overdueRate >= 15 ? 'watch' : 'good') as Status },
      { title: completeKpis.grossMargin < 15 ? 'مراجعة هوامش الأصناف منخفضة الربحية' : 'مراجعة فرص تحسين الهامش', impact: `الهامش الإجمالي الحالي ${formatPercent(completeKpis.grossMargin)}`, status: (completeKpis.grossMargin < 10 ? 'critical' : completeKpis.grossMargin < 20 ? 'watch' : 'good') as Status },
      { title: completeKpis.collectionRate < 70 ? 'تحسين دورة التحصيل' : 'الحفاظ على كفاءة التحصيل', impact: `معدل التحصيل ${formatPercent(completeKpis.collectionRate)}`, status: getCollectionStatus(completeKpis.collectionRate) },
    ];
  }, [completeKpis]);

  const selectedAction = actions[selected] ?? actions[0];

  return (
    <div dir="rtl" className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-ink-950 text-white p-6 lg:p-8">
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-primary-300 text-sm font-medium"><Sparkles size={16} /> مركز القيادة التنفيذي</div>
            <h1 className="mt-2 text-2xl lg:text-3xl font-bold">صورة العمل الآن</h1>
            <p className="mt-2 text-ink-300 max-w-2xl">مؤشرات حقيقية من بيانات الشركة، مع تفسير للإجراءات ذات الأولوية. الفترة الحالية هي نطاق العرض، بينما المؤشرات المعروضة تعتمد على مصدر البيانات المعتمد.</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white/10 p-1">
            {['7', '30', '90'].map(value => <button key={value} onClick={() => setPeriod(value)} className={`px-4 py-2 rounded-xl text-sm ${period === value ? 'bg-white text-ink-900' : ''}`}>{value} يوم</button>)}
          </div>
        </div>
      </section>

      {loading && <div className="rounded-2xl border border-ink-200 bg-white p-6 text-sm text-ink-500">جارٍ تحميل المؤشرات الحقيقية…</div>}
      {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>}
      {!loading && !error && kpis?.status === 'INSUFFICIENT_DATA' && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">البيانات الحالية غير كافية لإصدار جميع المؤشرات بثقة. لا يتم عرض قيم افتراضية.</div>}

      {!loading && !error && completeKpis && (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {cards.map(card => { const Icon = card.icon; return <div key={card.label} className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div className="rounded-xl bg-ink-50 p-2.5"><Icon size={20} /></div><span className="text-xs font-semibold px-2 py-1 rounded-full">{statusLabel(card.status)}</span></div><p className="mt-5 text-sm text-ink-500">{card.label}</p><strong className="text-2xl">{card.value}</strong></div>; })}
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 rounded-2xl border border-ink-200 bg-white p-5">
              <div className="flex items-center justify-between"><div><h2 className="font-bold text-lg">محرك القرار</h2><p className="text-sm text-ink-500 mt-1">الإجراءات مشتقة من المؤشرات الحالية وليست قيمًا تجريبية ثابتة.</p></div><BrainCircuit size={22} /></div>
              <div className="mt-5 space-y-3">
                {actions.map((action, index) => <button key={action.title} onClick={() => setSelected(index)} className="w-full text-right rounded-2xl border p-4"><div className="flex items-center gap-3"><div className="h-2.5 w-2.5 rounded-full" /><div className="flex-1"><p className="font-semibold">{action.title}</p><p className="text-xs text-ink-500 mt-1">{action.impact}</p></div><ChevronLeft size={18} /></div></button>)}
              </div>
            </div>
            <div className="rounded-2xl border border-ink-200 bg-white p-5">
              <div className="flex items-center gap-2"><CircleAlert size={20} /><h2 className="font-bold">التفسير والأدلة</h2></div>
              <p className="mt-4 text-sm leading-7 text-ink-600">{selectedAction?.title ?? 'لا توجد توصية متاحة حاليًا.'}</p>
              <div className="mt-5 rounded-xl bg-ink-50 p-4"><div className="text-xs text-ink-500">الأثر/المؤشر المرتبط</div><div className="mt-1 font-bold">{selectedAction?.impact ?? 'لا توجد بيانات كافية'}</div></div>
            </div>
          </section>

          <section className="rounded-2xl border border-ink-200 bg-white p-5">
            <div className="flex items-center gap-2"><Bell size={20} /><h2 className="font-bold">مراقبة التنبيهات الذكية</h2></div>
            <div className="mt-4 grid md:grid-cols-3 gap-3">
              <div className="rounded-xl bg-red-50 p-4"><b>متأخر</b><p className="text-sm mt-1">الذمم المتأخرة: {formatNumber(completeKpis.overdueReceivables)}</p></div>
              <div className="rounded-xl bg-amber-50 p-4"><b>هامش</b><p className="text-sm mt-1">الهامش الإجمالي: {formatPercent(completeKpis.grossMargin)}</p></div>
              <div className="rounded-xl bg-emerald-50 p-4"><b>تحصيل</b><p className="text-sm mt-1">معدل التحصيل: {formatPercent(completeKpis.collectionRate)}</p></div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
