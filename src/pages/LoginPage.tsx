import { FormEvent, useState } from 'react';
import { AlertCircle, ArrowLeft, Brain, CheckCircle2, FileSearch, Loader2, LogIn, ShieldCheck, Sparkles, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const principles = [
  { icon: ShieldCheck, title: 'حقيقة متعددة الطبقات', text: 'المصدر → الصيغة → الفترة → الشركة → الدليل → النتيجة.' },
  { icon: FileSearch, title: 'المستند ليس رقمًا', text: 'استخراج وتطبيع والتحقق مع حفظ الثقة والدليل قبل الاعتماد.' },
  { icon: Brain, title: 'الذكاء داخل السياق', text: 'التوصيات والتنبؤات والسيناريوهات تُعرض داخل مساحة القرار، لا كروبوت منفصل.' },
  { icon: CheckCircle2, title: 'العزل قبل الراحة', text: 'الهوية والصلاحيات وبيانات الشركة تُثبت قبل فتح المساحة التشغيلية.' },
];

const competitiveProofLanes = [
  { title: 'Evidence-First BI', text: 'مؤشر لا يُعرض وحده: تعريفه ومصدره ودليله ومسار القرار.', state: 'مسار منتج' },
  { title: 'Governed Excel / CSV', text: 'من ملف العميل إلى بيانات كانونية بدل إدخال يدوي أو ETL عام.', state: 'مسار منتج' },
  { title: 'Arabic RTL B2B UX', text: 'تجربة عربية أصلية، mobile وlow-bandwidth داخل workflows حقيقية.', state: 'مسار منتج' },
  { title: 'Inventory / Receivables', text: 'من الإشارة التشغيلية إلى التفسير ثم القرار والإجراء.', state: 'مسار منتج' },
  { title: 'Supabase Tenant Security', text: 'RLS وعزل المستأجرين مع إثبات رفض cross-tenant.', state: 'إثبات runtime مطلوب' },
];

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (signInError) setError('تعذر تسجيل الدخول. تحقق من بيانات الحساب ثم حاول مرة أخرى.');
    setSubmitting(false);
  }

  return (
    <main dir="rtl" className="min-h-screen overflow-hidden bg-[#0d1510]">
      <div className="grid min-h-screen lg:grid-cols-[1fr_.78fr]">
        <section className="relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="soft-grid absolute inset-0 opacity-20"/>
          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-primary-600/20 blur-3xl"/>
          <div className="absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-accent-500/10 blur-3xl"/>
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-xl font-black shadow-lg">أ</div>
              <div><div className="text-lg font-black">الأغبري</div><div className="text-[10px] text-slate-400">منصة ذكاء الأعمال والقرار</div></div>
            </div>
            <div className="mt-20 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-300/20 bg-primary-500/10 px-3 py-1.5 text-xs font-bold text-primary-100"><Sparkles size={14}/> Evidence-first BI</div>
              <h1 className="mt-5 text-5xl font-black leading-[1.15]">ليست لوحة مؤشرات.<br/>إنها مساحة قرار متكاملة.</h1>
              <p className="mt-5 max-w-xl text-sm leading-8 text-slate-300">من المستند والاستيراد، إلى جودة البيانات والتحليلات والذكاء والتوصية، ثم القرار والتنفيذ والتقرير التنفيذي — داخل نظام واحد وبهوية عربية أصلية.</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {principles.map(({ icon: Icon, title, text }) => <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"><div className="flex items-center gap-2 text-sm font-black"><Icon size={17} className="text-primary-300"/>{title}</div><p className="mt-2 text-xs leading-6 text-slate-400">{text}</p></div>)}
              </div>
              <div className="mt-5 rounded-2xl border border-primary-300/15 bg-primary-500/5 p-4">
                <div className="flex items-center gap-2 text-xs font-black text-primary-100"><Sparkles size={14}/> خمس طرق محددة لمنافسة المشاريع الأكبر</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {competitiveProofLanes.map(lane => <div key={lane.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-black text-white">{lane.title}</div>
                      <span className="rounded-full bg-white/5 px-2 py-1 text-[9px] font-bold text-primary-200">{lane.state}</span>
                    </div>
                    <p className="mt-1.5 text-[11px] leading-5 text-slate-400">{lane.text}</p>
                  </div>)}
                </div>
              </div>
            </div>
          </div>
          <div className="relative flex items-center gap-2 text-[11px] text-slate-500"><Upload size={13}/> التشغيل منخفض النطاق ومهيأ للويب والجوال.</div>
        </section>

        <section className="relative flex items-center justify-center bg-[#f4f7f4] p-5 sm:p-8 lg:p-12">
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-primary-100/70 blur-3xl lg:hidden"/>
          <div className="relative w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-700 text-lg font-black text-white">أ</div><div><div className="font-black text-ink-950">الأغبري</div><div className="text-[10px] text-ink-400">منصة ذكاء الأعمال والقرار</div></div></div>
            </div>
            <div className="rounded-[2rem] border border-ink-200/80 bg-white p-7 shadow-elevated sm:p-9">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700"><LogIn size={20}/></div>
              <h2 className="mt-5 text-2xl font-black text-ink-950">الدخول إلى مساحة العمل</h2>
              <p className="mt-2 text-sm leading-6 text-ink-500">أدخل حسابك للوصول إلى شركة المستخدم ومساحة البيانات المعتمدة.</p>
              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <div><label htmlFor="login-email" className="mb-2 block text-sm font-bold text-ink-700">البريد الإلكتروني</label><input id="login-email" type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} className="input" placeholder="name@company.com" dir="ltr"/></div>
                <div><label htmlFor="login-password" className="mb-2 block text-sm font-bold text-ink-700">كلمة المرور</label><input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} className="input" placeholder="••••••••••" dir="ltr"/></div>
                {error && <div role="alert" className="flex items-start gap-2 rounded-2xl border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-700"><AlertCircle size={18} className="mt-0.5 shrink-0"/><span>{error}</span></div>}
                <button type="submit" disabled={submitting} className="btn-primary w-full py-3">{submitting ? <Loader2 size={18} className="animate-spin"/> : <ArrowLeft size={18}/>} {submitting ? 'جارٍ التحقق...' : 'الدخول إلى مساحة العمل'}</button>
              </form>
              <div className="mt-6 grid grid-cols-2 gap-2"><div className="rounded-xl bg-ink-50 px-3 py-2 text-center text-[10px] font-semibold text-ink-500">هوية موثقة</div><div className="rounded-xl bg-ink-50 px-3 py-2 text-center text-[10px] font-semibold text-ink-500">شركة معزولة</div></div>
              <p className="mt-5 text-center text-[11px] leading-5 text-ink-400">لا يوجد حساب تجريبي افتراضي. بعد الدخول تُحدد الشركة والصلاحيات من الحساب الفعلي.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
