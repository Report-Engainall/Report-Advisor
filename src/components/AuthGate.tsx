import { useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { getAuthenticatedUser, onAuthStateChange } from '@/lib/auth-session';
import { LoginPage } from '@/pages/LoginPage';

interface AuthGateProps {
  children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    void getAuthenticatedUser().then((authenticatedUser) => {
      if (!mounted) return;
      setUser(authenticatedUser);
      setChecking(false);
    });

    const unsubscribe = onAuthStateChange((nextUser) => {
      if (!mounted) return;
      setUser(nextUser);
      setChecking(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  if (checking) {
    return (
      <div dir="rtl" className="min-h-screen bg-ink-50 flex items-center justify-center p-6" role="status" aria-live="polite">
        <div className="rounded-2xl border border-ink-100 bg-white px-8 py-7 shadow-sm text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          <p className="mt-4 text-sm text-ink-500">جارٍ التحقق من جلسة الدخول...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return <>{children}</>;
}
