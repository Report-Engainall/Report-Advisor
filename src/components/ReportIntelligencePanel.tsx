import { AlertTriangle, BrainCircuit, CheckCircle2, TrendingUp, ArrowUpLeft } from 'lucide-react';
import type { SmartReportDetail } from '@/lib/report-smart';
import { formatNumber } from '@/lib/format';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createSourceDecisionProposal } from '@/lib/report-decisions';

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
  const evidenceSnapshotId = typeof report.renderedOutput.evidenceSnapshotId === 'string' ? report.renderedOutput.evidenceSnapshotId : '';
  const [proposalState, setProposalState] = useState<Record<string, string>>({});
  const forecast = intelligence.forecast;
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

      <div className="rounded-2xl border border-ink-200 bg-ink-50/70 p-4">
        <div className="text-[10px] font-black text-ink-500">الخلاصة</div>
        <p className="mt-2 text-sm leading-7 text-ink-800">{intelligence.summary}</p>
      </div>

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
                <p className="mt-1 text-[11px] leading-5">{signal.message}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {signal.evidence.slice(0, 3).map((evidence) => (
                    <span key={evidence} className="rounded-full bg-white/70 px-2 py-1 font-mono text-[8px]">{evidence}</span>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={proposalState[signal.id] === 'saving'}
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
                        evidenceSnapshotId,
                      }).then((result) => {
                        setProposalState((current) => ({ ...current, [signal.id]: result.status === 'APPROVED' ? 'already-approved' : 'proposed' }));
                      }).catch(() => {
                        setProposalState((current) => ({ ...current, [signal.id]: 'error' }));
                      });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-white px-2.5 py-2 text-[9px] font-black text-primary-800 disabled:opacity-50"
                  >
                    {proposalState[signal.id] === 'saving' ? 'جارٍ الحفظ...' : proposalState[signal.id] === 'proposed' || proposalState[signal.id] === 'already-approved' ? 'تم حفظ القرار المقترح' : 'حفظ كقرار مقترح'}
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
            <div className="text-sm font-black">التنبؤ</div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/5 p-3"><div className="text-[9px] text-ink-300">الحالة</div><div className="mt-1 text-sm font-black">{forecast.status === 'AVAILABLE' ? 'متاح' : 'عينة غير كافية'}</div></div>
            <div className="rounded-xl bg-white/5 p-3"><div className="text-[9px] text-ink-300">الفترات</div><div className="mt-1 text-sm font-black">{forecast.observedPeriods}</div></div>
            <div className="rounded-xl bg-white/5 p-3"><div className="text-[9px] text-ink-300">الفترة التالية</div><div className="mt-1 text-sm font-black">{forecast.nextPeriod ?? 'غير متاح'}</div></div>
            <div className="rounded-xl bg-white/5 p-3"><div className="text-[9px] text-ink-300">القيمة المتوقعة</div><div className="mt-1 text-sm font-black">{number(forecast.nextValue)}</div></div>
          </div>
          <p className="mt-3 text-[10px] leading-5 text-ink-300">{forecast.note}</p>
        </div>

        <div className="rounded-2xl border border-ink-200 bg-white p-4">
          <div className="text-[10px] font-black text-primary-700">GUIDANCE</div>
          <h3 className="mt-1 text-lg font-black text-ink-950">{intelligence.guidance.focus}</h3>
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
