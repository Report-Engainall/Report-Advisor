import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle2, FileDown, Lightbulb, ShieldCheck, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge, PriorityBadge, SeverityBadge } from '@/components/ui/Badge';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { fetchDashboardSnapshot, fetchDashboardIntelligence } from '@/lib/dashboard-canonical';
import { formatCurrency } from '@/lib/format';
import type { Alert, Recommendation } from '@/lib/types';
import type { DashboardKPIs } from '@/lib/dashboard-canonical';
import { downloadReportArtifact } from '@/lib/report-execution/download';

function healthLabel(kpis: DashboardKPIs) {
  if (kpis.status === 'INSUFFICIENT_DATA') return 'بيانات غير كافية';
  if (kpis.grossMargin != null && kpis.grossMargin < 10) return 'يحتاج تدخل';
  if (kpis.collectionRate != null && kpis.collectionRate < 60) return 'تحت المراقبة';
  return 'مستقر';
}

export function ExecutiveIntelligenceReportPage() {
  const [snapshot, setSnapshot] = useState<Awaited<ReturnType<typeof fetchDashboardSnapshot>> | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashboard, intelligence] = await Promise.all([fetchDashboardSnapshot(3), fetchDashboardIntelligence()]);
      setSnapshot(dashboard);
      setAlerts(intelligence.alerts);
      setRecommendations(intelligence.recommendations);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر إنشاء التقرير التنفيذي');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const exportReport = useCallback(async () => {
    if (!snapshot) return;
    const rows = [
      ['المؤشر', 'القيمة'],
      ['إجمالي المبيعات', snapshot.kpis.totalSales],
      ['إجمالي الربح', snapshot.kpis.grossProfit],
      ['الذمم المدينة', snapshot.kpis.totalReceivables],
      ['قيمة المخزون', snapshot.kpis.inventoryValue],
      ['معدل التحصيل', snapshot.kpis.collectionRate],
      ['هامش الربح', snapshot.kpis.grossMargin],
    ];
    downloadReportArtifact(
      'executive-intelligence-report',
      'التقرير التنفيذي الذكي',
      ['المؤشر', 'القيمة'],
      rows.slice(1).map(([metric, value]) => ({ 'المؤشر': metric, 'القيمة': value })),
    );
  }, [snapshot]);

  const activeRecommendations = useMemo(
    () => recommendations.filter((item) => item.status === 'new' || item.status === 'accepted').slice(0, 6),
    [recommendations],
  );

  if (loading) return <LoadingState message="جارٍ بناء التقرير التنفيذي من بيانات النظام..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!snapshot) return null;

  const { kpis } = snapshot;
  const asOf = new Date().toLocaleString('ar-YE');

  return (
    <div dir="rtl" className="space-y-6 animate-fade-in">
      <section className="rounded-3xl bg-ink-950 p-6 text-white lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary-300 text-sm font-semibold"><Target size={16} /> تقرير ذكاء تنفيذي</div>
            <h1 className="mt-2 text-3xl font-bold">صورة العمل التي تحتاجها الإدارة الآن</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-ink-300">تقرير إسقاط حقيقي من مصادر لوحة القيادة الحالية. لا يعيد حساب حقيقة المؤشرات خارج المصدر canonical.</p>
            <p className="mt-2 text-xs text-ink-400">Data As Of / Generated: {asOf}</p>
          </div>
          <button type="button" onClick={() => void exportReport()} className="btn-secondary bg-white text-ink-900"><FileDown size={16} /> تصدير التقرير</button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          ['المبيعات', formatCurrency(kpis.totalSales), TrendingUp],
          ['الربح', formatCurrency(kpis.grossProfit), TrendingUp],
          ['الذمم', formatCurrency(kpis.totalReceivables), ShieldCheck],
          ['المخزون', formatCurrency(kpis.inventoryValue), Target],
          ['الصحة', healthLabel(kpis), CheckCircle2],
        ].map(([label, value, Icon]) => {
          const MetricIcon = Icon as typeof Target;
          return <Card key={label as string}><CardBody><div className="flex items-center justify-between"><span className="text-xs text-ink-500">{label as string}</span><MetricIcon size={17} className="text-primary-600" /></div><div className="mt-2 text-lg font-bold text-ink-900">{value as string}</div></CardBody></Card>;
        })}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="القضايا الحرجة" subtitle="من intelligence source الحالي" />
          <CardBody><div className="space-y-3">{alerts.slice(0, 6).map((alert) => <div key={alert.id} className="rounded-xl border border-ink-100 p-4"><div className="flex items-start gap-3"><AlertTriangle size={18} className="mt-0.5 text-danger-600" /><div className="min-w-0"><div className="flex flex-wrap gap-2"><span className="font-semibold text-ink-800">{alert.title}</span><SeverityBadge severity={alert.severity} /></div><p className="mt-1 text-xs leading-6 text-ink-500">{alert.description || 'لا يوجد تفسير إضافي متاح.'}</p></div></div></div>)}{alerts.length === 0 && <p className="py-5 text-center text-sm text-ink-400">لا توجد قضايا مسجلة.</p>}</div></CardBody>
        </Card>
        <Card>
          <CardHeader title="التوصيات والإجراءات" subtitle="الإجراءات المتاحة حاليًا" />
          <CardBody><div className="space-y-3">{activeRecommendations.map((recommendation) => <div key={recommendation.id} className="rounded-xl border border-ink-100 p-4"><div className="flex items-start gap-3"><Lightbulb size={18} className="mt-0.5 text-primary-600" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-semibold text-ink-800">{recommendation.title}</span><PriorityBadge priority={recommendation.priority} /></div><p className="mt-1 text-xs leading-6 text-ink-500">{recommendation.description || 'توصية مبنية على بيانات النظام.'}</p></div></div></div>)}{activeRecommendations.length === 0 && <p className="py-5 text-center text-sm text-ink-400">لا توجد توصيات نشطة.</p>}</div></CardBody>
        </Card>
      </section>

      <Card>
        <CardHeader title="مسار الإجراء" subtitle="من الحقيقة الحالية إلى التنفيذ — العناصر غير المتاحة تبقى ظاهرة كغير مثبتة" />
        <CardBody><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">{['DATA', 'EVIDENCE', 'METRIC', 'INSIGHT', 'RECOMMENDATION', 'DECISION', 'ACTION'].map((step, index) => <div key={step} className="rounded-xl border border-ink-100 bg-ink-50/50 p-3 text-center"><div className="text-[11px] text-ink-400">0{index + 1}</div><div className="mt-1 text-xs font-bold text-ink-700">{step}</div><Badge variant={index < 3 ? 'success' : 'neutral'}>{index < 3 ? 'متاح' : 'يحتاج إثباتًا'}</Badge></div>)}</div></CardBody>
      </Card>

      <div className="flex items-center justify-between text-xs text-ink-400">
        <span>التقرير الحالي projection من المسار canonical المتاح؛ لا يمثل وحده E2E acceptance.</span>
        <Link to="/reports" className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700"><ArrowLeft size={14} /> مركز التقارير</Link>
      </div>
    </div>
  );
}
