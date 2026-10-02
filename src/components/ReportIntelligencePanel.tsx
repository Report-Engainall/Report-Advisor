import { AlertTriangle, ArrowUpLeft, BrainCircuit, CheckCircle2, CircleHelp, ShieldCheck, TrendingUp } from 'lucide-react';
import type { SmartReportDetail } from '@/lib/report-smart';
import { formatNumber } from '@/lib/format';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createSourceDecisionProposal, fetchSourceDecisionProposals, type SourceDecisionState } from '@/lib/report-decisions';

const severityLabel: Record<string, string> = {
  critical: 'حرج',
  high: 'مرتفع',
  medium: 'متوسط',
  low: 'منخفض',
  info: 'معلومة',
};

const priorityLabel: Record<string, string> = {
  urgent: 'عاجل',
  high: 'مرتفع',
  medium: 'متوسط',
  low: 'منخفض',
};

function severityClass(value: string): string {
  if (value === 'critical' || value === 'high') return 'border-danger-200 bg-danger-50 text-danger-900';
  if (value === 'medium') return 'border-warning-200 bg-warning-50 text-warning-900';
  return 'border-ink-200 bg-ink-50 text-ink-700';
}

function number(value: number | null): string {
  return value == null ? 'غير متاح' : new Intl.NumberFormat('ar-YE', { maximumFractionDigits: 2 }).format(value);
}

export function ReportIntelligencePanel({ report }: { report: SmartReportDetail }) {
  const intelligence = report.intelligence;
  const [proposalState, setProposalState] = useState<Record<string, string>>({});
  const [decisionTrace, setDecisionTrace] = useState<SourceDecisionState[]>([]);
  const forecast = intelligence.forecast;

  useEffect(() => {
    let active = true;
    void fetchSourceDecisionProposals(report.sourceHash)
      .then((rows) => { if (active) setDecisionTrace(rows); })
      .catch(() => { if (active) setDecisionTrace([]); });
    return () => { active = false; };
  }, [report.sourceHash]);
  const specialtyLabel: Record<string, string> = {
    inventory: 'المخزون',
    sales: 'المبيعات',
    purchases: 'المشتريات',
    receivables: 'الذمم والتحصيل',
    payments: 'المدفوعات والسيولة',
    profitability: 'الربحية',
  };
  const domain = report.specialty ? specialtyLabel[report.specialty] ?? report.specialty : 'لم يُحسم المجال من المحتوى';
  const question = intelligence.businessQuestion;
  const topSignal = intelligence.signals[0] ?? null;
  const topRecommendation = topSignal
    ? intelligence.recommendations.find((item) => item.id === 'rec:' + topSignal.id) ?? null
    : null;
  const latestDecision = decisionTrace[0] ?? null;
  const journey = latestDecision ? [
    { label: 'التوصية', value: latestDecision.recommendationStatus ?? latestDecision.status },
    { label: 'القرار', value: latestDecision.status },
    { label: 'الموافقة', value: latestDecision.approvalStatus ?? 'لم تُطلب' },
    { label: 'العمل', value: latestDecision.workItemStatus ?? 'لم يُنشأ' },
    { label: 'النتيجة', value: latestDecision.outcomeStatus ?? 'لم تُسجل' },
    { label: 'التعلّم', value: latestDecision.outcomeStatus && latestDecision.actualImpact != null ? (latestDecision.outcomeQuality == null ? 'نتيجة متاحة' : 'نتيجة مقاسة') : 'غير متاح' },
  ] : [];
  return (
    <section dir="rtl" className="space-y-4 rounded-[18px] border border-primary-200 bg-white p-5 shadow-card lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <BrainCircuit size={19} className="text-primary-700" />
          <div>
            <div className="section-kicker">SOURCE INTELLIGENCE</div>
            <h2 className="mt-1 text-xl font-black text-ink-950">ماذا استنتج النظام من هذا التقرير؟</h2>
          </div>
        </div>
        <span className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-[10px] font-black text-primary-800">
          PROPOSED · لا يعتمد قرارًا تلقائيًا
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-2xl border border-primary-200 bg-primary-50/55 p-4">
          <div className="flex items-center gap-2">
            <CircleHelp size={16} className="text-primary-700" />
            <div className="text-[10px] font-black tracking-[0.08em] text-primary-800">BUSINESS QUESTION</div>
          </div>
          <p className="mt-2 text-sm font-black leading-7 text-ink-950">{question}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-[9px] font-bold text-ink-600">
            <span className="rounded-full bg-white px-2.5 py-1">المجال: {domain}</span>
            <span className="rounded-full bg-white px-2.5 py-1">الحالة: {report.evidenceStatus ?? 'غير مثبت'}</span>
            <span className="rounded-full bg-white px-2.5 py-1">{report.rowCount == null ? 'عدد الصفوف غير متاح' : formatNumber(report.rowCount) + ' صف'}</span>
          </div>
        </div>
        <div id="source-evidence-passport" className="rounded-2xl border border-ink-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-success-700" />
            <div className="text-[10px] font-black tracking-[0.08em] text-ink-700">EVIDENCE PASSPORT</div>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl bg-ink-50 p-2.5"><div className="text-[8px] text-ink-400">SOURCE</div><div className="mt-1 break-all font-mono text-[8px] text-ink-700">{report.sourcePath}</div></div>
            <div className="rounded-xl bg-ink-50 p-2.5"><div className="text-[8px] text-ink-400">FINGERPRINT</div><div className="mt-1 break-all font-mono text-[8px] text-ink-700">{report.sourceHash || 'غير متاح'}</div></div>
            <div className="rounded-xl bg-ink-50 p-2.5"><div className="text-[8px] text-ink-400">TRUST</div><div className="mt-1 text-[9px] font-black text-ink-800">{report.sourceTrustState ?? 'غير مثبت'}</div></div>
            <div className="rounded-xl bg-ink-50 p-2.5"><div className="text-[8px] text-ink-400">AS OF</div><div className="mt-1 text-[9px] font-black text-ink-800">{report.sourceAnalysis?.createdAt ? new Date(report.sourceAnalysis.createdAt).toLocaleString('ar-YE') : report.completedAt ? new Date(report.completedAt).toLocaleString('ar-YE') : 'غير متاح'}</div></div>
          </div>
          <div className="mt-3 text-[9px] leading-5 text-ink-500">القيم أدناه تُصنّف كمشاهدة من المصدر أو مشتقة منه. لا تتحول إلى حقيقة مالية نهائية بلا Evidence مناسب.</div>
          <div className="mt-2 flex flex-wrap gap-2 text-[8px] font-black">
            <span className="rounded-full bg-success-50 px-2 py-1 text-success-800">OBSERVED · Source</span>
            <span className="rounded-full bg-primary-50 px-2 py-1 text-primary-800">DERIVED · Intelligence</span>
            <span className="rounded-full bg-warning-50 px-2 py-1 text-warning-900">RECOMMENDED · Proposal</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.05fr_.95fr]">
        <div className="rounded-2xl border border-ink-200 bg-ink-50/70 p-4">
          <div className="text-[10px] font-black text-ink-500">الخلاصة</div>
          <p className="mt-2 text-sm leading-7 text-ink-800">{intelligence.summary}</p>
        </div>
        <div className="rounded-2xl border border-primary-200 bg-white p-4">
          <div className="text-[10px] font-black tracking-[.12em] text-primary-700">ADVISOR VALUE CHAIN</div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              ['WHAT', topSignal?.title ?? 'لا توجد إشارة'],
              ['WHY', topSignal?.message ?? 'لا يوجد سبب مثبت إضافي'],
              ['SO WHAT', topSignal?.soWhat ?? 'لا يوجد أثر نطاقي مثبت'],
              ['IMPACT', topSignal?.impact ?? 'غير مُثبت'],
              ['WHAT NEXT', topRecommendation?.action ?? 'مراجعة الدليل قبل الإجراء'],
              ['PROOF', topSignal?.evidence?.[0] ?? 'Evidence غير متاح'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-ink-100 bg-ink-50/60 p-2.5">
                <div className="text-[8px] font-black tracking-[.08em] text-ink-400">{label}</div>
                <div className="mt-1 text-[9px] font-bold leading-4 text-ink-800">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {latestDecision ? (
        <section className="rounded-2xl border border-primary-200 bg-primary-50/50 p-4" aria-label="استمرارية القرار من التقرير إلى النتيجة">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-black tracking-[.12em] text-primary-700">DECISION → ACTION → OUTCOME → LEARNING</div>
              <h3 className="mt-1 text-sm font-black text-ink-950">القضية نفسها ما زالت مرتبطة بالتقرير</h3>
              <p className="mt-1 text-[10px] leading-5 text-ink-600">هذه الحالة مأخوذة من السجلات الكانونية الحالية لهذا المصدر، وليست حالة واجهة محلية.</p>
            </div>
            <Link to={'/decision-experience?stage=' + (latestDecision.workItemStatus ? 'work' : latestDecision.approvalStatus ? 'approval' : 'decision') + '&reportJobId=' + encodeURIComponent(report.jobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash)} className="btn-primary text-[10px]">فتح السلسلة الكاملة <ArrowUpLeft size={12}/></Link>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
            {journey.map((stage, index) => (
              <div key={stage.label} className="rounded-xl border border-white bg-white p-3">
                <div className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-[8px] font-black text-primary-800">{index + 1}</span><span className="text-[9px] font-black text-ink-700">{stage.label}</span></div>
                <div className="mt-2 text-[9px] font-bold text-ink-900">{stage.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-3 text-[9px]">
            <div className="rounded-lg bg-white p-2"><span className="text-ink-400">OWNER</span><div className="mt-1 font-black text-ink-800">{topRecommendation?.ownerHint ?? 'غير محدد'}</div></div>
            <div className="rounded-lg bg-white p-2"><span className="text-ink-400">EXPECTED OUTCOME</span><div className="mt-1 font-bold text-ink-800">{topRecommendation?.expectedOutcome ?? 'غير متاح'}</div></div>
            <div className="rounded-lg bg-white p-2"><span className="text-ink-400">ACTUAL OUTCOME</span><div className="mt-1 font-black text-ink-800">{latestDecision.actualImpact == null ? 'لم تُسجل نتيجة فعلية' : String(latestDecision.actualImpact)}</div></div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-ink-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-warning-700" />
            <div className="text-sm font-black">الإشارات المكتشفة</div>
            <span className="mr-auto rounded-full bg-ink-50 px-2 py-1 text-[9px] font-bold">{formatNumber(intelligence.signals.length)}</span>
          </div>
          <div className="mt-3 space-y-2">
            {intelligence.signals.length === 0 ? (
              <div className="rounded-xl border border-success-200 bg-success-50 p-3 text-xs text-success-900">لم تُثبت إشارة استثنائية من البيانات المتاحة.</div>
            ) : intelligence.signals.slice(0, 8).map((signal) => (
              <article key={signal.id} className={'rounded-xl border p-3 ' + severityClass(signal.severity)}>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black">{severityLabel[signal.severity] ?? signal.severity}</span>
                  <span className="text-xs font-black">{signal.title}</span>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-current/10 bg-white/60 p-2">
                    <div className="text-[8px] font-black opacity-70">WHY</div>
                    <div className="mt-1 text-[9px] leading-4">{signal.message}</div>
                  </div>
                  <div className="rounded-lg border border-current/10 bg-white/60 p-2">
                    <div className="text-[8px] font-black opacity-70">SO WHAT</div>
                    <div className="mt-1 text-[9px] leading-4">{signal.soWhat}</div>
                  </div>
                  <div className="rounded-lg border border-current/10 bg-white/60 p-2">
                    <div className="text-[8px] font-black opacity-70">IMPACT</div>
                    <div className="mt-1 text-[9px] leading-4">{signal.impact}</div>
                  </div>
                  <div className="rounded-lg border border-current/10 bg-white/60 p-2">
                    <div className="text-[8px] font-black opacity-70">WHAT NEXT</div>
                    <div className="mt-1 text-[9px] leading-4">{intelligence.recommendations.find((item) => item.id === 'rec:' + signal.id)?.action ?? 'مراجعة الدليل المرتبط قبل أي إجراء.'}</div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {signal.evidence.slice(0, 3).map((evidence) => (
                    <span key={evidence} className="rounded-full bg-white/70 px-2 py-1 font-mono text-[8px]">{evidence}</span>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={proposalState[signal.id] === 'saving' || !report.sourceAnalysis?.id}
                    onClick={() => {
                      setProposalState((current) => ({ ...current, [signal.id]: 'saving' }));
                      void createSourceDecisionProposal({
                        reportJobId: report.jobId,
                        sourceHash: report.sourceHash,
                        signalId: signal.id,
                        signalTitle: signal.title,
                        signalMessage: signal.message,
                        severity: signal.severity,
                        evidence: signal.evidence,
                        evidenceSnapshotId: report.sourceAnalysis?.id ?? '',

                      }).then((result) => {
                        setProposalState((current) => ({ ...current, [signal.id]: result.status === 'APPROVED' ? 'already-approved' : 'proposed' }));
                        return fetchSourceDecisionProposals(report.sourceHash);
                      }).then((rows) => setDecisionTrace(rows)).catch(() => {
                        setProposalState((current) => ({ ...current, [signal.id]: 'error' }));
                      });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-white px-2.5 py-2 text-[9px] font-black text-primary-800 disabled:opacity-50"
                  >
                    {proposalState[signal.id] === 'saving' ? 'جارٍ الحفظ...' : proposalState[signal.id] === 'proposed' || proposalState[signal.id] === 'already-approved' ? 'تم حفظ التوصية والقرار' : !report.sourceAnalysis?.id ? 'الدليل غير متاح' : 'حفظ كتوصية ثم قرار'}
                  </button>
                  <Link
                    to={'/decision-experience?stage=evidence&reportJobId=' + encodeURIComponent(report.jobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash)}
                    className="inline-flex items-center gap-1 text-[9px] font-bold text-primary-700"
                  >
                    فتح مسار القرار <ArrowUpLeft size={12}/>
                  </Link>
                </div>
                {proposalState[signal.id] === 'error' && <div className="mt-2 text-[9px] font-bold text-danger-700">تعذر حفظ القرار المقترح؛ بقيت الإشارة مصدرية ولم تُحوّل إلى تنفيذ.</div>}
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-ink-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-primary-700" />
            <div className="text-sm font-black">ما الذي ينصح به النظام؟</div>
            <span className="mr-auto rounded-full bg-ink-50 px-2 py-1 text-[9px] font-bold">{formatNumber(intelligence.recommendations.length)}</span>
          </div>
          <div className="mt-3 space-y-2">
            {intelligence.recommendations.length === 0 ? (
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-3 text-xs text-ink-700">لا توجد توصية مصدرية كافية حاليًا.</div>
            ) : intelligence.recommendations.map((item) => (
              <article key={item.id} className="rounded-xl border border-ink-200 bg-ink-50/70 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary-50 px-2 py-1 text-[9px] font-black text-primary-800">{priorityLabel[item.priority] ?? item.priority}</span>
                  <span className="text-xs font-black text-ink-900">{item.title}</span>
                </div>
                <p className="mt-2 text-[11px] font-bold leading-5 text-ink-800">{item.action}</p>
                <p className="mt-1 text-[10px] leading-5 text-ink-500">{item.why}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-ink-200 bg-ink-950 p-4 text-white">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-primary-200" />
            <div className="text-sm font-black">الإسقاط المشروط</div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/5 p-3"><div className="text-[9px] text-ink-300">الحالة</div><div className="mt-1 text-sm font-black">{forecast.status === 'AVAILABLE' ? 'متاح من العينة' : 'عينة غير كافية'}</div></div>
            <div className="rounded-xl bg-white/5 p-3"><div className="text-[9px] text-ink-300">الفترات</div><div className="mt-1 text-sm font-black">{forecast.observedPeriods}</div></div>
            <div className="rounded-xl bg-white/5 p-3"><div className="text-[9px] text-ink-300">الفترة التالية</div><div className="mt-1 text-sm font-black">{forecast.nextPeriod ?? 'غير متاح'}</div></div>
            <div className="rounded-xl bg-white/5 p-3"><div className="text-[9px] text-ink-300">القيمة المتوقعة</div><div className="mt-1 text-sm font-black">{number(forecast.nextValue)}</div></div>
          </div>
          <p className="mt-3 text-[10px] leading-5 text-ink-300">{forecast.note}</p>
        </div>

        <div className="rounded-2xl border border-ink-200 bg-white p-4">
          <div className="text-[10px] font-black text-primary-700">GUIDANCE</div>
          <h3 className="mt-1 text-lg font-black text-ink-950">{intelligence.guidance.focus}</h3>
          {topSignal && (
            <div className="mt-3 rounded-xl border border-primary-100 bg-primary-50/60 p-3">
              <div className="text-[8px] font-black text-primary-800">ACTION BRIEF</div>
              <div className="mt-1 text-[10px] font-black text-ink-900">لماذا الآن؟</div>
              <div className="mt-1 text-[10px] leading-5 text-ink-700">{topSignal.message}</div>
              <div className="mt-2 text-[10px] font-black text-ink-900">الخطوة المقترحة</div>
              <div className="mt-1 text-[10px] leading-5 text-ink-700">{topRecommendation?.action ?? 'افتح Evidence Passport وراجع المصدر قبل إنشاء قرار.'}</div>
            </div>
          )}
          <div className="mt-3 space-y-2">
            {intelligence.guidance.inspect.map((item) => <div key={item} className="rounded-xl bg-ink-50 p-3 text-[11px] leading-5 text-ink-700">{item}</div>)}
          </div>
          <div className="mt-3 rounded-xl border border-ink-200 bg-ink-50 p-3 text-[10px] leading-5 text-ink-600">
            <strong>المسؤول المحتمل:</strong> {intelligence.guidance.ownerHint}<br />
            <strong>حد الدليل:</strong> {intelligence.guidance.boundary}
          </div>
        </div>
      </div>
    </section>
  );
}
