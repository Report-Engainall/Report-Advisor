import { ArrowLeft, CheckCircle2, FileSearch, ShieldCheck, Sparkles, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SmartReportDetail } from '@/lib/report-smart';
import { formatNumber } from '@/lib/format';

function label(value: unknown) {
  const text = String(value ?? '').trim();
  const map: Record<string, string> = {
    VERIFIED: 'موثق',
    TRUSTED: 'موثوق',
    REVIEW: 'مراجعة',
    GAP_DETECTED: 'فجوة دليل',
    PENDING_EVIDENCE: 'بانتظار الدليل',
    NO_DECISION_COMMITTED: 'لا قرار معتمد',
    NO_ACTION_COMMITTED: 'لا إجراء منفذ',
    NO_ACTION_REQUIRED: 'لا إجراء مطلوب',
    NOT_AVAILABLE: 'غير متاح',
    INSUFFICIENT_SAMPLE: 'عينة غير كافية',
    AVAILABLE_FROM_CANONICAL_ANALYSIS: 'متاح من التحليل الكانوني',
  };
  return map[text] ?? (text || 'غير متاح');
}

export function ReportDecisionCockpit({ report }: { report: SmartReportDetail }) {
  const hash = encodeURIComponent(report.sourceHash);
  const job = encodeURIComponent(report.jobId);
  const evidenceReady = report.reportVerificationState === 'VERIFIED' && report.evidenceStatus !== 'PENDING_EVIDENCE';
  const gap = Number(report.canonicalCommitGap ?? 0);
  const nextHref = evidenceReady
    ? '/decision-experience?stage=decision&reportJobId=' + job + '&sourceHash=' + hash
    : '/trust?reportJobId=' + job + '&sourceHash=' + hash;

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-ink-200 bg-[linear-gradient(135deg,#052b29_0%,#073a35_58%,#0b403a_100%)] p-5 text-white shadow-[0_26px_70px_-40px_rgba(5,46,43,.85)] lg:p-7" aria-label="غرفة قيادة التقرير">
      <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full border border-amber-200/20 shadow-[0_0_0_24px_rgba(231,181,43,.025),0_0_0_48px_rgba(231,181,43,.018)]" />
      <div className="pointer-events-none absolute -right-28 -bottom-36 h-80 w-80 rounded-full border border-teal-200/15" />
      <div className="relative z-10 grid gap-6 xl:grid-cols-[1.2fr_.8fr] xl:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-white/5 px-3 py-1.5 text-[9px] font-black tracking-[.16em] text-amber-100">
            <Sparkles size={13} /> AGHBARI DECISION COCKPIT
          </div>
          <h2 className="mt-3 max-w-3xl text-2xl font-black tracking-tight lg:text-4xl">{report.sourcePath}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-teal-50/80">
            هذا ليس Viewer. هذه هي الهوية التشغيلية للتقرير: المصدر، الحقيقة، الدليل، الإشارة، والقرار على نفس Report Job.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] text-teal-50/75">
            <span>Job: <b className="font-mono text-white/90">{report.jobId.slice(0, 12)}…</b></span>
            <span>•</span>
            <span>Hash: <b className="font-mono text-white/90">{report.sourceHash.slice(0, 14)}…</b></span>
            <span>•</span>
            <span>{formatNumber(report.rowCount ?? 0)} صف كانونـي</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to={nextHref} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-300 px-4 py-2.5 text-xs font-black text-[#12322f] shadow-lg shadow-black/10 hover:bg-amber-200">
              {evidenceReady ? 'افتح مسار القرار' : 'افتح طبقة الدليل'}
              <ArrowLeft size={14}/>
            </Link>
            <Link to={'/reports/executive?reportJobId=' + job + '&sourceHash=' + hash} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-black text-white hover:bg-white/10">
              التقرير التنفيذي
            </Link>
            <Link to={'/replay?reportJobId=' + job + '&sourceHash=' + hash} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-black text-white hover:bg-white/10">
              Replay
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[.06] p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[9px] font-black tracking-[.12em] text-teal-100/70"><ShieldCheck size={13}/> TRUTH</div>
            <div className="mt-2 text-lg font-black">{label(report.trustState)}</div>
            <div className="mt-1 text-[10px] text-teal-50/60">Verification: {label(report.reportVerificationState)}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[.06] p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[9px] font-black tracking-[.12em] text-teal-100/70"><FileSearch size={13}/> EVIDENCE</div>
            <div className="mt-2 text-lg font-black">{label(report.evidenceStatus)}</div>
            <div className="mt-1 text-[10px] text-teal-50/60">{gap > 0 ? 'فجوة تغطية: ' + formatNumber(gap) : 'لا توجد فجوة تغطية مسجلة'}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[.06] p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[9px] font-black tracking-[.12em] text-teal-100/70"><Target size={13}/> DECISION</div>
            <div className="mt-2 text-lg font-black">{label(report.renderedOutput.decisionStatus)}</div>
            <div className="mt-1 text-[10px] text-teal-50/60">Action: {label(report.renderedOutput.actionStatus)}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[.06] p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[9px] font-black tracking-[.12em] text-teal-100/70"><CheckCircle2 size={13}/> OUTCOME</div>
            <div className="mt-2 text-lg font-black">{label(report.renderedOutput.outcomeStatus)}</div>
            <div className="mt-1 text-[10px] text-teal-50/60">Learning: {label(report.renderedOutput.learningStatus)}</div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-6 grid gap-2 rounded-2xl border border-white/10 bg-black/10 p-2 sm:grid-cols-5">
        {([
          ['TRUTH', report.trustState],
          ['EVIDENCE', report.evidenceStatus],
          ['SIGNAL', report.renderedOutput.signalStatus],
          ['DECISION', report.renderedOutput.decisionStatus],
          ['OUTCOME', report.renderedOutput.outcomeStatus],
        ] as Array<[string, unknown]>).map(([stage, value], index) => (
          <div key={String(stage)} className="flex items-center gap-2 rounded-xl px-3 py-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[9px] font-black">{index + 1}</span>
            <div className="min-w-0">
              <div className="text-[8px] font-black tracking-[.12em] text-teal-100/55">{stage}</div>
              <div className="truncate text-[10px] font-bold text-white/90">{label(value)}</div>
            </div>
            {index < 4 && <span className="mr-auto hidden text-teal-100/35 sm:block">←</span>}
          </div>
        ))}
      </div>
    </section>
  );
}