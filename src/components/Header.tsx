import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Upload, Brain, Menu, CheckCircle2, Command, AlertTriangle, WifiOff, Sparkles } from 'lucide-react';
import type { Alert } from '@/lib/types';
import { SeverityBadge } from './ui/Badge';
import { relativeTime } from '@/lib/format';
import { supabase } from '@/lib/supabase';

type HealthState = 'checking' | 'healthy' | 'degraded' | 'offline';
interface HeaderProps { alerts: Alert[]; onMarkAlertRead: (id: string) => void; onMenuClick: () => void; onOpenCommandPalette: () => void; }

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
        if (sessionError || !sessionData.session) { setHealth('offline'); return; }
        const { data: companyId, error: tenantError } = await supabase.rpc('current_company_id');
        if (!mounted) return;
        setHealth(tenantError || !companyId ? 'degraded' : 'healthy');
      } catch { if (mounted) setHealth('offline'); }
    };
    void checkHealth();
    const timer = window.setInterval(checkHealth, 60_000);
    return () => { mounted = false; window.clearInterval(timer); };
  }, []);

  const healthLabel = { checking: 'جارٍ التحقق', healthy: 'النظام يعمل', degraded: 'الخدمة متأثرة', offline: 'غير متصل' }[health];
  const HealthIcon = health === 'healthy' ? CheckCircle2 : health === 'offline' ? WifiOff : AlertTriangle;
  const healthClass = health === 'healthy' ? 'text-success-500' : health === 'checking' ? 'text-ink-400' : 'text-warning-500';

  return <header className="sticky top-0 z-30 border-b border-ink-100/80 bg-white/90 backdrop-blur-xl">
    <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 h-[68px]">
      <button type="button" onClick={onMenuClick} className="lg:hidden shrink-0 rounded-xl p-2.5 text-ink-500 hover:bg-ink-100 hover:text-ink-800 transition" aria-label="فتح القائمة"><Menu size={21} /></button>
      <div className="lg:hidden shrink-0 flex items-center gap-2"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white font-bold shadow-sm">ع</div></div>
      <button type="button" onClick={onOpenCommandPalette} className="group flex-1 min-w-0 max-w-2xl relative flex h-11 items-center gap-3 rounded-2xl border border-ink-100 bg-ink-50/80 px-3.5 text-right text-sm text-ink-400 transition hover:border-primary-200 hover:bg-white hover:shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/10" aria-label="فتح البحث ولوحة الأوامر">
        <Search size={18} className="shrink-0 group-hover:text-primary-600" />
        <span className="flex-1 truncate">ابحث عن عميل، منتج، فاتورة، تقرير أو توصية...</span>
        <kbd className="hidden items-center gap-1 rounded-lg border border-ink-200 bg-white px-2 py-1 text-[10px] text-ink-400 sm:inline-flex"><Command size={10} /> K</kbd>
      </button>
      <div className="flex items-center gap-1">
        <Link to="/import" className="btn-ghost !rounded-xl !p-2.5" title="استيراد سريع" aria-label="استيراد سريع"><Upload size={18} /></Link>
        <Link to="/intelligence" className="hidden sm:inline-flex btn-ghost !rounded-xl !p-2.5" title="المساعد الذكي" aria-label="المساعد الذكي"><Brain size={18} /></Link>
        <Link to="/command-center" className="hidden md:inline-flex btn-ghost !rounded-xl !p-2.5" title="مركز القيادة" aria-label="مركز القيادة"><Sparkles size={18} /></Link>
        <div className="relative">
          <button type="button" onClick={() => setShowAlerts(value => !value)} className="btn-ghost !rounded-xl !p-2.5 relative" aria-label={`التنبيهات، ${unreadAlerts.length} غير مقروء`} aria-expanded={showAlerts}>
            <Bell size={18} />
            {unreadAlerts.length > 0 && <span className="absolute top-1 left-1 min-w-4 h-4 px-1 bg-danger-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">{unreadAlerts.length}</span>}
          </button>
          {showAlerts && <><div className="fixed inset-0 z-40" onClick={() => setShowAlerts(false)} /><div className="absolute left-0 mt-2 w-[calc(100vw-1.5rem)] max-w-sm bg-white rounded-2xl shadow-elevated border border-ink-100 z-50 max-h-[min(28rem,70vh)] overflow-y-auto animate-slide-up">
            <div className="p-4 border-b border-ink-100 flex items-center justify-between"><div><div className="font-bold text-sm text-ink-900">التنبيهات</div><div className="text-[11px] text-ink-400 mt-0.5">آخر التنبيهات والتنبيهات الحرجة</div></div><span className="badge-neutral">{unreadAlerts.length} جديد</span></div>
            {alerts.length === 0 ? <div className="p-8 text-center"><Bell size={22} className="mx-auto text-ink-300" /><div className="mt-2 text-sm font-medium text-ink-600">كل شيء هادئ</div><div className="mt-1 text-xs text-ink-400">لا توجد تنبيهات تحتاج إلى إجراء.</div></div> : <div className="divide-y divide-ink-50">{alerts.slice(0,10).map(alert => <div key={alert.id} onClick={() => onMarkAlertRead(alert.id)} className={`p-4 hover:bg-ink-50 cursor-pointer transition ${!alert.is_read?'bg-primary-50/30':''}`}><div className="flex items-center gap-2 mb-1.5"><SeverityBadge severity={alert.severity} /><span className="text-[11px] text-ink-400 mr-auto">{relativeTime(alert.created_at)}</span></div><div className="text-sm font-semibold text-ink-800">{alert.title}</div>{alert.description&&<div className="text-xs leading-5 text-ink-500 mt-1">{alert.description}</div>}</div>)}</div>}
          </div></>}
        </div>
        <div className="hidden lg:flex items-center gap-2 mr-1 pr-3 border-r border-ink-100" role="status" aria-live="polite" title={healthLabel}><span className={`flex h-8 w-8 items-center justify-center rounded-xl bg-ink-50 ${healthClass}`}><HealthIcon size={15}/></span><span className="text-xs font-medium text-ink-500">{healthLabel}</span></div>
      </div>
    </div>
  </header>;
}
