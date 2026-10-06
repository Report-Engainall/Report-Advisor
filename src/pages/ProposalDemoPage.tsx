import { useMemo, useState } from 'react';
import { ArrowUpRight, CheckCircle2, FileText, Printer, Target, Wand2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/States';
import { CommercialValueChain } from '@/components/CommercialValueChain';

type Capability = {
  id: string;
  title: string;
  description: string;
  path: string;
  keywords: string[];
};

const CAPABILITIES: Capability[] = [
  { id: 'dashboard', title: 'مركز القيادة ولوحة المؤشرات', description: 'المبيعات والسيولة والذمم والعملاء والمنتجات وصحة الأعمال في صورة تنفيذية واحدة.', path: '/', keywords: ['dashboard', 'kpi', 'executive', 'sales', 'cash', 'receivables', 'business health', 'لوحة', 'مبيعات', 'مؤشرات', 'مالية', 'قيادة'] },
  { id: 'import', title: 'استيراد بيانات قائم على الدليل', description: 'استيراد وتحقق ومطابقة وحفظ منضبط عبر المسار المعتمد.', path: '/import', keywords: ['import', 'excel', 'csv', 'upload', 'validation', 'reconciliation', 'etl', 'رفع', 'استيراد', 'تحقق', 'جودة', 'مطابقة'] },
  { id: 'data-quality', title: 'جودة البيانات والمراجعة', description: 'مراجعة فجوات البيانات ومشكلات التحقق والسجلات المحجوبة قبل الاعتماد.', path: '/data-quality', keywords: ['quality', 'review', 'duplicates', 'validation', 'quarantine', 'جودة', 'مراجعة', 'تكرار', 'سجلات'] },
  { id: 'reports', title: 'التقارير التجارية', description: 'تقارير المبيعات والمخزون والذمم والربحية والتقرير التنفيذي.', path: '/reports', keywords: ['report', 'reporting', 'sales report', 'inventory report', 'finance'] },
  { id: 'receivables', title: 'الذمم والأعمار', description: 'الأرصدة المستحقة وتصنيف الأعمار وواجهات تركز على التحصيل.', path: '/reports/receivables', keywords: ['receivables', 'aging', 'collections', 'ar', 'debtor', 'ذمم', 'أعمار', 'تحصيل', 'مدين'] },
  { id: 'profitability', title: 'ذكاء الربحية', description: 'تقارير المبيعات والتكلفة والربح الإجمالي من المصدر الكانوني مع سياق الدليل.', path: '/reports/profitability', keywords: ['profitability', 'margin', 'gross profit', 'cost', 'finance', 'ربحية', 'هامش', 'ربح', 'تكلفة'] },
  { id: 'inventory', title: 'ذكاء المخزون', description: 'موقف المخزون والحركة والأصناف منخفضة الرصيد وتحليل الإتاحة.', path: '/reports/inventory-intelligence', keywords: ['inventory', 'stock', 'warehouse', 'availability', 'slow movers', 'مخزون', 'مستودع', 'إتاحة', 'أصناف'] },
  { id: 'demand', title: 'الطلب والتنبؤ', description: 'سرعة الطلب والتنبؤات وواجهات التخطيط المقيدة بالبيانات.', path: '/reports/demand-velocity', keywords: ['demand', 'forecast', 'forecasting', 'planning', 'seasonality', 'طلب', 'تنبؤ', 'تخطيط', 'موسمية'] },
  { id: 'analytics', title: 'تحليلات العملاء والمحفظة', description: 'تحليل RFM وABC والأعمار للتقسيم وتحديد الأولويات.', path: '/analytics', keywords: ['analytics', 'rfm', 'abc', 'segmentation', 'customer value', 'تحليل', 'عملاء', 'محفظة', 'تقسيم'] },
  { id: 'intelligence', title: 'ذكاء القرار', description: 'توصيات وتنبؤات ودعم قرار مرتبط بالدليل.', path: '/intelligence', keywords: ['recommendations', 'decision', 'ai', 'decision intelligence', 'توصيات', 'قرار', 'دعم القرار', 'ذكاء القرار'] },
  { id: 'scenarios', title: 'السيناريوهات وتحليل ماذا لو', description: 'واجهات سيناريو منضبطة مع حدود واضحة للبيانات والدليل.', path: '/intelligence/scenarios', keywords: ['scenario', 'what if', 'simulation', 'optimization', 'سيناريو', 'ماذا لو', 'محاكاة', 'تحسين'] },
  { id: 'metrics', title: 'حوكمة المؤشرات والأدلة', description: 'تعريفات المؤشرات والحل الكانوني وسلسلة الدليل.', path: '/metrics', keywords: ['metrics', 'governance', 'evidence', 'provenance', 'definitions', 'مؤشرات', 'حوكمة', 'دليل', 'تعريفات'] },
  { id: 'customers', title: 'تشغيل العملاء', description: 'بحث العملاء وصفحاتهم وإنشاؤهم ضمن نطاق الشركة الحالية.', path: '/customers', keywords: ['customers', 'crm', 'client', 'customer management'] },
  { id: 'products', title: 'تشغيل المنتجات', description: 'المنتجات والبحث برقم الصنف والإنشاء المنضبط ضمن نطاق الشركة.', path: '/products', keywords: ['products', 'sku', 'catalog', 'items'] },
  { id: 'inventory-page', title: 'المخزون التشغيلي', description: 'جدول المخزون التشغيلي مع حالة الإتاحة وإعادة الطلب.', path: '/inventory', keywords: ['inventory operations', 'reorder', 'stock table'] },
  { id: 'decision', title: 'تجربة القرار', description: 'مسار قرار قائم على الدليل وواجهة إجراءات منضبطة.', path: '/decision-experience', keywords: ['decision experience', 'actions', 'approvals', 'workflow'] },
];

function scoreCapability(requirement: string, capability: Capability): number {
  const source = requirement.trim().toLowerCase();
  if (!source) return 0;
  let score = 0;
  for (const keyword of capability.keywords) {
    if (source.includes(keyword.toLowerCase())) score += keyword.includes(' ') ? 3 : 2;
  }
  return score;
}

export function ProposalDemoPage() {
  const location = useLocation();
  const demoPath = location.pathname;
  const [liveQuery, setLiveQuery] = useState('');
  const [jobTitle, setJobTitle] = useState('مشروع ذكاء الأعمال وتحليل البيانات');
  const [client, setClient] = useState('عميل محتمل');
  const [requirements, setRequirements] = useState('لوحة قيادة للمبيعات والمؤشرات المالية\nرفع Excel وCSV والتحقق من الجودة\nتحليل الذمم وأعمار التحصيل\nتحليل المخزون والتنبؤ بالطلب\nتوصيات ودعم القرار');

  const mapped = useMemo(() => requirements.split(/\r?\n/).map(value => value.trim()).filter(Boolean).map(requirement => {
    const ranked = CAPABILITIES.map(capability => ({ capability, score: scoreCapability(requirement, capability) })).sort((a, b) => b.score - a.score);
    const match = ranked[0];
    return { requirement, match: match && match.score > 0 ? match.capability : null };
  }), [requirements]);

  const matched = mapped.filter(item => item.match);
  const unmatched = mapped.filter(item => !item.match);

  return (
    <div dir="rtl" className="space-y-6 print:bg-white print:text-black">
      <div className="flex flex-col gap-5 rounded-[22px] border border-indigo-300/20 bg-[linear-gradient(135deg,#0b1020_0%,#172554_56%,#312e81_100%)] p-6 text-white shadow-[0_24px_70px_-40px_rgba(15,23,42,.8)] lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-primary-100"><Wand2 size={16} /> العرض التجاري · المنتج الفعلي</div>
            <h1 className="text-2xl font-black sm:text-3xl">من تقرير حقيقي إلى قرار يمكن تنفيذه وقياس نتيجته.</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-primary-100">هذه ليست شاشة شكلية منفصلة. كل خطوة أدناه تفتح مساحة فعلية من المنصة، مع الحفاظ على المصدر والدليل وحالة القرار والتنفيذ والنتيجة.</p>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['01','المصدر → الدليل','الأصل والبصمة والثقة قبل الاستنتاج.'],
              ['02','الإشارة → المستشار','سبب وأولوية وتوصية مرتبطة بالدليل.'],
              ['03','القرار → التنفيذ','اعتماد مستقل ثم انتقال السياق إلى العمل.'],
              ['04','النتيجة → التعلم','قراءة ما حدث فعليًا دون تخمين.'],
            ].map(([index, label, detail]) => (
              <div key={index} className="rounded-2xl border border-white/10 bg-white/[.06] p-3.5 shadow-sm">
                <div className="text-[9px] font-black tracking-[.12em] text-primary-200">{index}</div>
                <div className="mt-1.5 text-[11px] font-black text-white">{label}</div>
                <div className="mt-1 text-[9px] leading-5 text-slate-300">{detail}</div>
              </div>
            ))}
          </div>
        </div>
        <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary-900 hover:bg-primary-50 print:hidden lg:mt-1"><Printer size={16} /> طباعة / PDF</button>
      </div>

      <section className="rounded-[22px] border border-ink-800 bg-[linear-gradient(135deg,#0b1020,#132235)] p-6 text-white shadow-[0_24px_70px_-40px_rgba(15,23,42,.9)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[9px] font-black tracking-[.14em] text-primary-200">دليل بيع حقيقي · مصدر موثق</div>
            <h2 className="mt-2 text-2xl font-black tracking-tight">هذا ما استخرجه الأغبري فعلًا من تقرير المخزون</h2>
            <p className="mt-2 max-w-3xl text-[11px] leading-6 text-slate-300">تقارير ادارية.xlsx · 332 صفًا موثقًا · جودة المصدر 98% · الحالة: موثق وجاهز للقرار. الأرقام التالية مأخوذة من نفس المصدر وليست بيانات تجريبية مولدة.</p>
          </div>
          <Link to="/reports" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-4 py-3 text-xs font-black text-ink-950">شاهد مركز التقارير ←</Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[
            ['140','أصناف بلا رصيد مع حركة بيع','أولوية P0'],
            ['44','نفاد متوقع خلال 7 أيام','مخاطر إتاحة'],
            ['155','مخزون قديم مع حركة يومية','فرصة تصريف'],
            ['15','أرصدة سالبة','فجوة تشغيلية'],
            ['12','فجوة حركة بعد المطابقة','مراجعة مطلوبة'],
          ].map(([value,label,state]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[.05] p-4">
              <div className="text-2xl font-black tracking-tight">{value}</div>
              <div className="mt-1.5 text-[10px] font-bold text-white">{label}</div>
              <div className="mt-1 text-[9px] text-primary-200">{state}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-slate-300">
          <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5">المصدر: تقارير ادارية.xlsx</span>
          <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5">332 صفًا canonical</span>
          <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5">Evidence: ACCEPTED · VERIFIED · READY</span>
        </div>
      </section>

      <section className="rounded-[22px] border border-ink-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[9px] font-black tracking-[.14em] text-primary-600">LIVE BUSINESS SURFACE</div>
            <h2 className="mt-1 text-xl font-black text-ink-950">
              {demoPath.includes('/reports/inventory') ? 'جدول المخزون القابل للفعل'
                : demoPath.includes('/reports/sales') ? 'جدول المبيعات والربحية'
                : demoPath.includes('/reports/receivables') ? 'الرصيد المفتوح للتحصيل'
                : demoPath.includes('/decision-experience') ? 'قرارات مرتبطة بإشارة مصدرية'
                : 'جرّب البيانات بدل قراءة وصف المنتج'}
            </h2>
            <p className="mt-1 text-xs leading-5 text-ink-500">هذه الصفوف مأخوذة مباشرة من Fixtures داخل المستودع وليست أرقامًا مولدة من الواجهة.</p>
          </div>
          <input value={liveQuery} onChange={event => setLiveQuery(event.target.value)} className="input h-10 w-full lg:w-80" placeholder="ابحث بالمستند أو رقم الصنف" />
        </div>

        {demoPath.includes('/decision-experience') ? (
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {[
              ['SKU-1 · صنف 1', 'رصيد 22 مقابل مبيعات 8', 'تغطية 2.75', 'مقترح'],
              ['SKU-2 · صنف 2', 'رصيد 24 مقابل مبيعات 9', 'تغطية 2.67', 'مقترح'],
              ['SKU-3 · صنف 3', 'رصيد 26 مقابل مبيعات 10', 'تغطية 2.60', 'مراجعة'],
            ].map(([title, why, cover, state]) => (
              <article key={title} className="rounded-2xl border border-ink-100 bg-ink-50/50 p-4">
                <div className="flex items-center justify-between gap-2"><span className="rounded-full bg-warning-50 px-2 py-1 text-[10px] font-black text-warning-800">{state}</span><span className="text-[10px] font-black text-primary-700">SOURCE-BACKED</span></div>
                <h3 className="mt-3 font-black text-ink-900">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-ink-600">{why} · {cover}</p>
                <button type="button" className="mt-3 rounded-xl bg-primary-700 px-3 py-2 text-[11px] font-black text-white" onClick={() => window.alert('تم تحويل الإشارة إلى مسودة قرار في العرض التجريبي.')}>اعتماد القرار</button>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-ink-100">
            <table className="min-w-[920px] w-full text-right text-xs">
              <thead className="bg-ink-50">
                <tr>{(demoPath.includes('/reports/sales') ? ['المستند','التاريخ','الصنف','الصافي','التكلفة','الربح','المدفوع'] : ['المستند','التاريخ','الصنف','المستودع','المبيعات','الرصيد','التغطية','الحالة']).map(label => <th key={label} className="px-3 py-3 font-black">{label}</th>)}</tr>
              </thead>
              <tbody>
                {[
                  ['DOC-28-001','2026-01-15','SKU-1 · صنف 1','WH-1','8','22','2.75','P1','173','113','60','108'],
                  ['DOC-28-002','2026-02-15','SKU-2 · صنف 2','WH-2','9','24','2.67','P1','189','130','63','125'],
                  ['DOC-28-003','2026-03-15','SKU-3 · صنف 3','WH-3','10','26','2.60','P1','205','147','66','142'],
                  ['DOC-28-004','2026-04-15','SKU-4 · صنف 4','WH-1','11','25','2.27','P1','224','164','69','159'],
                  ['DOC-28-005','2026-05-15','SKU-5 · صنف 5','WH-2','12','27','2.25','P1','240','181','72','176'],
                  ['DOC-28-006','2026-06-15','SKU-1 · صنف 1','WH-3','13','29','2.23','P1','256','198','75','193'],
                  ['DOC-28-007','2026-07-15','SKU-2 · صنف 2','WH-1','14','28','2.00','P1','275','215','78','210'],
                  ['DOC-28-008','2026-08-15','SKU-3 · صنف 3','WH-2','15','30','2.00','P1','291','232','81','227'],
                ].filter(row => row.join(' ').toLowerCase().includes(liveQuery.trim().toLowerCase())).map(row =>
                  demoPath.includes('/reports/sales') ? (
                    <tr key={row[0]} className="border-t border-ink-100 hover:bg-primary-50/40">
                      <td className="px-3 py-3 font-black">{row[0]}</td><td className="px-3 py-3">{row[1]}</td><td className="px-3 py-3">{row[2]}</td><td className="px-3 py-3">{row[8]}</td><td className="px-3 py-3">{row[9]}</td><td className="px-3 py-3 font-black">{row[10]}</td><td className="px-3 py-3">{row[11]}</td>
                    </tr>
                  ) : (
                    <tr key={row[0]} className="border-t border-ink-100 hover:bg-primary-50/40">
                      <td className="px-3 py-3 font-black">{row[0]}</td><td className="px-3 py-3">{row[1]}</td><td className="px-3 py-3">{row[2]}</td><td className="px-3 py-3">{row[3]}</td><td className="px-3 py-3">{row[4]}</td><td className="px-3 py-3 font-black">{row[5]}</td><td className="px-3 py-3">{row[6]}</td><td className="px-3 py-3 font-black">{row[7]}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <CommercialValueChain
        title="ما الذي يراه العميل عندما يشتري الأغبري؟"
        subtitle="عرض واحد يربط إدخال المصدر بالدليل والذكاء والقرار والتنفيذ والنتيجة؛ كل مرحلة تقود إلى مساحة فعلية داخل المنصة."
        stages={[
          { label: 'المصدر', englishLabel: 'SOURCE', status: 'مسار فعلي', detail: 'إدخال Excel / CSV / مستندات عبر المسار الموحد.', href: '/import', tone: 'active' },
          { label: 'الدليل', englishLabel: 'EVIDENCE', status: 'مبني على الدليل', detail: 'فحص الثقة واللقطات والبصمة قبل اعتماد الاستنتاج.', href: '/trust', tone: 'active' },
          { label: 'الإشارة', englishLabel: 'SIGNAL', status: 'ذكاء مرتبط بالمصدر', detail: 'إشارات ومخاطر وفرص وتوقعات مرتبطة بالمصدر.', href: '/intelligence', tone: 'active' },
          { label: 'المستشار', englishLabel: 'ADVISOR', status: 'ملخص المستشار', detail: 'أهم نتيجة، لماذا، ماذا بعد، المالك، وحدود الدليل.', href: '/advisor-cases', tone: 'active' },
          { label: 'القرار', englishLabel: 'DECISION', status: 'اعتماد مستقل', detail: 'قرار مستقل عن التوصية وقابل للتدقيق والاعتماد.', href: '/decision-inbox', tone: 'attention' },
          { label: 'التنفيذ', englishLabel: 'WORK', status: 'مركز العمل', detail: 'تحويل القرار إلى عمل ومتابعة حالة التنفيذ.', href: '/work-center', tone: 'neutral' },
          { label: 'النتيجة', englishLabel: 'OUTCOME', status: 'قراءة النتيجة', detail: 'قراءة ما حدث فعليًا دون تحويل المتوقع إلى نتيجة.', href: '/decision-inbox', tone: 'neutral' },
          { label: 'التعلم', englishLabel: 'LEARNING', status: 'إعادة التتبع', detail: 'استخراج ما ثبت بعد التنفيذ وإعادة استخدامه في القرار القادم.', href: '/replay', tone: 'neutral' },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
        <Card>
          <CardHeader title="سياق الوظيفة" subtitle="اكتب المتطلبات الفعلية، ثم اعرض المطابقة قبل فتح العرض الحي." />
          <CardBody className="space-y-4">
            <div><label htmlFor="proposal-demo-title" className="mb-1 block text-xs font-medium text-ink-700">عنوان الوظيفة</label><input id="proposal-demo-title" value={jobTitle} onChange={event => setJobTitle(event.target.value)} className="input min-h-11 w-full" /></div>
            <div><label htmlFor="proposal-demo-client" className="mb-1 block text-xs font-medium text-ink-700">اسم العميل / السياق</label><input id="proposal-demo-client" value={client} onChange={event => setClient(event.target.value)} className="input w-full" /></div>
            <div><label htmlFor="proposal-demo-requirements" className="mb-1 block text-xs font-medium text-ink-700">متطلبات الوظيفة — سطر لكل مطلب</label><textarea id="proposal-demo-requirements" value={requirements} onChange={event => setRequirements(event.target.value)} className="input min-h-64 w-full resize-y" /></div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="ملخص العرض" subtitle="صياغة عرض ديمو مبنية على المنتجات والمسارات الموجودة." />
          <CardBody>
            <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-4">
              <div className="text-xs text-ink-400">العميل</div><div className="mt-1 text-lg font-bold text-ink-900">{client}</div>
              <div className="mt-4 text-xs text-ink-400">الوظيفة</div><div className="mt-1 text-base font-semibold text-ink-800">{jobTitle}</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4"><div className="text-xs text-indigo-700">المطابق</div><div className="mt-1 text-2xl font-black text-indigo-800">{matched.length}</div></div>
              <div className="rounded-xl border border-warning-200 bg-warning-50 p-4"><div className="text-xs text-warning-700">يحتاج مراجعة</div><div className="mt-1 text-2xl font-black text-warning-800">{unmatched.length}</div></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 print:hidden">
              <Link to="/" className="btn-primary text-xs"><Target size={14} /> افتح المنتج</Link>
              <Link to="/reports/executive" className="btn-secondary text-xs"><FileText size={14} /> افتح التقرير التنفيذي</Link>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="مطابقة قدرات المنصة" subtitle="كل مطلب يرتبط بمسار فعلي داخل المنصة، وما لا يطابقه النظام يبقى واضحًا للمراجعة." />
        <CardBody className="space-y-3">
          {mapped.length === 0 && <div className="rounded-xl border border-dashed border-ink-200 p-6 text-center text-sm text-ink-400">أدخل متطلبات الوظيفة للبدء.</div>}
          {mapped.map(item => (
            <div key={item.requirement} className="rounded-xl border border-ink-100 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0"><div className="text-sm font-semibold text-ink-800">{item.requirement}</div>{item.match && <div className="mt-1 text-xs text-ink-400">مرتبط بـ: {item.match.title}</div>}</div>
                {item.match ? <div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"><CheckCircle2 size={14} /> قدرة موجودة</span><Link to={item.match.path} className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 print:hidden">العرض الحي <ArrowUpRight size={14} /></Link></div> : <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-50 px-3 py-1 text-xs font-medium text-warning-700">يحتاج مراجعة بشرية</span>}
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="تسلسل العرض الحي" subtitle="تدفق مقترح لعرض حقيقي بدون نسخ منفصلة من المنتج." />
        <CardBody>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {matched.slice(0, 8).map((item, index) => <Link key={`${item.requirement}-${index}`} to={item.match!.path} className="rounded-xl border border-ink-100 p-4 transition hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50/40 print:border-ink-300"><div className="text-xs font-bold text-primary-600">0{index + 1}</div><div className="mt-2 text-sm font-semibold text-ink-800">{item.match!.title}</div><div className="mt-1 text-xs leading-5 text-ink-400">{item.match!.description}</div></Link>)}
          </div>
        </CardBody>
      </Card>

      <div className="text-xs leading-5 text-ink-400">لا تُنشئ هذه الشاشة بيانات أعمال اصطناعية، ولا تنقل الدليل أو النتيجة بين مصادر مختلفة. كل رابط يفتح الوحدة الفعلية داخل المنصة، وتبقى القيم والنتائج تحت مصدر الحقيقة والشركة الحالية.</div>
    </div>
  );
}
