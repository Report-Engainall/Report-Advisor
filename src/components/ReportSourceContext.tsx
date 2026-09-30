import { useEffect, useState } from 'react';
import { ArrowLeft, FileSearch, ShieldCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchSmartReport, type SmartReportDetail } from '@/lib/report-smart';
import { formatNumber } from '@/lib/format';

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
  const jobId = params.get('reportJobId')?.trim() ?? '';
  const sourceHash = params.get('sourceHash')?.trim() ?? '';
  const [report, setReport] = useState<SmartReportDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setReport(null);
      setError(null);
      return;
    }
    let active = true;
    setError(null);
    void fetchSmartReport(jobId).then((value) => {
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
  }, [jobId, sourceHash]);

  if (!jobId) return null;

  if (error || !report) {
    return (
      <section dir="rtl" className="rounded-2xl border border-warning-200 bg-warning-50/80 p-4" role="status">
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-warning-800" />
          <div className="min-w-0">
            <div className="text-[11px] font-black text-warning-950">سياق المصدر غير متاح</div>
            <p className="mt-1 text-[11px] leading-5 text-warning-900/80">{error ?? 'تعذر قراءة التقرير المصدرّي الحالي.'}</p>
            <Link to="/reports" className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[10px] font-black text-warning-950">العودة إلى مركز التقارير <ArrowLeft size={13}/></Link>
          </div>
        </div>
      </section>
    );
  }

  const domain = report?.specialty ? DOMAIN_PATHS[report.specialty] : null;
  const contextLinks = report
    ? [
        { path: '/reports/smart/' + report.jobId, label: 'التقرير الذكي' },
        { path: '/reports/executive', label: 'التقرير التنفيذي' },
        { path: '/trust', label: 'الأدلة والثقة' },
        { path: '/decision-experience?stage=evidence', label: 'مساحة القرار' },
        { path: '/work-center', label: 'مركز العمل' },
        ...(domain ? [{ path: domain.path, label: domain.label }] : []),
      ].map((item) => {
        const [pathname, query = ''] = item.path.split('?');
        const next = new URLSearchParams(query);
        next.set('reportJobId', report.jobId);
        next.set('sourceHash', report.sourceHash);
        return { ...item, href: pathname + '?' + next.toString() };
      })
    : [];

  return (
    <section dir="rtl" className="rounded-[18px] border border-primary-200 bg-primary-50/50 p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-[.12em] text-primary-800">
            <FileSearch size={14}/> SOURCE-BOUND CONTEXT
          </div>
          <div className="mt-1 truncate text-sm font-black text-ink-950" title={report.sourcePath}>{report.sourcePath}</div>
          <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-ink-500">
            <span>التخصص: {report.specialty ?? 'عام'}</span>
            <span>·</span>
            <span>الصفوف: {report.rowCount == null ? 'غير متاح' : formatNumber(report.rowCount)}</span>
            <span>·</span>
            <span>الجودة: {report.qualityScore == null ? 'غير متاح' : report.qualityScore + '%'}</span>
            <span>·</span>
            <span>الثقة: {stateLabel(report.trustState)}</span>
            <span>·</span>
            <span>الدليل: {stateLabel(report.evidenceStatus)}</span>
          </div>
          <div className="mt-2 break-all font-mono text-[9px] text-ink-400">{report.sourceHash}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {contextLinks.map((item, index) => (
            <Link
              key={item.href}
              to={item.href}
              className={'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-black transition ' + (index === 0 ? 'bg-ink-950 text-white hover:bg-ink-800' : 'border border-primary-200 bg-white text-primary-900 hover:bg-primary-100')}
            >
              {item.label}<ArrowLeft size={12}/>
            </Link>
          ))}
        </div>
      </div>
      <p className="mt-3 border-t border-primary-200 pt-3 text-[10px] leading-5 text-primary-900/80">
        هذه الشاشة مفتوحة من تقرير محدد. أي مؤشرات عامة أدناه لا تُعاد تسميتها إلى مؤشرات المصدر؛ المخرجات المصدرية المؤكدة تبقى مرتبطة بهذا Job والبصمة الأصلية.
      </p>
    </section>
  );
}
