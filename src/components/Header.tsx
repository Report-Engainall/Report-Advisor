import { useEffect, useMemo, useState } from 'react';
import { Bell, Brain, CheckCircle2, Command, Menu, Search, Upload, WifiOff, AlertTriangle, ChevronLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import type { Alert } from '@/lib/types';
import { SeverityBadge } from './ui/Badge';
import { relativeTime } from '@/lib/format';
import { supabase } from '@/lib/supabase';

type HealthState = 'checking' | 'healthy' | 'degraded' | 'offline';

export function Header({
  alerts,
  alertState,
  onMarkAlertRead,
  onMenuClick,
  onOpenCommandPalette,
}: {
  alerts: Alert[];
  alertState: 'loading' | 'ready' | 'unavailable';
  onMarkAlertRead: (id: string) => void;
  onMenuClick: () => void;
  onOpenCommandPalette: () => void;
}) {
  const [showAlerts, setShowAlerts] = useState(false);
  const [health, setHealth] = useState<HealthState>('checking');
  const location = useLocation();
  const unreadAlerts = alerts.filter(a => !a.is_read);
  const alertsLoading = alertState === 'loading';
  const alertsUnavailable = alertState === 'unavailable';

  const currentLabel = useMemo(() => {
    if (location.pathname === '/') return 'لوحة التحكم';
    const map: Record<string, string> = {
      '/command-center': 'مركز القيادة',
      '/work-center': 'مركز العمل',
      '/import': 'إدخال البيانات',
      '/import/analyze': 'تحليل المستندات',
      '/data-quality': 'جودة البيانات',
      '/reports': 'مركز التقارير',
      '/analytics': 'التحليلات',
      '/intelligence': 'مركز الذكاء',
      '/decision-experience': 'تجربة القرار',
      '/customers': 'العملاء',
      '/products': 'المنتجات',
      '/inventory': 'المخزون',
      '/settings': 'إعدادات الشركة',
    };
    return map[location.pathname] ?? 'واجهة الأغبري';
  }, [location.pathname]);

  useEffect(() => {
    let mounted = true;
    const checkHealth = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (!mounted) return;
        if (sessionError || !sessionData.session) { setHealth('offline'); return; }
        const { data: companyId, error: tenantError } = await supabase.rpc('current_company_id');
        if (!mounted) return;
        setHealth(tenantError || !companyId ? 'degraded' : 'healthy');
      } catch {
        if (mounted) setHealth('offline');
      }
    };
    void checkHealth();
    const timer = window.setInterval(checkHealth, 60_000);
    return () => { mounted = false; window.clearInterval(timer); };
  }, []);

  const healthLabel = health === 'healthy' ? 'متصل' : health === 'offline' ? 'غير متصل' : health === 'degraded' ? 'متأثر' : 'فحص الاتصال';
  const HealthIcon = health === 'healthy' ? CheckCircle2 : health === 'offline' ? WifiOff : AlertTriangle;
  const healthClass = health === 'healthy' ? 'text-success-600' : health === 'checking' ? 'text-ink-400' : 'text-warning-600';

  return (
    <header className="sticky top-0 z-30 border-b border-ink-200/70 bg-[#f4f7f4]/90 backdrop-blur-xl">
      <div className="flex h-[72px] items-center gap-3 px-4 lg:px-8">
        <button onClick={onMenuClick} className="rounded-xl p-2 text-ink-500 hover:bg-white lg:hidden" aria-label="فتح القائمة"><Menu size={21}/></button>

        <div className="hidden xl:flex items-center gap-2 text-xs text-ink-400">
          <span>الأغبري</span><ChevronLeft size={13}/><span className="font-bold text-ink-700">{currentLabel}</span>
        </div>

        <button type="button" onClick={onOpenCommandPalette} className="mx-auto flex h-11 w-full max-w-[560px] items-center gap-3 rounded-2xl border border-ink-200/80 bg-white px-4 text-right text-sm text-ink-400 shadow-sm transition hover:border-primary-300 hover:shadow-card" aria-label="فتح البحث ولوحة الأوامر">
          <Search size={18} className="text-primary-700"/>
          <span className="flex-1 truncate">ابحث في العملاء، المنتجات، التقارير، الفواتير، المقاييس...</span>
          <kbd className="hidden items-center gap-1 rounded-lg border border-ink-200 bg-ink-50 px-2 py-1 text-[10px] font-bold text-ink-400 sm:inline-flex"><Command size={11}/> K</kbd>
        </button>

        <div className="flex items-center gap-1.5">
          <Link to="/import" className="rounded-xl p-2.5 text-ink-500 hover:bg-white hover:text-primary-700" title="إدخال بيانات" aria-label="إدخال بيانات"><Upload size={18}/></Link>
          <Link to="/intelligence" className="rounded-xl bg-primary-700 p-2.5 text-white shadow-sm hover:bg-primary-800" title="مركز الذكاء" aria-label="مركز الذكاء"><Brain size={18}/></Link>
          <div className="relative">
            <button onClick={() => setShowAlerts(value => !value)} className="relative rounded-xl p-2.5 text-ink-500 hover:bg-white hover:text-ink-800" aria-label={alertsLoading ? 'جارٍ تحميل التنبيهات' : alertsUnavailable ? 'التنبيهات غير متاحة حاليًا' : 'التنبيهات، ' + unreadAlerts.length + ' غير مقروء'} aria-expanded={showAlerts}>
              <Bell size={18}/>
              {unreadAlerts.length > 0 && <span className="absolute -left-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-600 px-1 text-[9px] font-black text-white">{unreadAlerts.length}</span>}
            </button>
            {showAlerts && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAlerts(false)} />
                <div className="absolute left-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-elevated">
                  <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3"><span className="text-sm font-black text-ink-800">الانتباه</span><span className="text-xs text-ink-400">{unreadAlerts.length} غير مقروء</span></div>
                  {alertsLoading ? <div className="p-6 text-center text-sm text-ink-400">جارٍ تحميل التنبيهات...</div> : alertsUnavailable ? <div className="p-6 text-center text-sm text-warning-700">خدمة التنبيهات غير متاحة حاليًا. لم يتم افتراض عدم وجود تنبيهات.</div> : alerts.length === 0 ? <div className="p-6 text-center text-sm text-ink-400">لا توجد تنبيهات</div> : (
                    <div className="max-h-96 divide-y divide-ink-100 overflow-y-auto">
                      {alerts.slice(0, 10).map(alert => (
                        <button type="button" key={alert.id} onClick={() => onMarkAlertRead(alert.id)} className={'w-full p-4 text-right hover:bg-ink-50 ' + (!alert.is_read ? 'bg-primary-50/40' : '')}>
                          <div className="flex items-start gap-2"><SeverityBadge severity={alert.severity}/><span className="mr-auto text-[10px] text-ink-400">{relativeTime(alert.created_at)}</span></div>
                          <div className="mt-2 text-sm font-bold text-ink-800">{alert.title}</div>
                          {alert.description && <div className="mt-1 text-xs leading-5 text-ink-500">{alert.description}</div>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="hidden lg:flex items-center gap-2 border-r border-ink-200 pr-3" role="status" aria-live="polite" title={healthLabel}><HealthIcon size={15} className={healthClass}/><span className="text-xs font-semibold text-ink-500">{healthLabel}</span></div>
        </div>
      </div>
    </header>
  );
}
