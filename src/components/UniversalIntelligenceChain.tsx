import { ArrowLeft, CheckCircle2, CircleAlert, CircleDashed, Fingerprint, Lightbulb, ShieldCheck, Target, Workflow } from 'lucide-react';
import type { UniversalIntelligenceResult, UniversalIntelligenceStageStatus } from '@/lib/universal-report-intelligence';

function statusMeta(status: UniversalIntelligenceStageStatus) {
  if (status === 'VERIFIED' || status === 'TRUSTED') {
    return { label: status === 'VERIFIED' ? 'مثبت' : 'موثوق', className: 'border-indigo-300/40 bg-indigo-400/10 text-indigo-200', icon: CheckCircle2 };
  }
  if (status === 'DERIVED') {
    return { label: 'مشتق', className: 'border-indigo-300/40 bg-indigo-400/10 text-indigo-200', icon: Lightbulb };
  }
  if (status === 'PROPOSED') {
    return { label: 'مقترح', className: 'border-amber-300/40 bg-amber-400/10 text-amber-200', icon: Target };
  }
  if (status === 'GAP_DETECTED') {
    return { label: 'فجوة', className: 'border-amber-300/60 bg-amber-400/15 text-amber-100', icon: CircleAlert };
  }
  if (status === 'INSUFFICIENT_DATA') {
    return { label: 'بيانات غير كافية', className: 'border-rose-400/40 bg-rose-500/10 text-rose-200', icon: CircleAlert };
  }
  if (status === 'NOT_AVAILABLE') {
    return { label: 'غير متاح', className: 'border-slate-700 bg-slate-800 text-slate-400', icon: CircleDashed };
  }
  return { label: 'مراجعة مطلوبة', className: 'border-amber-300/40 bg-amber-400/10 text-amber-200', icon: CircleAlert };
}

function stageConnector(status: UniversalIntelligenceStageStatus) {
  if (status === 'VERIFIED' || status === 'TRUSTED') return 'bg-indigo-400/70';
  if (status === 'DERIVED' || status === 'PROPOSED') return 'bg-indigo-400/70';
  return 'bg-slate-700';
}

export function UniversalIntelligenceChain({ result }: { result: UniversalIntelligenceResult }) {
  const strongest = result.intelligence.advisorBrief.headline || result.intelligence.summary;
  const archetypeLabel = result.archetype?.title
    ? result.archetype.title + (result.archetypeState === 'REVIEW_REQUIRED' ? ' · يحتاج مراجعة' : '')
    : result.archetypeState === 'REVIEW_REQUIRED'
      ? 'النمط يحتاج مراجعة'
      : 'نمط عام / غير محدد';

  return (
    <section dir="rtl" className="space-y-4 rounded-[22px] border border-slate-700/80 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,.14),transparent_42%),linear-gradient(180deg,#0b1020_0%,#111827_100%)] p-5 text-slate-100 shadow-[0_22px_64px_-42px_rgba(2,6,23,.9)] ring-1 ring-white/[.04] lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="section-kicker text-indigo-300">UNIVERSAL BUSINESS INTELLIGENCE</div>
          <h2 className="mt-1 text-xl font-black text-white">من المصدر إلى قرار قابل للتنفيذ</h2>
          <p className="mt-1 max-w-4xl text-xs leading-6 text-slate-400">
            العقل يجمع استخراج الملف، التعيين الدلالي، كشف النمط، الإشارات، أسئلة الأعمال، الأدلة، التوصيات، ومسار القرار في سياق واحد.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px] font-black">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-200">
            <Fingerprint size={13} />
            قوة التحليل المصدرية {result.confidence}%
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-300/40 bg-indigo-400/10 px-3 py-2 text-indigo-200">
            <ShieldCheck size={13} />
            حالة الفهم: {archetypeLabel}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-indigo-300/15 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,.26),transparent_40%),linear-gradient(135deg,#090f1e_0%,#141c32_64%,#212348_100%)] p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.06)]">
        <div className="text-[9px] font-black tracking-[.14em] text-indigo-200">EXECUTIVE SIGNAL</div>
        <div className="mt-1 text-base font-black leading-7">{strongest}</div>
        <div className="mt-2 text-[11px] leading-5 text-ink-200">
          {result.intelligence.businessQuestion}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {result.stages.map((item, index) => {
          const meta = statusMeta(item.status);
          const Icon = meta.icon;
          return (
            <div key={item.key} className="relative rounded-2xl border border-slate-700/80 bg-[linear-gradient(150deg,#151b30_0%,#101625_100%)] p-4 shadow-[0_18px_34px_-28px_rgba(0,0,0,.85)] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-indigo-400/60 hover:shadow-lg">
              {index < result.stages.length - 1 && (
                <span aria-hidden className={'hidden xl:block absolute -left-[13px] top-10 h-px w-3 ' + stageConnector(item.status)} />
              )}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl border border-indigo-400/20 bg-indigo-400/10 text-indigo-200 shadow-sm">
                    <Icon size={15} />
                  </span>
                  <div>
                    <div className="text-[9px] font-black text-slate-500">{String(index + 1).padStart(2, '0')}</div>
                    <div className="text-xs font-black text-slate-200">{item.label}</div>
                  </div>
                </div>
                <span className={'rounded-full border px-2.5 py-1 text-[9px] font-black ' + meta.className}>{meta.label}</span>
              </div>
              <div className="mt-3 text-sm font-black leading-6 text-white">{item.headline}</div>
              <div className="mt-1 text-[10px] leading-5 text-slate-300">{item.detail}</div>
              {item.evidence.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.evidence.map((evidence) => (
                    <span key={evidence} className="rounded-lg border border-slate-700 bg-slate-950/60 px-2 py-1 text-[9px] text-slate-400">
                      {evidence}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-slate-700/80 bg-slate-950/60 p-2.5 text-[9px] leading-5 text-slate-300">
                <Workflow size={12} className="mt-0.5 shrink-0 text-indigo-300" />
                <span>{item.next}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-4">
          <div className="flex items-center gap-2 text-xs font-black text-indigo-200">
            <Lightbulb size={14} />
            ماذا يعني هذا للمستخدم؟
          </div>
          <div className="mt-2 text-sm leading-6 text-slate-100">
            {result.intelligence.advisorBrief.recommendedAction || 'لا توجد خطوة تنفيذية مؤهلة قبل اكتمال الدليل.'}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-700/80 bg-slate-950/50 p-3">
              <div className="text-[9px] font-black text-indigo-300">المالك</div>
              <div className="mt-1 text-[10px] font-bold text-slate-200">{result.intelligence.advisorBrief.ownerHint || 'غير محدد'}</div>
            </div>
            <div className="rounded-xl border border-slate-700/80 bg-slate-950/50 p-3">
              <div className="text-[9px] font-black text-indigo-300">القياس</div>
              <div className="mt-1 text-[10px] font-bold text-slate-200">{result.intelligence.advisorBrief.measurement || 'يحتاج تعريفًا'}</div>
            </div>
            <div className="rounded-xl border border-slate-700/80 bg-slate-950/50 p-3">
              <div className="text-[9px] font-black text-indigo-300">الأثر</div>
              <div className="mt-1 text-[10px] font-bold text-slate-200">{result.intelligence.advisorBrief.expectedOutcome || 'غير مثبت'}</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-300/30 bg-amber-500/10 p-4">
          <div className="text-xs font-black text-amber-100">حدود القرار</div>
          <div className="mt-2 text-[10px] leading-5 text-amber-200">
            {result.intelligence.advisorBrief.proofRequirement}
          </div>
          <div className="mt-3 text-[10px] font-bold text-amber-100">
            الحقول المربوطة: {result.mappedFieldCount}/{Math.max(1, result.totalFieldCount)} · حالة القرار: {result.advisory.actionState}
          </div>
          <div className="mt-1 text-[10px] font-bold text-amber-100">
            حالة النتيجة: {result.advisory.outcomeState} · المقارنة: لا تُخترع دون مرجع موثق
          </div>
        </div>
      </div>

      <details className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4">
        <summary className="cursor-pointer text-xs font-black text-slate-100">أسئلة المستشار التي تم اختبارها</summary>
        {result.topQuestions.length ? (
          <div className="mt-3 grid gap-2 lg:grid-cols-2">
            {result.topQuestions.map((question) => (
              <div key={question.id} className="rounded-xl border border-slate-700 bg-slate-950/60 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] font-black text-slate-200">{question.label}</div>
                <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-1 text-[8px] font-black text-slate-400">{question.state}</span>
              </div>
              <div className="mt-1 text-[10px] leading-5 text-slate-300">{question.answer}</div>
              {question.followUp && (
                <div className="mt-2 flex items-center gap-1.5 text-[9px] font-bold text-indigo-300">
                  <ArrowLeft size={11} />
                  {question.followUp}
                </div>
              )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-[10px] leading-5 text-slate-300">
            لم يتم إنشاء سؤال استشاري إضافي من الدليل الحالي؛ لا نملأ المساحة بأسئلة شكلية.
          </div>
        )}
      </details>
    </section>
  );
}
