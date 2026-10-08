import { AlertTriangle, ArrowLeft, BarChart3, BrainCircuit, CheckCircle2, FileSearch, Gauge, Lightbulb, ListChecks, ShieldCheck, Target } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { ReportIntelligence } from '@/lib/report-intelligence/report-smart-insights';

function healthLabel(value: ReportIntelligence['advisorBrief']['health']): string {
  if (value === 'REVIEW_REQUIRED') return 'مراجعة مطلوبة';
  if (value === 'ATTENTION') return 'انتباه';
  return 'مستقر';
}

function severityLabel(value: string): string {
  if (value === 'critical') return 'حرج';
  if (value === 'high') return 'مرتفع';
  if (value === 'medium') return 'متوسط';
  if (value === 'low') return 'منخفض';
  return 'معلومة';
}

function severityClass(value: string): string {
  if (value === 'critical' || value === 'high') return 'border-rose-200 bg-rose-50 text-rose-950';
  if (value === 'medium') return 'border-amber-200 bg-amber-50 text-amber-950';
  if (value === 'low') return 'border-primary-200 bg-primary-50 text-primary-950';
  return 'border-ink-200 bg-ink-50 text-ink-700';
}

function cleanText(value: unknown): string {
  return value == null || value === '' ? 'غير متاح' : String(value);
}

export function GenericFileIntelligenceCard({ intelligence, format }: { intelligence: ReportIntelligence; format: string }) {
  const brief = intelligence.advisorBrief;
  const topSignal = intelligence.signals[0] ?? null;
  const topRecommendation = intelligence.recommendations[0] ?? null;
  const evidence = topSignal?.evidence?.length ? topSignal.evidence : intelligence.findings[0]?.evidence ?? [];
  const allSignals = intelligence.signals;
  const allRecommendations = intelligence.recommendations;

  return (
    <Card className="border-indigo-200 bg-white shadow-card" data-testid="generic-file-intelligence">
      <CardHeader
        title="العقل العام للتقرير"
        subtitle="لا يحتاج الملف إلى اسم تجاري مسبق: يقرأ الحقول، يحسب ما يمكن إثباته، يرتب الإشارات، ثم يربطها بتوصية وقياس."
        action={
          <Badge variant={brief.health === 'REVIEW_REQUIRED' ? 'danger' : brief.health === 'ATTENTION' ? 'warning' : 'success'}>
            {healthLabel(brief.health)}
          </Badge>
        }
      />
      <CardBody>
        <section className="rounded-[22px] border border-ink-200 bg-ink-950 p-5 text-white lg:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[9px] font-black tracking-[.14em] text-indigo-200">
                <BrainCircuit size={14} /> UNIVERSAL MIND · SOURCE BOUND
              </div>
              <h3 className="mt-2 max-w-4xl text-xl font-black leading-8">{brief.headline}</h3>
              <p className="mt-2 max-w-4xl text-xs leading-6 text-ink-200">{cleanText(intelligence.summary)}</p>
            </div>
            <div className="grid min-w-[220px] grid-cols-2 gap-2 text-center">
              <div className="rounded-xl border border-white/10 bg-white/[.05] p-3">
                <div className="text-[9px] text-ink-400">الإشارات</div>
                <div className="mt-1 text-2xl font-black">{allSignals.length}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[.05] p-3">
                <div className="text-[9px] text-ink-400">التوصيات</div>
                <div className="mt-1 text-2xl font-black">{allRecommendations.length}</div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-2 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[.04] p-3">
              <div className="text-[9px] text-indigo-200">المالك</div>
              <div className="mt-1 text-[11px] font-black">{cleanText(brief.ownerHint)}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[.04] p-3">
              <div className="text-[9px] text-indigo-200">القياس</div>
              <div className="mt-1 text-[11px] font-black">{cleanText(brief.measurement)}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[.04] p-3">
              <div className="text-[9px] text-indigo-200">حد الاعتماد</div>
              <div className="mt-1 text-[11px] font-black">{cleanText(brief.proofRequirement)}</div>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-[22px] border border-indigo-100 bg-indigo-50/50 p-4 lg:p-5">
          <div className="flex items-center gap-2">
            <BrainCircuit size={16} className="text-indigo-700" />
            <div>
              <div className="section-kicker text-indigo-700">خريطة العقل</div>
              <h4 className="mt-1 text-base font-black text-ink-950">المصدر → الحقيقة → الإشارة → لماذا → التوصية → القياس</h4>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
            {[
              ['01', 'المصدر', format],
              ['02', 'الحقيقة', intelligence.guidance.inspect[0] ?? 'حقائق المصدر متاحة للفحص'],
              ['03', 'الإشارة', topSignal?.title ?? 'لا توجد إشارة مؤهلة'],
              ['04', 'لماذا', topSignal?.soWhat ?? intelligence.guidance.boundary ?? 'لا توجد قرينة كافية'],
              ['05', 'التوصية', topRecommendation?.title ?? brief.recommendedAction ?? 'لا توجد توصية مؤهلة'],
              ['06', 'القياس', topRecommendation?.measurement ?? brief.measurement ?? 'لا يوجد قياس محدد'],
            ].map(([step, title, body]) => (
              <article key={step} className="relative rounded-2xl border border-indigo-100 bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-indigo-950 px-2 py-1 text-[8px] font-black text-white">{step}</span>
                  <span className="text-[9px] font-black text-indigo-700">{title}</span>
                </div>
                <div className="mt-2 text-[10px] font-bold leading-5 text-ink-800">{body}</div>
                {step !== '06' && <ArrowLeft aria-hidden size={12} className="absolute -left-2.5 top-8 hidden text-indigo-300 xl:block" />}
              </article>
            ))}
          </div>
        </section>

        {topSignal && (
          <section className="mt-4 grid gap-3 lg:grid-cols-[1.1fr_.9fr]">
            <article className="rounded-[20px] border border-ink-200 bg-ink-50/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-black text-ink-800"><Target size={14} /> الإشارة الأقوى</div>
                <span className={'rounded-full border px-2.5 py-1 text-[9px] font-black ' + severityClass(topSignal.severity)}>{severityLabel(topSignal.severity)}</span>
              </div>
              <h4 className="mt-3 text-base font-black text-ink-950">{topSignal.title}</h4>
              <p className="mt-1 text-sm leading-6 text-ink-700">{topSignal.message}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-ink-200 bg-white p-3 text-[10px]">
                  <div className="font-black text-ink-900">لماذا تستحق الانتباه؟</div>
                  <div className="mt-1 leading-5 text-ink-600">{cleanText(topSignal.soWhat)}</div>
                </div>
                <div className="rounded-xl border border-ink-200 bg-white p-3 text-[10px]">
                  <div className="font-black text-ink-900">النطاق المثبت</div>
                  <div className="mt-1 leading-5 text-ink-600">{topSignal.affectedRows == null ? 'غير كمي من المصدر الحالي' : String(topSignal.affectedRows) + ' سجل'}</div>
                </div>
              </div>
            </article>

            <article className="rounded-[20px] border border-primary-200 bg-primary-50 p-4">
              <div className="flex items-center gap-2 text-xs font-black text-primary-950"><ListChecks size={14} /> التوصية الأولى</div>
              <h4 className="mt-3 text-base font-black text-primary-950">{topRecommendation?.title ?? brief.recommendedAction ?? 'لا توجد توصية تنفيذية مؤهلة'}</h4>
              <p className="mt-2 text-sm leading-6 text-primary-900">{topRecommendation?.action ?? 'أعد فحص الدليل قبل تحويله إلى قرار.'}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl bg-white/80 p-3 text-[10px]"><b>المالك:</b> {cleanText(topRecommendation?.ownerHint ?? brief.ownerHint)}</div>
                <div className="rounded-xl bg-white/80 p-3 text-[10px]"><b>القياس:</b> {cleanText(topRecommendation?.measurement ?? brief.measurement)}</div>
              </div>
            </article>
          </section>
        )}

        <section className="mt-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="section-kicker text-primary-700">كل الإشارات</div>
              <h4 className="mt-1 text-base font-black text-ink-950">ما الذي اكتشفه المحرك فعلًا؟</h4>
            </div>
            <div className="text-[10px] font-bold text-ink-400">{allSignals.length} إشارة مرتبطة بالمصدر</div>
          </div>
          {allSignals.length ? (
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {allSignals.map((signal) => (
                <article key={signal.id} className="rounded-2xl border border-ink-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[9px] font-black text-ink-400">{signal.priority ?? 'P3'} · {signal.ownerHint ?? 'مالك غير محدد'}</div>
                      <div className="mt-1 text-sm font-black text-ink-950">{signal.title}</div>
                    </div>
                    <span className={'shrink-0 rounded-full border px-2 py-1 text-[8px] font-black ' + severityClass(signal.severity)}>{severityLabel(signal.severity)}</span>
                  </div>
                  <p className="mt-2 text-[11px] leading-5 text-ink-600">{signal.message}</p>
                  <div className="mt-3 rounded-xl border border-primary-100 bg-primary-50/50 p-3 text-[10px] leading-5 text-primary-950">
                    <b>لماذا؟</b> {cleanText(signal.soWhat)}
                  </div>
                  {signal.evidence.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-ink-700"><ShieldCheck size={12} /> الدليل من المصدر</div>
                      <div className="mt-2 grid gap-1.5">
                        {signal.evidence.map((item) => <div key={item} className="rounded-lg border border-ink-100 bg-ink-50 px-2.5 py-1.5 text-[9px] leading-4 text-ink-600">{item}</div>)}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-ink-200 bg-ink-50 p-5 text-sm text-ink-600">لم تظهر إشارة مؤهلة من المصدر الحالي؛ لا يتم ملء الشاشة بنتائج مصطنعة.</div>
          )}
        </section>

        <section className="mt-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="section-kicker text-primary-700">كل التوصيات</div>
              <h4 className="mt-1 text-base font-black text-ink-950">من الإشارة إلى إجراء يمكن قياسه</h4>
            </div>
            <div className="text-[10px] font-bold text-ink-400">{allRecommendations.length} توصية مولدة من الإشارات</div>
          </div>
          {allRecommendations.length ? (
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {allRecommendations.map((recommendation) => (
                <article key={recommendation.id} className="rounded-2xl border border-primary-100 bg-primary-50/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-[9px] font-black text-primary-800"><Lightbulb size={12} /> {recommendation.priority}</div>
                    <span className="rounded-full bg-white px-2 py-1 text-[8px] font-black text-primary-800">{recommendation.status}</span>
                  </div>
                  <div className="mt-2 text-sm font-black text-primary-950">{recommendation.title}</div>
                  <p className="mt-2 text-[11px] leading-5 text-primary-900">{recommendation.action}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl bg-white/80 p-3 text-[9px] leading-5"><b>لماذا الآن؟</b><div>{cleanText(recommendation.whyNow)}</div></div>
                    <div className="rounded-xl bg-white/80 p-3 text-[9px] leading-5"><b>القياس</b><div>{cleanText(recommendation.measurement)}</div></div>
                  </div>
                  <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[9px] leading-5 text-amber-950">
                    <b>حاجز الاعتماد:</b> {cleanText(recommendation.blocker)}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-ink-200 bg-ink-50 p-5 text-sm text-ink-600">لا توجد توصيات مؤهلة؛ السبب يبقى ظاهرًا بدل اختراع إجراء.</div>
          )}
        </section>

        {intelligence.guidance.inspect.length ? (
          <section className="mt-5 rounded-2xl border border-ink-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-black text-ink-800"><Gauge size={15} /> ماذا فحص النظام؟</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {intelligence.guidance.inspect.map((item) => <span key={item} className="rounded-full border border-ink-200 bg-ink-50 px-2.5 py-1.5 text-[9px] text-ink-600">{item}</span>)}
            </div>
          </section>
        ) : null}

        <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950">
          <div className="flex items-center gap-2 font-black"><AlertTriangle size={14} /> حدود الحقيقة والاعتماد</div>
          <div className="mt-1">{cleanText(brief.proofRequirement)} {cleanText(intelligence.guidance.boundary)}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/80 px-2.5 py-1">المصدر: {format}</span>
            <span className="rounded-full bg-white/80 px-2.5 py-1">الإشارات: {allSignals.length}</span>
            <span className="rounded-full bg-white/80 px-2.5 py-1">التوصيات: {allRecommendations.length}</span>
          </div>
        </section>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
          <CheckCircle2 size={14}/>
          <span>كل النتائج المعروضة مشتقة من محتوى المصدر نفسه. لا يتم اختلاق سبب أو أثر مالي أو Benchmark غير مثبت.</span>
        </div>
      </CardBody>
    </Card>
  );
}
