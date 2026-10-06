import { useCallback, useEffect, useMemo, useState } from 'react';
import { ReportSourceContext } from '@/components/ReportSourceContext';
import { SourceBoundReportSurface } from '@/components/SourceBoundReportSurface';
import { ArrowLeft, FileText, Printer, RefreshCw, ShieldCheck, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchLatestSmartReportBySourceHash, type SmartReportDetail } from '@/lib/report-smart';
import { selectExecutiveRecommendation, selectExecutiveSignal } from '@/lib/report-intelligence/report-smart-insights';
import { formatNumber } from '@/lib/format';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/States';

const PRIMARY_SMART_REPORT_SOURCE_HASH = 'sha256:587f2d3dbdc7ec1ccc8c988ccad72f84b6cf2b794fcbce6711ffe5ecf9d6b313';

function specialtyLabel(value: string | null | undefined): string {
  return value === 'inventory'
    ? 'تقرير المخزون'
    : value === 'sales'
      ? 'تقرير المبيعات'
      : value === 'purchases'
        ? 'تقرير المشتريات'
        : value === 'receivables'
          ? 'تقرير الذمم والتحصيل'
          : value === 'profitability'
            ? 'تقرير الربحية'
            : 'التقرير الحالي';
}

function evidenceLabel(value: unknown): string {
  const text = String(value ?? '').trim();
  if (!text) return 'الدليل غير متاح';
  return text
    .replace(/\bfield\s*=\s*/gi, 'الحقل: ')
    .replace(/\baffectedRows\s*=\s*/gi, 'السجلات المتأثرة: ')
    .replace(/\bnegativeRows\s*=\s*/gi, 'السجلات السالبة: ')
    .replace(/\bzeroRows\s*=\s*/gi, 'السجلات الصفرية: ')
    .replace(/\bstockField\s*=\s*/gi, 'حقل الرصيد: ')
    .replace(/\bdailySalesField\s*=\s*/gi, 'حقل معدل البيع اليومي: ')
    .replace(/\busableRows\s*=\s*/gi, 'السجلات الصالحة: ')
    .replace(/\brows\s*=\s*/gi, 'السجلات: ');
}

function healthLabel(value: string): string {
  return value === 'HEALTHY' ? 'سليم' : value === 'ATTENTION' ? 'يحتاج انتباهًا' : 'المراجعة مطلوبة';
}

function statusLabel(value: unknown): string {
  const text = String(value ?? '').trim();
  const labels: Record<string, string> = {
    VERIFIED: 'موثق',
    TRUSTED: 'موثوق',
    READY: 'جاهز للمراجعة والقرار',
    REVIEW_REQUIRED: 'المراجعة مطلوبة',
    NO_DECISION_COMMITTED: 'لا قرار معتمد بعد',
    NO_ACTION_COMMITTED: 'لا إجراء منفذ بعد',
    AVAILABLE_FROM_CANONICAL_ANALYSIS: 'متاح من التحليل الموثق',
    INSUFFICIENT_SAMPLE: 'عينة غير كافية',
    NOT_AVAILABLE: 'غير متاح',
  };
  return labels[text] ?? (text || 'غير متاح');
}

export function ExecutiveReportPage() {
  const [params] = useSearchParams();
  const reportJobId = params.get('reportJobId')?.trim() ?? '';
  const sourceHash = params.get('sourceHash')?.trim() ?? '';
  if (reportJobId) {
    return <SourceBoundReportSurface mode="executive" jobId={reportJobId} expectedSourceHash={sourceHash} />;
  }
  return <ExecutiveReportGeneralPage />;
}

function ExecutiveReportGeneralPage() {
  const [report, setReport] = useState<SmartReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      let current: SmartReportDetail | null = null;
      let lastError: unknown = null;
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
          current = await fetchLatestSmartReportBySourceHash(
            PRIMARY_SMART_REPORT_SOURCE_HASH,
            { signal: AbortSignal.timeout(25000) },
          );
          lastError = null;
          break;
        } catch (cause) {
          lastError = cause;
          if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 700 * attempt));
        }
      }
      if (!current) {
        throw lastError instanceof Error
          ? lastError
          : new Error('لا يوجد تقرير مصدر حقيقي صالح للعرض.');
      }
      setReport(current);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تحميل التقرير التنفيذي من المصدر الحقيقي.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const selectedSignal = useMemo(
    () => report ? selectExecutiveSignal(report.intelligence) : null,
    [report],
  );
  const selectedRecommendation = useMemo(
    () => report ? selectExecutiveRecommendation(report.intelligence, selectedSignal) : null,
    [report, selectedSignal],
  );

  if (loading) return <LoadingState message="جارٍ بناء التقرير التنفيذي من المصدر الحقيقي..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!report) return <EmptyState title="لا يوجد تقرير تنفيذي صالح" message="لا يتم إنشاء صورة بديلة عندما لا يوجد مصدر حقيقي متاح." action={<Link to="/import" className="btn-primary">إضافة مصدر</Link>} />;

  const advisor = report.intelligence.advisorBrief;
  const visibleRows = report.canonicalRows.slice(0, 8);
  const firstRow = visibleRows[0]?.data ?? {};
  const previewColumns = Object.keys(firstRow).slice(0, 6);

  return (
    <div dir="rtl" className="ag-executive-report report-page space-y-5 pb-10 print:space-y-3">
      <ReportSourceContext />

      <header className="ag-exec-hero overflow-hidden rounded-[18px] border border-[#26344a] bg-[linear-gradient(135deg,#07111f,#153047)] p-5 text-white shadow-elevated lg:p-6">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.14em] text-primary-200">
              <FileText size={15}/> التقرير التنفيذي · مرتبط بالمصدر
            </div>
            <h1 className="mt-2 text-[25px] font-black tracking-tight lg:text-[31px]">{specialtyLabel(report.specialty)}</h1>
            <p className="mt-2 max-w-3xl text-[11px] leading-6 text-slate-300">
              هذه القراءة مبنية على نفس التقرير الحقيقي الذي يحمل البصمة المصدرية الحالية؛ لا يتم استبدال تقرير المخزون بملخص مبيعات عام.
            </p>
          </div>
          <div className="print-hide flex flex-wrap gap-2">
            <button type="button" onClick={() => void load(true)} disabled={refreshing} className="btn-secondary text-xs disabled:opacity-60">
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''}/> تحديث
            </button>
            <button type="button" onClick={() => window.print()} className="btn-primary text-xs">
              <Printer size={17}/> طباعة / PDF
            </button>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-bold">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{report.sourcePath}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{formatNumber(report.authoritativeCurrentRowCount ?? report.rowCount ?? 0)} صفًا</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">جودة المصدر {report.qualityScore == null ? 'غير متاحة' : Math.round(report.qualityScore) + '%'}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{statusLabel(report.evidenceStatus)}</span>
        </div>
      </header>

      <section className="ag-decision-strip" aria-label="ملخص التقرير التنفيذي">
        <div className="ag-decision-cell"><span className="ag-decision-label">السجلات</span><span className="ag-decision-value">{formatNumber(report.authoritativeCurrentRowCount ?? report.rowCount ?? 0)}</span></div>
        <div className="ag-decision-cell"><span className="ag-decision-label">جودة المصدر</span><span className="ag-decision-value">{report.qualityScore == null ? 'غير متاح' : Math.round(report.qualityScore) + '%'}</span></div>
        <div className="ag-decision-cell"><span className="ag-decision-label">الإشارات</span><span className="ag-decision-value">{report.intelligence.signals.length}</span></div>
        <div className="ag-decision-cell"><span className="ag-decision-label">التوصيات</span><span className="ag-decision-value">{report.intelligence.recommendations.length}</span></div>
        <div className="ag-decision-cell"><span className="ag-decision-label">حالة الدليل</span><span className="ag-decision-value">{statusLabel(report.evidenceStatus)}</span></div>
      </section>

      <section className="rounded-[20px] border border-primary-200 bg-white p-5 shadow-card lg:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="section-kicker">موجز الإدارة</div>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-ink-950">{advisor.headline}</h2>
            <p className="mt-2 text-xs leading-6 text-ink-600">{report.intelligence.summary}</p>
          </div>
          <div className="rounded-2xl border border-ink-200 bg-ink-50 p-4 xl:w-64">
            <div className="text-[9px] font-black text-ink-400">حالة الصورة</div>
            <div className="mt-1 text-base font-black text-ink-900">{healthLabel(advisor.health)}</div>
            <div className="mt-1 text-[10px] leading-5 text-ink-500">{advisor.ownerHint}</div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['أهم نتيجة', advisor.topFinding?.title ?? 'لا توجد نتيجة مثبتة', advisor.topFinding?.statement ?? 'لا توجد نتيجة أعمال كافية من المصدر الحالي.'],
            ['أهم خطر', advisor.topRisk?.title ?? 'لا يوجد خطر مثبت', advisor.topRisk?.statement ?? 'لا يوجد خطر أعمال مثبت من البيانات الحالية.'],
            ['أهم فرصة', advisor.topOpportunity?.title ?? 'لا توجد فرصة مثبتة', advisor.topOpportunity?.statement ?? 'لا توجد فرصة قابلة للإثبات حاليًا.'],
            ['الإجراء المقترح', advisor.recommendedAction ?? 'لا يوجد إجراء مؤهل بعد', advisor.expectedOutcome ?? advisor.proofRequirement],
          ].map(([label, title, detail]) => (
            <div key={label} className="rounded-2xl border border-ink-100 bg-white p-4">
              <div className="text-[9px] font-black text-ink-400">{label}</div>
              <div className="mt-2 text-sm font-black text-ink-950">{title}</div>
              <div className="mt-1 text-[10px] leading-5 text-ink-600">{detail}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={'/reports/smart/' + encodeURIComponent(report.jobId) + '?sourceHash=' + encodeURIComponent(report.sourceHash)} className="btn-primary text-[10px]">فتح التقرير الكامل <ArrowLeft size={13}/></Link>
          <Link to={'/trust?reportJobId=' + encodeURIComponent(report.jobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash)} className="btn-secondary text-[10px]">فتح الدليل <ShieldCheck size={13}/></Link>
          <Link to={'/decision-experience?stage=decision&reportJobId=' + encodeURIComponent(report.jobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash)} className="btn-ghost text-[10px]">مساحة القرار <Target size={13}/></Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <article className="rounded-[20px] border border-ink-200 bg-white p-5 shadow-card">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-warning-700"/>
            <div>
              <div className="section-kicker">الإشارة الأعلى أولوية</div>
              <h2 className="mt-1 text-lg font-black text-ink-950">{selectedSignal?.title ?? 'لا توجد إشارة استثنائية مثبتة'}</h2>
            </div>
          </div>
          {selectedSignal ? (
            <>
              <p className="mt-3 text-[11px] leading-6 text-ink-700">{selectedSignal.message}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl bg-ink-50 p-3"><div className="text-[9px] font-black text-ink-400">ما الذي يعنيه ذلك</div><div className="mt-1 text-[10px] leading-5 text-ink-800">{selectedSignal.soWhat}</div></div>
                <div className="rounded-xl bg-amber-50 p-3"><div className="text-[9px] font-black text-amber-700">الأثر</div><div className="mt-1 text-[10px] leading-5 text-amber-900">{selectedSignal.impact}</div></div>
              </div>
              <div className="mt-3 rounded-xl border border-ink-100 bg-white p-3">
                <div className="text-[9px] font-black text-ink-400">الدليل المرتبط</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedSignal.evidence.map((item) => <span key={item} className="rounded-full bg-ink-50 px-2 py-1 text-[8px] font-bold text-ink-700">{evidenceLabel(item)}</span>)}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-[10px]">
                <span className="rounded-full bg-primary-50 px-2.5 py-1 font-black text-primary-800">{selectedSignal.priority === 'P0' ? 'عاجل' : selectedSignal.priority === 'P1' ? 'مرتفع' : selectedSignal.priority === 'P2' ? 'متوسط' : 'منخفض'}</span>
                <span className="text-ink-500">السجلات المتأثرة: {selectedSignal.affectedRows == null ? 'غير متاح' : formatNumber(selectedSignal.affectedRows)}</span>
              </div>
            </>
          ) : (
            <p className="mt-3 rounded-xl bg-ink-50 p-4 text-xs text-ink-600">لا توجد إشارة استثنائية مثبتة من المصدر الحالي.</p>
          )}
        </article>

        <article className="rounded-[20px] border border-primary-200 bg-primary-50/50 p-5 shadow-card">
          <div className="flex items-center gap-2"><TrendingUp size={18} className="text-primary-700"/><div><div className="section-kicker">الإجراء التالي</div><h2 className="mt-1 text-lg font-black text-ink-950">{selectedRecommendation?.title ?? 'مراجعة المصدر'}</h2></div></div>
          <p className="mt-3 text-[11px] leading-6 text-ink-700">{selectedRecommendation?.action ?? advisor.recommendedAction ?? 'لا يوجد إجراء تنفيذي قبل اكتمال التحقق.'}</p>
          <div className="mt-4 space-y-2 text-[10px]">
            <div className="rounded-xl bg-white p-3"><span className="font-black text-ink-500">المسؤول المحتمل:</span> {selectedRecommendation?.ownerHint ?? advisor.ownerHint}</div>
            <div className="rounded-xl bg-white p-3"><span className="font-black text-ink-500">النتيجة المتوقعة:</span> {selectedRecommendation?.expectedOutcome ?? advisor.expectedOutcome ?? 'غير متاح'}</div>
            <div className="rounded-xl bg-white p-3"><span className="font-black text-ink-500">حد الدليل:</span> {advisor.proofRequirement}</div>
          </div>
        </article>
      </section>

      <section className="rounded-[20px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
        <div className="flex items-center justify-between gap-3">
          <div><div className="section-kicker">المصدر</div><h2 className="mt-1 text-lg font-black text-ink-950">عينة فعلية من التقرير</h2></div>
          <span className="text-[10px] text-ink-500">{formatNumber(visibleRows.length)} صفوف معروضة</span>
        </div>
        {visibleRows.length === 0 ? (
          <div className="mt-4 rounded-xl border border-warning-200 bg-warning-50 p-4 text-xs text-warning-900">لا توجد عينة صفوف مثبتة في القراءة الحالية.</div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-ink-200">
            <table className="min-w-full text-right text-[10px]">
              <thead className="bg-ink-50">
                <tr>{previewColumns.map((column) => <th key={column} className="whitespace-nowrap px-3 py-2 font-black text-ink-600">{column}</th>)}</tr>
              </thead>
              <tbody>
                {visibleRows.map((row, index) => (
                  <tr key={row.row_number ?? index} className="border-t border-ink-100">
                    {previewColumns.map((column) => <td key={column} className="max-w-[220px] truncate whitespace-nowrap px-3 py-2 text-ink-800">{String(row.data?.[column] ?? 'غير متاح')}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-[20px] border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-center gap-2 text-amber-900"><Target size={18}/><h2 className="font-black">حدود التقرير</h2></div>
        <p className="mt-2 text-[11px] leading-6 text-amber-900">{advisor.proofRequirement} لا يتم تحويل غياب القرار أو النتيجة الفعلية إلى نجاح أو أثر مالي افتراضي.</p>
      </section>
    </div>
  );
}
