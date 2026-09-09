import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, Upload, Brain, Menu, CheckCircle2, Command, AlertTriangle, WifiOff, Sparkles, ChevronLeft } from 'lucide-react';
import type { Alert } from '@/lib/types';
import { SeverityBadge } from './ui/Badge';
import { relativeTime } from '@/lib/format';
import { supabase } from '@/lib/supabase';

type HealthState = 'checking' | 'healthy' | 'degraded' | 'offline';
interface HeaderProps { alerts: Alert[]; onMarkAlertRead: (id: string) => void; onMenuClick: () => void; onOpenCommandPalette: () => void; }

export function Header({ alerts, onMarkAlertRead, onMenuClick, onOpenCommandPalette }: HeaderProps) {
  const [showAlerts, setShowAlerts] = useState(false);
  const [health, setHealth] = useState<HealthState>('checking');
  const location = useLocation();
  const unreadAlerts = alerts.filter(a => !a.is_read);
  useEffect(() => { setShowAlerts(false); }, [location.pathname]);
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
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setShowAlerts(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
  const healthLabel = { checking: 'جارٍ التحقق', healthy: 'النظام يعمل', degraded: 'الخدمة متأثرة', offline: 'غير متصل' }[health];
  const HealthIcon = health === 'healthy' ? CheckCircle2 : health === 'offline' ? WifiOff : AlertTriangle;
  const healthClass = health === 'healthy' ? 'text-success-500' : health === 'checking' ? 'text-ink-400' : 'text-warning-500';
  return <header className="sticky top-0 z-30 border-b border-ink-100/80 bg-[#f7f8f3]/90 backdrop-blur-2xl">
    <div className="flex items-center gap-2 px-3 sm:gap-3 sm:px-4 lg:px-7 h-[76px]">
      <button type="button" onClick={onMenuClick} className="lg:hidden shrink-0 rounded-2xl p-3 text-ink-500 hover:bg-white hover:text-primary-700 transition shadow-sm" aria-label="فتح القائمة"><Menu size={20} /></button>
      <div className="lg:hidden shrink-0 flex items-center gap-2"><div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-800 to-amber-600 flex items-center justify-center text-white font-black shadow-lg">ع</div></div>
      <div className="hidden xl:flex shrink-0 items-center gap-2 pl-3"><span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,.10)]"/><span className="text-xs font-bold text-ink-500">مساحة العمل التنفيذية</span></div>
      <button type="button" onClick={onOpenCommandPalette} className="group flex-1 min-w-0 max-w-3xl relative flex h-12 items-center gap-3 rounded-2xl border border-ink-100 bg-white/80 px-4 text-right text-sm text-ink-400 transition hover:border-primary-200 hover:bg-white hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/10" aria-label="فتح البحث ولوحة الأوامر">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-primary-700 group-hover:bg-emerald-100"><Search size={17} /></span>
        <span className="flex-1 truncate">ابحث عن عميل، منتج، فاتورة، تقرير أو توصية...</span>
        <kbd className="hidden items-center gap-1 rounded-xl border border-ink-200 bg-ink-50 px-2.5 py-1.5 text-[10px] font-semibold text-ink-400 sm:inline-flex"><Command size={10} /> K</kbd>
      </button>
      <div className="flex items-center gap-1.5">
        <Link to="/import" className="hidden sm:inline-flex btn-ghost !rounded-2xl !p-3" title="استيراد سريع" aria-label="استيراد سريع"><Upload size={18} /></Link>
        <Link to="/intelligence" className="hidden md:inline-flex btn-ghost !rounded-2xl !p-3" title="المساعد الذكي" aria-label="المساعد الذكي"><Brain size={18} /></Link>
        <Link to="/command-center" className="hidden lg:inline-flex items-center gap-2 rounded-2xl bg-emerald-950 px-3.5 py-2.5 text-xs font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg" title="مركز القيادة"><Sparkles size={16} /> القيادة</Link>
        <div className="relative">
          <button type="button" onClick={() => setShowAlerts(value => !value)} className="btn-ghost !rounded-2xl !p-3 relative" aria-label={`التنبيهات، ${unreadAlerts.length} غير مقروء`} aria-expanded={showAlerts} aria-controls="global-alerts-panel">
            <Bell size={18} />
            {unreadAlerts.length > 0 && <span className="absolute top-1 left-1 min-w-4 h-4 px-1 bg-danger-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#f7f8f3]">{unreadAlerts.length}</span>}
          </button>
          {showAlerts && <><div className="fixed inset-0 z-40" onClick={() => setShowAlerts(false)} aria-hidden="true" /><div id="global-alerts-panel" role="dialog" aria-label="مركز التنبيهات" className="absolute left-0 mt-2 w-[calc(100vw-1.5rem)] max-w-sm bg-white rounded-3xl shadow-elevated border border-ink-100 z-50 max-h-[min(28rem,70vh)] overflow-y-auto animate-slide-up">
            <div className="p-5 border-b border-ink-100 flex items-center justify-between"><div><div className="font-black text-sm text-ink-900">مركز التنبيهات</div><div className="text-[11px] text-ink-400 mt-1">الإشارات التي تستحق انتباهك الآن</div></div><span className="badge-neutral">{unreadAlerts.length} جديد</span></div>
            {alerts.length === 0 ? <div className="p-10 text-center"><Bell size={24} className="mx-auto text-ink-300" /><div className="mt-3 text-sm font-bold text-ink-600">كل شيء هادئ</div><div className="mt-1 text-xs text-ink-400">لا توجد تنبيهات تحتاج إلى إجراء.</div></div> : <div className="divide-y divide-ink-50">{alerts.slice(0,10).map(alert => <button type="button" key={alert.id} onClick={() => onMarkAlertRead(alert.id)} className={`block w-full p-4 text-right hover:bg-ink-50 cursor-pointer transition ${!alert.is_read?'bg-primary-50/30':''}`}><div className="flex items-center gap-2 mb-1.5"><SeverityBadge severity={alert.severity} /><span className="text-[11px] text-ink-400 mr-auto">{relativeTime(alert.created_at)}</span></div><div className="text-sm font-semibold text-ink-800">{alert.title}</div>{alert.description&&<div className="text-xs leading-5 text-ink-500 mt-1">{alert.description}</div>}</button>)}</div>}
            <Link to="/intelligence" onClick={() => setShowAlerts(false)} className="flex items-center justify-between px-5 py-3.5 border-t border-ink-100 text-xs font-bold text-primary-700 hover:bg-ink-50"><span>فتح مركز الذكاء</span><ChevronLeft size={15}/></Link>
          </div></>}
        </div>
        <div className="hidden lg:flex items-center gap-2 mr-1 pr-3 border-r border-ink-100" role="status" aria-live="polite" title={healthLabel}><span className={`flex h-9 w-9 items-center justify-center rounded-2xl bg-white shadow-sm ${healthClass}`}><HealthIcon size={15}/></span><span className="text-xs font-semibold text-ink-500">{healthLabel}</span></div>
      </div>
    </div>
  </header>;
}
