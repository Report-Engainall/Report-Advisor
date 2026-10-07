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
    <div dir="rtl" className="min-h-screen bg-[#f6f7fb] px-3 py-4 sm:px-5 lg:px-7">
      <div className="mx-auto max-w-[1500px] space-y-5 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/proposal-demo" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 text-xs font-black text-ink-700 hover:bg-ink-50">
            <ArrowLeft size={14} />
            العودة إلى العرض التجاري
          </Link>
          <div className="flex items-center gap-2 text-[10px] font-black">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">تقرير ذكي فعلي في مسار العرض</span>
            <span className="rounded-full border border-ink-200 bg-white px-3 py-2 text-ink-600">{SOURCE_NAME}</span>
          </div>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-slate-700 bg-[linear-gradient(135deg,#07111d,#102b31_60%,#171622)] p-5 text-white shadow-[0_28px_90px_-42px_rgba(15,23,42,.9)] lg:p-8">
          <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr] xl:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-[9px] font-black tracking-[.16em] text-emerald-200">
                <ShieldCheck size={14} />
                SMART REPORT · SOURCE BOUND
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight lg:text-4xl">هذا هو التقرير الذكي الذي يجب أن يراه العميل</h1>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
                لا يبدأ بالجدول. يبدأ بالحكم: ماذا حدث، لماذا يستحق الانتباه، ماذا يعني للإدارة، وما الإجراء الذي يمكن متابعته وقياسه.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold text-slate-200">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">المصدر: {SOURCE_NAME}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{SOURCE_ROWS.length} صفًا</span>
                <span className="rounded-full border border-white/10 bg-white/5">11 حقلًا</span>
                <span className="rounded-full border border-white/10 bg-white/5">{analysis.signals.length} إشارات</span>
                <span className="rounded-full border border-white/10 bg-white/5">{analysis.recommendations.length} توصيات</span>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[.06] p-5">
              <div className="text-[9px] font-black tracking-[.16em] text-emerald-200">EXECUTIVE JUDGMENT</div>
              <div className="mt-2 text-xl font-black leading-8">{signal?.message ?? analysis.advisorBrief.headline}</div>
              <div className="mt-3 text-[11px] leading-5 text-slate-300">
                التغطية الحالية الكلية = {metricNumber(coverage)}x، و{lowCoverageRows.length} صفوف تقع تحت حد التغطية 2.00x.
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {[
            ['الصفوف المصدرية', String(SOURCE_ROWS.length), 'كل صفوف الـFixture مستخدمة'],
            ['الإشارة', String(analysis.signals.length), 'إشارات مشتقة من نفس المصدر'],
            ['التوصيات', String(analysis.recommendations.length), 'أفعال مقترحة وليست نتائج منجزة'],
            ['جاهزية الإجراء', statusLabel(universal.advisory.actionState), 'لا تُحوّل الفجوة إلى قرار مزيف'],
            ['النتيجة', statusLabel(universal.advisory.outcomeState), 'لا توجد نتيجة مستقبلية مخترعة'],
          ].map(([label, value, detail]) => (
            <article key={label} className="rounded-2xl border border-ink-200 bg-white p-4 shadow-sm">
              <div className="text-[9px] font-black text-ink-400">{label}</div>
              <div className="mt-2 text-lg font-black text-ink-950">{value}</div>
              <div className="mt-1 text-[10px] leading-5 text-ink-500">{detail}</div>
            </article>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-[22px] border border-primary-200 bg-white p-5 shadow-card lg:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="section-kicker">ADVISOR BRIEF</div>
                <h2 className="mt-1 text-xl font-black text-ink-950">الحكم التنفيذي</h2>
              </div>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-black text-amber-900">
                {analysis.advisorBrief.health === 'REVIEW_REQUIRED' ? 'يحتاج تدخلًا' : 'انتباه'}
              </span>
            </div>
            <div className="mt-4 rounded-2xl bg-ink-950 p-5 text-white">
              <div className="text-[9px] font-black text-primary-200">ماذا حدث؟</div>
              <div className="mt-1 text-lg font-black leading-8">{analysis.advisorBrief.headline}</div>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-ink-100 bg-ink-50/60 p-4">
                <div className="text-[9px] font-black text-ink-400">لماذا الآن؟</div>
                <div className="mt-2 text-sm font-bold leading-6 text-ink-900">{recommendation?.whyNow ?? signal?.soWhat ?? 'توجد إشارة تحتاج تفسيرًا.'}</div>
              </div>
              <div className="rounded-2xl border border-ink-100 bg-ink-50/60 p-4">
                <div className="text-[9px] font-black text-ink-400">ماذا يعني؟</div>
                <div className="mt-2 text-sm font-bold leading-6 text-ink-900">{signal?.soWhat ?? analysis.advisorBrief.proofRequirement}</div>
              </div>
              <div className="rounded-2xl border border-primary-100 bg-primary-50/60 p-4">
                <div className="text-[9px] font-black text-primary-700">ماذا نفعل الآن؟</div>
                <div className="mt-2 text-sm font-black leading-6 text-primary-950">{recommendation?.action ?? analysis.advisorBrief.recommendedAction}</div>
              </div>
              <div className="rounded-2xl border border-ink-100 bg-white p-4">
                <div className="text-[9px] font-black text-ink-400">كيف نقيس؟</div>
                <div className="mt-2 text-sm font-bold leading-6 text-ink-900">{recommendation?.measurement ?? analysis.advisorBrief.measurement}</div>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-amber-200 bg-amber-50/70 p-5 shadow-card lg:p-6">
            <div className="flex items-center gap-2">
              <Target size={17} className="text-amber-800" />
              <h2 className="text-lg font-black text-amber-950">قرار الإدارة</h2>
            </div>
            <div className="mt-4 rounded-2xl border border-amber-200 bg-white/80 p-4">
              <div className="text-[9px] font-black text-amber-700">حالة القرار</div>
              <div className="mt-2 text-lg font-black text-amber-950">{statusLabel(universal.advisory.actionState)}</div>
              <p className="mt-2 text-[11px] leading-5 text-amber-900">
                لا يوجد قرار معتمد داخل المعاينة العامة. المطلوب هو مراجعة الدليل قبل إنشاء قرار فعلي.
              </p>
            </div>
            <div className="mt-3 grid gap-2">
              <div className="rounded-xl bg-white/80 p-3">
                <div className="text-[9px] font-black text-amber-700">المالك المقترح</div>
                <div className="mt-1 text-xs font-black text-amber-950">{recommendation?.ownerHint ?? analysis.advisorBrief.ownerHint}</div>
              </div>
              <div className="rounded-xl bg-white/80 p-3">
                <div className="text-[9px] font-black text-amber-700">مانع الاعتماد</div>
                <div className="mt-1 text-[11px] leading-5 text-amber-950">{recommendation?.blocker ?? analysis.advisorBrief.proofRequirement}</div>
              </div>
              <div className="rounded-xl bg-white/80 p-3">
                <div className="text-[9px] font-black text-amber-700">حالة النتيجة</div>
                <div className="mt-1 text-xs font-black text-amber-950">{statusLabel(universal.advisory.outcomeState)}</div>
              </div>
            </div>
          </div>
        </section>

        <UniversalIntelligenceChain result={universal} />

        <CommercialValueChain
          title="من المصدر إلى النتيجة — الحالة الفعلية لهذا التقرير"
          subtitle="السلسلة لا تدّعي تنفيذًا أو نتيجة لم تحدث. كل مرحلة تعرض ما ثبت وما يحتاج خطوة لاحقة."
          stages={[
            { label: 'المصدر', englishLabel: 'SOURCE', status: 'VERIFIED', detail: SOURCE_NAME + ' · ' + SOURCE_ROWS.length + ' سجلًا', tone: 'trusted' },
            { label: 'الحقيقة', englishLabel: 'TRUTH', status: 'VERIFIED', detail: '11 حقلًا مربوطة بقاعدة المخزون', tone: 'trusted' },
            { label: 'الإشارة', englishLabel: 'SIGNAL', status: signal ? 'DERIVED' : 'NOT_AVAILABLE', detail: signal?.title ?? 'لا توجد إشارة مؤهلة', tone: 'active' },
            { label: 'التوصية', englishLabel: 'RECOMMENDATION', status: recommendation ? 'PROPOSED' : 'NOT_AVAILABLE', detail: recommendation?.title ?? 'لا توجد توصية مؤهلة', tone: 'active' },
            { label: 'القرار', englishLabel: 'DECISION', status: 'REVIEW_REQUIRED', detail: 'يتطلب اعتماد الدليل قبل الإنشاء', tone: 'attention' },
            { label: 'العمل', englishLabel: 'WORK', status: 'REVIEW_REQUIRED', detail: 'لم يُنفّذ إجراء خارجي من المعاينة', tone: 'attention' },
            { label: 'النتيجة', englishLabel: 'OUTCOME', status: 'INSUFFICIENT', detail: 'تُقاس بعد التنفيذ فقط', tone: 'neutral' },
            { label: 'التعلّم', englishLabel: 'LEARNING', status: 'GAP_DETECTED', detail: 'لا توجد نتيجة لاحقة مثبتة بعد', tone: 'neutral' },
          ]}
        />

        <section className="rounded-[22px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="section-kicker">TOP SIGNALS</div>
              <h2 className="mt-1 text-xl font-black text-ink-950">الإشارات والتوصيات المرتبطة بالمصدر</h2>
              <p className="mt-1 text-xs leading-5 text-ink-500">كل بطاقة تحمل قرائن المصدر وحدود الاستنتاج حتى لا تتحول الأرقام إلى كلام عام.</p>
            </div>
            <span className="text-[10px] font-black text-ink-400">{analysis.signals.length} إشارات · {analysis.recommendations.length} توصيات</span>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {analysis.signals.slice(0, 6).map((item) => (
              <article key={item.id} className="rounded-2xl border border-ink-200 bg-ink-50/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-black text-ink-950">{item.title}</div>
                  <span className="rounded-full border border-ink-200 bg-white px-2.5 py-1 text-[9px] font-black text-ink-600">{item.priority}</span>
                </div>
                <p className="mt-2 text-[11px] font-bold leading-5 text-ink-800">{item.message}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.evidence.slice(0, 5).map((evidence) => <span key={evidence} className="rounded-lg bg-white px-2 py-1 font-mono text-[8px] text-ink-500">{evidence}</span>)}
                </div>
                <div className="mt-3 rounded-xl border border-primary-100 bg-primary-50/70 p-3 text-[10px] leading-5 text-primary-950">
                  <b>ماذا نفعل؟</b> {analysis.recommendations.find((candidate) => candidate.id === 'rec:' + item.id)?.action ?? 'راجع الدليل المرتبط قبل أي إجراء.'}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[22px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
          <div className="flex items-center gap-2">
            <FileSearch size={17} className="text-primary-700" />
            <div>
              <div className="section-kicker">SOURCE EVIDENCE</div>
              <h2 className="mt-1 text-xl font-black text-ink-950">الدليل الذي بُني عليه الحكم</h2>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-ink-200">
            <table className="min-w-[900px] w-full text-right text-[10px]">
              <thead className="bg-ink-950 text-white">
                <tr>
                  {[
                    ['المستند','documentNo'],
                    ['الصنف','productCode'],
                    ['المستودع','warehouse'],
                    ['المبيعات','salesQty'],
                    ['الرصيد','currentStock'],
                    ['التغطية','coverage'],
                    ['الحالة','status'],
                  ].map(([label, key]) => <th key={key} className="px-3 py-3 font-black">{label}</th>)}
                </tr>
              </thead>
              <tbody>
                {SOURCE_ROWS.map((row) => {
                  const itemCoverage = row.salesQty > 0 ? row.currentStock / row.salesQty : null;
                  const low = itemCoverage != null && itemCoverage < 2;
                  return (
                    <tr key={row.documentNo} className={low ? 'bg-amber-50/70' : 'bg-white'}>
                      <td className="px-3 py-2.5 font-mono">{row.documentNo}</td>
                      <td className="px-3 py-2.5 font-black">{row.productCode}</td>
                      <td className="px-3 py-2.5">{row.warehouse}</td>
                      <td className="px-3 py-2.5 tabular-nums">{metricNumber(row.salesQty)}</td>
                      <td className="px-3 py-2.5 tabular-nums">{metricNumber(row.currentStock)}</td>
                      <td className="px-3 py-2.5 tabular-nums">{itemCoverage == null ? 'غير متاح' : metricNumber(itemCoverage) + 'x'}</td>
                      <td className="px-3 py-2.5 font-black">
                        {low ? <span className="inline-flex items-center gap-1 text-amber-900"><CircleAlert size={12}/> يحتاج معالجة</span> : <span className="inline-flex items-center gap-1 text-emerald-800"><CheckCircle2 size={12}/> ضمن الحد</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] leading-5 text-amber-950">
            حد الدليل: المصدر يثبت الرصيد والمبيعات والتغطية فقط. لا توجد مهلة توريد أو نقطة إعادة طلب أو كمية شراء معتمدة في هذا المصدر، لذلك النظام لا يخترعها.
          </div>
        </section>

        <section className="rounded-[22px] border border-primary-200 bg-primary-50/50 p-5 lg:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[9px] font-black tracking-[.14em] text-primary-700">NEXT BUSINESS ACTION</div>
              <h2 className="mt-1 text-lg font-black text-primary-950">انقل هذا التقرير إلى قرار حقيقي</h2>
              <p className="mt-1 text-[11px] leading-5 text-primary-900">
                هذه الصفحة تثبت أن التقرير الذكي أصبح منتجًا مرئيًا. أما القرار الفعلي فيحتاج جلسة عمل مصادق عليها ولقطة دليل معتمدة قبل الكتابة إلى مسار القرار.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/try-report" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary-700 px-4 text-[10px] font-black text-white hover:bg-primary-800">
                جرّب رفع تقريرك الحقيقي <ArrowUpLeft size={13} />
              </Link>
              <Link to="/proposal-demo" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-primary-200 bg-white px-4 text-[10px] font-black text-primary-800 hover:bg-primary-100">
                عُد إلى العرض التجاري <ArrowLeft size={13} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
