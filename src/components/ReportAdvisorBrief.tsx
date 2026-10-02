import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, ChevronDown, CircleAlert, FileSearch, Lightbulb, ShieldCheck, Target } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { SmartReportDetail } from '@/lib/report-smart';
import { createSourceDecisionProposal } from '@/lib/report-decisions';
import type { AdvisorQuestionId } from '@/lib/report-intelligence/report-advisor-engine';

const statusLabel: Record<string,string> = {
  ANSWERED:'مجاب', NOT_AVAILABLE:'غير متاح', INSUFFICIENT_SAMPLE:'عينة غير كافية', REVIEW_REQUIRED:'يحتاج مراجعة', BLOCKED:'محظور',
};
const statusClass: Record<string,string> = {
  ANSWERED:'border-success-200 bg-success-50 text-success-900',
  NOT_AVAILABLE:'border-ink-200 bg-ink-50 text-ink-700',
  INSUFFICIENT_SAMPLE:'border-warning-200 bg-warning-50 text-warning-900',
  REVIEW_REQUIRED:'border-warning-200 bg-warning-50 text-warning-900',
  BLOCKED:'border-danger-200 bg-danger-50 text-danger-900',
};

function money(value:number|null){ return value == null ? 'غير متاح' : new Intl.NumberFormat('ar-YE',{maximumFractionDigits:2}).format(value); }

export function ReportAdvisorBrief({ report }: { report: SmartReportDetail }) {
  const navigate = useNavigate();
  const brief = report.advisorBrief;
  const [questionId,setQuestionId] = useState<AdvisorQuestionId>('WHAT');
  const [proposalState,setProposalState] = useState<'idle'|'saving'|'saved'|'error'>('idle');
  const question = useMemo(() => brief.questions.find(x => x.id === questionId) ?? brief.questions[0], [brief.questions,questionId]);
  const action = brief.recommendedAction;
  const topSignal = report.intelligence.signals.find(x => x.severity !== 'info') ?? null;

  const convertToDecision = async () => {
    if (!topSignal || !report.evidenceSnapshotId) {
      setProposalState('error');
      return;
    }
    setProposalState('saving');
    try {
      const proposal = await createSourceDecisionProposal({
        reportJobId: report.jobId,
        sourceHash: report.sourceHash,
        signalId: topSignal.id,
        signalTitle: topSignal.title,
        signalMessage: topSignal.message,
        severity: topSignal.severity,
        evidence: topSignal.evidence,
        evidenceSnapshotId: report.evidenceSnapshotId,
      });
      setProposalState('saved');
      const params = new URLSearchParams({
        stage:'decision',
        reportJobId:report.jobId,
        sourceHash:report.sourceHash,
      });
      if (proposal.recommendationId) params.set('recommendationId',proposal.recommendationId);
      navigate('/decision-experience?' + params.toString());
    } catch {
      setProposalState('error');
    }
  };

  return (
    <section dir="rtl" className="space-y-5 rounded-[24px] border border-primary-300 bg-[linear-gradient(135deg,#062d2a_0%,#073c37_58%,#0b403b_100%)] p-5 text-white shadow-[0_28px_80px_-48px_rgba(4,51,46,.95)] lg:p-7" aria-label="Advisor Brief">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-100/20 bg-white/5 px-3 py-1.5 text-[9px] font-black tracking-[.14em] text-amber-100"><Lightbulb size={13}/> ADVISOR BRIEF</div>
          <h2 className="mt-3 text-2xl font-black tracking-tight lg:text-3xl">ماذا يريد الأغبري أن يقول للإدارة؟</h2>
          <p className="mt-2 text-[12px] leading-6 text-teal-50/75">هذه ليست بطاقة تلخيص. النتيجة مبنية من الصفوف الكانونية لنفس الـReport Job، وتفصل المساهمة المرصودة عن السببية غير المثبتة.</p>
          <div className="mt-3 flex flex-wrap gap-2 text-[9px] text-teal-50/70">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">Archetype: {brief.archetypeId}</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">Profile: {brief.profileVersion}</span>
            <span className="rounded-full border border-white/10 bg-white/5">Proof: {brief.proofState}</span>
          </div>
        </div>
        <button type="button" onClick={() => void convertToDecision()} disabled={proposalState==='saving' || !report.evidenceSnapshotId} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-xs font-black text-[#12322f] shadow-lg hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50">
          {proposalState==='saving' ? 'جارٍ إنشاء القرار...' : proposalState==='saved' ? 'تم تحويلها إلى قرار' : 'حوّلها إلى قرار'}
          <ArrowLeft size={15}/>
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[.055] p-4">
          <div className="text-[9px] font-black tracking-[.14em] text-teal-100/65">HEALTH</div>
          <div className="mt-2 text-xl font-black">{brief.health.status}</div>
          <p className="mt-1 text-[11px] leading-5 text-teal-50/70">{brief.health.rationale}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[.055] p-4">
          <div className="text-[9px] font-black tracking-[.14em] text-teal-100/65">PROOF STATE</div>
          <div className="mt-2 flex items-center gap-2 text-xl font-black"><ShieldCheck size={17}/>{brief.proofState}</div>
          <div className="mt-1 text-[10px] text-teal-50/65">Job {brief.lineage.jobId.slice(0,12)}… · Hash {brief.lineage.sourceHash.slice(0,18)}…</div>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[.055] p-4 xl:col-span-2">
          <div className="flex items-center gap-2"><Target size={15} className="text-amber-200"/><div className="text-[10px] font-black tracking-[.13em]">TOP FINDINGS</div></div>
          <div className="mt-3 grid gap-2 lg:grid-cols-2">
            {brief.topFindings.map((item,index)=>(
              <article key={item.title+index} className="rounded-xl border border-white/10 bg-black/10 p-3">
                <div className="text-xs font-black text-white">{item.title}</div>
                <p className="mt-1 text-[11px] leading-5 text-teal-50/75">{item.statement}</p>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[8px] text-teal-100/65">
                  {item.value != null && <span className="rounded-full bg-white/5 px-2 py-1">Value {money(item.value)}</span>}
                  {item.dimension && <span className="rounded-full bg-white/5 px-2 py-1">{item.dimension}</span>}
                  <span className="rounded-full bg-white/5 px-2 py-1">Sample {item.sampleSize}</span>
                </div>
                <div className="mt-2 space-y-1">{item.evidence.slice(-4).map(e=><div key={e} className="font-mono text-[8px] text-teal-100/55">{e}</div>)}</div>
              </article>
            ))}
            {!brief.topFindings.length && <div className="rounded-xl border border-white/10 bg-black/10 p-4 text-[11px] text-teal-50/65">لا توجد Findings كمية مكتملة.</div>}
          </div>
        </div>
        <div className="space-y-3">
          <article className="rounded-2xl border border-danger-200/20 bg-danger-500/10 p-4">
            <div className="flex items-center gap-2 text-[9px] font-black text-red-100"><CircleAlert size={14}/> TOP RISK</div>
            <div className="mt-2 text-sm font-black text-white">{brief.topRisk?.title ?? 'غير مثبت'}</div>
            <p className="mt-1 text-[10px] leading-5 text-red-50/75">{brief.topRisk?.statement ?? 'لا يوجد خطر مثبت من البيانات الحالية.'}</p>
          </article>
          <article className="rounded-2xl border border-success-200/20 bg-success-500/10 p-4">
            <div className="flex items-center gap-2 text-[9px] font-black text-emerald-100"><Target size={14}/> TOP OPPORTUNITY</div>
            <div className="mt-2 text-sm font-black text-white">{brief.topOpportunity?.title ?? 'لا توجد فرصة كمية مثبتة'}</div>
            <p className="mt-1 text-[10px] leading-5 text-emerald-50/75">{brief.topOpportunity?.statement ?? 'لا يختلق الأغبري فرصة عند غياب مقارنة مثبتة.'}</p>
          </article>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[.8fr_1.2fr]">
        <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
          <div className="text-[9px] font-black tracking-[.14em] text-teal-100/65">BUSINESS QUESTIONS</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {brief.questions.map(item=>(
              <button key={item.id} type="button" onClick={()=>setQuestionId(item.id)} className={'rounded-xl border px-3 py-3 text-right ' + (item.id===question?.id ? 'border-amber-200/30 bg-amber-100/10' : 'border-white/10 bg-white/[.035]')}>
                <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-black text-white">{item.id}</span><span className={'rounded-full border px-1.5 py-0.5 text-[7px] font-black ' + (statusClass[item.status] ?? statusClass.NOT_AVAILABLE)}>{statusLabel[item.status] ?? item.status}</span></div>
                <div className="mt-1 text-[9px] text-teal-50/60">{item.question}</div>
              </button>
            ))}
          </div>
        </div>
        {question && <div className="rounded-2xl border border-white/10 bg-white/[.055] p-4">
          <div className="flex items-center justify-between gap-2"><div className="text-[10px] font-black text-amber-100">{question.id} · {question.question}</div><ChevronDown size={15} className="text-white/35"/></div>
          <div className="mt-3 rounded-xl border border-white/10 bg-black/10 p-3"><div className="text-[9px] text-teal-100/55">الإجابة</div><div className="mt-1 text-sm font-black text-white">{question.answer}</div></div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl bg-black/10 p-3"><div className="text-[8px] text-teal-100/45">العينة</div><div className="mt-1 text-sm font-black">{question.sampleSize}</div></div>
            <div className="rounded-xl bg-black/10 p-3"><div className="text-[8px] text-teal-100/45">الحقول</div><div className="mt-1 text-[9px] font-mono text-teal-50/80">{question.fields.join(', ') || 'غير متاح'}</div></div>
            <div className="rounded-xl bg-black/10 p-3"><div className="text-[8px] text-teal-100/45">التالي</div><div className="mt-1 text-sm font-black">{question.nextQuestionId ?? 'نهاية'}</div></div>
          </div>
          <div className="mt-3"><div className="text-[8px] font-black text-teal-100/50">EVIDENCE</div>{question.evidence.slice(0,8).map(e=><div key={e} className="mt-1 break-all font-mono text-[8px] text-teal-50/55">{e}</div>)}</div>
          {question.limitations.length>0 && <div className="mt-3 rounded-xl border border-amber-100/10 bg-amber-100/5 p-3 text-[9px] leading-5 text-amber-50/70">{question.limitations.join(' · ')}</div>}
        </div>}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[.055] p-4">
          <div className="text-[9px] font-black tracking-[.14em] text-teal-100/65">WHY / SO WHAT</div>
          <div className="mt-3">
            <div className="text-xs font-black text-white">WHY · {statusLabel[brief.why.status] ?? brief.why.status}</div>
            <p className="mt-1 text-[11px] leading-6 text-teal-50/75">{brief.why.answer}</p>
            <div className="mt-3 rounded-xl border border-white/10 bg-black/10 p-3"><div className="text-[9px] text-teal-100/55">SO WHAT</div><div className="mt-1 text-sm font-black text-white">{brief.soWhat}</div></div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[.055] p-4">
          <div className="text-[9px] font-black tracking-[.14em] text-teal-100/65">RECOMMENDED ACTION</div>
          {action ? <div className="mt-3 space-y-2 text-[10px] leading-5 text-teal-50/80">
            <div><b className="text-white">المشكلة:</b> {action.problem}</div>
            <div><b className="text-white">لماذا الآن؟</b> {action.whyNow}</div>
            <div><b className="text-white">الإجراء:</b> {action.action}</div>
            <div><b className="text-white">OWNER:</b> {action.owner}</div>
            <div><b className="text-white">EXPECTED OUTCOME:</b> {action.expectedOutcome}</div>
            <div><b className="text-white">MEASUREMENT:</b> {action.measurement}</div>
            <div><b className="text-white">RISKS / BLOCKERS:</b> {action.risksBlockers.join(' · ')}</div>
            <div><b className="text-white">LIMITATIONS:</b> {action.limitations.join(' · ')}</div>
          </div> : <div className="mt-3 text-[11px] text-teal-50/65">لا توجد توصية كمية جاهزة من هذا المصدر.</div>}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
        <div className="flex flex-wrap items-center gap-2 text-[9px] font-black tracking-[.14em] text-teal-100/60"><FileSearch size={14}/> LINEAGE</div>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <div className="rounded-xl bg-white/[.04] p-3"><div className="text-[8px] text-teal-100/45">JOB ID</div><div className="mt-1 break-all font-mono text-[9px]">{report.jobId}</div></div>
          <div className="rounded-xl bg-white/[.04] p-3"><div className="text-[8px] text-teal-100/45">SOURCE HASH</div><div className="mt-1 break-all font-mono text-[9px]">{report.sourceHash}</div></div>
          <div className="rounded-xl bg-white/[.04] p-3"><div className="text-[8px] text-teal-100/45">EVIDENCE SNAPSHOT</div><div className="mt-1 break-all font-mono text-[9px]">{report.evidenceSnapshotId ?? 'غير متاح'}</div></div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to={'/trust?reportJobId='+encodeURIComponent(report.jobId)+'&sourceHash='+encodeURIComponent(report.sourceHash)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.045] px-3 py-2 text-[9px] font-black text-white"><ShieldCheck size={13}/> Evidence</Link>
          <Link to={'/decision-experience?stage=evidence&reportJobId='+encodeURIComponent(report.jobId)+'&sourceHash='+encodeURIComponent(report.sourceHash)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.045] px-3 py-2 text-[9px] font-black text-white"><CheckCircle2 size={13}/> Decision journey</Link>
        </div>
        {proposalState==='error' && <div className="mt-3 rounded-xl border border-danger-200/20 bg-danger-500/10 p-3 text-[9px] text-red-100">تعذر تحويل التوصية. يلزم Evidence Passport VERIFIED/READY ولقطة دليل صحيحة.</div>}
      </div>
    </section>
  );
}