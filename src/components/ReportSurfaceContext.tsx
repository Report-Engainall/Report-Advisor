import { Link } from 'react-router-dom';

export type ReportTruthStatus = 'CALCULATED' | 'INSUFFICIENT DATA' | 'REVIEW';

interface ReportSurfaceContextProps {
  companyName: string;
  period: string;
  currency: string | null;
  asOf: string;
  status: ReportTruthStatus;
  sourceLabel: string;
}

const statusMeta: Record<ReportTruthStatus, { label: string; className: string }> = {
  CALCULATED: { label: 'CALCULATED · محسوب من المصدر', className: 'border-success-200 bg-success-50 text-success-800' },
  'INSUFFICIENT DATA': { label: 'INSUFFICIENT DATA · بيانات غير كافية', className: 'border-warning-200 bg-warning-50 text-warning-900' },
  REVIEW: { label: 'REVIEW · يحتاج مراجعة', className: 'border-warning-200 bg-warning-50 text-warning-900' },
};

export function ReportSurfaceContext({ companyName, period, currency, asOf, status, sourceLabel }: ReportSurfaceContextProps) {
  const meta = statusMeta[status];
  return (
    <section aria-label="سياق التقرير والحقيقة" className="rounded-2xl border border-ink-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-primary-700">REPORT TRUTH CONTEXT</div>
          <p className="mt-1 text-sm font-black text-ink-900">السطح مرتبط بالمصدر الحالي ولا يُنشئ أرقامًا بديلة عند نقص الدليل.</p>
          <p className="mt-1 text-xs text-ink-500">{sourceLabel}</p>
        </div>
        <Link to="/trust" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-ink-200 px-3 text-xs font-bold text-ink-700 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400">
          فحص الدليل
        </Link>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] sm:grid-cols-3 xl:grid-cols-5">
        <div className="rounded-xl bg-ink-50 px-3 py-2"><div className="text-ink-400">الشركة</div><div className="mt-1 truncate font-bold text-ink-800">{companyName || 'غير متاح'}</div></div>
        <div className="rounded-xl bg-ink-50 px-3 py-2"><div className="text-ink-400">الفترة</div><div className="mt-1 font-bold text-ink-800">{period}</div></div>
        <div className="rounded-xl bg-ink-50 px-3 py-2"><div className="text-ink-400">العملة</div><div className="mt-1 font-bold text-ink-800">{currency || 'غير متاحة'}</div></div>
        <div className="rounded-xl bg-ink-50 px-3 py-2"><div className="text-ink-400">As Of</div><div className="mt-1 font-bold text-ink-800">{asOf}</div></div>
        <div className={'rounded-xl border px-3 py-2 font-bold ' + meta.className}><div className="opacity-70">حالة الحقيقة</div><div className="mt-1">{meta.label}</div></div>
      </div>
    </section>
  );
}
