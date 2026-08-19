import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Upload, Brain, Menu, X, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Alert } from '@/lib/types';
import { SeverityBadge } from './ui/Badge';
import { relativeTime } from '@/lib/format';

interface HeaderProps {
  alerts: Alert[];
  onMarkAlertRead: (id: string) => void;
  onMenuClick: () => void;
}

export function Header({ alerts, onMarkAlertRead, onMenuClick }: HeaderProps) {
  const [showAlerts, setShowAlerts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const unreadAlerts = alerts.filter(a => !a.is_read);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-ink-100">
      <div className="flex items-center gap-3 px-4 lg:px-6 h-16">
        <button onClick={onMenuClick} className="lg:hidden text-ink-500 hover:text-ink-700">
          <Menu size={22} />
        </button>

        <div className="flex-1 max-w-md relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث شامل: عملاء، منتجات، فواتير، تقارير..."
            className="input pr-10 bg-ink-50/50 border-transparent focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Link to="/import" className="btn-ghost p-2.5" title="استيراد سريع">
            <Upload size={18} />
          </Link>
          <Link to="/intelligence" className="btn-ghost p-2.5" title="المساعد الذكي">
            <Brain size={18} />
          </Link>

          <div className="relative">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="btn-ghost p-2.5 relative"
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

          <div className="hidden sm:flex items-center gap-2 mr-2 pl-3 border-r border-ink-100 pr-3">
            <CheckCircle2 size={16} className="text-success-500" />
            <span className="text-xs text-ink-500">النظام يعمل</span>
          </div>
        </div>
      </div>
    </header>
  );
}
