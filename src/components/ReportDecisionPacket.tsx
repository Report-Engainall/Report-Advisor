import { useMemo } from 'react';
import { Download, ShieldCheck } from 'lucide-react';
import type { SmartReportDetail } from '@/lib/report-smart';
import type { BusinessQuestionStatus, ReportClaim } from '@/lib/report-intelligence/report-decision-artifacts';

function statusLabel(status: BusinessQuestionStatus): string {
  const labels: Record<BusinessQuestionStatus, string> = { ANSWERED: 'أجاب المصدر', NOT_AVAILABLE: 'غير متاح', INSUFFICIENT_SAMPLE: 'عينة غير كافية', REVIEW_REQUIRED: 'يحتاج مراجعة', BLOCKED: 'محجوب' };
  return labels[status];
}

function statusTone(status: BusinessQuestionStatus): string {
  if (status === 'ANSWERED') return 'border-success-200 bg-success-50 text-success-900';
  if (status === 'BLOCKED' || status === 'REVIEW_REQUIRED') return 'border-warning-200 bg-warning-50 text-warning-900';
  return 'border-ink-200 bg-ink-50 text-ink-700';
}

function downloadPacket(report: SmartReportDetail): void {
  const payload = { packet: report.artifacts.decisionPacket, questions: report.artifacts.questions, claims: report.artifacts.claims, source: { jobId: report.jobId, sourceHash: report.sourceHash, sourcePath: report.sourcePath } };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = 'decision-packet-' + report.sourceHash.slice(-16) + '.json'; link.click(); URL.revokeObjectURL(url);
}

function ClaimRow({ claim }: { claim: ReportClaim }) {
  return <div className='rounded-xl border border-ink-200 bg-ink-50/70 p-3'>
    <div className='flex flex-wrap items-center justify-between gap-2'><div className='text-[10px] font-black text-ink-900'>{claim.statement}</div><span className='rounded-full bg-white px-2 py-1 text-[8px] font-black text-primary-800'>{claim.status}</span></div>
    <div className='mt-2 grid gap-2 text-[9px] text-ink-500 sm:grid-cols-2'>
      <span>rule={claim.ruleId}</span><span>sample={claim.sampleSize ?? 'غير متاح'}</span><span className='break-all'>hash={claim.sourceHash}</span><span>profile={claim.profileVersion ?? 'UNDECLARED'}</span>
    </div>
    <div className='mt-2 rounded-lg bg-white p-2 text-[9px] leading-5 text-ink-600'>
      <div>calculation: {claim.calculationMethod}</div><div>inputs: {claim.inputFields.join(' · ') || 'غير متاح'}</div>
      <div>evidence: {claim.evidenceSnapshotId ?? 'غير متاح'} · passport: {claim.evidencePassportId ?? 'غير متاح'}</div>
      <div>limitations: {claim.limitations.join(' ')}</div>
    </div>
  </div>;
}

export function ReportDecisionPacket({ report }: { report: SmartReportDetail }) {
  const questions = report.artifacts.questions;
  const packet = report.artifacts.decisionPacket;
  const claimCount = report.artifacts.claims.length;
  const answerCount = useMemo(() => questions.filter((question) => question.status === 'ANSWERED').length, [questions]);
  return <section className='rounded-[18px] border border-ink-200 bg-white p-5 shadow-card lg:p-6' aria-label='Business question and claim provenance'>
    <div className='flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between'>
      <div><div className='section-kicker'>BUSINESS QUESTION ENGINE</div><h2 className='mt-1 text-lg font-black text-ink-950'>من ماذا حدث إلى ماذا نفعل ثم ماذا قيس</h2><p className='mt-1 max-w-4xl text-[10px] leading-5 text-ink-500'>كل إجابة تحمل حالتها؛ غياب البيانات يبقى معلنًا بدل ملء الفراغ بتحليل تجميلي.</p></div>
      <button type='button' onClick={() => downloadPacket(report)} className='btn-secondary inline-flex items-center gap-2 text-[10px]'><Download size={14}/> Decision Packet</button>
    </div>
    <div className='mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4'><div className='rounded-xl bg-ink-950 p-3 text-white'><div className='text-[8px] text-primary-200'>QUESTIONS ANSWERED</div><div className='mt-1 text-lg font-black'>{answerCount}/{questions.length}</div></div><div className='rounded-xl bg-ink-50 p-3'><div className='text-[8px] text-ink-500'>CLAIMS</div><div className='mt-1 text-lg font-black'>{claimCount}</div></div><div className='rounded-xl bg-ink-50 p-3'><div className='text-[8px] text-ink-500'>PROFILE VERSION</div><div className='mt-1 text-xs font-black'>{packet.profileVersion ?? 'UNDECLARED'}</div></div><div className='rounded-xl bg-ink-50 p-3'><div className='text-[8px] text-ink-500'>REPRODUCIBILITY</div><div className='mt-1 break-all font-mono text-[8px]'>{packet.reproducibilityKey}</div></div></div>
    <div className='mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>{questions.map((question) => <div key={question.key} className={'rounded-xl border p-3 ' + statusTone(question.status)}><div className='text-[9px] font-black'>{question.key} · {statusLabel(question.status)}</div><div className='mt-1 text-[10px] font-black'>{question.title}</div><div className='mt-2 text-[10px] leading-5'>{question.answer}</div>{question.limitations.length > 0 && <div className='mt-2 text-[9px] opacity-80'>{question.limitations.join(' ')}</div>}</div>)}</div>
    <div className='mt-4 rounded-2xl border border-primary-200 bg-primary-50/50 p-4'><div className='flex items-center gap-2 text-[11px] font-black text-primary-950'><ShieldCheck size={15}/> حدود القرار</div><div className='mt-2 grid gap-2 text-[10px] text-primary-950 sm:grid-cols-2'><span>Decision: {packet.decisionStatus ?? 'غير متاح'}</span><span>Approval: {packet.approvalStatus ?? 'غير متاح'}</span><span>Work: {packet.workStatus ?? 'غير متاح'}</span><span>Actual Outcome: {packet.actualOutcome ?? 'غير متاح'}</span></div><div className='mt-2 text-[10px] leading-5 text-primary-950'>{packet.limitations.join(' ')}</div><div className='mt-3 rounded-xl border border-white/70 bg-white/70 p-3 text-[10px] text-primary-950'><div className='font-black'>LEARNING · {packet.learning.status}</div><div className='mt-1'>{packet.learning.statement}</div><div className='mt-1'>المتوقع: {packet.learning.expected ?? 'غير متاح'} · الفعلي: {packet.learning.actual ?? 'غير متاح'} · الفارق: {packet.learning.delta ?? 'غير متاح'}</div></div></div>
    <div className='mt-4'><div className='text-[9px] font-black tracking-[.12em] text-ink-500'>CLAIM LEDGER</div><div className='mt-2 space-y-2'>{report.artifacts.claims.slice(0, 12).map((claim) => <ClaimRow key={claim.id} claim={claim}/>)}</div></div>
  </section>;
}