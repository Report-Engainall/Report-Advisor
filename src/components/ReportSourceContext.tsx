import { useEffect, useState } from 'react';
import { ArrowLeft, FileSearch, ShieldCheck, AlertTriangle, CheckCircle2, TrendingUp, Lightbulb } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchSmartReport, type SmartReportDetail } from '@/lib/report-smart';
import { formatNumber } from '@/lib/format';
import { readActiveReportContext, saveActiveReportContext } from '@/lib/report-context';

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
  const saved = readActiveReportContext();
  const jobId = params.get('reportJobId')?.trim() || saved?.jobId || '';
  const sourceHash = params.get('sourceHash')?.trim() || saved?.sourceHash || '';
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
      if (value) saveActiveReportContext({ jobId: value.jobId, sourceHash: value.sourceHash });
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
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-ink-200 bg-white p-3">
          <div className="flex items-center gap-2 text-[9px] font-black text-ink-500"><AlertTriangle size={13} className="text-warning-700"/> الإشارات</div>
          <div className="mt-1 text-sm font-black text-ink-950">{report.intelligence.signals.length}</div>
          <div className="mt-1 text-[10px] leading-4 text-ink-500">{report.intelligence.signals[0]?.title ?? 'لا توجد إشارة استثنائية مثبتة'}</div>
        </div>
        <div className="rounded-xl border border-ink-200 bg-white p-3">
          <div className="flex items-center gap-2 text-[9px] font-black text-ink-500"><Lightbulb size={13} className="text-primary-700"/> التوصيات</div>
          <div className="mt-1 text-sm font-black text-ink-950">{report.intelligence.recommendations.length}</div>
          <div className="mt-1 text-[10px] leading-4 text-ink-500">{report.intelligence.recommendations[0]?.action ?? 'لا توجد توصية مصدرية كافية حاليًا'}</div>
        </div>
        <div className="rounded-xl border border-ink-200 bg-white p-3">
          <div className="flex items-center gap-2 text-[9px] font-black text-ink-500"><TrendingUp size={13} className="text-primary-700"/> التنبؤ</div>
          <div className="mt-1 text-sm font-black text-ink-950">{report.intelligence.forecast.status === 'AVAILABLE' ? 'متاح' : 'عينة غير كافية'}</div>
          <div className="mt-1 text-[10px] leading-4 text-ink-500">{report.intelligence.forecast.status === 'AVAILABLE' ? 'الفترة التالية: ' + (report.intelligence.forecast.nextPeriod ?? 'غير متاح') : report.intelligence.forecast.note}</div>
        </div>
        <div className="rounded-xl border border-ink-200 bg-white p-3">
          <div className="flex items-center gap-2 text-[9px] font-black text-ink-500"><CheckCircle2 size={13} className="text-success-700"/> الإرشاد</div>
          <div className="mt-1 text-sm font-black text-ink-950">{report.intelligence.advisorBrief.health === 'HEALTHY' ? 'سليم' : report.intelligence.advisorBrief.health === 'ATTENTION' ? 'يحتاج انتباهًا' : 'مراجعة مطلوبة'}</div>
          <div className="mt-1 text-[10px] leading-4 text-ink-500">{report.intelligence.guidance.focus}</div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to={'/reports/smart/' + encodeURIComponent(report.jobId) + '?sourceHash=' + encodeURIComponent(report.sourceHash)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-700 px-3 py-2 text-[10px] font-black text-white"
        >
          افتح كل طبقات الذكاء <ArrowLeft size={12}/>
        </Link>
        <Link
          to={'/intelligence/recommendations?reportJobId=' + encodeURIComponent(report.jobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-white px-3 py-2 text-[10px] font-black text-primary-900"
        >
          التوصيات <ArrowLeft size={12}/>
        </Link>
        <Link
          to={'/intelligence/forecasts?reportJobId=' + encodeURIComponent(report.jobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-white px-3 py-2 text-[10px] font-black text-primary-900"
        >
          التنبؤات <ArrowLeft size={12}/>
        </Link>
      </div>
      <p className="mt-4 border-t border-primary-200 pt-3 text-[10px] leading-5 text-primary-900/80">
        هذه الشاشة مفتوحة من تقرير محدد. كل طبقات الذكاء أعلاه مشتقة من نفس Report Job؛ المؤشرات العامة أدناه لا تُعاد تسميتها إلى مؤشرات المصدر.
      </p>
    </section>
  );
}
