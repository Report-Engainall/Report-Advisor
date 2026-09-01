import { FormEvent, useState } from 'react';
import { AlertCircle, LogIn, Loader2, BrainCircuit, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BRAND_DESCRIPTION, BRAND_MARK, BRAND_NAME, BRAND_TITLE } from '@/lib/brand';

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
    if (signInError) setError('تعذر تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور ثم حاول مرة أخرى.');
    setSubmitting(false);
  }

  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-ink-950 px-5 py-8 sm:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary-500/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>
      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.97] shadow-2xl lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="flex items-center gap-3"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl font-black ring-1 ring-white/20">{BRAND_MARK}</div><div><div className="text-xl font-black tracking-tight">{BRAND_NAME}</div><div className="text-xs text-white/75">{BRAND_TITLE}</div></div></div>
              <div className="mt-16 max-w-md"><p className="mb-3 text-sm font-semibold text-white/70">قرارات أوضح. رؤية أعمق.</p><h2 className="text-4xl font-black leading-tight">حوّل بيانات أعمالك إلى قرارات قابلة للتنفيذ.</h2><p className="mt-5 text-sm leading-7 text-white/80">{BRAND_DESCRIPTION} تجمع الأغبري بين التقارير والتحليلات والذكاء والتوصيات في مساحة عمل واحدة.</p></div>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/75"><ShieldCheck size={16} /> هوية وصلاحيات معزولة لكل شركة</div>
          </div>
          <div className="p-7 sm:p-10">
            <div className="lg:hidden"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 text-xl font-black text-white shadow-lg">{BRAND_MARK}</div><div><div className="font-black text-ink-900">{BRAND_NAME}</div><div className="text-xs text-ink-400">{BRAND_TITLE}</div></div></div></div>
            <div className="mt-8 lg:mt-12"><div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700"><BrainCircuit size={14} /> بوابة الدخول الآمنة</div><h1 className="text-3xl font-black tracking-tight text-ink-900">مرحبًا بك في {BRAND_NAME}</h1><p className="mt-3 max-w-md text-sm leading-6 text-ink-500">سجّل الدخول للوصول إلى {BRAND_TITLE}.</p></div>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div><label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-ink-700">البريد الإلكتروني</label><input id="login-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-ink-200 bg-ink-50/30 px-4 py-3.5 text-sm text-ink-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100" placeholder="أدخل بريدك الإلكتروني" dir="ltr" /></div>
              <div><label htmlFor="login-password" className="mb-2 block text-sm font-semibold text-ink-700">كلمة المرور</label><input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-ink-200 bg-ink-50/30 px-4 py-3.5 text-sm text-ink-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100" placeholder="أدخل كلمة المرور" dir="ltr" /></div>
              {error && <div role="alert" className="flex items-start gap-2 rounded-2xl border border-danger-100 bg-danger-50 px-3.5 py-3 text-sm text-danger-700"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
              <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}{submitting ? 'جارٍ تسجيل الدخول...' : 'الدخول إلى المنصة'}</button>
            </form>
            <p className="mt-7 text-center text-xs leading-5 text-ink-400">لا يوجد حساب تجريبي افتراضي. يتم تحديد الهوية والصلاحيات من حسابك الفعلي.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
