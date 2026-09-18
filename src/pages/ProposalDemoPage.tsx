import { useMemo, useState, useCallback } from 'react';
import { ArrowUpRight, CheckCircle2, FileText, Printer, Target, Wand2, Copy, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/States';

type Capability = {
  id: string;
  title: string;
  description: string;
  path: string;
  keywords: string[];
  proofState: 'LIVE_SURFACE' | 'RUNTIME_REQUIRED' | 'PARTIAL';
  commercialAngle: string;
  evidencePath?: string;
};

const CAPABILITIES: Capability[] = [
  { id: 'dashboard', title: 'Command Center & KPI Dashboard', description: 'Executive sales, cash, receivables, customers, products and business health.', path: '/', keywords: ['dashboard', 'kpi', 'executive', 'sales', 'cash', 'receivables', 'business health'], proofState: 'LIVE_SURFACE', commercialAngle: 'نبدأ من الصورة التنفيذية ثم ننزل مباشرة إلى المؤشر والتقرير والدليل.', evidencePath: '/metrics?metric=metric.net_sales' },
  { id: 'import', title: 'Evidence-First Data Import', description: 'Import, validation, reconciliation and governed persistence.', path: '/import', keywords: ['import', 'excel', 'csv', 'upload', 'validation', 'reconciliation', 'etl'], proofState: 'RUNTIME_REQUIRED', commercialAngle: 'نحوّل ملف العميل من عبء يدوي إلى مسار محكوم من المصدر حتى الحقيقة الكانونية.' },
  { id: 'data-quality', title: 'Data Quality & Review', description: 'Review data gaps, validation issues and blocked records before acceptance.', path: '/data-quality', keywords: ['quality', 'review', 'duplicates', 'validation', 'quarantine'], proofState: 'LIVE_SURFACE', commercialAngle: 'نظهر ما لا يمكن الوثوق به بدل إخفائه خلف أرقام جميلة.' },
  { id: 'reports', title: 'Business Reporting', description: 'Sales, inventory, receivables, profitability and executive reporting.', path: '/reports', keywords: ['report', 'reporting', 'sales report', 'inventory report', 'finance'], proofState: 'LIVE_SURFACE', commercialAngle: 'التقرير يصبح طبقة قرار قابلة للتتبع وليس ملفًا ثابتًا.' },
  { id: 'receivables', title: 'Receivables & Aging', description: 'Outstanding balances, aging buckets and collection-focused views.', path: '/reports/receivables', keywords: ['receivables', 'aging', 'collections', 'ar', 'debtor'], proofState: 'LIVE_SURFACE', commercialAngle: 'نحوّل الذمم من رقم إجمالي إلى قائمة تحصيل قابلة للتصرف.' },
  { id: 'profitability', title: 'Profitability Intelligence', description: 'Canonical sales, cost and gross-profit reporting with evidence context.', path: '/reports/profitability', keywords: ['profitability', 'margin', 'gross profit', 'cost', 'finance'], proofState: 'LIVE_SURFACE', commercialAngle: 'نفصل الإيراد عن الربح الحقيقي ونربط الحساب بالتعريف والمصدر.' , evidencePath: '/metrics?metric=metric.gross_profit' },
  { id: 'inventory', title: 'Inventory Intelligence', description: 'Stock position, movement, low-stock and availability analysis.', path: '/reports/inventory-intelligence', keywords: ['inventory', 'stock', 'warehouse', 'availability', 'slow movers'], proofState: 'LIVE_SURFACE', commercialAngle: 'نربط المخزون بالحركة والتغطية والمخاطر بدل عرض الرصيد فقط.' , evidencePath: '/metrics?metric=metric.inventory_value' },
  { id: 'demand', title: 'Demand & Forecasting', description: 'Demand velocity, forecasts and constrained planning views.', path: '/reports/demand-velocity', keywords: ['demand', 'forecast', 'forecasting', 'planning', 'seasonality'], proofState: 'PARTIAL', commercialAngle: 'نبدأ من البيانات المتاحة ونفصل ما هو محسوب عما يحتاج بيانات تنبؤية إضافية.' },
  { id: 'analytics', title: 'Customer & Portfolio Analytics', description: 'RFM, ABC and aging analysis for segmentation and prioritization.', path: '/analytics', keywords: ['analytics', 'rfm', 'abc', 'segmentation', 'customer value'], proofState: 'LIVE_SURFACE', commercialAngle: 'تحليلات عملية لتحويل العملاء والمنتجات إلى أولويات واضحة.' },
  { id: 'intelligence', title: 'Decision Intelligence', description: 'Recommendations, forecasts and evidence-bound decision support.', path: '/intelligence', keywords: ['recommendations', 'decision', 'ai', 'decision intelligence'], proofState: 'PARTIAL', commercialAngle: 'المساعد ليس chatbot؛ التوصية مرتبطة بنطاق وبيانات ودليل وحالة ثقة.' },
  { id: 'scenarios', title: 'Scenarios & What-If Analysis', description: 'Governed scenario views with explicit data/evidence boundaries.', path: '/intelligence/scenarios', keywords: ['scenario', 'what if', 'simulation', 'optimization'], proofState: 'LIVE_SURFACE', commercialAngle: 'نختبر ماذا يحدث قبل القرار مع فصل السيناريو عن الحقيقة الفعلية.' },
  { id: 'metrics', title: 'Metric Governance & Evidence', description: 'Metric definitions, canonical resolution and evidence lineage.', path: '/metrics', keywords: ['metrics', 'governance', 'evidence', 'provenance', 'definitions'], proofState: 'LIVE_SURFACE', commercialAngle: 'يمكن للعميل فحص تعريف المؤشر ومصدره ودليل تحديثه بدل الثقة العمياء.' },
  { id: 'customers', title: 'Customer Operations', description: 'Tenant-scoped customer search, pagination and creation.', path: '/customers', keywords: ['customers', 'crm', 'client', 'customer management'], proofState: 'LIVE_SURFACE', commercialAngle: 'تشغيل يومي حقيقي ضمن نطاق العميل بدل شاشة showcase معزولة.' },
  { id: 'products', title: 'Product Operations', description: 'Tenant-scoped products, SKU search and governed creation.', path: '/products', keywords: ['products', 'sku', 'catalog', 'items'], proofState: 'LIVE_SURFACE', commercialAngle: 'بيانات الأصناف جزء من النظام التشغيلي وليست مجرد جدول عرض.' },
  { id: 'inventory-page', title: 'Operational Inventory', description: 'Operational stock table with availability and reorder states.', path: '/inventory', keywords: ['inventory operations', 'reorder', 'stock table'], proofState: 'LIVE_SURFACE', commercialAngle: 'من التحليل إلى قائمة تشغيلية واضحة للمخزون.' },
  { id: 'decision', title: 'Decision Experience', description: 'Evidence-led decision workflow and governed action surface.', path: '/decision-experience', keywords: ['decision experience', 'actions', 'approvals', 'workflow'], proofState: 'PARTIAL', commercialAngle: 'نحوّل insight إلى قرار قابل للتتبع ثم نربطه بالإجراء والنتيجة.' },
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
  const [copied, setCopied] = useState(false);

  const mapped = useMemo(() => requirements.split(/\r?\n/).map(value => value.trim()).filter(Boolean).map(requirement => {
    const ranked = CAPABILITIES.map(capability => ({ capability, score: scoreCapability(requirement, capability) })).sort((a, b) => b.score - a.score);
    const match = ranked[0];
    return { requirement, match: match && match.score > 0 ? match.capability : null };
  }), [requirements]);

  const matched = mapped.filter(item => item.match);
  const unmatched = mapped.filter(item => !item.match);
  const proofCounts = useMemo(() => mapped.reduce((acc, item) => {
    const key = item.match?.proofState ?? 'MISSING';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>), [mapped]);

  const proposalDraft = useMemo(() => {
    const opening = `مرحبًا، راجعت نطاق ${jobTitle} من منظور المشكلة والنتيجة المطلوبة، وليس من قائمة تقنيات عامة. لدي مسارات فعلية داخل الأغبري تغطي أجزاء أساسية من هذا النطاق.\\n\\n`;
    const matchedLines = matched.slice(0, 8).map(item => {
      const state = item.match?.proofState === 'LIVE_SURFACE' ? 'مسار عرض حي موجود' : item.match?.proofState === 'PARTIAL' ? 'مسار موجود ويحتاج تحديد حدود الدليل' : 'مسار يحتاج إثبات تشغيل قبل ادعاء الإنتاج';
      return `- ${item.requirement}: ${item.match?.commercialAngle} [${state}]`;
    }).join('\\n');
    const gapText = unmatched.length
      ? `\\n\\nالمتطلبات التي لا أريد المبالغة فيها: ${unmatched.map(item => item.requirement).join('؛ ')}. أفضّل تثبيت نطاقها ومعايير القبول قبل الالتزام بها.`
      : '';
    return opening + matchedLines + gapText + `\\n\\nالخطوة التالية المقترحة: مكالمة قصيرة لتثبيت مصادر البيانات، معايير القبول، ونطاق التسليم قبل التنفيذ.`;
  }, [jobTitle, matched, unmatched]);

  const copyProposal = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(proposalDraft);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, [proposalDraft]);

  return (
    <div dir="rtl" className="space-y-6 print:bg-white print:text-black">
      <div className="flex flex-col gap-4 rounded-2xl border border-ink-100 bg-gradient-to-br from-primary-950 via-primary-900 to-ink-900 p-6 text-white shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-primary-100"><Wand2 size={16} /> Upwork Job Fit / Proposal Demo Mode</div>
          <h1 className="text-2xl font-black sm:text-3xl">حوّل متطلبات الوظيفة إلى عرض حي مبني على قدرات المنتج الفعلية</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-primary-100">هذه الشاشة لا تنشئ Mockup مستقلًا. إنها تربط متطلبات العميل بوحدات Report-Advisor الموجودة فعليًا وتفتح نفس مسارات المنتج الحية للعرض.</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden"><button type="button" onClick={() => void copyProposal()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary-900 hover:bg-primary-50"><Copy size={16} /> {copied ? "تم النسخ" : "نسخ مسودة العرض"}</button><button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15"><Printer size={16} /> طباعة / PDF</button></div>
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
          <CardHeader title="Proposal Snapshot" subtitle="صياغة عرض ديمو مبنية على المنتجات والمسارات الموجودة." />
          <CardBody>
            <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-4">
              <div className="text-xs text-ink-400">Client</div><div className="mt-1 text-lg font-bold text-ink-900">{client}</div>
              <div className="mt-4 text-xs text-ink-400">Job</div><div className="mt-1 text-base font-semibold text-ink-800">{jobTitle}</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl border border-primary-200 bg-primary-50 p-4"><div className="text-xs text-primary-700">Proof coverage</div><div className="mt-1 text-2xl font-black text-primary-900">{matched.length ? Math.round((matched.length / Math.max(1, mapped.length)) * 100) : 0}%</div><div className="mt-1 text-[10px] text-primary-700">مطابقة أولية للمتطلبات</div></div><div className="rounded-xl border border-ink-200 bg-white p-4"><div className="text-xs text-ink-500">حالة الدليل</div><div className="mt-1 flex flex-wrap gap-1.5 text-[10px] font-bold text-ink-700"><span>{proofCounts.LIVE_SURFACE ?? 0} عرض حي</span><span>·</span><span>{proofCounts.PARTIAL ?? 0} جزئي</span><span>·</span><span>{proofCounts.RUNTIME_REQUIRED ?? 0} يحتاج تشغيل</span></div></div></div><div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-success-200 bg-success-50 p-4"><div className="text-xs text-success-700">Matched</div><div className="mt-1 text-2xl font-black text-success-800">{matched.length}</div></div>
              <div className="rounded-xl border border-warning-200 bg-warning-50 p-4"><div className="text-xs text-warning-700">Needs review</div><div className="mt-1 text-2xl font-black text-warning-800">{unmatched.length}</div></div>
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
                <div className="min-w-0"><div className="text-sm font-semibold text-ink-800">{item.requirement}</div>{item.match && <div className="mt-1 text-xs text-ink-400">Mapped to: {item.match.title}</div>}</div>
                {item.match ? <div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-700"><CheckCircle2 size={14} /> قدرة موجودة</span><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${item.match.proofState === "LIVE_SURFACE" ? "bg-success-50 text-success-700" : item.match.proofState === "PARTIAL" ? "bg-warning-50 text-warning-700" : "bg-danger-50 text-danger-700"}`}>{item.match.proofState === "LIVE_SURFACE" ? <ShieldCheck size={14}/> : <AlertTriangle size={14}/>} {item.match.proofState === "LIVE_SURFACE" ? "مسار عرض حي" : item.match.proofState === "PARTIAL" ? "إثبات جزئي" : "تشغيل مطلوب قبل ادعاء الإنتاج"}</span><Link to={item.match.path} className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 print:hidden">Live Demo <ArrowUpRight size={14} /></Link></div> : <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-50 px-3 py-1 text-xs font-medium text-warning-700">Proof Gap — يحتاج مراجعة بشرية</span>}
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Proposal Draft" subtitle="مسودة claim-safe مبنية فقط على القدرات المطابقة وحدود دليلها." />
        <CardBody>
          <div className="rounded-2xl border border-primary-100 bg-primary-50/60 p-5 whitespace-pre-wrap text-sm leading-7 text-ink-700">{proposalDraft}</div>
          <div className="mt-3 text-[11px] text-ink-400">المسودة ليست تعهدًا تعاقديًا، ولا تتجاوز Proof State الحالي.</div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Live Demo Sequence" subtitle="تدفق مقترح لعرض حقيقي بدون نسخ منفصلة من المنتج." />
        <CardBody>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {matched.slice(0, 8).map((item, index) => <Link key={`${item.requirement}-${index}`} to={item.match!.path} className="rounded-xl border border-ink-100 p-4 transition hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50/40 print:border-ink-300"><div className="text-xs font-bold text-primary-600">0{index + 1}</div><div className="mt-2 text-sm font-semibold text-ink-800">{item.match!.title}</div><div className="mt-1 text-xs leading-5 text-ink-400">{item.match!.description}</div></Link>)}
          </div>
        </CardBody>
      </Card>

      <div className="text-xs leading-5 text-ink-400">لا تُنشئ هذه الشاشة بيانات أعمال اصطناعية ولا تنقل Evidence من SHA إلى SHA. كل رابط يفتح الوحدة الفعلية في Report-Advisor، وتبقى نتائج الأعمال والقيم الرقمية تحت مصدر الحقيقة والـtenant الحالي.</div>
    </div>
  );
}
