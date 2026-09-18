import { useMemo, useState } from 'react';
import { AlertTriangle, Check, CircleDot, Copy, ExternalLink, FileCheck2, LifeBuoy, MonitorUp, Play, RefreshCw, TerminalSquare } from 'lucide-react';

type State = 'open' | 'evidence' | 'closed';

const routes = [
  ['/', 'لوحة القيادة', 'رئيسي', 'المؤشرات التنفيذية'],
  ['/work-center', 'مركز العمليات', 'تشغيل', 'حالة الأعمال والاستيراد'],
  ['/command-center', 'مركز القيادة', 'قرار', 'الأعمال والإنذارات التنفيذية'],
  ['/import', 'مركز الاستيراد', 'بيانات', 'المسار الحقيقي للمستندات'],
  ['/import/analyze', 'تحليل الملفات', 'بيانات', 'Extraction / normalization / validation'],
  ['/data-quality', 'جودة البيانات', 'بيانات', 'التعارضات ونقص البيانات'],
  ['/reports', 'مركز التقارير', 'تقارير', 'التقارير العامة'],
  ['/reports/executive', 'التقرير التنفيذي', 'تقارير', 'Executive readback'],
  ['/reports/sales', 'المبيعات', 'تقارير', 'Sales truth'],
  ['/reports/receivables', 'الذمم والتحصيل', 'تقارير', 'AR / aging'],
  ['/reports/profitability', 'الربحية', 'تقارير', 'Profitability'],
  ['/reports/inventory-intelligence', 'ذكاء المخزون', 'تقارير', 'Inventory intelligence'],
  ['/reports/demand-velocity', 'حركة الطلب', 'تقارير', 'Demand velocity'],
  ['/analytics', 'مركز التحليلات', 'تحليلات', 'Analytics'],
  ['/analytics/rfm', 'RFM', 'تحليلات', 'Customer segmentation'],
  ['/analytics/abc', 'ABC', 'تحليلات', 'Product classification'],
  ['/analytics/aging', 'الأعمار', 'تحليلات', 'Aging'],
  ['/intelligence', 'مركز الذكاء', 'ذكاء', 'Insights'],
  ['/intelligence/recommendations', 'التوصيات', 'ذكاء', 'Decision-ready recommendations'],
  ['/intelligence/forecasts', 'التنبؤات', 'ذكاء', 'Forecasts'],
  ['/intelligence/scenarios', 'السيناريوهات', 'ذكاء', 'Truth-guarded scenarios'],
  ['/decision-experience', 'تجربة القرار', 'قرار', 'Decision experience'],
  ['/metrics', 'فحص المقاييس', 'قرار', 'Metric identity / evidence'],
  ['/customers', 'العملاء', 'كيانات', 'Customer master'],
  ['/products', 'المنتجات', 'كيانات', 'Product master'],
  ['/inventory', 'المخزون', 'كيانات', 'Inventory master'],
  ['/alternative-groups', 'مجموعات البدائل', 'كيانات', 'Alternative groups'],
  ['/settings', 'الإعدادات', 'نظام', 'Company settings'],
  ['/settings/profile', 'الملف الشخصي', 'نظام', 'Profile'],
] as const;

const blockers = [
  { id:'persistence', title:'Real Business Persistence E2E', state:'open' as State, cause:'المرحلة الحاسمة المتبقية: إثبات أن المسار التجاري الحقيقي يكتب ويقرأ من DB ثم يصمد بعد refresh/session lifecycle.', action:'أصلح أول فشل حقيقي، ثم أثبت DB readback وtenant isolation على Exact Main فقط.' },
  { id:'tenant', title:'Authenticated Tenant A/B runtime', state:'evidence' as State, cause:'يحتاج دليلًا حيًا على القراءة والكتابة وRPC وstorage وعدم التسريب بين A وB.', action:'شغّل Actor A/B على deployment يطابق SHA، واحفظ browser/network/DB evidence.' },
  { id:'report-trigger', title:'Real durable report trigger', state:'evidence' as State, cause:'البنية durable محكمة، لكن ربط أول side-effect تجاري حقيقي بالـ guarded enqueue يحتاج إثبات runtime.', action:'حدد trigger الحقيقي واربطه بالمسار الحالي دون Runner أو RPC جديد ودون تصنيع queue rows.' },
  { id:'migration', title:'Fresh migration / schema parity', state:'open' as State, cause:'يجب أن يكون repository قابلًا لإعادة البناء بنفس schema/function/RLS/grants الموجودة على البيئة المرجعية.', action:'نفّذ replay معزولًا، صنّف الفروقات، وأثبت reconciliation على Exact SHA.' },
  { id:'security', title:'Security hardening closure', state:'open' as State, cause:'تبقى عناصر أمنية تشغيلية مفتوحة، منها classification/adversarial proof وبعض Auth control-plane settings.', action:'صنّف SECURITY DEFINER boundaries، نفّذ الاختبارات adversarial، وأغلق إعدادات Auth المطلوبة.' },
  { id:'cert', title:'Fresh exact-head certification', state:'open' as State, cause:'إصلاح الكود وحده لا يساوي certification؛ يجب أن تتطابق SHA وdeployment وruntime evidence.', action:'جمّع الأدلة الجديدة على Exact Main فقط ثم نفّذ release gate النهائي fail-closed.' },
];

const command = 'تابع من Exact Main الحالي: e1ad9697fbb528dd83950f0239851b3f5e9fbb99.\nآخر merges أغلقت PDF runtime وprivate storage remediation؛ لا تعُد لهذه الجبهات إلا إذا ظهر regression حقيقي.\n\nنفّذ بالترتيب:\n1) أول فشل حقيقي في Real Business Persistence E2E ثم اقرأ DB بعد العملية وبعد refresh/session lifecycle.\n2) authenticated Tenant A/B adversarial runtime مع deployment/SHA مطابق.\n3) اربط real report-generation trigger بالـ guarded durable execution entrypoint الموجود، دون Runner/RPC جديد.\n4) fresh migration replay/schema/RLS/grants parity.\n5) security classification + adversarial proof + Auth control-plane closure.\n6) fresh exact-head evidence bundle ثم certification fail-closed.\n\nالقواعد: لا bypass، لا fixture، لا fake PASS، لا JWT مزيف، لا historical evidence transfer، لا service-role browser access، ولا إعادة فحوص مغلقة دون تغير مادي. بعد إغلاق كل جبهة انتقل مباشرة التالية.';

const stateMeta: Record<State, { label: string; className: string }> = {
  closed: { label: 'مغلق بالأدلة', className: 'badge-success' },
  evidence: { label: 'قيد الإثبات', className: 'badge-warning' },
  open: { label: 'مفتوح', className: 'badge-danger' },
};

export function OpsConsolePage() {
  const [path, setPath] = useState('/command-center');
  const [group, setGroup] = useState('الكل');
  const [copied, setCopied] = useState(false);
  const groups = useMemo(() => ['الكل', ...Array.from(new Set(routes.map(r => r[2])))], []);
  const visible = useMemo(() => group === 'الكل' ? routes : routes.filter(r => r[2] === group), [group]);

  async function copyCommand() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  const openRoute = () => window.open(path, '_blank', 'noopener,noreferrer');

  return (
    <div dir="rtl" className="space-y-6 pb-10">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(59,130,246,.30),transparent_30%),radial-gradient(circle_at_90%_90%,rgba(14,165,233,.18),transparent_34%)]" />
        <div className="relative grid gap-6 p-6 lg:grid-cols-[1.2fr_.8fr] lg:p-8">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs"><LifeBuoy size={14}/> Rescue Console</div>
            <h1 className="text-3xl font-black tracking-tight lg:text-4xl">غرفة الإنقاذ والتشغيل</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">مكان واحد لرؤية الحواجز الحقيقية، فتح كل الواجهات، نسخ أمر التنفيذ، ومشاهدة أي route دون تغيير منطق الأعمال.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button className="btn-primary" onClick={openRoute}><MonitorUp size={16}/> فتح الواجهة</button>
              <button className="btn-secondary border-white/15 bg-white/10 text-white hover:bg-white/15" onClick={copyCommand}>{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? 'تم النسخ' : 'نسخ أمر التنفيذ'}</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 self-end">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs text-slate-400">Exact Main</div><div className="mt-2 font-mono text-xs">e1ad9697…</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs text-slate-400">واجهات</div><div className="mt-2 text-2xl font-black">{routes.length}</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs text-slate-400">مفتوح الآن</div><div className="mt-2 text-2xl font-black">{blockers.filter(b => b.state === 'open').length}</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs text-slate-400">حالة الإصدار</div><div className="mt-2 text-sm font-bold">Fail-Closed</div></div>
          </div>
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-ink-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="text-lg font-bold text-ink-900">الحواجز الحالية</h2><p className="mt-1 text-xs text-ink-500">آخر حالة موثقة؛ لا تُحوّل أي بطاقة إلى PASS دون دليل Exact-SHA جديد.</p></div>
          <button className="btn-secondary" onClick={() => window.location.reload()}><RefreshCw size={16}/> تحديث</button>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
          {blockers.map(item => <article key={item.id} className="rounded-2xl border border-ink-100 bg-ink-50/60 p-4"><div className="flex items-start justify-between gap-3"><h3 className="font-bold text-ink-900">{item.title}</h3><span className={stateMeta[item.state].className}>{item.state === 'open' ? <AlertTriangle size={13}/> : <CircleDot size={13}/>} {stateMeta[item.state].label}</span></div><p className="mt-3 text-xs leading-6 text-ink-600">{item.cause}</p><div className="mt-3 rounded-xl border border-ink-100 bg-white p-3 text-xs leading-6 text-ink-700"><b>الإجراء:</b> {item.action}</div></article>)}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_.95fr]">
        <div className="card overflow-hidden">
          <div className="border-b border-ink-100 p-5">
            <h2 className="text-lg font-bold text-ink-900">كتالوج الواجهات</h2>
            <p className="mt-1 text-xs text-ink-500">حدد أي شاشة لعرضها مباشرة أو فتحها منفصلة.</p>
            <div className="mt-4 flex flex-wrap gap-2">{groups.map(item => <button key={item} onClick={() => setGroup(item)} className={group === item ? 'badge-primary cursor-pointer' : 'badge-neutral cursor-pointer'}>{item}</button>)}</div>
          </div>
          <div className="max-h-[620px] overflow-auto p-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {visible.map(([route, label, section, note]) => <button key={route} onClick={() => setPath(route)} className={path === route ? 'rounded-2xl border border-primary-200 bg-primary-50 p-3 text-right shadow-sm' : 'rounded-2xl border border-ink-100 bg-white p-3 text-right hover:border-primary-200'}><div className="flex items-start gap-3"><div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-ink-50 text-primary-600"><Play size={14}/></div><div className="min-w-0"><div className="font-semibold text-ink-800">{label}</div><div className="mt-1 font-mono text-[10px] text-ink-400" dir="ltr">{route}</div><div className="mt-1 text-[11px] text-ink-500">{section} — {note}</div></div></div></button>)}
            </div>
          </div>
        </div>
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink-100 p-5"><div><h2 className="text-lg font-bold text-ink-900">المعاينة</h2><div className="mt-1 font-mono text-[11px] text-ink-400" dir="ltr">{path}</div></div><button className="btn-ghost" onClick={openRoute}><ExternalLink size={16}/> فتح</button></div>
          <div className="bg-ink-100 p-3"><div className="overflow-hidden rounded-2xl border border-ink-200 bg-white"><iframe title="Route preview" src={path} className="h-[620px] w-full bg-white"/></div></div>
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto]"><div><div className="flex items-center gap-2"><TerminalSquare size={18} className="text-primary-600"/><h2 className="text-lg font-bold text-ink-900">أمر التنفيذ</h2></div><pre dir="rtl" className="mt-4 whitespace-pre-wrap rounded-2xl bg-slate-950 p-5 font-mono text-xs leading-6 text-slate-100">{command}</pre></div><div className="flex flex-col gap-2 lg:min-w-52"><button className="btn-primary" onClick={copyCommand}>{copied ? <Check size={16}/> : <Copy size={16}/>} نسخ</button><button className="btn-secondary" onClick={() => window.open('/work-center','_blank','noopener,noreferrer')}><FileCheck2 size={16}/> مركز العمليات</button></div></div>
      </section>
    </div>
  );
}
