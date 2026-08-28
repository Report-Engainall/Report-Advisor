import { FormEvent, useState } from 'react';
import { AlertCircle, LogIn, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
    <main dir="rtl" className="min-h-screen bg-ink-50 flex items-center justify-center p-5">
      <section className="w-full max-w-md rounded-3xl border border-ink-100 bg-white p-7 sm:p-9 shadow-elevated">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 text-2xl font-black text-white">N</div>
          <h1 className="mt-5 text-2xl font-bold text-ink-900">تسجيل الدخول</h1>
          <p className="mt-2 text-sm leading-6 text-ink-500">سجّل الدخول للوصول إلى منصة Nasr لذكاء الأعمال والقرار.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div><label htmlFor="login-email" className="mb-2 block text-sm font-medium text-ink-700">البريد الإلكتروني</label><input id="login-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100" placeholder="أدخل بريدك الإلكتروني" dir="ltr" /></div>
          <div><label htmlFor="login-password" className="mb-2 block text-sm font-medium text-ink-700">كلمة المرور</label><input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100" placeholder="أدخل كلمة المرور" dir="ltr" /></div>
          {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-danger-100 bg-danger-50 px-3 py-3 text-sm text-danger-700"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
          <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}{submitting ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}</button>
        </form>
        <p className="mt-6 text-center text-xs leading-5 text-ink-400">لا يوجد حساب تجريبي افتراضي. يتم تحديد الهوية والصلاحيات من حسابك الفعلي.</p>
      </section>
    </main>
  );
}
