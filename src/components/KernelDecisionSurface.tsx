import type { AghbariIntelligenceKernelResult } from '@/lib/report-intelligence/aghbari-intelligence-kernel';
import type { CalculationResult } from '@/lib/report-intelligence/calculation-capability-registry';

type KernelDecisionSurfaceProps = {
  kernel?: AghbariIntelligenceKernelResult | null;
  calculations?: CalculationResult[] | null;
  archetypeState?: string | null;
  calculationPersistenceStatus?: string | null;
  calculationPersistedCount?: number | null;
  calculationReadBackCount?: number | null;
};

const stateLabel = (value: unknown): string => {
  const state = String(value ?? '').trim();
  const labels: Record<string, string> = {
    PASS: 'ناجح',
    READY: 'جاهز',
    SUPPORTED: 'التحليل مدعوم',
    REVIEW_REQUIRED: 'يحتاج مراجعة',
    BLOCKED: 'محجوب',
    INSUFFICIENT_SAMPLE: 'عينة غير كافية',
    NOT_AVAILABLE: 'غير متاح',
    CALCULATED: 'محسوب فعليًا',
    VERIFIED: 'موثق',
    NOT_RUN: 'لم يُشغّل',
  };
  return labels[state] ?? (state || 'غير محدد');
};

const numberLabel = (value: unknown, digits = 2): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'غير متاح';
  return value.toLocaleString('ar-YE', { maximumFractionDigits: digits });
};

function humanizeEvidence(value: string): string {
  const labels: Record<string, string> = {
    field: 'الحقل',
    stockField: 'حقل النفاد',
    dailySalesField: 'معدل البيع اليومي',
    affectedRows: 'السجلات المتأثرة',
    negativeRows: 'السجلات ذات الرصيد السالب',
    zeroRows: 'السجلات ذات الرصيد الصفري',
    rows: 'السجلات',
    duplicateRows: 'السجلات المتكررة',
    usableRows: 'السجلات الصالحة',
    assumption: 'الافتراض',
    source: 'المصدر',
  };
  const [key, ...rest] = value.split('=');
  if (rest.length === 0) return value;
  return (labels[key] ?? key) + ': ' + rest.join('=');
}

export function KernelDecisionSurface({
  kernel,
  calculations = [],
  archetypeState,
  calculationPersistenceStatus,
  calculationPersistedCount,
  calculationReadBackCount,
}: KernelDecisionSurfaceProps) {
  if (!kernel && (!calculations || calculations.length === 0)) return null;

  const calculated = (calculations ?? []).filter((item) => item.availabilityState === 'CALCULATED');
  const unavailable = (calculations ?? []).filter((item) => item.availabilityState !== 'CALCULATED');
  const topAnomalies = (kernel?.anomalies ?? []).slice(0, 4);
  const scenarios = kernel?.scenarios ?? [];
  const sensitivity = kernel?.sensitivity ?? [];
  const blockers = kernel?.quality.blockers ?? [];
  const qualityChecks = kernel?.quality.checks ?? {};

  return (
    <section
      id="aghbari-intelligence-kernel"
      data-testid="aghbari-intelligence-kernel-surface"
      className="rounded-[20px] border border-slate-700 bg-[#0b1020] p-5 text-white shadow-card lg:p-6"
      aria-label="نواة ذكاء الأغبري"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[9px] font-black tracking-[.14em] text-primary-200">حسابات وتحليلات المصدر</div>
          <h2 className="mt-1 text-xl font-black text-white">ما الذي حسبه النظام فعلًا؟</h2>
          <p className="mt-1 max-w-3xl text-[10px] leading-5 text-slate-300">
            مخرجات الحساب والتحليل من المصدر الحالي، مع إبقاء حدود الثقة والمعلومات غير المتاحة ظاهرة.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[9px] font-black">
          <span
            data-testid="kernel-status"
            data-status={kernel?.status ?? ''}
            className="rounded-full bg-primary-900/60 px-3 py-1.5 text-primary-100"
          >
            النواة: {stateLabel(kernel?.status)}
          </span>
          {archetypeState ? (
            <span className="rounded-full bg-slate-800 px-3 py-1.5 text-slate-100">
              النموذج: {stateLabel(archetypeState)}
            </span>
          ) : null}
          {calculationPersistenceStatus ? (
            <span className="rounded-full bg-emerald-950/70 px-3 py-1.5 text-emerald-100">
              الحفظ/القراءة: {stateLabel(calculationPersistenceStatus)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
          <div className="text-[9px] font-black text-slate-400">حسابات فعلية</div>
          <div data-testid="kernel-calculated-count" className="mt-1 text-2xl font-black text-white">{numberLabel(calculated.length, 0)}</div>
          <div className="mt-1 text-[9px] text-slate-400">مخرجات وصلت إلى قيمة مثبتة.</div>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
          <div className="text-[9px] font-black text-slate-400">حسابات غير متاحة</div>
          <div data-testid="kernel-unavailable-count" className="mt-1 text-2xl font-black text-white">{numberLabel(unavailable.length, 0)}</div>
          <div className="mt-1 text-[9px] text-slate-400">حُجبت فقط عندما غابت الأدلة اللازمة.</div>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
          <div className="text-[9px] font-black text-slate-400">إشارات تحليلية</div>
          <div data-testid="kernel-anomaly-count" data-value={String(kernel?.anomalies.length ?? 0)} className="mt-1 text-2xl font-black text-white">{numberLabel(kernel?.anomalies.length ?? 0, 0)}</div>
          <div className="mt-1 text-[9px] text-slate-400">إنذارات قابلة للتفسير والمتابعة.</div>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
          <div className="text-[9px] font-black text-slate-400">سيناريوهات</div>
          <div data-testid="kernel-scenario-count" data-value={String(scenarios.length)} className="mt-1 text-2xl font-black text-white">{numberLabel(scenarios.length, 0)}</div>
          <div className="mt-1 text-[9px] text-slate-400">اختبارات What-if منفصلة عن حقيقة المصدر.</div>
        </div>
      </div>

      {calculated.length > 0 ? (
        <div className="mt-5">
          <div className="text-[9px] font-black tracking-[.08em] text-primary-200">الحسابات الفعلية</div>
          <div className="mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {calculated.slice(0, 9).map((item) => (
              <article key={item.metricId} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-white">{item.name}</h3>
                    <details className="mt-1"><summary className="cursor-pointer text-[8px] text-slate-500">تفاصيل فنية</summary><div className="mt-1 break-all font-mono text-[8px] text-slate-500">{item.metricId}</div></details>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-950/70 px-2 py-1 text-[8px] font-black text-emerald-100">محسوب</span>
                </div>
                <div className="mt-3 text-2xl font-black text-white">
                  {typeof item.value === 'number' ? numberLabel(item.value, 4) : String(item.value ?? 'غير متاح')}
                </div>
                <div className="mt-1 text-[9px] text-slate-400">{item.unit ?? 'قيمة مصدرية'} · ثقة {numberLabel(Number(item.confidence) * 100, 0)}%</div>
                <p className="mt-3 text-[9px] leading-5 text-slate-400">{item.limitation}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {topAnomalies.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-rose-900/70 bg-rose-950/30 p-4">
          <div className="text-[9px] font-black tracking-[.08em] text-rose-200">ما يحتاج انتباهًا</div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {topAnomalies.map((anomaly) => (
              <article key={anomaly.kind} className="rounded-xl border border-rose-900/70 bg-slate-950/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-black text-white">{anomaly.message}</h3>
                  <span className="rounded-full bg-rose-900/60 px-2 py-1 text-[8px] font-black text-rose-100">
                    {anomaly.severity === 'high' ? 'مرتفع' : anomaly.severity === 'medium' ? 'متوسط' : 'منخفض'}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[9px] leading-5 text-slate-300">{anomaly.evidence.map((item) => <span key={item} className="rounded-full bg-white/5 px-2 py-1">{humanizeEvidence(item)}</span>)}</div><details className="mt-2"><summary className="cursor-pointer text-[8px] text-slate-500">تفاصيل التدقيق الفني</summary><div className="mt-2 font-mono text-[7px] leading-4 text-slate-500">{anomaly.evidence.join(' · ')}</div></details>
                <div className="mt-2 text-[9px] leading-5 text-slate-400">الحد: {anomaly.limitation}</div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {scenarios.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-cyan-900/70 bg-cyan-950/30 p-4">
          <div className="text-[9px] font-black tracking-[.08em] text-cyan-200">ماذا لو؟</div>
          <div className="mt-1 text-xs font-black text-white">سيناريو منفصل عن الحقيقة الأصلية</div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {scenarios.map((scenario) => (
              <article key={scenario.id} className="rounded-xl border border-cyan-900/70 bg-slate-950/60 p-3">
                <div className="text-sm font-black text-white">{scenario.label}</div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg bg-slate-900 p-2">
                    <div className="text-[8px] text-slate-500">الرصيد الأساس</div>
                    <div data-testid="kernel-stock-baseline" data-value={String(scenario.baseline.stock)} className="mt-1 text-xs font-black text-white">{numberLabel(scenario.baseline.stock, 0)}</div>
                  </div>
                  <div className="rounded-lg bg-slate-900 p-2">
                    <div className="text-[8px] text-slate-500">الطلب الأساس</div>
                    <div data-testid="kernel-demand-baseline" data-value={String(scenario.baseline.demand)} className="mt-1 text-xs font-black text-white">{numberLabel(scenario.baseline.demand, 0)}</div>
                  </div>
                  <div className="rounded-lg bg-slate-900 p-2">
                    <div className="text-[8px] text-slate-500">تغطية الأساس</div>
                    <div data-testid="kernel-coverage-baseline" data-value={String(scenario.baseline.coverage)} className="mt-1 text-xs font-black text-white">{numberLabel(scenario.baseline.coverage, 10)}</div>
                  </div>
                  <div className="rounded-lg bg-slate-900 p-2">
                    <div className="text-[8px] text-slate-500">تغطية +15%</div>
                    <div data-testid="kernel-coverage-plus-demand" data-value={String(scenario.result.coverage)} className="mt-1 text-xs font-black text-white">{numberLabel(scenario.result.coverage, 10)}</div>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[9px] text-slate-300">
                  <div>الرصيد في السيناريو: {numberLabel(scenario.result.stock, 0)}</div>
                  <div>الطلب في السيناريو: {numberLabel(scenario.result.demand, 0)}</div>
                  <div>تغير التغطية: {numberLabel(scenario.result.coverageDelta, 4)}</div>
                  <div>الافتراض: +{numberLabel(scenario.assumptions.demandPct, 0)}% طلب</div>
                </div>
                <div className="mt-2 text-[9px] leading-5 text-slate-300">مستوى المخاطر: {scenario.risk === 'high' ? 'مرتفع' : scenario.risk === 'medium' ? 'متوسط' : 'منخفض'} · ثقة السيناريو {numberLabel(scenario.confidence * 100, 0)}%</div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {sensitivity.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-amber-900/70 bg-amber-950/25 p-4">
          <div className="text-[9px] font-black tracking-[.08em] text-amber-200">حساسية القرار <span data-testid="kernel-sensitivity-count" data-value={String(sensitivity.length)} className="mr-2 rounded-full bg-amber-950 px-2 py-1 text-[8px]">{numberLabel(sensitivity.length, 0)}</span></div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {sensitivity.map((item, index) => (
              <article key={item.variable + ':' + index} className="rounded-xl border border-amber-900/70 bg-slate-950/60 p-3">
                <div className="text-sm font-black text-white">{item.variable} · {item.direction === 'up' ? 'ارتفاع' : 'انخفاض'}</div>
                <div className="mt-1 text-xs font-black text-white">الأثر: {numberLabel(item.magnitude, 4)}</div>
                <div className="mt-2 text-[9px] leading-5 text-slate-300">{item.decisionImpact}</div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {(blockers.length > 0 || Object.keys(qualityChecks).length > 0) ? (
        <details className="mt-5 rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
          <summary className="cursor-pointer text-[10px] font-black text-slate-100">لماذا قد تكون النواة في حالة «يحتاج مراجعة»؟</summary>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {Object.entries(qualityChecks).map(([key, value]) => (
              <div key={key} className="rounded-xl bg-slate-950/70 p-3 text-[9px]">
                <div className="font-black text-slate-200">{key}</div>
                <div className="mt-1 text-slate-400">{String(value)}</div>
              </div>
            ))}
          </div>
          {blockers.length > 0 ? (
            <div className="mt-3 rounded-xl border border-amber-900/70 bg-amber-950/30 p-3 text-[9px] leading-5 text-amber-100">
              {blockers.join(' · ')}
            </div>
          ) : null}
          {(calculationPersistedCount != null || calculationReadBackCount != null) ? (
            <div className="mt-3 text-[9px] text-slate-400">
              الحفظ الدائم: {numberLabel(calculationPersistedCount ?? 0, 0)} · إعادة القراءة: {numberLabel(calculationReadBackCount ?? 0, 0)}
            </div>
          ) : null}
        </details>
      ) : null}

      {kernel?.unknowns?.length ? (
        <div className="mt-4 rounded-xl border border-amber-900/70 bg-amber-950/30 p-3 text-[9px] leading-5 text-amber-100">
          <span className="font-black">حدود المعرفة الحالية: </span>
          {kernel.unknowns.slice(0, 3).join(' · ')}
        </div>
      ) : null}
    </section>
  );
}
