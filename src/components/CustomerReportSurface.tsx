import { AlertTriangle, ArrowLeft, FileText, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { SmartReportDetail } from '@/lib/report-smart';

const SPECIALTY_LABELS: Record<string, string> = {
  sales: 'المبيعات',
  purchases: 'المشتريات',
  inventory: 'المخزون',
  receivables: 'الذمم والتحصيل',
  profitability: 'الربحية',
  payments: 'المدفوعات والسيولة',
};

const FIELD_LABELS: Record<string, string> = {
  product_name: 'الصنف',
  item_name: 'الصنف',
  item: 'الصنف',
  product: 'الصنف',
  customer_name: 'العميل',
  customer: 'العميل',
  supplier_name: 'المورد',
  supplier: 'المورد',
  invoice_number: 'رقم الفاتورة',
  invoice_date: 'تاريخ الفاتورة',
  due_date: 'تاريخ الاستحقاق',
  quantity: 'الكمية',
  qty: 'الكمية',
  amount: 'المبلغ',
  total_amount: 'الإجمالي',
  local_amount: 'الإجمالي',
  total: 'الإجمالي',
  paid_amount: 'المدفوع',
  balance: 'المتبقي',
  outstanding_balance: 'الرصيد المستحق',
  current_stock: 'المخزون الحالي',
  stock: 'المخزون',
  unit_cost: 'تكلفة الوحدة',
  cost: 'التكلفة',
  value: 'القيمة',
  sales: 'المبيعات',
  purchases: 'المشتريات',
  profit: 'الربح',
  gross_profit: 'الربح الإجمالي',
  margin: 'الهامش',
  gross_margin: 'الهامش الإجمالي',
  category: 'الفئة',
  warehouse: 'المستودع',
  date: 'التاريخ',
  status: 'الحالة',
};

function compactFieldLabel(value: unknown): string {
  const key = String(value ?? '').trim();
  if (!key) return 'حقل';
  const normalized = key.toLowerCase().replace(/[\\s_-]+/g, '');
  const match = Object.entries(FIELD_LABELS).find(([candidate]) =>
    normalized === candidate.toLowerCase().replace(/[\\s_-]+/g, ''),
  );
  return match?.[1] ?? 'مؤشر تشغيلي';
}

function reportTitle(report: SmartReportDetail): string {
  const label = SPECIALTY_LABELS[report.specialty ?? ''];
  return label ? 'تقرير ' + label : 'تقرير أعمال ذكي';
}

function reportContextLabel(report: SmartReportDetail): string {
  const specialty = SPECIALTY_LABELS[report.specialty ?? ''] ?? 'تحليل أعمال';
  return 'تحليل ' + specialty + ' من المصدر الحالي';
}

function friendlyState(value: unknown): string {
  const labels: Record<string, string> = {
    VERIFIED: 'موثق',
    TRUSTED: 'موثوق',
    REVIEW: 'مراجعة مطلوبة',
    BLOCKED: 'محظور',
    PROPOSED: 'مقترح',
    APPROVED: 'معتمد',
    REJECTED: 'مرفوض',
    COMPLETED: 'مكتمل',
    IN_PROGRESS: 'قيد التنفيذ',
    OPEN: 'مفتوح',
    PENDING: 'بانتظار الإجراء',
    NOT_AVAILABLE: 'غير متاح',
    INSUFFICIENT_SAMPLE: 'العينة غير كافية',
    INSUFFICIENT_DATA: 'البيانات غير كافية',
  };
  const key = String(value ?? '').trim();
  return labels[key] ?? (key ? 'حالة مسجلة' : 'غير متاح');
}

function parseNumeric(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const normalized = value
      .replace(/٬/g, '')
      .replace(/,/g, '')
      .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
    const number = Number(normalized);
    return Number.isFinite(number) ? number : null;
  }
  return null;
}

function numericColumns(report: SmartReportDetail) {
  const dataset = report.sourceAnalysis?.datasets?.[0];
  const columns = dataset && typeof dataset === 'object' && Array.isArray((dataset as Record<string, unknown>).columns)
    ? (dataset as Record<string, unknown>).columns as Array<Record<string, unknown>>
    : [];

  return columns
    .map((column) => {
      const statistics = column.statistics && typeof column.statistics === 'object' ? column.statistics as Record<string, unknown> : {};
      const value = parseNumeric(statistics.sum ?? statistics.mean);
      const mappedField = String(column.mappedField ?? column.name ?? '').trim();
      return { column, mappedField, value };
    })
    .filter((item) => item.value != null && item.mappedField)
    .slice(0, 8);
}

function contributionRows(report: SmartReportDetail) {
  const dataset = report.sourceAnalysis?.datasets?.[0];
  const columns = dataset && typeof dataset === 'object' && Array.isArray((dataset as Record<string, unknown>).columns)
    ? (dataset as Record<string, unknown>).columns as Array<Record<string, unknown>>
    : [];
  const rows = report.canonicalRows
    .filter((row) => row && row.data && typeof row.data === 'object')
    .map((row) => row.data as Record<string, unknown>);

  const dimension = columns.find((column) => {
    const mapped = String(column.mappedField ?? '').toLowerCase();
    return ['product_name', 'item_name', 'customer_name', 'supplier_name', 'category', 'warehouse'].includes(mapped);
  });
  const measure = columns.find((column) => {
    const mapped = String(column.mappedField ?? '').toLowerCase();
    return ['amount', 'total_amount', 'local_amount', 'sales', 'purchase', 'profit', 'value', 'outstanding_balance'].includes(mapped);
  });

  if (!dimension || !measure) return [];
  const dimensionKey = String(dimension.name ?? dimension.mappedField ?? '');
  const measureKey = String(measure.name ?? measure.mappedField ?? '');
  return rows
    .map((row) => ({
      name: String(row[dimensionKey] ?? '').trim(),
      value: parseNumeric(row[measureKey]),
    }))
    .filter((row) => row.name && row.value != null)
    .sort((a, b) => Number(b.value) - Number(a.value))
    .slice(0, 6);
}

export function CustomerReportSurface({
  report,
  expectedSpecialty,
  title,
}: {
  report: SmartReportDetail;
  expectedSpecialty: string;
  title: string;
}) {
  const actualMatches = report.specialty === expectedSpecialty;
  const displayTitle = actualMatches ? 'تقرير ' + title : reportTitle(report);
  const metrics = numericColumns(report);
  const contributors = contributionRows(report);
  const advisor = report.intelligence.advisorBrief;
  const topSignal = report.intelligence.signals[0] ?? null;
  const topRecommendation = report.intelligence.recommendations[0] ?? null;
  const dataset = report.sourceAnalysis?.datasets?.[0];
  const rawColumns = dataset && typeof dataset === 'object' && Array.isArray((dataset as Record<string, unknown>).columns)
    ? (dataset as Record<string, unknown>).columns as Array<Record<string, unknown>>
    : [];

  return (
    <div dir="rtl" className="report-page space-y-5 animate-fade-in pb-12">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0d1424] p-5 text-white shadow-[0_24px_70px_-36px_rgba(15,23,42,.9)] lg:p-7">
        <div className="pointer-events-none absolute -left-12 -top-16 h-44 w-44 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-52 w-52 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 text-[9px] font-black tracking-[.16em] text-amber-200">
            <FileText size={14} /> REPORT ADVISOR
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 tracking-normal text-slate-300">مصدر محدد</span>
          </div>
          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-black tracking-tight lg:text-4xl">{displayTitle}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">{reportContextLabel(report)} — ما يراه العميل هنا هو معنى التقرير وقرار الأعمال، وليس أسماء أعمدة الملف الخام.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={'/reports/smart/' + encodeURIComponent(report.jobId) + '?sourceHash=' + encodeURIComponent(report.sourceHash)} className="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-4 py-2.5 text-xs font-black text-[#111827] hover:bg-amber-200">فتح التقرير الذكي <ArrowLeft size={14} /></Link>
              <Link to={'/decision-experience?stage=evidence&reportJobId=' + encodeURIComponent(report.jobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-black text-white hover:bg-white/10">الدليل والقرار <ArrowLeft size={14} /></Link>
            </div>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5"><div className="text-[9px] text-slate-400">سجلات التقرير</div><div className="mt-1 text-xl font-black">{report.rowCount == null ? 'غير متاح' : formatNumber(report.rowCount)}</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5"><div className="text-[9px] text-slate-400">جودة المصدر</div><div className="mt-1 text-xl font-black">{report.qualityScore == null ? 'غير متاح' : report.qualityScore + '%'}</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5"><div className="text-[9px] text-slate-400">الثقة</div><div className="mt-1 text-xl font-black">{friendlyState(report.trustState ?? report.sourceTrustState)}</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5"><div className="text-[9px] text-slate-400">حالة القرار</div><div className="mt-1 text-xl font-black">{friendlyState(report.renderedOutput.decisionStatus)}</div></div>
          </div>
        </div>
      </section>

      {!actualMatches && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-950">
          المصدر الحالي مصنّف كـ{SPECIALTY_LABELS[report.specialty ?? ''] ?? 'تحليل عام'}؛ لم يتم تحويله إلى تقرير {title} غير مثبت.
        </section>
      )}

      <section className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-[.12em] text-indigo-700"><Sparkles size={15} /> EXECUTIVE READ</div>
          <h2 className="mt-2 text-xl font-black text-slate-950">ماذا يعني التقرير للإدارة؟</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">{advisor?.headline ?? 'لا توجد خلاصة استشارية مثبتة بعد؛ يعرض النظام ما يمكن إثباته فقط ولا يملأ الفراغ بتخمين.'}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-[9px] font-black text-slate-400">أهم نتيجة</div><div className="mt-1 text-sm font-black text-slate-950">{advisor?.topFinding?.title ?? 'لا توجد نتيجة مثبتة'}</div><p className="mt-1 text-[10px] leading-5 text-slate-600">{advisor?.topFinding?.statement ?? 'لا توجد قراءة كافية من المصدر الحالي.'}</p></div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4"><div className="flex items-center gap-1 text-[9px] font-black text-amber-800"><AlertTriangle size={12}/> أهم خطر</div><div className="mt-1 text-sm font-black text-amber-950">{advisor?.topRisk?.title ?? 'لا يوجد خطر مثبت'}</div><p className="mt-1 text-[10px] leading-5 text-amber-900">{advisor?.topRisk?.statement ?? 'لا يوجد خطر يمكن إثباته من البيانات الحالية.'}</p></div>
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4"><div className="text-[9px] font-black text-indigo-800">الخطوة التالية</div><div className="mt-1 text-sm font-black text-slate-950">{topRecommendation?.title ?? advisor?.recommendedAction ?? 'تحقق من الدليل'}</div><p className="mt-1 text-[10px] leading-5 text-slate-600">{topRecommendation?.action ?? advisor?.expectedOutcome ?? 'لا يوجد إجراء مؤهل قبل اكتمال الإثبات.'}</p></div>
          </div>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-[.12em] text-slate-500"><ShieldCheck size={15} /> TRUST</div>
          <h2 className="mt-2 text-xl font-black text-slate-950">هل يصلح التقرير لاتخاذ قرار؟</h2>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[9px] text-slate-400">حالة الإثبات</div>
            <div className="mt-1 text-lg font-black text-slate-950">{friendlyState(report.reportVerificationState ?? report.evidenceStatus)}</div>
            <div className="mt-1 text-[10px] leading-5 text-slate-600">لا تتحول القراءة إلى توصية تنفيذية عندما يكون المصدر غير مكتمل أو غير موثق.</div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-slate-50 p-3"><div className="text-[9px] text-slate-400">التحليل</div><div className="mt-1 text-sm font-black">{friendlyState(report.sourceAnalysis?.analysisStatus)}</div></div>
            <div className="rounded-xl bg-slate-50 p-3"><div className="text-[9px] text-slate-400">اعتماد السجلات</div><div className="mt-1 text-sm font-black">{report.canonicalCommitVerified ? 'موثق' : 'غير مكتمل'}</div></div>
          </div>
        </div>
      </section>

      <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div><div className="text-[10px] font-black tracking-[.12em] text-indigo-700">BUSINESS METRICS</div><h2 className="mt-1 text-xl font-black text-slate-950">الأرقام التي تهم القرار</h2><p className="mt-1 text-[10px] text-slate-500">تُعرض بأسماء أعمال مفهومة بدل أسماء الأعمدة الخام.</p></div>
          <div className="text-[10px] font-bold text-slate-400">{metrics.length} مؤشرات رئيسية</div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.slice(0, 4).map(({ mappedField, value }, index) => (
            <div key={mappedField + index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[10px] font-bold text-slate-500">{compactFieldLabel(mappedField)}</div>
              <div className="mt-2 text-2xl font-black tabular-nums text-slate-950">{/amount|total|sales|purchase|profit|value|balance|cost|revenue|مبلغ|إجمالي|مبيعات|مشتريات|ربح|قيمة|رصيد|تكلفة/i.test(mappedField) ? formatCurrency(value) : formatNumber(value)}</div>
            </div>
          ))}
          {!metrics.length && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 sm:col-span-2 lg:col-span-4">لا يوجد مؤشر مالي أو تشغيلي مكتمل بما يكفي لعرضه كحقيقة رقمية.</div>}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-[10px] font-black tracking-[.12em] text-indigo-700">DECISION PATH</div>
          <h2 className="mt-1 text-xl font-black text-slate-950">من الحقيقة إلى التنفيذ</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ['الدليل', friendlyState(report.evidenceStatus)],
              ['التوصية', friendlyState(report.renderedOutput.recommendationStatus)],
              ['القرار', friendlyState(report.renderedOutput.decisionStatus)],
              ['النتيجة', friendlyState(report.renderedOutput.outcomeStatus)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="text-[9px] text-slate-400">{label}</div><div className="mt-1 text-sm font-black text-slate-950">{value}</div></div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to={'/decision-experience?stage=evidence&reportJobId=' + encodeURIComponent(report.jobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash)} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-[10px] font-black text-white">فتح الدليل والقرار <ArrowLeft size={13}/></Link>
            <Link to="/work-center" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-[10px] font-black text-slate-800">مركز العمل <ArrowLeft size={13}/></Link>
          </div>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-[#111827] p-5 text-white shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-[.12em] text-amber-200"><TrendingUp size={14}/> SIGNAL</div>
          <h2 className="mt-1 text-xl font-black">أقوى إشارة في التقرير</h2>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-black">{topSignal?.title ?? 'لا توجد إشارة استثنائية مثبتة'}</div>
            <p className="mt-2 text-[11px] leading-6 text-slate-300">{topSignal?.message ?? 'المصدر الحالي لم يثبت انحرافًا يستحق رفعه كتنبيه.'}</p>
            <div className="mt-3 rounded-xl bg-white/5 p-3"><div className="text-[9px] font-black text-amber-200">WHAT NEXT</div><div className="mt-1 text-[10px] leading-5 text-slate-200">{topRecommendation?.action ?? 'لا إجراء قبل مراجعة الدليل.'}</div></div>
          </div>
        </div>
      </section>

      <details className="group rounded-[22px] border border-slate-200 bg-white shadow-sm">
        <summary className="cursor-pointer list-none px-5 py-4 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><div className="text-[10px] font-black tracking-[.12em] text-slate-500">EVIDENCE DETAIL</div><div className="mt-1 text-base font-black text-slate-950">تفاصيل المصدر عند الحاجة فقط</div><div className="mt-1 text-[10px] text-slate-500">التفاصيل الخام ليست الواجهة الرئيسية للعميل.</div></div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[9px] font-black text-slate-600">عرض الدليل</span>
          </div>
        </summary>
        <div className="border-t border-slate-100 p-5 lg:p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3"><div className="text-[9px] text-slate-400">نوع المصدر</div><div className="mt-1 text-sm font-black">{report.sourceAnalysis?.sourceFormat ?? 'غير متاح'}</div></div>
            <div className="rounded-xl bg-slate-50 p-3"><div className="text-[9px] text-slate-400">الحقول المكتشفة</div><div className="mt-1 text-sm font-black">{rawColumns.length}</div></div>
            <div className="rounded-xl bg-slate-50 p-3"><div className="text-[9px] text-slate-400">حالة الكاننة</div><div className="mt-1 text-sm font-black">{report.canonicalCommitVerified ? 'مكتملة' : 'تحتاج مراجعة'}</div></div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {rawColumns.slice(0, 12).map((column, index) => (
              <span key={String(column.name ?? index)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-black text-slate-700">{compactFieldLabel(column.mappedField ?? column.name)}</span>
            ))}
          </div>
          {contributors.length ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[10px] font-black text-slate-500">أبرز المساهمين بالقيمة</div>
              <div className="mt-3 space-y-2">
                {contributors.map((row, index) => (
                  <div key={row.name + index} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5"><span className="truncate text-xs font-bold text-slate-800">{row.name}</span><span className="shrink-0 text-xs font-black text-slate-950">{formatNumber(row.value ?? 0)}</span></div>
                ))}
              </div>
            </div>
          ) : null}
          <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-[10px] leading-5 text-indigo-900">تم فصل التفاصيل الخام عن سطح القرار عمدًا. اسم المصدر والبصمة الكاملة يبقيان في طبقة التدقيق ولا يُستخدمان كعنوان للمستخدم.</div>
        </div>
      </details>
    </div>
  );
}
