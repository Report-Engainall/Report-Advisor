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
        void sync(initialUser);
        unsubscribe = onAuthStateChange((nextUser) => { void sync(nextUser); });
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
    return <div className="flex min-h-screen items-center justify-center">جاري التحقق...</div>;
  }

  if (state === 'unauthenticated') return <LoginPage />;

  if (state === 'tenant-missing') {
    return <div className="flex min-h-screen items-center justify-center">لم يتم تحديد شركة للمستخدم.</div>;
  }

  if (state === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3">
        <AlertTriangle className="h-5 w-5" />
        <span>{errorMessage ?? 'تعذر التحقق من جلسة الدخول والشركة.'}</span>
        <button type="button" onClick={() => setRetryVersion((v) => v + 1)}>
          <RefreshCw className="h-4 w-4" />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return <>{children}</>;
}