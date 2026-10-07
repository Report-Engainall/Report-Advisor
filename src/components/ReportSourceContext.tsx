import { useEffect, useState } from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { fetchSmartReport, type SmartReportDetail } from '@/lib/report-smart';
import { formatNumber } from '@/lib/format';
import { selectExecutiveRecommendation, selectExecutiveSignal } from '@/lib/report-intelligence/report-smart-insights';
import { IntelligenceResultRail } from '@/components/IntelligenceResultRail';

const DOMAIN_PATHS: Record<string, { path: string; label: string }> = {
  sales: { path: '/reports/sales', label: 'تقرير المبيعات' },
  purchases: { path: '/reports/purchases', label: 'تقرير المشتريات' },
  inventory: { path: '/reports/inventory', label: 'تقرير المخزون' },
  payments: { path: '/analytics/liquidity', label: 'تحليل المدفوعات والسيولة' },
  receivables: { path: '/reports/receivables', label: 'تقرير الذمم المدينة' },
  profitability: { path: '/reports/profitability', label: 'تقرير الربحية' },
};

function stateLabel(value: string | null): string {
  if (!value) return 'غير متاح';
  const labels: Record<string, string> = {
    TRUSTED: 'موثوق',
    REVIEW: 'مراجعة',
    BLOCKED: 'محظور',
    VERIFIED: 'موثق',
    AWAITING_EVIDENCE_SNAPSHOT: 'بانتظار لقطة الدليل',
    INSUFFICIENT_SAMPLE: 'عينة غير كافية',
    NOT_AVAILABLE: 'غير متاح',
  };
  return labels[value] ?? value;
}

export function ReportSourceContext() {
  const [params] = useSearchParams();
  const location = useLocation();
  const jobId = params.get('reportJobId')?.trim() || '';
  const sourceHash = params.get('sourceHash')?.trim() || '';
  const validSourceHash = /^sha256:[0-9a-fA-F]{64}$/.test(sourceHash);
  const [report, setReport] = useState<SmartReportDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId || !validSourceHash) {
      setReport(null);
      setError(jobId ? 'مصدر التقرير يحتاج بصمة صالحة.' : null);
      return;
    }
    let active = true;
    setError(null);
    void fetchSmartReport(jobId, sourceHash).then((value) => {
      if (!active) return;
      if (value && sourceHash && value.sourceHash !== sourceHash) {
        setReport(null);
        setError('مصدر التقرير لا يطابق البصمة المرسلة إلى هذه الشاشة.');
        return;
      }
      setReport(value);
    }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : String(cause));
    });
    return () => { active = false; };
  }, [jobId, sourceHash, validSourceHash]);

  if (!jobId || !validSourceHash) return null;

  if (error || !report) {
    return (
      <section dir="rtl" className="rounded-2xl border border-warning-200 bg-warning-50/80 p-4" role="status">
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-warning-800" />
          <div className="min-w-0">
            <div className="text-[11px] font-black text-warning-950">سياق المصدر غير متاح</div>
            <p className="mt-1 text-[11px] leading-5 text-warning-900/80">{error === 'INVALID_REPORT_CONTEXT' ? 'تعذر تحديد سياق التقرير الحالي. افتح التقرير من مركز التقارير.' : error ?? 'تعذر قراءة التقرير المصدرّي الحالي.'}</p>
            <Link to="/reports" className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[10px] font-black text-warning-950">العودة إلى مركز التقارير <ArrowLeft size={13}/></Link>
          </div>
        </div>
      </section>
    );
  }

  if (location.pathname.startsWith('/reports/smart/')) return null;

  const domain = report?.specialty ? DOMAIN_PATHS[report.specialty] : null;
  const signal = selectExecutiveSignal(report.intelligence);
  const recommendation = selectExecutiveRecommendation(report.intelligence, signal);
  const evidence = signal?.evidence ?? recommendation?.evidence ?? [];
  return (
    <div className="mb-4 space-y-3">
      <IntelligenceResultRail
        sourceLabel={report.sourcePath || 'التقرير الحالي'}
        headline={signal?.message ?? report.intelligence.advisorBrief.headline ?? 'لا يوجد حكم استشاري مثبت من المصدر الحالي.'}
        signalTitle={signal?.title ?? 'لا توجد إشارة مؤهلة'}
        signalMessage={signal?.message ?? report.intelligence.summary ?? 'لا توجد نتيجة استثنائية مثبتة من المصدر الحالي.'}
        evidence={evidence}
        whyNow={recommendation?.whyNow ?? signal?.soWhat ?? 'لا توجد قرينة كافية لتحديد أولوية إضافية.'}
        recommendationTitle={recommendation?.title ?? 'مراجعة الدليل قبل إنشاء توصية'}
        recommendationAction={recommendation?.action ?? report.intelligence.advisorBrief.recommendedAction ?? 'لا يوجد إجراء تنفيذي مؤهل قبل اكتمال الدليل.'}
        measurement={recommendation?.measurement ?? report.intelligence.advisorBrief.measurement ?? 'لا توجد آلية قياس مثبتة بعد.'}
        blocker={recommendation?.blocker ?? report.intelligence.advisorBrief.proofRequirement ?? 'اعتماد الدليل النهائي غير مثبت.'}
        status={report.reportVerificationState === 'VERIFIED' ? 'الدليل موثق' : report.sourceTrustState === 'TRUSTED' ? 'الذكاء متاح · الاعتماد النهائي يحتاج مراجعة' : 'المراجعة مطلوبة'}
        href={'/reports/smart/' + encodeURIComponent(report.jobId) + '?sourceHash=' + encodeURIComponent(report.sourceHash)}
        hrefLabel="التقرير الذكي الكامل"
      />

      <section dir="rtl" className="report-context-compact rounded-2xl border border-primary-200/70 bg-white/90 px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-ink-950 px-2.5 py-1 text-[9px] font-black text-white">السياق الحالي</span>
            <span className="truncate text-sm font-black text-ink-950">{report.specialty ? (DOMAIN_PATHS[report.specialty]?.label ?? 'تحليل أعمال') : 'تحليل أعمال ذكي'}</span>
            <span className="text-[10px] text-ink-400">·</span>
            <span className="text-[10px] font-bold text-ink-600">{report.rowCount == null ? 'حجم المصدر غير متاح' : formatNumber(report.rowCount) + ' صفًا'}</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-ink-500">
            <span>{report.rowCount == null ? 'عدد الصفوف غير متاح' : formatNumber(report.rowCount) + ' صف'}</span>
            <span>·</span>
            <span>الجودة {report.qualityScore == null ? 'غير متاح' : report.qualityScore + '%'}</span>
            <span>·</span>
            <span>الثقة {stateLabel(report.trustState)}</span>
            <span>·</span>
            <span>الدليل {stateLabel(report.evidenceStatus)}</span>
            <span>·</span>
            <span>المصدر الأصلي محفوظ للتدقيق</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={'/reports/smart/' + encodeURIComponent(report.jobId) + '?sourceHash=' + encodeURIComponent(report.sourceHash)} className="btn-primary text-[10px]">التقرير الذكي</Link>
          <Link to={'/trust?reportJobId=' + encodeURIComponent(report.jobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash)} className="btn-secondary text-[10px]">الدليل</Link>
          <Link to={'/decision-experience?stage=evidence&reportJobId=' + encodeURIComponent(report.jobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash)} className="btn-secondary text-[10px]">القرار</Link>
          {domain ? <Link to={domain.path + '?reportJobId=' + encodeURIComponent(report.jobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash)} className="btn-secondary text-[10px]">{domain.label}</Link> : null}
        </div>
      </div>
      </section>
    </div>
  );
}
