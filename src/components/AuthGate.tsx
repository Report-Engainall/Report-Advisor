import { useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { getAuthenticatedUser, onAuthStateChange } from '@/lib/auth-session';
import { resolveCurrentCompanyId, supabase } from '@/lib/supabase';
import { LoginPage } from '@/pages/LoginPage';

interface AuthGateProps { children: ReactNode; }
type GateState = 'checking' | 'ready' | 'unauthenticated' | 'tenant-missing' | 'tenant-error';

export function AuthGate({ children }: AuthGateProps) {
  const [state, setState] = useState<GateState>('checking');
  const [tenantError, setTenantError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const sync = async (authenticatedUser: User | null) => {
      if (!authenticatedUser) {
        if (mounted) { setTenantError(null); setState('unauthenticated'); }
        return;
      }
      if (mounted) { setTenantError(null); setState('checking'); }
      try {
        const companyId = await resolveCurrentCompanyId();
        if (!mounted) return;
        if (!companyId) { setState('tenant-missing'); return; }
        setState('ready');
      } catch (error) {
        if (!mounted) return;
        setTenantError(error instanceof Error ? error.message : 'تعذر التحقق من عضوية الشركة.');
        setState('tenant-error');
      }
    };
    void getAuthenticatedUser().then(sync).catch((error) => {
      if (!mounted) return;
      setTenantError(error instanceof Error ? error.message : 'تعذر التحقق من جلسة الدخول.');
      setState('tenant-error');
    });
    const unsubscribe = onAuthStateChange((nextUser) => { void sync(nextUser); });
    return () => { mounted = false; unsubscribe(); };
  }, []);

  if (state === 'checking') return (
    <div dir="rtl" className="min-h-screen bg-ink-50 flex items-center justify-center p-6" role="status" aria-live="polite">
      <div className="rounded-2xl border border-ink-100 bg-white px-8 py-7 shadow-sm text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        <p className="mt-4 text-sm text-ink-500">جارٍ التحقق من جلسة الدخول والشركة...</p>
      </div>
    </div>
  );
  if (state === 'unauthenticated') return <LoginPage />;
  if (state === 'tenant-missing') return (
    <div dir="rtl" className="min-h-screen bg-ink-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-warning-200 bg-white p-8 shadow-sm text-center">
        <h1 className="text-xl font-bold text-ink-900">لم يتم تحديد شركة للمستخدم</h1>
        <p className="mt-2 text-sm leading-6 text-ink-500">تم تسجيل الدخول، لكن لا توجد عضوية شركة نشطة يمكن للنظام استخدامها. تم إيقاف البيانات عمدًا لحماية العزل بين الشركات.</p>
        <button type="button" onClick={() => void supabase.auth.signOut()} className="mt-6 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white">تسجيل الخروج</button>
      </div>
    </div>
  );
  if (state === 'tenant-error') return (
    <div dir="rtl" className="min-h-screen bg-ink-50 flex items-center justify-center p-6">
      <div role="alert" className="w-full max-w-lg rounded-2xl border border-danger-200 bg-white p-8 shadow-sm text-center">
        <h1 className="text-xl font-bold text-ink-900">تعذر التحقق من الشركة</h1>
        <p className="mt-2 text-sm leading-6 text-ink-500">تم إيقاف تحميل بيانات النظام لأن التحقق من عضوية الشركة فشل. لا يتم تجاوز العزل أو استخدام شركة افتراضية.</p>
        {tenantError && <p className="mt-3 rounded-xl bg-danger-50 p-3 text-xs text-danger-700">{tenantError}</p>}
        <div className="mt-5 flex justify-center gap-2">
          <button type="button" onClick={() => window.location.reload()} className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white">إعادة المحاولة</button>
          <button type="button" onClick={() => void supabase.auth.signOut()} className="rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-700">تسجيل الخروج</button>
        </div>
      </div>
    </div>
  );
  return <>{children}</>;
}
