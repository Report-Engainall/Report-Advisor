import { useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { getAuthenticatedUser, onAuthStateChange } from '@/lib/auth-session';
import { resolveCurrentCompanyId, supabase } from '@/lib/supabase';
import { LoginPage } from '@/pages/LoginPage';
import { AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface AuthGateProps { children: ReactNode; }
type GateState = 'checking' | 'ready' | 'unauthenticated' | 'tenant-missing';

const TENANT_RETRY_COUNT = 6;
const TENANT_RETRY_DELAY_MS = 400;

async function resolveTenantWithRetry(): Promise<string | null> {
  for (let attempt = 1; attempt <= TENANT_RETRY_COUNT; attempt += 1) {
    const companyId = await resolveCurrentCompanyId();
    if (companyId) return companyId;
    if (attempt < TENANT_RETRY_COUNT) await new Promise(resolve => window.setTimeout(resolve, TENANT_RETRY_DELAY_MS));
  }
  return null;
}

export function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<GateState>('checking');

  useEffect(() => {
    let mounted = true;
    const sync = async (authenticatedUser: User | null) => {
      if (!authenticatedUser) {
        if (mounted) { setUser(null); setState('unauthenticated'); }
        return;
      }
      if (mounted) { setUser(authenticatedUser); setState('checking'); }
      const companyId = await resolveTenantWithRetry();
      if (!mounted) return;
      setState(companyId ? 'ready' : 'tenant-missing');
    };
    void getAuthenticatedUser().then(sync);
    const unsubscribe = onAuthStateChange(nextUser => { void sync(nextUser); });
    return () => { mounted = false; unsubscribe(); };
  }, []);

  if (state === 'checking') return (
    <div dir="rtl" className="min-h-screen bg-[#0d1510] p-6 text-white">
      <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center">
        <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center shadow-elevated backdrop-blur">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-lg font-black">أ</div>
          <div className="mt-5 text-base font-black">الأغبري</div>
          <div className="mt-1 text-[10px] text-slate-500">جارٍ تثبيت الهوية وسياق الشركة</div>
          <div className="mx-auto mt-7 h-8 w-8 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" role="status" aria-label="جارٍ التحقق"/>
        </div>
      </div>
    </div>
  );

  if (state === 'unauthenticated') return <LoginPage />;

  if (state === 'tenant-missing') return (
    <div dir="rtl" className="min-h-screen bg-[#0d1510] p-6 text-white">
      <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center">
        <div className="w-full max-w-lg rounded-[2rem] border border-warning-400/15 bg-white/5 p-8 text-center shadow-elevated backdrop-blur">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-warning-500/10 text-warning-300"><AlertTriangle size={22}/></div>
          <h1 className="mt-5 text-xl font-black">السياق التجاري غير مكتمل</h1>
          <p className="mt-2 text-sm leading-7 text-slate-400">تم التحقق من الحساب، لكن لا توجد عضوية شركة نشطة يمكن اعتمادها. تم إيقاف البيانات عمدًا بدل فتح مساحة غير محددة.</p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-right"><div className="flex items-center gap-2 text-sm font-bold text-primary-100"><ShieldCheck size={16}/> حماية العزل مفعلة</div><p className="mt-1 text-xs leading-5 text-slate-500">لا يتم اختيار شركة افتراضية ولا يتم تمرير بيانات من مستأجر آخر.</p></div>
          <button type="button" onClick={() => void supabase.auth.signOut()} className="btn mt-6 w-full border border-white/10 bg-white text-ink-950 hover:bg-slate-100"><CheckCircle2 size={17}/> تسجيل الخروج</button>
        </div>
      </div>
    </div>
  );

  return <>{children}</>;
}
