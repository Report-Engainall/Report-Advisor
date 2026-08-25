import { useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { getAuthenticatedUser, onAuthStateChange } from '@/lib/auth-session';
import { resolveCurrentCompanyId, supabase } from '@/lib/supabase';
import { LoginPage } from '@/pages/LoginPage';

interface AuthGateProps {
  children: ReactNode;
}

type GateState = 'checking' | 'ready' | 'unauthenticated' | 'tenant-missing';

export function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<GateState>('checking');

  useEffect(() => {
    let mounted = true;

    const sync = async (authenticatedUser: User | null) => {
      if (!authenticatedUser) {
        if (mounted) {
          setUser(null);
          setState('unauthenticated');
        }
        return;
      }

      if (mounted) {
        setUser(authenticatedUser);
        setState('checking');
      }

      const companyId = await resolveCurrentCompanyId();
      if (!mounted) return;

      if (!companyId) {
        setState('tenant-missing');
        return;
      }

      setState('ready');
    };

    void getAuthenticatedUser().then(sync);
    const unsubscribe = onAuthStateChange((nextUser) => { void sync(nextUser); });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  if (state === 'checking') {
    return (
      <div dir="rtl" className="min-h-screen bg-ink-50 flex items-center justify-center p-6" role="status" aria-live="polite">
        <div className="rounded-2xl border border-ink-100 bg-white px-8 py-7 shadow-sm text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          <p className="mt-4 text-sm text-ink-500">جارٍ التحقق من جلسة الدخول والشركة...</p>
        </div>
      </div>
    );
  }

  if (state === 'unauthenticated') return <LoginPage />;

  if (state === 'tenant-missing') {
    return (
      <div dir="rtl" className="min-h-screen bg-ink-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-2xl border border-warning-200 bg-white p-8 shadow-sm text-center">
          <h1 className="text-xl font-bold text-ink-900">لم يتم تحديد شركة للمستخدم</h1>
          <p className="mt-2 text-sm leading-6 text-ink-500">تم تسجيل الدخول، لكن لا توجد عضوية شركة نشطة يمكن للنظام استخدامها. تم إيقاف البيانات عمدًا لحماية العزل بين الشركات.</p>
          <button type="button" onClick={() => void supabase.auth.signOut()} className="mt-6 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white">تسجيل الخروج</button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
