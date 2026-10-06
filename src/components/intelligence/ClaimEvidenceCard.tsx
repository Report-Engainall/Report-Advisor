import { CheckCircle2, CircleAlert, FileSearch, LockKeyhole, ShieldCheck } from 'lucide-react';
import type { Claim, ClaimState } from '@/lib/report-intelligence/claim-ledger';

const stateLabel: Record<ClaimState, string> = {
  VALID: 'مثبت',
  REVIEW_REQUIRED: 'يحتاج مراجعة',
  INSUFFICIENT_SAMPLE: 'عينة غير كافية',
  NOT_AVAILABLE: 'غير متاح',
  BLOCKED: 'محجوب',
};

function stateIcon(state: ClaimState) {
  if (state === 'VALID') return <CheckCircle2 size={15} />;
  if (state === 'BLOCKED') return <LockKeyhole size={15} />;
  if (state === 'REVIEW_REQUIRED' || state === 'INSUFFICIENT_SAMPLE') return <CircleAlert size={15} />;
  return <FileSearch size={15} />;
}

export function ClaimEvidenceCard({ claim }: { claim: Claim }) {
  return (
    <article dir="rtl" className="rounded-2xl border border-ink-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[9px] font-black tracking-[.12em] text-primary-700">
            <ShieldCheck size={14} /> استنتاج موثق
          </div>
          <h3 className="mt-1.5 text-sm font-black leading-6 text-ink-950">{claim.statement}</h3>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-ink-200 bg-ink-50 px-2.5 py-1.5 text-[9px] font-black text-ink-700">
          {stateIcon(claim.state)} {stateLabel[claim.state]}
        </span>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl bg-ink-50 p-3"><div className="text-[9px] font-bold text-ink-500">العينة</div><div className="mt-1 text-sm font-black">{claim.sampleSize}</div></div>
        <div className="rounded-xl bg-ink-50 p-3"><div className="text-[9px] font-bold text-ink-500">الحساب</div><div className="mt-1 text-[10px] font-black">محسوب من المصدر</div></div>
        <div className="rounded-xl bg-ink-50 p-3"><div className="text-[9px] font-bold text-ink-500">الفترة</div><div className="mt-1 text-[10px] font-black">{claim.scope.period || 'غير محددة'}</div></div>
      </div>
      <details className="mt-3 rounded-xl border border-primary-100 bg-primary-50/40 p-3">
        <summary className="cursor-pointer list-none text-[10px] font-black text-primary-900">عرض مسار الإثبات</summary>
        <div className="mt-3 space-y-2 text-[10px] text-primary-950">
          <div><b>البصمة:</b> <span className="font-mono break-all">{claim.sourceHash}</span></div>
          <div><b>تشغيل التقرير:</b> <span className="font-mono break-all">{claim.reportExecutionJobId}</span></div>
          <div><b>لقطة الدليل:</b> <span className="font-mono break-all">{claim.evidenceSnapshotId || 'غير متاح'}</span></div>
          <div><b>جواز الدليل:</b> <span className="font-mono break-all">{claim.evidencePassportId || 'غير متاح'}</span></div>
          <div><b>قاعدة الحساب:</b> <span className="font-mono break-all">{claim.ruleId || 'غير محدد'}</span></div>
          <div><b>النموذج الفني:</b> {claim.archetypeId || 'غير محدد'} · v{claim.profileVersion ?? '—'}</div>
          <div><b>المدخلات الفنية:</b> {claim.inputFields.length ? claim.inputFields.join('، ') : 'غير محددة'}</div>
          {claim.supportingEvidence.length > 0 && <div><b>الأدلة الداعمة:</b> <span className="font-mono">{claim.supportingEvidence.join(' · ')}</span></div>}
        </div>
      </details>
      {claim.limitations.length > 0 && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3"><div className="text-[9px] font-black text-amber-900">حدود الاستنتاج</div><div className="mt-1 space-y-1 text-[10px] leading-5 text-amber-950">{claim.limitations.map((item) => <p key={item}>• {item}</p>)}</div></div>
      )}
    </article>
  );
}
