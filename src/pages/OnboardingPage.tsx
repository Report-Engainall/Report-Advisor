import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpLeft, BarChart3, Building2, CheckCircle2, CircleAlert, FileInput, FileText, Gauge, Package, Receipt, ShieldCheck, Target, TrendingUp, Users, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader, ErrorState, LoadingState } from '@/components/ui/States';
import { TruthContextStrip } from '@/components/TruthContextStrip';
import { getAuthenticatedUser } from '@/lib/auth-session';
import { resolveCurrentCompanyId, supabase } from '@/lib/supabase';
import { fetchDataQualitySnapshot } from '@/lib/data-quality-snapshot';
import { fetchDashboardIntelligence, fetchDashboardSnapshot, type DashboardKPIs } from '@/lib/dashboard-canonical';
import type { Alert, Recommendation } from '@/lib/types';
import { formatCurrency } from '@/lib/format';

type StepState = 'READY' | 'ACTION_REQUIRED' | 'UNKNOWN';

type BusinessSnapshot = { kpis: DashboardKPIs; asOf: string | null; coverage: number; };
type OnboardingState = { userReady: boolean; companyName: string | null; role: string | null; canonicalCommitCount: number | null; dataQualityIssues: number | null; business: BusinessSnapshot | null; alerts: Alert[]; recommendations: Recommendation[]; };

const STEPS = [
  { id: 'account', title: 'الحساب والدخول', description: 'جلسة مستخدم موثقة.', icon: ShieldCheck, href: '/settings/profile' },
  { id: 'company', title: 'الشركة والسياق', description: 'الشركة الحالية وبياناتها الأساسية.', icon: Building2, href: '/settings' },
  { id: 'team', title: 'العضوية والدور', description: 'العضوية الفعلية في الشركة الحالية.', icon: Users, href: '/settings/profile' },
  { id: 'import', title: 'استيراد البيانات', description: 'ابدأ من المسار الحاكم للاستيراد.', icon: FileInput, href: '/import' },
  { id: 'quality', title: 'جودة البيانات', description: 'راجع أي مشكلة قبل اعتبار البيانات جاهزة.', icon: Gauge, href: '/data-quality' },
  { id: 'dashboard', title: 'لوحة القيادة', description: 'المؤشرات من المصدر الكانوني.', icon: Wand2, href: '/' },
  { id: 'reports', title: 'التقارير', description: 'التقارير التنفيذية والمالية.', icon: FileText, href: '/reports' },
  { id: 'decision', title: 'القرار', description: 'تحويل evidence إلى قرار وإجراء.', icon: CheckCircle2, href: '/decision-experience' },
] as const;

function stateFor(stepId: string, data: OnboardingState): StepState {
  if (stepId === 'account') return data.userReady ? 'READY' : 'ACTION_REQUIRED';
  if (stepId === 'company') return data.companyName ? 'READY' : 'ACTION_REQUIRED';
  if (stepId === 'team') return data.role ? 'READY' : 'ACTION_REQUIRED';
  if (stepId === 'import') return data.canonicalCommitCount == null ? 'UNKNOWN' : data.canonicalCommitCount > 0 ? 'READY' : 'ACTION_REQUIRED';
  if (stepId === 'quality') return data.dataQualityIssues == null ? 'UNKNOWN' : data.dataQualityIssues === 0 ? 'READY' : 'ACTION_REQUIRED';
  return 'UNKNOWN';
}

export function OnboardingPage() {
  const [data, setData] = useState<OnboardingState>({ userReady: false, companyName: null, role: null, canonicalCommitCount: null, dataQualityIssues: null, business: null, alerts: [], recommendations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await getAuthenticatedUser();
      if (!user) throw new Error('AUTH_REQUIRED');
      const companyId = await resolveCurrentCompanyId();
      if (!companyId) throw new Error('TENANT_REQUIRED');
      const [{ data: company }, { data: membership }, { count: canonicalCommitCount, error: canonicalCommitError }] = await Promise.all([
        supabase.from('companies').select('name').eq('id', companyId).maybeSingle(),
        supabase.from('company_memberships').select('role').eq('company_id', companyId).eq('user_id', user.id).eq('is_active', true).maybeSingle(),
        supabase.from('canonical_import_commits').select('id', { count: 'exact' }).eq('company_id', companyId).limit(1),
      ]);
      if (canonicalCommitError) throw canonicalCommitError;
      const qualitySnapshot = await fetchDataQualitySnapshot();
      const dataQualityIssues = qualitySnapshot.status === 'EMPTY' ? null : qualitySnapshot.entities.reduce((total, entity) => total + entity.issues, 0);
      let business: BusinessSnapshot | null = null;
      let alerts: Alert[] = [];
      let recommendations: Recommendation[] = [];
      try {
        const [{ kpis, asOf }, intelligence] = await Promise.all([fetchDashboardSnapshot(3), fetchDashboardIntelligence()]);
        const confirmed = [kpis.totalSales, kpis.grossProfit, kpis.totalReceivables, kpis.inventoryValue, kpis.totalCustomers, kpis.totalProducts, kpis.invoiceCount, kpis.collectionRate].filter(value => value !== null).length;
        business = { kpis, asOf, coverage: Math.round((confirmed / 8) * 100) };
        alerts = intelligence.alerts.slice(0, 3);
        recommendations = intelligence.recommendations.filter(row => row.status === 'new' || row.status === 'accepted').slice(0, 3);
      } catch (dashboardError) {
        console.warn('[OnboardingPage] Business snapshot unavailable', dashboardError);
      }
      setData({ userReady: true, companyName: company?.name ?? null, role: membership?.role ?? null, canonicalCommitCount: canonicalCommitCount ?? 0, dataQualityIssues, business, alerts, recommendations });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تحميل حالة البداية');
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const summary = useMemo(() => { const states = STEPS.map(step => stateFor(step.id, data)); return { ready: states.filter(state => state === 'READY').length, action: states.filter(state => state === 'ACTION_REQUIRED').length, unknown: states.filter(state => state === 'UNKNOWN').length }; }, [data]);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  const nextAction = STEPS.find(step => stateFor(step.id, data) === 'ACTION_REQUIRED');
  const firstSignal = data.alerts[0] ?? null;
  const firstRecommendation = data.recommendations[0] ?? null;
  const snapshot = data.business;
  const snapshotTiles = snapshot ? [
    { label: 'المبيعات', value: snapshot.kpis.totalSales, Icon: TrendingUp },
    { label: 'الربح الإجمالي', value: snapshot.kpis.grossProfit, Icon: BarChart3 },
    { label: 'الذمم المدينة', value: snapshot.kpis.totalReceivables, Icon: Receipt },
    { label: 'قيمة المخزون', value: snapshot.kpis.inventoryValue, Icon: Package },
  ] : [];
  return (
    <div dir="rtl" className="space-y-6">
      <PageHeader title="بدء الاستخدام التجاري" subtitle="مسار تجهيز مبني على حالة الحساب والشركة الحالية والبيانات الحقيقية." />
      {snapshot && <TruthContextStrip status={snapshot.kpis.status} asOf={snapshot.asOf ?? 'غير متاح'} asOfLabel="حتى" rangeLabel="الصورة التنفيذية الحالية" />}
      <div className="grid gap-4 sm:grid-cols-3"><Card><CardBody><div className="text-xs text-ink-500">جاهز</div><div className="mt-1 text-2xl font-black text-success-700">{summary.ready}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500">يحتاج إجراء</div><div className="mt-1 text-2xl font-black text-warning-700">{summary.action}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500">غير مثبت بعد</div><div className="mt-1 text-2xl font-black text-ink-700">{summary.unknown}</div></CardBody></Card></div>
      {nextAction && <Card><CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-xs font-medium text-primary-700">الخطوة التالية</div><div className="mt-1 text-lg font-bold text-ink-900">{nextAction.title}</div><div className="mt-1 text-sm text-ink-500">{nextAction.description}</div></div><Link to={nextAction.href} className="btn-primary text-xs">متابعة <ArrowLeft size={14} /></Link></CardBody></Card>}
      <section className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
        <Card>
          <CardHeader title="صورتك الأولى" subtitle="ملخص حي من المصدر الكانوني؛ لا يتم اختلاق رقم عندما لا تتوفر قيمة موثوقة." />
          <CardBody>
            {snapshot ? <>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-ink-50/60 p-4"><div><div className="text-xs text-ink-400">تغطية المؤشرات الأساسية</div><div className="mt-1 text-3xl font-black text-ink-950">{snapshot.coverage}%</div></div><div className="text-left"><div className="text-[10px] font-bold text-ink-400">حالة المصدر</div><div className="mt-1 text-xs font-black text-ink-800">{snapshot.kpis.status === 'CONFIRMED' ? 'مصدر مؤكد' : snapshot.kpis.status === 'CALCULATED' ? 'محسوب من المصدر' : 'بيانات غير كافية'}</div><div className="mt-1 text-[10px] text-ink-400">حتى {snapshot.asOf ?? 'غير متاح'}</div></div></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{snapshotTiles.map(({ label, value, Icon }) => <div key={label} className="rounded-2xl border border-ink-100 bg-white p-4"><div className="flex items-center justify-between gap-2"><span className="text-xs font-bold text-ink-700">{label}</span><Icon size={15} className="text-primary-600"/></div><div className="mt-3 text-lg font-black tabular-nums text-ink-950">{value === null ? 'غير متاح' : formatCurrency(value)}</div></div>)}</div>
            </> : <div className="rounded-2xl border border-dashed border-ink-200 p-6 text-sm leading-6 text-ink-500">الصورة التنفيذية غير متاحة في هذه اللحظة. لا يتم استبدالها بأرقام تجريبية؛ استخدم مسار الاستيراد أو أعد المحاولة لاحقًا.</div>}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="أول ما يستحق انتباهك" subtitle="إشارة أو توصية حقيقية، أو حالة صريحة بعدم توفر دليل." />
          <CardBody className="space-y-3">
            {firstSignal ? <div className="rounded-2xl border border-warning-200 bg-warning-50/70 p-4"><div className="flex items-center gap-2 text-xs font-black text-warning-800"><CircleAlert size={15}/> إشارة نشطة</div><div className="mt-2 text-sm font-black text-ink-900">{firstSignal.title}</div><div className="mt-1 text-xs leading-5 text-ink-500">{firstSignal.description || 'إشارة مسجلة دون تفسير سببي مكتمل.'}</div><Link to="/intelligence" className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-primary-700">افتح التحقيق <ArrowUpLeft size={14}/></Link></div> : firstRecommendation ? <div className="rounded-2xl border border-primary-200 bg-primary-50/70 p-4"><div className="flex items-center gap-2 text-xs font-black text-primary-800"><Target size={15}/> توصية للمراجعة</div><div className="mt-2 text-sm font-black text-ink-900">{firstRecommendation.title}</div><div className="mt-1 text-xs leading-5 text-ink-500">{firstRecommendation.description || 'توصية مرتبطة بالبيانات الحالية وتحتاج مراجعة قبل التنفيذ.'}</div><Link to="/decision-experience" className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-primary-700">افتح مسار القرار <ArrowUpLeft size={14}/></Link></div> : <div className="rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 p-4"><div className="flex items-center gap-2 text-xs font-black text-ink-700"><ShieldCheck size={15}/> لا توجد إشارة مثبتة الآن</div><div className="mt-2 text-xs leading-5 text-ink-500">لن نخترع فرصة أو خطرًا. استخدم الصورة التنفيذية والتقارير عند توفر بيانات موثوقة.</div></div>}
            <Link to="/reports/executive" className="flex items-center justify-between rounded-xl border border-ink-200 bg-white px-3 py-3 text-xs font-bold text-ink-700 hover:bg-ink-50"><span>أول مخرج مفيد: التقرير التنفيذي</span><ArrowLeft size={14}/></Link>
          </CardBody>
        </Card>
      </section>
      <Card><CardHeader title="مسار التجهيز التجاري" subtitle={data.companyName ? `الشركة الحالية: ${data.companyName}${data.role ? ` · الدور: ${data.role}` : ''}` : 'لم يتم تثبيت الشركة الحالية بعد.'} /><CardBody className="space-y-3">{STEPS.map((step, index) => { const state = stateFor(step.id, data); const Icon = step.icon; const badge = state === 'READY' ? { text: 'جاهز', className: 'bg-success-50 text-success-700' } : state === 'ACTION_REQUIRED' ? { text: 'إجراء مطلوب', className: 'bg-warning-50 text-warning-700' } : { text: 'غير مثبت', className: 'bg-ink-50 text-ink-500' }; return <div key={step.id} className="flex flex-col gap-3 rounded-xl border border-ink-100 p-4 sm:flex-row sm:items-center"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-ink-600"><Icon size={18} /></div><div className="min-w-0 flex-1"><div className="text-xs font-bold text-primary-600">0{index + 1}</div><div className="mt-0.5 text-sm font-semibold text-ink-900">{step.title}</div><div className="mt-1 text-xs leading-5 text-ink-400">{step.description}</div></div><div className="flex items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}>{state === 'READY' && <CheckCircle2 className="ml-1 inline" size={13} />}{state === 'ACTION_REQUIRED' && <CircleAlert className="ml-1 inline" size={13} />}{badge.text}</span><Link to={step.href} className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50">فتح</Link></div></div>; })}</CardBody></Card>
      <div className="text-xs leading-5 text-ink-400">هذه الشاشة لا تمنح حالة “مكتمل” لخطوات المنتج لمجرد وجود المسار. الحالة مرتبطة فقط بالأدلة التي يمكن قراءتها من الجلسة والـtenant والبيانات الحالية.</div>
    </div>
  );
}