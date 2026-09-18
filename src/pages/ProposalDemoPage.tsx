import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, CheckCircle2, FileText, Printer, Target, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';

type Capability = {
  id: string;
  title: string;
  description: string;
  path: string;
  keywords: string[];
};

const CAPABILITIES: Capability[] = [
  { id: 'dashboard', title: 'مركز القيادة ولوحة المؤشرات', description: 'المبيعات والسيولة والذمم والعملاء والمنتجات وصحة الأعمال في صورة تنفيذية واحدة.', path: '/', keywords: ['dashboard', 'kpi', 'executive', 'sales', 'cash', 'receivables', 'business health'] },
  { id: 'import', title: 'استيراد بيانات قائم على الدليل', description: 'استيراد وتحقق ومطابقة وحفظ منضبط عبر المسار المعتمد.', path: '/import', keywords: ['import', 'excel', 'csv', 'upload', 'validation', 'reconciliation', 'etl'] },
  { id: 'data-quality', title: 'جودة البيانات والمراجعة', description: 'مراجعة فجوات البيانات ومشكلات التحقق والسجلات المحجوبة قبل الاعتماد.', path: '/data-quality', keywords: ['quality', 'review', 'duplicates', 'validation', 'quarantine'] },
  { id: 'reports', title: 'التقارير التجارية', description: 'تقارير المبيعات والمخزون والذمم والربحية والتقرير التنفيذي.', path: '/reports', keywords: ['report', 'reporting', 'sales report', 'inventory report', 'finance'] },
  { id: 'receivables', title: 'الذمم والأعمار', description: 'الأرصدة المستحقة وتصنيف الأعمار وواجهات تركز على التحصيل.', path: '/reports/receivables', keywords: ['receivables', 'aging', 'collections', 'ar', 'debtor'] },
  { id: 'profitability', title: 'ذكاء الربحية', description: 'تقارير المبيعات والتكلفة والربح الإجمالي من المصدر الكانوني مع سياق الدليل.', path: '/reports/profitability', keywords: ['profitability', 'margin', 'gross profit', 'cost', 'finance'] },
  { id: 'inventory', title: 'ذكاء المخزون', description: 'موقف المخزون والحركة والأصناف منخفضة الرصيد وتحليل الإتاحة.', path: '/reports/inventory-intelligence', keywords: ['inventory', 'stock', 'warehouse', 'availability', 'slow movers'] },
  { id: 'demand', title: 'الطلب والتنبؤ', description: 'سرعة الطلب والتنبؤات وواجهات التخطيط المقيدة بالبيانات.', path: '/reports/demand-velocity', keywords: ['demand', 'forecast', 'forecasting', 'planning', 'seasonality'] },
  { id: 'analytics', title: 'تحليلات العملاء والمحفظة', description: 'تحليل RFM وABC والأعمار للتقسيم وتحديد الأولويات.', path: '/analytics', keywords: ['analytics', 'rfm', 'abc', 'segmentation', 'customer value'] },
  { id: 'intelligence', title: 'ذكاء القرار', description: 'توصيات وتنبؤات ودعم قرار مرتبط بالدليل.', path: '/intelligence', keywords: ['recommendations', 'decision', 'ai', 'decision intelligence'] },
  { id: 'scenarios', title: 'السيناريوهات وتحليل ماذا لو', description: 'واجهات سيناريو منضبطة مع حدود واضحة للبيانات والدليل.', path: '/intelligence/scenarios', keywords: ['scenario', 'what if', 'simulation', 'optimization'] },
  { id: 'metrics', title: 'حوكمة المؤشرات والأدلة', description: 'تعريفات المؤشرات والحل الكانوني وسلسلة الدليل.', path: '/metrics', keywords: ['metrics', 'governance', 'evidence', 'provenance', 'definitions'] },
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
  const [jobTitle, setJobTitle] = useState('Business Intelligence / Data Analytics Project');
  const [client, setClient] = useState('Prospective Client');
  const [requirements, setRequirements] = useState('Dashboard with sales and financial KPIs\nExcel/CSV import and validation\nReceivables and aging analysis\nInventory and demand forecasting\nRecommendations and decision support');
  const [selectedCapabilityIds, setSelectedCapabilityIds] = useState<string[]>(['dashboard', 'profitability', 'receivables', 'inventory', 'demand', 'decision']);
  const [copied, setCopied] = useState(false);

  const mapped = useMemo(() => requirements.split(/\r?\n/).map(value => value.trim()).filter(Boolean).map(requirement => {
    const ranked = CAPABILITIES.map(capability => ({ capability, score: scoreCapability(requirement, capability) })).sort((a, b) => b.score - a.score);
    const match = ranked[0];
    return { requirement, match: match && match.score > 0 ? match.capability : null };
  }), [requirements]);

  const matched = mapped.filter(item => item.match);
  const unmatched = mapped.filter(item => !item.match);
  useEffect(() => {
    const available = new Set(mapped.flatMap(item => item.match ? [item.match.id] : []));
    setSelectedCapabilityIds(current => current.filter(id => available.has(id)).length ? current.filter(id => available.has(id)) : mapped.flatMap(item => item.match ? [item.match.id] : []).slice(0, 6));
  }, [mapped]);
  const selected = CAPABILITIES.filter(capability => selectedCapabilityIds.includes(capability.id));
  const toggleCapability = (id: string) => setSelectedCapabilityIds(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]);
  const proposalSummary = [
    `Client: ${client}`,
    `Project: ${jobTitle}`,
    '',
    'Selected product paths:',
    ...selected.map((capability, index) => `${index + 1}. ${capability.title} — ${window.location.origin}${capability.path}`),
    '',
    'Requirement coverage:',
    ...matched.map(item => `- ${item.requirement} → ${item.match?.title ?? 'Human review required'}`),
    ...(unmatched.length ? ['', 'Requirements requiring human review:', ...unmatched.map(item => `- ${item.requirement}`)] : []),
  ].join('\\n');
  const copyProposal = async () => {
    try { await navigator.clipboard.writeText(proposalSummary); setCopied(true); window.setTimeout(() => setCopied(false), 1600); } catch { setCopied(false); }
  };

  return (
    <div dir="rtl" className="space-y-6 print:bg-white print:text-black">
      <div className="flex flex-col gap-4 rounded-2xl border border-ink-100 bg-gradient-to-br from-primary-950 via-primary-900 to-ink-900 p-6 text-white shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-primary-100"><Wand2 size={16} /> مطابقة وظيفة Upwork / وضع العرض التقديمي</div>
          <h1 className="text-2xl font-black sm:text-3xl">حوّل متطلبات الوظيفة إلى عرض حي مبني على قدرات المنتج الفعلية</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-primary-100">هذه الشاشة لا تنشئ Mockup مستقلًا. إنها تربط متطلبات العميل بوحدات Report-Advisor الموجودة فعليًا وتفتح نفس مسارات المنتج الحية للعرض.</p>
        </div>
        <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary-900 hover:bg-primary-50 print:hidden"><Printer size={16} /> طباعة / PDF</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
        <Card>
          <CardHeader title="سياق الوظيفة" subtitle="اكتب المتطلبات الفعلية، ثم اعرض المطابقة قبل فتح العرض الحي." />
          <CardBody className="space-y-4">
            <div><label htmlFor="proposal-demo-title" className="mb-1 block text-xs font-medium text-ink-700">عنوان الوظيفة</label><input id="proposal-demo-title" value={jobTitle} onChange={event => setJobTitle(event.target.value)} className="input w-full" /></div>
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
              <div className="rounded-xl border border-success-200 bg-success-50 p-4"><div className="text-xs text-success-700">المطابق</div><div className="mt-1 text-2xl font-black text-success-800">{matched.length}</div></div>
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
        <CardHeader title="Capability Mapping" subtitle="المطابقة حتمية ومقيدة بكتالوج مسارات المنتج الحالية." />
        <CardBody className="space-y-3">
          {mapped.length === 0 && <div className="rounded-xl border border-dashed border-ink-200 p-6 text-center text-sm text-ink-400">أدخل متطلبات الوظيفة للبدء.</div>}
          {mapped.map(item => (
            <div key={item.requirement} className="rounded-xl border border-ink-100 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0"><div className="text-sm font-semibold text-ink-800">{item.requirement}</div>{item.match && <div className="mt-1 text-xs text-ink-400">مرتبط بـ: {item.match.title}</div>}</div>
                {item.match ? <div className="flex flex-wrap items-center gap-2"><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50"><input type="checkbox" checked={selectedCapabilityIds.includes(item.match.id)} onChange={() => toggleCapability(item.match!.id)} className="h-3.5 w-3.5 rounded border-ink-300 text-primary-600 focus:ring-primary-500" /> ضمن العرض</label><span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-700"><CheckCircle2 size={14} /> قدرة موجودة</span><Link to={item.match.path} className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 print:hidden">العرض الحي <ArrowUpRight size={14} /></Link></div> : <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-50 px-3 py-1.5 text-xs font-medium text-warning-700">يحتاج مراجعة بشرية</span>}
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="حزمة العرض المختارة" subtitle="حدّد المسارات التي ستظهر للعميل؛ كل بطاقة تفتح الوحدة الحقيقية من المنتج." action={<button type="button" onClick={() => void copyProposal()} className="btn-secondary text-xs print:hidden">{copied ? 'تم النسخ' : 'نسخ ملخص العرض'}</button>} />
        <CardBody>
          {selected.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{selected.map((capability, index) => <Link key={capability.id} to={capability.path} className="rounded-xl border border-primary-200 bg-primary-50/50 p-4 transition hover:-translate-y-0.5 hover:bg-primary-50 print:border-ink-300"><div className="flex items-center justify-between gap-2"><span className="text-xs font-black text-primary-700">عرض {String(index + 1).padStart(2, '0')}</span><ArrowUpRight size={14} className="text-primary-500"/></div><div className="mt-2 text-sm font-black text-ink-900">{capability.title}</div><div className="mt-1 text-xs leading-5 text-ink-500">{capability.description}</div></Link>)}</div> : <div className="rounded-xl border border-dashed border-ink-200 p-6 text-center text-sm text-ink-400">اختر قدرة واحدة على الأقل لتكوين حزمة العرض.</div>}
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

      <div className="text-xs leading-5 text-ink-400">لا تُنشئ هذه الشاشة بيانات أعمال اصطناعية ولا تنقل Evidence من SHA إلى SHA. كل رابط يفتح الوحدة الفعلية في Report-Advisor، وتبقى نتائج الأعمال والقيم الرقمية تحت مصدر الحقيقة والشركة الحالية. حزمة العرض نفسها تُبنى من المسارات الحالية ولا تدّعي تنفيذًا تجاريًا غير مثبت.</div>
    </div>
  );
}
