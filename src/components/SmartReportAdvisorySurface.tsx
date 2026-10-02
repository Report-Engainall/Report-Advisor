import { ArrowLeft, BrainCircuit, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SmartReportDetail } from '@/lib/report-smart';
import { buildAdvisoryPacket } from '@/lib/report-intelligence/report-advisory-orchestrator';
import { BusinessQuestionRail } from '@/components/intelligence/BusinessQuestionRail';
import { ClaimEvidenceCard } from '@/components/intelligence/ClaimEvidenceCard';
import type { CanonicalField } from '@/lib/report-intelligence/canonical-schema';

function canonicalFields(report: SmartReportDetail): CanonicalField[] {
  const dataset = report.sourceAnalysis?.datasets?.[0];
  if (!dataset || typeof dataset !== 'object') return [];
  const columns = (dataset as Record<string, unknown>).columns;
  if (!Array.isArray(columns)) return [];
  return columns
    .map((column) => typeof column === 'object' && column ? String((column as Record<string, unknown>).mappedField ?? '') : '')
    .filter(Boolean) as CanonicalField[];
}

export function SmartReportAdvisorySurface({ report }: { report: SmartReportDetail }) {
  const evidencePassportId = typeof report.renderedOutput.evidencePassportId === 'string'
    ? report.renderedOutput.evidencePassportId
    : null;
  const evidenceSnapshotId = typeof report.renderedOutput.evidenceSnapshotId === 'string'
    ? report.renderedOutput.evidenceSnapshotId
    : null;

  const packet = buildAdvisoryPacket({
    intelligence: report.intelligence,
    provenance: {
      tenantId: report.tenantId,
      sourceHash: report.sourceHash,
      reportExecutionJobId: report.jobId,
      evidenceSnapshotId,
      evidencePassportId,
      sourceVersionId: typeof report.renderedOutput.sourceVersionId === 'string' ? report.renderedOutput.sourceVersionId : null,
    },
    availableFields: canonicalFields(report),
    sampleSize: report.rowCount ?? 0,
    archetypeId: typeof report.renderedOutput.archetypeId === 'string' ? report.renderedOutput.archetypeId : null,
    profileVersion: typeof report.renderedOutput.profileVersion === 'number' ? report.renderedOutput.profileVersion : null,
  });

  const decisionClaims = packet.claims.filter((claim) => claim.status === 'RECOMMENDED' || claim.status === 'DERIVED').slice(0, 6);

  return (
    <section dir="rtl" className="space-y-4">
      <div className="rounded-[18px] border border-primary-200 bg-[linear-gradient(135deg,#f7fbfa,#ffffff)] p-5 shadow-card lg:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[9px] font-black tracking-[.15em] text-primary-700"><BrainCircuit size={15}/> ADVISORY INTELLIGENCE</div>
            <h2 className="mt-1 text-xl font-black text-ink-950">من التقرير إلى الفهم والقرار</h2>
            <p className="mt-2 max-w-3xl text-xs leading-6 text-ink-600">هذه الطبقة تجمع الإشارات والتوصيات والأسئلة وحالة الدليل في مسار واحد، مع إبقاء ما لم يُثبت معلنًا.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[9px] font-black text-ink-700"><ShieldCheck size={13}/> {packet.proofState === 'VERIFIED' ? 'الدليل مرتبط' : 'المراجعة مطلوبة'}</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-4 border border-ink-100"><div className="text-[9px] font-black text-ink-500">CLAIMS</div><div className="mt-1 text-2xl font-black">{packet.claims.length}</div><div className="mt-1 text-[10px] text-ink-500">نتائج قابلة للتتبع</div></div>
          <div className="rounded-xl bg-white p-4 border border-ink-100"><div className="text-[9px] font-black text-ink-500">QUESTIONS</div><div className="mt-1 text-2xl font-black">{packet.questions.length}</div><div className="mt-1 text-[10px] text-ink-500">أسئلة أعمال</div></div>
          <div className="rounded-xl bg-white p-4 border border-ink-100"><div className="text-[9px] font-black text-ink-500">ACTION STATE</div><div className="mt-1 text-lg font-black">{packet.actionState === 'ACTIONABLE' ? 'قابل للمراجعة والتنفيذ' : packet.actionState === 'REVIEW_REQUIRED' ? 'مراجعة مطلوبة' : 'غير متاح'}</div><div className="mt-1 text-[10px] text-ink-500">لا تنفيذ تلقائي</div></div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <div className="space-y-3">
          <div className="flex items-center justify-between"><div className="text-sm font-black text-ink-950">الاستنتاجات الموثقة</div><Link to={'/trust?reportJobId=' + encodeURIComponent(report.jobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash)} className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-700">فتح الثقة <ArrowLeft size={13}/></Link></div>
          {decisionClaims.length ? decisionClaims.map((claim) => <ClaimEvidenceCard key={claim.claimId} claim={claim}/>) : <div className="rounded-xl border border-ink-200 bg-white p-5 text-xs text-ink-500">لا توجد Claim جوهرية مثبتة بعد.</div>}
        </div>
        <BusinessQuestionRail questions={packet.questions}/>
      </div>

      <div className="rounded-2xl border border-primary-200 bg-[linear-gradient(135deg,#ffffff,#f5faf8)] p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[9px] font-black tracking-[.14em] text-primary-700">DECISION PATH</div>
            <div className="mt-1 text-sm font-black text-ink-950">لا تتوقف عند التوصية — تابعها حتى العمل والنتيجة</div>
            <p className="mt-1 text-[11px] leading-5 text-ink-600">الانتقال إلى مساحة القرار يبقى مربوطًا بهذا التقرير ومصدره؛ لا يتم إنشاء قرار أو أثر تنفيذي تلقائيًا من هذه الشاشة.</p>
          </div>
          <Link
            to={'/decision-experience?reportJobId=' + encodeURIComponent(report.jobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-700 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-primary-800"
          >
            فتح مساحة القرار <ArrowLeft size={14}/>
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-6" aria-label="رحلة القرار">
          {[
            ['1', 'الدليل', packet.proofState === 'VERIFIED'],
            ['2', 'الفهم', packet.claims.length > 0],
            ['3', 'التوصية', Boolean(packet.nextRecommendation)],
            ['4', 'القرار', false],
            ['5', 'العمل', false],
            ['6', 'النتيجة', packet.outcomeState === 'OBSERVED'],
          ].map(([step, label, done]) => (
            <div key={String(step)} className="rounded-xl border border-ink-100 bg-white px-2 py-3 text-center">
              <div className={"mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black " + (done ? "bg-primary-100 text-primary-800" : "bg-ink-100 text-ink-500")}>
                {done ? '✓' : step}
              </div>
              <div className="mt-2 text-[10px] font-bold text-ink-700">{label}</div>
              <div className="mt-1 text-[9px] text-ink-400">{done ? 'متحقق' : 'لم يُثبت بعد'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-ink-200 bg-white p-4">
        <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary-700"/><div><div className="text-[9px] font-black tracking-[.12em] text-primary-700">NEXT</div><div className="mt-1 text-sm font-black">الخطوة التالية</div></div></div>
        <p className="mt-2 text-xs leading-6 text-ink-600">{packet.nextRecommendation?.statement ?? 'لا توجد توصية مثبتة قابلة للتحويل إلى خطوة الآن.'}</p>
      </div>
    </section>
  );
}
