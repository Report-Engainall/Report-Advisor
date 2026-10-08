import { useMemo } from 'react';
import { ArrowLeft, ArrowUpLeft, CheckCircle2, CircleAlert, FileSearch, ShieldCheck, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CommercialValueChain } from '@/components/CommercialValueChain';
import { UniversalIntelligenceChain } from '@/components/UniversalIntelligenceChain';
import { buildUniversalReportIntelligence } from '@/lib/universal-report-intelligence';
import { deriveReportIntelligence, selectExecutiveRecommendation, selectExecutiveSignal } from '@/lib/report-intelligence/report-smart-insights';

const SOURCE_NAME = '28-inventory-stockout-reorder.csv';

const RAW_ROWS = [
  ['DOC-28-001','2026-01-15','SKU-1','صنف 1','WH-1',8,22,173,113,60,108],
  ['DOC-28-002','2026-02-15','SKU-2','صنف 2','WH-2',9,24,189,130,63,125],
  ['DOC-28-003','2026-03-15','SKU-3','صنف 3','WH-3',10,26,205,147,66,142],
  ['DOC-28-004','2026-04-15','SKU-4','صنف 4','WH-1',11,25,224,164,69,159],
  ['DOC-28-005','2026-05-15','SKU-5','صنف 5','WH-2',12,27,240,181,72,176],
  ['DOC-28-006','2026-06-15','SKU-1','صنف 1','WH-3',13,29,256,198,75,193],
  ['DOC-28-007','2026-07-15','SKU-2','صنف 2','WH-1',14,28,275,215,78,210],
  ['DOC-28-008','2026-08-15','SKU-3','صنف 3','WH-2',15,30,291,232,81,227],
  ['DOC-28-009','2026-09-15','SKU-4','صنف 4','WH-3',16,32,307,249,84,244],
  ['DOC-28-010','2026-10-15','SKU-5','صنف 5','WH-1',17,31,326,266,87,261],
  ['DOC-28-011','2026-11-15','SKU-1','صنف 1','WH-2',18,33,342,283,90,278],
  ['DOC-28-012','2026-12-15','SKU-2','صنف 2','WH-3',19,35,358,300,93,295],
] as const;

const COLUMN_DEFS = [
  ['documentNo','invoice_number','text'],
  ['documentDate','date','date'],
  ['productCode','sku','text'],
  ['productName','product_name','text'],
  ['warehouse','warehouse','text'],
  ['salesQty','sales_qty','number'],
  ['currentStock','current_stock','number'],
  ['netAmount','net_amount','number'],
  ['cost','cost','number'],
  ['profit','profit','number'],
  ['paidAmount','paid_amount','number'],
] as const;

function buildRows() {
  return RAW_ROWS.map((row) => ({
    documentNo: row[0],
    documentDate: row[1],
    productCode: row[2],
    productName: row[3],
    warehouse: row[4],
    salesQty: row[5],
    currentStock: row[6],
    netAmount: row[7],
    cost: row[8],
    profit: row[9],
    paidAmount: row[10],
    invoice_number: row[0],
    date: row[1],
    sku: row[2],
    product_name: row[3],
    warehouse_name: row[4],
    sales_qty: row[5],
    current_stock: row[6],
    net_amount: row[7],
    cost_value: row[8],
    profit_value: row[9],
    paid_amount: row[10],
  }));
}

const SOURCE_ROWS = buildRows();

const DATASET = {
  name: SOURCE_NAME,
  rowCount: SOURCE_ROWS.length,
  columns: COLUMN_DEFS.map(([name, mappedField, dataType]) => ({
    name,
    mappedField,
    dataType,
    nullCount: 0,
    mappingConfidence: 100,
  })),
  rows: SOURCE_ROWS,
  preview: SOURCE_ROWS.slice(0, 10),
};

const CANONICAL_ROWS = SOURCE_ROWS.map((data, index) => ({ row_number: index + 1, data }));

function metricNumber(value: number) {
  return new Intl.NumberFormat('ar-YE', { maximumFractionDigits: 2 }).format(value);
}

function statusLabel(value: string) {
  const labels: Record<string, string> = {
    ACTIONABLE: 'قابل للتحويل إلى عمل',
    REVIEW_REQUIRED: 'المراجعة مطلوبة',
    BLOCKED: 'محظور',
    NOT_ACTIONABLE: 'غير مؤهل للتنفيذ',
    VERIFIED: 'الدليل موثق',
    PROPOSED: 'مقترح',
    INSUFFICIENT: 'غير مثبت بعد',
    GAP_DETECTED: 'فجوة مكتشفة',
  };
  return labels[value] ?? value;
}

export function PublicSmartReportDemoPage() {
  const analysis = useMemo(() => {
    const intelligence = deriveReportIntelligence({
      specialty: 'inventory',
      rowCount: SOURCE_ROWS.length,
      sourceAnalysis: { datasets: [DATASET] },
      canonicalRows: CANONICAL_ROWS,
    });
    return intelligence;
  }, []);

  const universal = useMemo(() => buildUniversalReportIntelligence({
    specialty: 'inventory',
    rowCount: SOURCE_ROWS.length,
    sourceAnalysis: { datasets: [DATASET] },
    canonicalRows: CANONICAL_ROWS,
    sourcePath: SOURCE_NAME,
    sourceHash: 'preview:28-inventory-stockout-reorder',
    reportJobId: 'preview-smart-report-28',
    tenantId: 'preview',
  }), []);

  const signal = selectExecutiveSignal(analysis);
  const recommendation = selectExecutiveRecommendation(analysis, signal);
  const lowCoverageRows = SOURCE_ROWS.filter((row) => row.salesQty > 0 && row.currentStock / row.salesQty < 2);
  const totalSales = SOURCE_ROWS.reduce((sum, row) => sum + row.salesQty, 0);
  const totalStock = SOURCE_ROWS.reduce((sum, row) => sum + row.currentStock, 0);
  const coverage = totalSales > 0 ? totalStock / totalSales : 0;

  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f5f9] px-3 py-4 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-[1440px] space-y-4 pb-10">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/proposal-demo"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 text-xs font-black text-ink-700 transition hover:border-primary-300 hover:bg-primary-50"
          >
            <ArrowLeft size={14} />
            العودة إلى العرض التجاري
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-black">
            <span className="rounded-full border border-primary-200 bg-primary-50 px-3 py-2 text-primary-800">تقرير تجريبي مربوط بالمصدر</span>
            <span className="rounded-full border border-ink-200 bg-white px-3 py-2 text-ink-600">{SOURCE_NAME}</span>
          </div>
        </header>

        <section className="overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0a1020_0%,#111d3a_58%,#312e81_100%)] p-5 text-white shadow-[0_30px_90px_-48px_rgba(15,23,42,.9)] lg:p-7">
          <div className="relative grid gap-6 xl:grid-cols-[1.45fr_.55fr] xl:items-stretch">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/20 bg-white/5 px-3 py-1.5 text-[9px] font-black tracking-[.14em] text-indigo-100">
                <ShieldCheck size={13} />
                التقرير الذكي
              </div>
              <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-tight lg:text-5xl">الحكم أولًا. الدليل تحته. الإجراء بعده.</h1>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-200/80">
                هذا التقرير أخذ 12 سجلًا حقيقيًا من نفس المصدر، وحوّلها إلى إشارة تشغيلية وتوصية قابلة للمراجعة دون اختلاق قرار أو نتيجة.
              </p>

              <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/[.06] p-3">
                  <div className="text-[9px] text-slate-300/60">التغطية</div>
                  <div className="mt-1 text-2xl font-black tabular-nums">{metricNumber(coverage)}x</div>
                  <div className="mt-1 text-[9px] text-slate-300/55">إجمالي الرصيد ÷ المبيعات</div>
                </div>
                <div className="rounded-2xl border border-amber-200/10 bg-amber-100/[.06] p-3">
                  <div className="text-[9px] text-amber-100/65">تحت الحد</div>
                  <div className="mt-1 text-2xl font-black tabular-nums">{lowCoverageRows.length}</div>
                  <div className="mt-1 text-[9px] text-amber-100/55">من أصل {SOURCE_ROWS.length} سجلًا</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[.06] p-3">
                  <div className="text-[9px] text-slate-300/60">اتجاه الطلب</div>
                  <div className="mt-1 text-2xl font-black tabular-nums">+57%</div>
                  <div className="mt-1 text-[9px] text-slate-300/55">متوسط الجزء الأحدث مقابل البداية</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[.06] p-3">
                  <div className="text-[9px] text-slate-300/60">الرصيد</div>
                  <div className="mt-1 text-2xl font-black tabular-nums">{metricNumber(totalStock)}</div>
                  <div className="mt-1 text-[9px] text-slate-300/55">وحدة مثبتة في المصدر</div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-amber-200/20 bg-black/15 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[9px] font-black tracking-[.14em] text-amber-100">الحكم التنفيذي</div>
                <span className="rounded-full border border-amber-100/15 bg-amber-100/10 px-2.5 py-1 text-[8px] font-black text-amber-100">P1</span>
              </div>
              <div className="mt-3 text-xl font-black leading-8">{signal?.message ?? analysis.advisorBrief.headline}</div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[.05] p-3">
                <div className="text-[9px] text-slate-300/55">الإجراء المطلوب</div>
                <div className="mt-1 text-sm font-black leading-6 text-white">{recommendation?.title ?? analysis.advisorBrief.recommendedAction}</div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to="/try-report"
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-amber-300 px-3.5 py-2 text-[10px] font-black text-[#111827] hover:bg-amber-200"
                >
                  حلّل ملفك الحقيقي
                  <ArrowLeft size={13} />
                </Link>
                <a href="#الدليل" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-[10px] font-black text-white hover:bg-white/10">
                  شاهد الدليل
                  <ArrowUpLeft size={13} />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-3">
          <article className="rounded-[22px] border border-ink-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="section-kicker text-primary-700">قرار الإدارة</div>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-ink-950">ما الذي يجب أن يعرفه المدير خلال 30 ثانية؟</h2>
              </div>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-black text-amber-900">
                {statusLabel(universal.advisory.actionState)}
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <article className="rounded-2xl border border-ink-100 bg-ink-50/60 p-4">
                <div className="text-[9px] font-black text-ink-400">ماذا حدث؟</div>
                <div className="mt-2 text-sm font-black leading-6 text-ink-950">{analysis.advisorBrief.headline}</div>
              </article>
              <article className="rounded-2xl border border-primary-100 bg-primary-50/60 p-4">
                <div className="text-[9px] font-black text-primary-700">لماذا الآن؟</div>
                <div className="mt-2 text-sm font-black leading-6 text-primary-950">{recommendation?.whyNow ?? signal?.soWhat ?? 'توجد إشارة تحتاج مراجعة.'}</div>
              </article>
              <article className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                <div className="text-[9px] font-black text-amber-800">ماذا نفعل الآن؟</div>
                <div className="mt-2 text-sm font-black leading-6 text-amber-950">{recommendation?.action ?? analysis.advisorBrief.recommendedAction}</div>
              </article>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-[.8fr_1.2fr]">
              <div className="rounded-2xl bg-[#0d1424] p-4 text-white">
                <div className="text-[9px] font-black text-indigo-200">المعنى للإدارة</div>
                <div className="mt-2 text-sm font-black leading-6">{signal?.soWhat ?? analysis.advisorBrief.proofRequirement}</div>
              </div>
              <div className="rounded-2xl border border-ink-100 bg-white p-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div><div className="text-[9px] text-ink-400">المالك</div><div className="mt-1 text-sm font-black text-ink-950">{recommendation?.ownerHint ?? analysis.advisorBrief.ownerHint}</div></div>
                  <div><div className="text-[9px] text-ink-400">القياس</div><div className="mt-1 text-[11px] font-bold leading-5 text-ink-800">{recommendation?.measurement ?? analysis.advisorBrief.measurement}</div></div>
                  <div><div className="text-[9px] text-ink-400">مانع الاعتماد</div><div className="mt-1 text-[11px] font-bold leading-5 text-ink-800">{recommendation?.blocker ?? analysis.advisorBrief.proofRequirement}</div></div>
                </div>
              </div>
            </div>
          </article>

          <aside className="rounded-[22px] border border-ink-200 bg-[#0c1220] p-5 text-white shadow-sm">
            <div className="flex items-center gap-2 text-indigo-100">
              <Target size={16} />
              <div className="text-[9px] font-black tracking-[.14em]">حالة القرار</div>
            </div>
            <div className="mt-3 text-2xl font-black">{statusLabel(universal.advisory.actionState)}</div>
            <p className="mt-2 text-[11px] leading-6 text-slate-300">
              لا يوجد قرار معتمد داخل المعاينة. هذه الإشارة جاهزة للمراجعة، وليست قرار شراء منفذًا.
            </p>
            <div className="mt-4 space-y-2">
              <div className="rounded-xl bg-white/[.05] p-3"><div className="text-[9px] text-slate-400">النتيجة</div><div className="mt-1 text-sm font-black">{statusLabel(universal.advisory.outcomeState)}</div></div>
              <div className="rounded-xl bg-white/[.05] p-3"><div className="text-[9px] text-slate-400">البيانات</div><div className="mt-1 text-sm font-black">{SOURCE_ROWS.length} سجلًا · 11 حقلًا</div></div>
              <div className="rounded-xl bg-white/[.05] p-3"><div className="text-[9px] text-slate-400">المصدر</div><div className="mt-1 break-all text-[10px] font-bold text-slate-200">{SOURCE_NAME}</div></div>
            </div>
          </aside>
        </section>

        <section className="rounded-[22px] border border-ink-200 bg-white p-5 shadow-sm" id="الدليل">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="section-kicker text-primary-700">الدليل الحاسم</div>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-ink-950">ثلاثة سجلات تحت حد التغطية</h2>
              <p className="mt-1 text-xs leading-6 text-ink-500">هذه هي الصفوف التي صنعت الإشارة. اضغط على تفاصيل الإثبات لاحقًا لرؤية السجل الكامل.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-[10px] font-black">
              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-900">{lowCoverageRows.length} يحتاج معالجة</span>
              <span className="rounded-full bg-ink-50 px-3 py-1.5 text-ink-700">{SOURCE_ROWS.length - lowCoverageRows.length} ضمن الحد</span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {lowCoverageRows.map((row) => {
              const itemCoverage = row.salesQty > 0 ? row.currentStock / row.salesQty : null;
              return (
                <article key={row.documentNo} className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[9px] font-mono text-amber-800">{row.documentNo}</div>
                      <div className="mt-1 text-lg font-black text-amber-950">{row.productCode}</div>
                      <div className="mt-1 text-[10px] text-amber-900">{row.productName} · {row.warehouse}</div>
                    </div>
                    <div className="rounded-xl bg-white px-2.5 py-2 text-center shadow-sm">
                      <div className="text-[8px] text-ink-400">التغطية</div>
                      <div className="mt-1 text-sm font-black tabular-nums text-amber-900">{itemCoverage == null ? '—' : metricNumber(itemCoverage) + 'x'}</div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-white/80 p-2.5"><div className="text-[8px] text-ink-400">المبيعات</div><div className="mt-1 text-sm font-black tabular-nums text-ink-950">{metricNumber(row.salesQty)}</div></div>
                    <div className="rounded-xl bg-white/80 p-2.5"><div className="text-[8px] text-ink-400">الرصيد</div><div className="mt-1 text-sm font-black tabular-nums text-ink-950">{metricNumber(row.currentStock)}</div></div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-4 rounded-2xl border border-ink-100 bg-ink-50/60 p-4">
            <div className="flex items-center gap-2">
              <FileSearch size={15} className="text-primary-700" />
              <div className="text-sm font-black text-ink-950">حدود الاستنتاج</div>
            </div>
            <p className="mt-2 text-[11px] leading-6 text-ink-600">
              المصدر يثبت الرصيد والمبيعات والتغطية فقط. لا توجد مهلة توريد أو نقطة إعادة طلب أو كمية شراء معتمدة؛ لذلك النظام يحدد أولوية المراجعة ولا يخترع كمية شراء.
            </p>
          </div>
        </section>

        <section className="rounded-[22px] border border-primary-200 bg-[linear-gradient(145deg,#eff3ff,#ffffff)] p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="section-kicker text-primary-700">الخطوة التالية</div>
              <h2 className="mt-1 text-xl font-black text-ink-950">انقل الإشارة من الشاشة إلى القرار</h2>
              <p className="mt-1 text-xs leading-6 text-ink-600">راجع الأصناف الثلاثة، ثبّت المسؤول والموعد، ثم اعتمد كمية الشراء فقط بعد اكتمال بيانات التوريد ونقطة إعادة الطلب.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/try-report" className="btn-primary inline-flex items-center gap-2 text-xs">ارفع تقريرك الحقيقي <ArrowLeft size={13}/></Link>
              <Link to="/proposal-demo" className="btn-secondary inline-flex items-center gap-2 text-xs">استكشف المنتج <ArrowLeft size={13}/></Link>
            </div>
          </div>
        </section>

        <details className="rounded-[22px] border border-ink-200 bg-white shadow-sm">
          <summary className="cursor-pointer list-none px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="section-kicker">الإثبات التفصيلي</div>
                <h2 className="mt-1 text-lg font-black text-ink-950">افتح طبقة المصدر والمنهجية والتتبّع</h2>
                <p className="mt-1 text-[10px] leading-5 text-ink-500">التفاصيل التقنية موجودة، لكنها لا تزاحم الحكم التنفيذي.</p>
              </div>
              <span className="rounded-full border border-ink-200 bg-ink-50 px-3 py-1.5 text-[10px] font-black text-ink-600">فتح</span>
            </div>
          </summary>

          <div className="space-y-4 border-t border-ink-100 p-4 lg:p-5">
            <UniversalIntelligenceChain result={universal} />
            <CommercialValueChain
              title="من المصدر إلى النتيجة"
              subtitle="السلسلة تبقى مرتبطة بنفس المصدر، ولا تدعي تنفيذًا أو نتيجة غير موجودة."
              stages={[
                { label: 'المصدر', englishLabel: 'SOURCE', status: 'VERIFIED', detail: SOURCE_NAME + ' · ' + SOURCE_ROWS.length + ' سجلًا', tone: 'trusted' },
                { label: 'الحقيقة', englishLabel: 'TRUTH', status: 'VERIFIED', detail: '11 حقلًا مربوطة بقاعدة المخزون', tone: 'trusted' },
                { label: 'الإشارة', englishLabel: 'SIGNAL', status: signal ? 'DERIVED' : 'NOT_AVAILABLE', detail: signal?.title ?? 'لا توجد إشارة مؤهلة', tone: 'active' },
                { label: 'التوصية', englishLabel: 'RECOMMENDATION', status: recommendation ? 'PROPOSED' : 'NOT_AVAILABLE', detail: recommendation?.title ?? 'لا توجد توصية مؤهلة', tone: 'active' },
                { label: 'القرار', englishLabel: 'DECISION', status: 'REVIEW_REQUIRED', detail: 'يحتاج اعتماد الدليل قبل الإنشاء', tone: 'attention' },
                { label: 'العمل', englishLabel: 'WORK', status: 'REVIEW_REQUIRED', detail: 'لم يُنفذ إجراء خارجي في المعاينة', tone: 'attention' },
                { label: 'النتيجة', englishLabel: 'OUTCOME', status: 'INSUFFICIENT', detail: 'تُقاس بعد التنفيذ فقط', tone: 'neutral' },
                { label: 'التعلّم', englishLabel: 'LEARNING', status: 'GAP_DETECTED', detail: 'لا توجد نتيجة لاحقة مثبتة بعد', tone: 'neutral' },
              ]}
            />
          </div>
        </details>
      </div>
    </div>
  );
}