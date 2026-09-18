import { useMemo, useState } from 'react';
import { ExternalLink, Copy, Check, Play, ShieldCheck, AlertTriangle, CircleDot, RefreshCw, MonitorUp, FileCheck2, TerminalSquare } from 'lucide-react';

type CheckState = 'pass' | 'blocked' | 'pending';

interface RouteCard {
  path: string;
  label: string;
  group: string;
  note: string;
}

const routes: RouteCard[] = [
  { path: '/', label: 'لوحة القيادة', group: 'رئيسي', note: 'المؤشرات المالية والملخص التنفيذي' },
  { path: '/work-center', label: 'مركز العمليات', group: 'تشغيل', note: 'مسار الأعمال وحالة التنفيذ' },
  { path: '/command-center', label: 'مركز القيادة', group: 'قرار', note: 'القرارات والتنبيهات التنفيذية' },
  { path: '/import', label: 'مركز الاستيراد', group: 'بيانات', note: 'رفع المستندات وتشغيل المسار الحقيقي' },
  { path: '/import/analyze', label: 'تحليل الملفات', group: 'بيانات', note: 'Extraction → Normalization → Validation' },
  { path: '/data-quality', label: 'جودة البيانات', group: 'بيانات', note: 'مشاكل البيانات والتعارضات' },
  { path: '/reports', label: 'مركز التقارير', group: 'تقارير', note: 'التقارير التشغيلية والتنفيذية' },
  { path: '/reports/executive', label: 'التقرير التنفيذي', group: 'تقارير', note: 'Executive readback' },
  { path: '/reports/sales', label: 'المبيعات', group: 'تقارير', note: 'Sales truth' },
  { path: '/reports/receivables', label: 'الذمم والتحصيل', group: 'تقارير', note: 'Receivables and aging' },
  { path: '/reports/profitability', label: 'الربحية', group: 'تقارير', note: 'Profitability truth' },
  { path: '/reports/inventory-intelligence', label: 'ذكاء المخزون', group: 'تقارير', note: 'Inventory intelligence' },
  { path: '/analytics', label: 'مركز التحليلات', group: 'تحليلات', note: 'التحليلات العامة' },
  { path: '/analytics/rfm', label: 'RFM', group: 'تحليلات', note: 'تقسيم العملاء' },
  { path: '/analytics/abc', label: 'ABC', group: 'تحليلات', note: 'تصنيف المنتجات' },
  { path: '/analytics/aging', label: 'الأعمار', group: 'تحليلات', note: 'Aging analysis' },
  { path: '/intelligence', label: 'مركز الذكاء', group: 'ذكاء', note: 'الرؤى والتوصيات' },
  { path: '/intelligence/recommendations', label: 'التوصيات', group: 'ذكاء', note: 'قرارات قابلة للتنفيذ' },
  { path: '/intelligence/forecasts', label: 'التنبؤات', group: 'ذكاء', note: 'Forecasts' },
  { path: '/intelligence/scenarios', label: 'السيناريوهات', group: 'ذكاء', note: 'Truth-guarded scenarios' },
  { path: '/decision-experience', label: 'تجربة القرار', group: 'قرار', note: 'Decision experience' },
  { path: '/metrics', label: 'فحص المقاييس', group: 'قرار', note: 'Metric identity and evidence' },
  { path: '/customers', label: 'العملاء', group: 'كيانات', note: 'Customer master' },
  { path: '/products', label: 'المنتجات', group: 'كيانات', note: 'Product master' },
  { path: '/inventory', label: 'المخزون', group: 'كيانات', note: 'Inventory master' },
  { path: '/alternative-groups', label: 'مجموعات البدائل', group: 'كيانات', note: 'Alternative groups' },
  { path: '/settings', label: 'إعدادات الشركة', group: 'نظام', note: 'Company configuration' },
  { path: '/settings/profile', label: 'الملف الشخصي', group: 'نظام', note: 'User profile' },
];

const blockers = [
  {
    id: 'pdf-text',
    title: 'مسار PDF النصي',
    state: 'blocked' as CheckState,
    cause: 'آخر حالة تشغيلية محفوظة أشارت إلى POSITIVE_POLICY_COMMIT_UNAVAILABLE؛ يجب إثبات المسار الحقيقي حتى commit.',
    action: 'أصلح extraction → normalization → validation → commit دون اختراع Runner/RPC جديد.',
  },
  {
    id: 'pdf-ocr-ar',
    title: 'PDF العربي / OCR',
    state: 'blocked' as CheckState,
    cause: 'آخر سجل محفوظ أشار إلى فشل نفس بوابة positive-policy؛ لا يُقبل دليل اصطناعي.',
    action: 'أثبت OCR الحقيقي مع thresholds ثم اربطه بالـ canonical commit والأدلة.',
  },
  {
    id: 'persistence',
    title: 'Business Persistence E2E',
    state: 'pending' as CheckState,
    cause: 'كان آخر تقرير تشغيلي يضعه تحت الإغلاق، مع تغييرات لاحقة على main يجب إعادة ربطها بـ Exact HEAD.',
    action: 'نفّذ persistence على الرأس الدقيق الحالي، لا على SHA تاريخي، ثم احفظ evidence.',
  },
];

const programmerCommand = `تابع من Exact Main الحالي فقط. لا تعيد تدقيق CLOSED checks ولا تنقل أي evidence تاريخي إلى SHA جديد.

الأولوية:
1) أغلق PDF text وPDF OCR العربي عبر المسار الحقيقي: extraction → normalization → validation → evidence → canonical DB commit → rendered result.
2) أغلق Business Persistence E2E على Exact HEAD.
3) افحص أي regression ناتج عن آخر merges.
4) لا تضف Runner/RPC جديدًا إذا كان المسار الحالي قابلًا للإصلاح.
5) لا bypass، لا fixture، لا fake PASS، لا JWT مزيف، ولا كتابة UI مباشرة لإغلاق import.
6) لكل إصلاح: test → evidence → exact SHA → classification.
7) عند إغلاق جبهة، انتقل مباشرة للجبهة التالية دون انتظار.`;

function stateLabel(state: CheckState) {
  if (state === 'pass') return 'مغلق';
  if (state === 'blocked') return 'حاجز';
  return 'قيد الإثبات';
}

export function OpsConsolePage() {
  const [selectedPath, setSelectedPath] = useState('/command-center');
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState('الكل');

  const groups = useMemo(() => ['الكل', ...Array.from(new Set(routes.map(r => r.group)))], []);
  const visibleRoutes = useMemo(() => filter === 'الكل' ? routes : routes.filter(r => r.group === filter), [filter]);

  async function copyCommand() {
    await navigator.clipboard.writeText(programmerCommand);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function openRoute(path: string) {
    window.open(path, '_blank', 'noopener,noreferrer');
  }

  return (
    <div dir="rtl" className="space-y-6 pb-12">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(59,130,246,.28),transparent_28%),radial-gradient(circle_at_85%_80%,rgba(14,165,233,.18),transparent_30%)]" />
        <div className="relative grid gap-6 p-6 lg:grid-cols-[1.35fr_.65fr] lg:p-8">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200">
              <ShieldCheck size={14} /> غرفة إنقاذ وتشغيل — دون bypass
            </div>
            <h1 className="text-2xl font-black tracking-tight lg:text-4xl">Report-Advisor Rescue Console</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              شاشة واحدة لفتح الواجهات، عزل المشاكل، نسخ أمر التنفيذ للمبرمج، ومراجعة الحالة على Exact HEAD بدل الدوران بين صفحات متعددة.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button className="btn-primary" onClick={() => openRoute(selectedPath)}><MonitorUp size={16} /> فتح الواجهة المحددة</button>
              <button className="btn-secondary bg-white/10 text-white border-white/15 hover:bg-white/15" onClick={copyCommand}>
                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'تم النسخ' : 'نسخ أمر المبرمج'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 self-end">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs text-slate-400">Exact Main</div><div className="mt-2 font-mono text-sm">4f3a5047…</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs text-slate-400">واجهات مكتشفة</div><div className="mt-2 text-2xl font-black">{routes.length}</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs text-slate-400">حواجز محفوظة</div><div className="mt-2 text-2xl font-black">{blockers.filter(b => b.state === 'blocked').length}</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs text-slate-400">قاعدة التشغيل</div><div className="mt-2 text-sm font-bold">Fail-Closed</div></div>
          </div>
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-ink-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink-900">لوحة الحواجز</h2>
            <p className="mt-1 text-xs text-ink-500">هذه الحالات مأخوذة من آخر الحالة التشغيلية المعروفة، وتحتاج إعادة ربط بـ Exact HEAD قبل إعلان الإغلاق.</p>
          </div>
          <button className="btn-secondary" onClick={() => window.location.reload()}><RefreshCw size={16} /> تحديث الشاشة</button>
        </div>
        <div className="grid gap-3 p-4 lg:grid-cols-3">
          {blockers.map(item => (
            <article key={item.id} className="rounded-2xl border border-ink-100 bg-ink-50/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-ink-900">{item.title}</h3>
                <span className={item.state === 'blocked' ? 'badge-danger' : item.state === 'pass' ? 'badge-success' : 'badge-warning'}>{item.state === 'blocked' ? <AlertTriangle size={13}/> : <CircleDot size={13}/>} {stateLabel(item.state)}</span>
              </div>
              <p className="mt-3 text-xs leading-6 text-ink-600">{item.cause}</p>
              <div className="mt-3 rounded-xl border border-ink-100 bg-white p-3 text-xs leading-6 text-ink-700">
                <span className="font-bold">الإجراء:</span> {item.action}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <div className="card overflow-hidden">
          <div className="border-b border-ink-100 p-5">
            <h2 className="text-lg font-bold text-ink-900">عارض الواجهات</h2>
            <p className="mt-1 text-xs text-ink-500">اختر شاشة ثم اعرضها في معاينة مباشرة أو افتحها في تبويب مستقل.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {groups.map(group => (
                <button key={group} onClick={() => setFilter(group)} className={filter === group ? 'badge-primary cursor-pointer' : 'badge-neutral cursor-pointer hover:bg-ink-200'}>{group}</button>
              ))}
            </div>
          </div>
          <div className="max-h-[620px] overflow-auto p-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {visibleRoutes.map(route => (
                <button key={route.path} onClick={() => setSelectedPath(route.path)} className={selectedPath === route.path ? 'rounded-2xl border border-primary-200 bg-primary-50 p-3 text-right shadow-sm' : 'rounded-2xl border border-ink-100 bg-white p-3 text-right hover:border-primary-200 hover:bg-primary-50/40'}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-primary-600"><Play size={14} /></div>
                    <div className="min-w-0">
                      <div className="font-semibold text-ink-800">{route.label}</div>
                      <div className="mt-1 truncate font-mono text-[10px] text-ink-400" dir="ltr">{route.path}</div>
                      <div className="mt-1 text-[11px] leading-5 text-ink-500">{route.note}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink-100 p-5">
            <div>
              <h2 className="text-lg font-bold text-ink-900">المعاينة</h2>
              <div className="mt-1 font-mono text-[11px] text-ink-400" dir="ltr">{selectedPath}</div>
            </div>
            <button className="btn-ghost" onClick={() => openRoute(selectedPath)}><ExternalLink size={16} /> فتح</button>
          </div>
          <div className="bg-ink-100 p-3">
            <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-inner">
              <iframe title="معاينة الواجهة" src={selectedPath} className="h-[620px] w-full bg-white" />
            </div>
          </div>
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <div className="flex items-center gap-2"><TerminalSquare size={18} className="text-primary-600" /><h2 className="text-lg font-bold text-ink-900">أمر التنفيذ للمبرمج</h2></div>
            <pre dir="rtl" className="mt-4 whitespace-pre-wrap rounded-2xl bg-slate-950 p-5 font-mono text-xs leading-6 text-slate-100">{programmerCommand}</pre>
          </div>
          <div className="flex flex-col gap-2 lg:min-w-52">
            <button className="btn-primary" onClick={copyCommand}>{copied ? <Check size={16} /> : <Copy size={16} />} نسخ الأمر</button>
            <button className="btn-secondary" onClick={() => openRoute('/work-center')}><FileCheck2 size={16} /> فتح مركز العمليات</button>
          </div>
        </div>
      </section>
    </div>
  );
}
