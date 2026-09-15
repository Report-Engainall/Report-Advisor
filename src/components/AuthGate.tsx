import { useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { getAuthenticatedUser, onAuthStateChange } from '@/lib/auth-session';
import { resolveCurrentCompanyId, supabase } from '@/lib/supabase';
import { LoginPage } from '@/pages/LoginPage';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface AuthGateProps {
  children: ReactNode;
}

type GateState = 'checking' | 'ready' | 'unauthenticated' | 'tenant-missing' | 'error';

export function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<GateState>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);

  useEffect(() => {
    let mounted = true;
    let syncVersion = 0;
    let unsubscribe: (() => void) | undefined;

    const fail = (error: unknown) => {
      if (!mounted) return;
      setErrorMessage(error instanceof Error ? error.message : 'تعذر التحقق من جلسة الدخول والشركة.');
      setState('error');
    };

    const sync = async (authenticatedUser: User | null) => {
      const version = ++syncVersion;
      if (!mounted) return;

      if (!authenticatedUser) {
        setUser(null);
        setErrorMessage(null);
        setState('unauthenticated');
        return;
      }

      setUser(authenticatedUser);
      setErrorMessage(null);
      setState('checking');

      try {
        const companyId = await resolveCurrentCompanyId();
        if (!mounted || version !== syncVersion) return;

        if (!companyId) {
          setState('tenant-missing');
          return;
        }

        setState('ready');
      } catch (error) {
        if (version === syncVersion) fail(error);
      }
    };

    const bootstrap = async () => {
      try {
        const initialUser = await getAuthenticatedUser();
        if (!mounted) return;
        unsubscribe = onAuthStateChange((nextUser) => { void sync(nextUser); });
        void sync(initialUser);
      } catch (error) {
        fail(error);
      }
    };
    void bootstrap();

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [retryVersion]);

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

  if (state === 'error') {
    return (
      <div dir="rtl" className="min-h-screen bg-ink-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-2xl border border-danger-200 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-50 text-danger-600"><AlertTriangle size={24}/></div>
          <h1 className="text-xl font-bold text-ink-900">تعذر التحقق من الدخول</h1>
          <p className="mt-2 text-sm leading-6 text-ink-500">حدث خطأ أثناء التحقق من جلسة الدخول أو الشركة. لم يتم عرض بيانات العمل.</p>
          {errorMessage&&<p className="mt-3 rounded-xl bg-ink-50 px-3 py-2 text-xs text-ink-500 break-words">{errorMessage}</p>}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button type="button" onClick={()=>{setErrorMessage(null);setState('checking');setRetryVersion(v=>v+1);}} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white"><RefreshCw size={16}/> إعادة المحاولة</button>
            <button type="button" onClick={()=>void supabase.auth.signOut()} className="rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-700">تسجيل الخروج</button>
          </div>
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
