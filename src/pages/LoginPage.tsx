import { FormEvent, useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, LogIn, Loader2, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const cleanEmail = email.trim();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (signInError) setError('تعذر تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور ثم حاول مرة أخرى.');
    setSubmitting(false);
  }

  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-[#f7faf8] text-ink-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-amber-200/25 blur-3xl" />
        <div className="absolute right-1/3 top-1/3 h-72 w-72 rounded-full bg-teal-200/15 blur-3xl" />
      </div>
      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-5 py-8 lg:grid-cols-[1.05fr_.95fr] lg:px-10">
        <section className="hidden min-h-[720px] overflow-hidden rounded-[2.75rem] bg-gradient-to-br from-emerald-950 via-emerald-900 to-[#5a4710] p-10 text-white shadow-[0_30px_100px_rgba(2,44,34,.24)] lg:flex lg:flex-col lg:justify-between" aria-label="تعريف المنصة">
          <div><div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-md"><Sparkles size={16} className="text-amber-300" /> منصة ذكاء الأعمال والقرار</div><h2 className="mt-10 max-w-xl text-5xl font-black leading-[1.12] tracking-tight xl:text-6xl">من الأرقام إلى<span className="block bg-gradient-to-l from-amber-200 via-amber-100 to-white bg-clip-text text-transparent">قرارات أوضح.</span></h2><p className="mt-6 max-w-lg text-base leading-8 text-emerald-50/75">مساحة تنفيذية واحدة لفهم الأداء، اكتشاف الفرص، متابعة المخاطر، وتحويل البيانات إلى قرارات قابلة للتنفيذ.</p></div>
          <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-3xl border border-white/10 bg-white/[.08] p-5 backdrop-blur-xl"><TrendingUp size={22} className="text-amber-300" /><div className="mt-5 text-lg font-bold">رؤية أعمق</div><div className="mt-1 text-xs leading-5 text-white/60">مؤشرات وذكاء تشغيلي في مكان واحد</div></div><div className="rounded-3xl border border-white/10 bg-white/[.08] p-5 backdrop-blur-xl"><ShieldCheck size={22} className="text-emerald-300" /><div className="mt-5 text-lg font-bold">عزل آمن</div><div className="mt-1 text-xs leading-5 text-white/60">هوية وصلاحيات وبيانات محمية</div></div><div className="rounded-3xl border border-white/10 bg-white/[.08] p-5 backdrop-blur-xl"><CheckCircle2 size={22} className="text-amber-200" /><div className="mt-5 text-lg font-bold">قرار موثوق</div><div className="mt-1 text-xs leading-5 text-white/60">أدلة واضحة قبل اتخاذ القرار</div></div></div>
        </section>
        <section className="mx-auto w-full max-w-xl rounded-[2.5rem] border border-white/80 bg-white/90 p-6 shadow-[0_30px_90px_rgba(15,23,42,.12)] backdrop-blur-xl sm:p-10 lg:p-12" aria-labelledby="login-title">
          <div className="mb-8 flex items-center justify-between"><div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-emerald-700 via-emerald-600 to-amber-500 text-2xl font-black text-white shadow-lg shadow-emerald-900/20" aria-hidden="true">ع</div><div className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">دخول آمن</div></div>
          <div><p className="text-sm font-semibold text-emerald-700">مرحباً بعودتك</p><h1 id="login-title" className="mt-2 text-3xl font-black tracking-tight text-ink-950 sm:text-4xl">تسجيل الدخول</h1><p className="mt-3 max-w-md text-sm leading-7 text-ink-500">ادخل إلى منصة الأغبري لذكاء الأعمال والقرار وواصل العمل من حيث توقفت.</p></div>
          <form onSubmit={handleSubmit} className="mt-9 space-y-5" noValidate>
            <div><label htmlFor="login-email" className="mb-2.5 block text-sm font-bold text-ink-700">البريد الإلكتروني</label><input id="login-email" type="email" autoComplete="username" required value={email} onChange={(event) => { setEmail(event.target.value); if(error)setError(null); }} className="input h-14 rounded-2xl px-5 text-base" placeholder="أدخل بريدك الإلكتروني" dir="ltr" aria-invalid={Boolean(error)} /></div>
            <div><label htmlFor="login-password" className="mb-2.5 block text-sm font-bold text-ink-700">كلمة المرور</label><div className="relative"><input id="login-password" type={showPassword?'text':'password'} autoComplete="current-password" required value={password} onChange={(event) => { setPassword(event.target.value); if(error)setError(null); }} className="input h-14 w-full rounded-2xl px-5 pl-14 text-base" placeholder="أدخل كلمة المرور" dir="ltr" aria-invalid={Boolean(error)} /><button type="button" onClick={()=>setShowPassword(value=>!value)} className="absolute left-2 top-2 flex h-10 w-10 items-center justify-center rounded-xl text-ink-400 transition hover:bg-ink-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/10" aria-label={showPassword?'إخفاء كلمة المرور':'إظهار كلمة المرور'} aria-pressed={showPassword}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></div>
            {error && <div role="alert" aria-live="assertive" className="flex items-start gap-2 rounded-2xl border border-danger-100 bg-danger-50 px-4 py-3.5 text-sm text-danger-700"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
            <button type="submit" disabled={submitting} className="btn-primary h-14 w-full rounded-2xl text-base font-bold disabled:cursor-wait disabled:opacity-60" aria-busy={submitting}>{submitting ? <Loader2 size={19} className="animate-spin" /> : <LogIn size={19} />}{submitting ? 'جارٍ تسجيل الدخول...' : 'دخول إلى المنصة'}{!submitting && <ArrowLeft size={18} className="mr-1" />}</button>
          </form>
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-ink-100 bg-ink-50/70 p-4"><ShieldCheck size={19} className="shrink-0 text-emerald-700" /><p className="text-xs leading-5 text-ink-500">يتم تحديد الهوية والصلاحيات من حسابك الفعلي، ولا يوجد حساب تجريبي افتراضي.</p></div>
        </section>
      </div>
    </main>
  );
}
