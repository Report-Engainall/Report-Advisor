import { DatabaseZap, ShieldCheck, Sparkles, FileSearch, CheckCircle2, ArrowLeft, BarChart3, BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CanonicalImportPage } from '@/pages/CanonicalImportPage';
import { FolderBatchImportPanel } from '@/components/FolderBatchImportPanel';

const workflow = [
  { path: '/import', icon: DatabaseZap, step: '01', title: 'إدخال المصدر', text: 'ارفع البيانات عبر مسار الاستيراد المعتمد.' },
  { path: '/import/analyze', icon: FileSearch, step: '02', title: 'فحص وتحليل', text: 'راجع البنية والمحتوى قبل اعتماد أي تغيير.' },
  { path: '/data-quality', icon: CheckCircle2, step: '03', title: 'ثقة البيانات', text: 'تحقق من النقص والتعارضات ومجالات الخطر.' },
  { path: '/reports', icon: BarChart3, step: '04', title: 'قراءة النتائج', text: 'انتقل إلى التقارير بعد اكتمال المصدر.' },
  { path: '/intelligence', icon: BrainCircuit, step: '05', title: 'قرار أذكى', text: 'استخدم الإشارات والتوصيات عندما تصبح البيانات جاهزة.' },
] as const;

export function ImportPage(){
  return <div dir="rtl" className="space-y-7 pb-10 animate-fade-in">
    <section className="experience-hero relative overflow-hidden rounded-[2rem] px-6 py-8 sm:px-9 sm:py-10 lg:px-12">
      <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full bg-amber-300/15 blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-[-100px] right-10 h-72 w-72 rounded-full bg-teal-300/10 blur-3xl" aria-hidden="true" />
      <div className="relative z-10 flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <div className="experience-chip"><DatabaseZap size={14}/> Data Operations</div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">مركز إدخال البيانات</h1>
          <p className="mt-4 text-sm leading-7 text-emerald-50/75 sm:text-base">بوابة البيانات التي تبدأ من المصدر الخام وتنتهي ببيانات موثوقة قابلة للتحليل والقرار — بدون قفزات غامضة أو تعديل خارج المسار المعتمد.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <span className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white ring-1 ring-white/10"><ShieldCheck size={14} className="inline ml-1"/> عزل آمن</span>
          <span className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white ring-1 ring-white/10"><Sparkles size={14} className="inline ml-1"/> مسار موحد</span>
        </div>
      </div>
    </section>

    <section className="grid gap-3 md:grid-cols-5" aria-label="مسار تشغيل البيانات">
      {workflow.map((item,index)=>{const Icon=item.icon; const active=index===0; return <Link key={item.path+item.step} to={item.path} className={`group relative overflow-hidden rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-elevated ${active?'border-emerald-200 bg-emerald-50/70':'border-ink-100 bg-white hover:border-emerald-100'}`}>
        <div className="flex items-start justify-between gap-2"><span className={`text-[10px] font-black tracking-widest ${active?'text-emerald-700':'text-ink-300'}`}>{item.step}</span><Icon size={18} className={active?'text-emerald-700':'text-ink-400'}/></div>
        <h2 className="mt-5 text-sm font-black text-ink-900">{item.title}</h2>
        <p className="mt-1.5 text-[11px] leading-5 text-ink-500">{item.text}</p>
        <ArrowLeft size={13} className="absolute bottom-4 left-4 text-ink-300 transition group-hover:-translate-x-1 group-hover:text-emerald-600" aria-hidden="true" />
      </Link>})}
    </section>

    <section className="rounded-2xl border border-ink-100 bg-white px-4 py-3 shadow-sm sm:px-5">
      <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-ink-600"><ShieldCheck size={16} className="text-emerald-600"/><span className="font-bold">قاعدة التشغيل:</span><span>المعاينة والتحقق يسبقان الاعتماد، ولا نعرض نجاحًا بدل بيانات ناقصة.</span></div>
        <Link to="/data-quality" className="font-black text-emerald-700 hover:text-emerald-800">مركز الثقة ←</Link>
      </div>
    </section>

    <CanonicalImportPage/>
    <FolderBatchImportPanel/>
  </div>
}
