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
      className="rounded-[20px] border border-primary-200 bg-white p-5 shadow-card lg:p-6"
      aria-label="نواة ذكاء الأغبري"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="section-kicker">AGHBARI INTELLIGENCE KERNEL</div>
          <h2 className="mt-1 text-xl font-black text-ink-950">ما الذي حسبه النظام فعلًا؟</h2>
          <p className="mt-1 max-w-3xl text-[10px] leading-5 text-ink-500">
            هذه الطبقة تعرض مخرجات الحساب والتحليل من المصدر الحالي، مع إبقاء حدود الثقة والمعلومات غير المتاحة ظاهرة.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[9px] font-black">
          <span className="rounded-full bg-primary-50 px-3 py-1.5 text-primary-800">
            النواة: {stateLabel(kernel?.status)}
          </span>
          {archetypeState ? (
            <span className="rounded-full bg-ink-50 px-3 py-1.5 text-ink-700">
              النموذج: {stateLabel(archetypeState)}
            </span>
          ) : null}
          {calculationPersistenceStatus ? (
            <span className="rounded-full bg-success-50 px-3 py-1.5 text-success-800">
              الحفظ/القراءة: {stateLabel(calculationPersistenceStatus)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-ink-100 bg-ink-50/70 p-4">
          <div className="text-[9px] font-black text-ink-400">حسابات مثبتة</div>
          <div className="mt-1 text-2xl font-black text-ink-950">{numberLabel(calculated.length, 0)}</div>
          <div className="mt-1 text-[9px] text-ink-500">مخرجات وصلت إلى قيمة فعلية.</div>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-ink-50/70 p-4">
          <div className="text-[9px] font-black text-ink-400">حسابات غير متاحة</div>
          <div className="mt-1 text-2xl font-black text-ink-950">{numberLabel(unavailable.length, 0)}</div>
          <div className="mt-1 text-[9px] text-ink-500">لم تُحسب بسبب قيد معلن.</div>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-ink-50/70 p-4">
          <div className="text-[9px] font-black text-ink-400">إنذارات تحليلية</div>
          <div className="mt-1 text-2xl font-black text-ink-950">{numberLabel(kernel?.anomalies.length ?? 0, 0)}</div>
          <div className="mt-1 text-[9px] text-ink-500">إشارات تحتاج تفسيرًا أو متابعة.</div>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-ink-50/70 p-4">
          <div className="text-[9px] font-black text-ink-400">سيناريوهات</div>
          <div className="mt-1 text-2xl font-black text-ink-950">{numberLabel(scenarios.length, 0)}</div>
          <div className="mt-1 text-[9px] text-ink-500">اختبارات What-if غير متغيرة للمصدر.</div>
        </div>
      </div>

      {calculated.length > 0 ? (
        <div className="mt-5">
          <div className="text-[9px] font-black tracking-[.08em] text-primary-700">الحسابات الفعلية</div>
          <div className="mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {calculated.slice(0, 9).map((item) => (
              <article key={item.metricId} className="rounded-2xl border border-ink-200 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-ink-950">{item.name}</h3>
                    <div className="mt-1 text-[9px] text-ink-400">{item.metricId}</div>
                  </div>
                  <span className="shrink-0 rounded-full bg-success-50 px-2 py-1 text-[8px] font-black text-success-800">محسوب</span>
                </div>
                <div className="mt-3 text-2xl font-black text-ink-950">
                  {typeof item.value === 'number' ? numberLabel(item.value, 4) : String(item.value ?? 'غير متاح')}
                </div>
                <div className="mt-1 text-[9px] text-ink-500">{item.unit ?? 'قيمة مصدرية'} · ثقة {numberLabel(Number(item.confidence) * 100, 0)}%</div>
                <p className="mt-3 text-[9px] leading-5 text-ink-500">{item.limitation}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {topAnomalies.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
          <div className="text-[9px] font-black tracking-[.08em] text-rose-800">ما يحتاج انتباهًا</div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {topAnomalies.map((anomaly) => (
              <article key={anomaly.kind} className="rounded-xl border border-rose-100 bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-black text-ink-950">{anomaly.message}</h3>
                  <span className="rounded-full bg-rose-100 px-2 py-1 text-[8px] font-black text-rose-800">
                    {anomaly.severity === 'high' ? 'مرتفع' : anomaly.severity === 'medium' ? 'متوسط' : 'منخفض'}
                  </span>
                </div>
                <div className="mt-2 text-[9px] leading-5 text-ink-500">{anomaly.evidence.join(' · ')}</div>
                <div className="mt-2 text-[9px] leading-5 text-ink-500">الحد: {anomaly.limitation}</div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {scenarios.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4">
          <div className="text-[9px] font-black tracking-[.08em] text-cyan-800">ماذا لو؟</div>
          <div className="mt-1 text-xs font-black text-ink-950">سيناريو غير متداخل مع الحقيقة الأصلية</div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {scenarios.map((scenario) => (
              <article key={scenario.id} className="rounded-xl border border-cyan-100 bg-white p-3">
                <div className="text-sm font-black text-ink-950">{scenario.label}</div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-ink-50 p-2"><div className="text-[8px] text-ink-400">الأساس</div><div className="mt-1 text-xs font-black">{numberLabel(scenario.baseline.coverage, 4)}</div></div>
                  <div className="rounded-lg bg-ink-50 p-2"><div className="text-[8px] text-ink-400">السيناريو</div><div className="mt-1 text-xs font-black">{numberLabel(scenario.result.coverage, 4)}</div></div>
                  <div className="rounded-lg bg-ink-50 p-2"><div className="text-[8px] text-ink-400">التغير</div><div className="mt-1 text-xs font-black">{numberLabel(scenario.result.coverageDelta, 4)}</div></div>
                </div>
                <div className="mt-2 text-[9px] leading-5 text-ink-500">مستوى المخاطر: {scenario.risk === 'high' ? 'مرتفع' : scenario.risk === 'medium' ? 'متوسط' : 'منخفض'} · ثقة السيناريو {numberLabel(scenario.confidence * 100, 0)}%</div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {sensitivity.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
          <div className="text-[9px] font-black tracking-[.08em] text-amber-800">حساسية القرار</div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {sensitivity.map((item, index) => (
              <article key={item.variable + ':' + index} className="rounded-xl border border-amber-100 bg-white p-3">
                <div className="text-sm font-black text-ink-950">{item.variable} · {item.direction === 'up' ? 'ارتفاع' : 'انخفاض'}</div>
                <div className="mt-1 text-xs font-black text-ink-900">الأثر: {numberLabel(item.magnitude, 4)}</div>
                <div className="mt-2 text-[9px] leading-5 text-ink-500">{item.decisionImpact}</div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {(blockers.length > 0 || Object.keys(qualityChecks).length > 0) ? (
        <details className="mt-5 rounded-2xl border border-ink-200 bg-ink-50/60 p-4">
          <summary className="cursor-pointer text-[10px] font-black text-ink-800">لماذا قد تكون النواة في حالة «يحتاج مراجعة»؟</summary>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {Object.entries(qualityChecks).map(([key, value]) => (
              <div key={key} className="rounded-xl bg-white p-3 text-[9px]">
                <div className="font-black text-ink-800">{key}</div>
                <div className="mt-1 text-ink-500">{String(value)}</div>
              </div>
            ))}
          </div>
          {blockers.length > 0 ? (
            <div className="mt-3 rounded-xl border border-warning-200 bg-warning-50 p-3 text-[9px] leading-5 text-warning-900">
              {blockers.join(' · ')}
            </div>
          ) : null}
          {(calculationPersistedCount != null || calculationReadBackCount != null) ? (
            <div className="mt-3 text-[9px] text-ink-500">
              الحفظ الدائم: {numberLabel(calculationPersistedCount ?? 0, 0)} · إعادة القراءة: {numberLabel(calculationReadBackCount ?? 0, 0)}
            </div>
          ) : null}
        </details>
      ) : null}

      {kernel?.unknowns?.length ? (
        <div className="mt-4 rounded-xl border border-warning-200 bg-warning-50 p-3 text-[9px] leading-5 text-warning-900">
          <span className="font-black">حدود المعرفة الحالية: </span>
          {kernel.unknowns.slice(0, 3).join(' · ')}
        </div>
      ) : null}
    </section>
  );
}
