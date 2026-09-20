import { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCircle2, Command, Menu, Search, Upload, WifiOff, AlertTriangle, ChevronLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '@/lib/language';
import type { Alert } from '@/lib/types';
import { SeverityBadge } from './ui/Badge';
import { relativeTime } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import { resolveNavigationItem } from '@/lib/navigation-registry';

type HealthState = 'checking' | 'healthy' | 'degraded' | 'offline';

export function Header({
  alerts,
  onMarkAlertRead,
  onMenuClick,
  onOpenCommandPalette,
}: {
  alerts: Alert[];
  onMarkAlertRead: (id: string) => void;
  onMenuClick: () => void;
  onOpenCommandPalette: () => void;
}) {
  const { language } = useLanguage();
  const [showAlerts, setShowAlerts] = useState(false);
  const [health, setHealth] = useState<HealthState>('checking');
  const location = useLocation();
  const unreadAlerts = alerts.filter((alert) => !alert.is_read);

  const currentLabel = useMemo(() => {
    const item = resolveNavigationItem(location.pathname);
    if (!item) return 'الأغبري';
    return language === 'ar' ? item.label : item.enLabel;
  }, [language, location.pathname]);

  useEffect(() => {
    let mounted = true;
    const checkHealth = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (!mounted) return;
        if (sessionError || !sessionData.session) {
          setHealth('offline');
          return;
        }
        const { data: companyId, error: tenantError } = await supabase.rpc('current_company_id');
        if (!mounted) return;
        if (tenantError) {
          setHealth('degraded');
        } else {
          setHealth(companyId ? 'healthy' : 'degraded');
        }
      } catch {
        if (mounted) setHealth('offline');
      }
    };

    void checkHealth();
    const timer = window.setInterval(checkHealth, 60000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const healthLabel =
    health === 'healthy' ? 'متصل' :
    health === 'offline' ? 'غير متصل' :
    health === 'degraded' ? 'متأثر' :
    'فحص';

  const HealthIcon =
    health === 'healthy' ? CheckCircle2 :
    health === 'offline' ? WifiOff :
    AlertTriangle;

  const healthClass =
    health === 'healthy' ? 'text-success-600' :
    health === 'checking' ? 'text-ink-400' :
    'text-warning-600';

  return (
    <header className="sticky top-0 z-30 border-b border-ink-200 bg-white">
      <div className="flex h-[60px] items-center gap-2.5 px-3 sm:px-4 lg:px-5">
        <button onClick={onMenuClick} className="rounded-[8px] p-2 text-ink-500 hover:bg-ink-100 lg:hidden" aria-label="فتح القائمة">
          <Menu size={19} />
        </button>

        <div className="hidden items-center gap-1.5 text-[11px] text-ink-400 md:flex">
          <span>الأغبري</span>
          <ChevronLeft size={12} />
          <span className="font-bold text-ink-800">{currentLabel}</span>
        </div>

        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="mx-auto flex h-9 w-full max-w-[470px] items-center gap-2.5 rounded-[9px] border border-ink-200 bg-ink-50/70 px-3.5 text-right text-xs text-ink-400 hover:border-primary-300 hover:bg-white"
          aria-label="فتح البحث ولوحة الأوامر"
        >
          <Search size={16} className="text-ink-500" />
          <span className="flex-1 truncate">ابحث في الأعمال أو اضغط ⌘K</span>
          <kbd className="hidden items-center rounded-md border border-ink-200 bg-white px-1.5 py-0.5 text-[9px] font-bold text-ink-400 sm:inline-flex">
            <Command size={10} /> K
          </kbd>
        </button>

        <div className="flex items-center gap-0.5">
          <LanguageToggle />
          <Link to="/import" className="rounded-[8px] p-2 text-ink-500 hover:bg-ink-100 hover:text-primary-700" title="استيراد" aria-label="استيراد">
            <Upload size={17} />
          </Link>

          <div className="relative">
            <button
              onClick={() => setShowAlerts((value) => !value)}
              className="relative rounded-[8px] p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-900"
              aria-label={'التنبيهات، ' + unreadAlerts.length + ' غير مقروء'}
              aria-expanded={showAlerts}
            >
              <Bell size={17} />
              {unreadAlerts.length > 0 && (
                <span className="absolute -left-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-600 px-1 text-[9px] font-black text-white">
                  {unreadAlerts.length}
                </span>
              )}
            </button>

            {showAlerts && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAlerts(false)} />
                <div className="absolute left-0 z-50 mt-1.5 w-80 overflow-hidden rounded-[12px] border border-ink-200 bg-white shadow-elevated">
                  <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
                    <span className="text-sm font-black text-ink-900">الانتباه</span>
                    <span className="text-[11px] text-ink-400">{unreadAlerts.length} غير مقروء</span>
                  </div>

                  {alerts.length === 0 ? (
                    <div className="p-6 text-center text-sm text-ink-400">لا توجد تنبيهات</div>
                  ) : (
                    <div className="max-h-96 divide-y divide-ink-100 overflow-y-auto">
                      {alerts.slice(0, 10).map((alert) => (
                        <button
                          type="button"
                          key={alert.id}
                          onClick={() => onMarkAlertRead(alert.id)}
                          className={'w-full p-3.5 text-right hover:bg-ink-50 ' + (!alert.is_read ? 'bg-primary-50/40' : '')}
                        >
                          <div className="flex items-start gap-2">
                            <SeverityBadge severity={alert.severity} />
                            <span className="mr-auto text-[10px] text-ink-400">{relativeTime(alert.created_at)}</span>
                          </div>
                          <div className="mt-1.5 text-[13px] font-bold text-ink-800">{alert.title}</div>
                          {alert.description && <div className="mt-1 text-[11px] leading-5 text-ink-500">{alert.description}</div>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="hidden items-center gap-1.5 border-r border-ink-200 pr-2.5 lg:flex" role="status" aria-live="polite" title={healthLabel}>
            <HealthIcon size={14} className={healthClass} />
            <span className="text-[11px] font-semibold text-ink-500">{healthLabel}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
