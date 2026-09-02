import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Upload, Brain, Menu, CheckCircle2, Command, AlertTriangle, WifiOff } from 'lucide-react';
import type { Alert } from '@/lib/types';
import { SeverityBadge } from './ui/Badge';
import { relativeTime } from '@/lib/format';
import { supabase } from '@/lib/supabase';

type HealthState = 'checking' | 'healthy' | 'degraded' | 'offline';

interface HeaderProps {
  alerts: Alert[];
  onMarkAlertRead: (id: string) => void;
  onMenuClick: () => void;
  onOpenCommandPalette: () => void;
}

export function Header({ alerts, onMarkAlertRead, onMenuClick, onOpenCommandPalette }: HeaderProps) {
  const [showAlerts, setShowAlerts] = useState(false);
  const [health, setHealth] = useState<HealthState>('checking');
  const unreadAlerts = alerts.filter(a => !a.is_read);

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

        // A real authenticated DB round-trip. RLS/current_company_id remains the
        // authoritative tenant boundary; this is only an availability signal.
        const { data: companyId, error: tenantError } = await supabase.rpc('current_company_id');
        if (!mounted) return;

        // A successful RPC with a NULL tenant is not a healthy production state:
        // it means the authenticated user has no unambiguous active membership.
        // Keep the UI truthful without exposing tenant internals.
        setHealth(tenantError || !companyId ? 'degraded' : 'healthy');
      } catch {
        if (mounted) setHealth('offline');
      }
    };

    void checkHealth();
    const timer = window.setInterval(checkHealth, 60_000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const healthLabel = {
    checking: 'جارٍ التحقق',
    healthy: 'النظام يعمل',
    degraded: 'الخدمة متأثرة',
    offline: 'غير متصل',
  }[health];

  const HealthIcon = health === 'healthy' ? CheckCircle2 : health === 'offline' ? WifiOff : AlertTriangle;
  const healthClass = health === 'healthy' ? 'text-success-500' : health === 'checking' ? 'text-ink-400' : 'text-warning-500';

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-ink-100">
      <div className="flex items-center gap-3 px-4 lg:px-6 h-16">
        <button onClick={onMenuClick} className="lg:hidden text-ink-500 hover:text-ink-700" aria-label="فتح القائمة">
          <Menu size={22} />
        </button>

        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex-1 max-w-md relative flex h-10 items-center gap-3 rounded-xl border border-transparent bg-ink-50/70 px-3 text-right text-sm text-ink-400 transition hover:border-ink-200 hover:bg-white"
          aria-label="فتح البحث ولوحة الأوامر"
        >
          <Search size={18} />
          <span className="flex-1 truncate">بحث شامل: عملاء، منتجات، فواتير، تقارير...</span>
          <kbd className="hidden items-center gap-1 rounded-md border border-ink-200 bg-white px-1.5 py-0.5 text-[10px] text-ink-400 sm:inline-flex"><Command size={10} /> K</kbd>
        </button>

        <div className="flex items-center gap-1.5">
          <Link to="/import" className="btn-ghost p-2.5" title="استيراد سريع" aria-label="استيراد سريع">
            <Upload size={18} />
          </Link>
          <Link to="/intelligence" className="btn-ghost p-2.5" title="المساعد الذكي" aria-label="المساعد الذكي">
            <Brain size={18} />
          </Link>

          <div className="relative">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="btn-ghost p-2.5 relative"
              aria-label={`التنبيهات، ${unreadAlerts.length} غير مقروء`}
              aria-expanded={showAlerts}
            >
              <Bell size={18} />
              {unreadAlerts.length > 0 && (
                <span className="absolute top-1 left-1 w-4 h-4 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadAlerts.length}
                </span>
              )}
            </button>

            {showAlerts && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAlerts(false)} />
                <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-elevated border border-ink-100 z-50 max-h-96 overflow-y-auto animate-slide-up">
                  <div className="p-3 border-b border-ink-100 flex items-center justify-between">
                    <span className="font-semibold text-sm text-ink-800">التنبيهات</span>
                    <span className="text-xs text-ink-400">{unreadAlerts.length} غير مقروء</span>
                  </div>
                  {alerts.length === 0 ? (
                    <div className="p-6 text-center text-sm text-ink-400">لا توجد تنبيهات</div>
                  ) : (
                    <div className="divide-y divide-ink-50">
                      {alerts.slice(0, 10).map((alert) => (
                        <div
                          key={alert.id}
                          onClick={() => onMarkAlertRead(alert.id)}
                          className={`p-3 hover:bg-ink-50 cursor-pointer ${!alert.is_read ? 'bg-primary-50/30' : ''}`}
                        >
                          <div className="flex items-start gap-2 mb-1">
                            <SeverityBadge severity={alert.severity} />
                            <span className="text-xs text-ink-400 mr-auto">{relativeTime(alert.created_at)}</span>
                          </div>
                          <div className="text-sm font-medium text-ink-800 mb-0.5">{alert.title}</div>
                          {alert.description && <div className="text-xs text-ink-500">{alert.description}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 mr-2 pl-3 border-r border-ink-100 pr-3" role="status" aria-live="polite" title={healthLabel}>
            <HealthIcon size={16} className={healthClass} />
            <span className="text-xs text-ink-500">{healthLabel}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
