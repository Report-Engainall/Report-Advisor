import { ArrowUpLeft, BadgeCheck, Bot, Gauge, GitCompare, Landmark, ShieldCheck, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';

const capabilities = [
  { title: 'Evidence Passport', detail: 'المصدر، الفترة، الشركة، as-of، freshness، الحالة ومراجع الدليل في بطاقة واحدة.', icon: ShieldCheck, state: 'جاهز', path: '/decision-experience?stage=evidence' },
  { title: 'Decision ROI', detail: 'Expected مقابل Actual وDelta، مع إبقاء النتيجة Pending حتى يثبت التنفيذ الحقيقي.', icon: Gauge, state: 'جاهز', path: '/decision-experience?stage=outcome' },
  { title: 'Money Recovery', detail: 'تحصيل متأخر، تعرض المخزون، وضغط الهامش مشتقة من المصدر الكانوني بدون تقدير مصطنع.', icon: Landmark, state: 'فعلي من المصدر', path: '/' },
  { title: 'Decision Operating System', detail: 'إشارة → دليل → قرار → موافقة → تنفيذ → نتيجة → تعلّم، باستخدام دورة القرار الموجودة.', icon: Workflow, state: 'بنية حقيقية', path: '/decision-experience' },
  { title: 'Schema Drift Guard', detail: 'تغيّر الأعمدة أو الأنواع لا يمر بصمت؛ التغييرات الحرجة تُحوّل إلى مراجعة.', icon: GitCompare, state: 'محرك جاهز', path: '/import/analyze' },
  { title: 'Evidence Agent Protocol', detail: 'عقد منظم لوكلاء AI لطلب truth context دون اختراع أرقام أو evidence.', icon: Bot, state: 'Protocol 1.0', path: '/metrics' },
] as const;

export function AghbariMoatPanel() {
  return <section className="rounded-3xl border border-primary-200 bg-gradient-to-br from-primary-50 to-white p-5 shadow-card">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2 text-[10px] font-black tracking-[.13em] text-primary-700"><BadgeCheck size={14}/> AGHBARI DIFFERENTIATION LAYER</div>
        <h2 className="mt-1 text-xl font-black text-ink-950">لماذا لا نتنافس كـ Dashboard آخر؟</h2>
        <p className="mt-1 max-w-3xl text-xs leading-6 text-ink-600">القيمة هنا ليست “AI أكثر”، بل ربط الرقم بالدليل، والدليل بالقرار، والقرار بالنتيجة الفعلية.</p>
      </div>
      <span className="rounded-full bg-primary-700 px-3 py-1.5 text-[10px] font-black text-white">Business Decision OS</span>
    </div>
    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{capabilities.map(({ title, detail, icon: Icon, state, path }) =>
      <Link key={title} to={path} className="group rounded-2xl border border-ink-100 bg-white p-4 transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-sm">
        <div className="flex items-start justify-between gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><Icon size={17}/></span><span className="rounded-full bg-ink-50 px-2 py-1 text-[9px] font-black text-ink-600">{state}</span></div>
        <h3 className="mt-3 text-sm font-black text-ink-900">{title}</h3>
        <p className="mt-1 text-xs leading-6 text-ink-500">{detail}</p>
        <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-black text-primary-700">افتح المسار <ArrowUpLeft size={13}/></div>
      </Link>
    )}</div>
  </section>;
}
