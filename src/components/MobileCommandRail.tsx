import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Brain, Home, Plus, Users } from 'lucide-react';

const items = [
  { path: '/', label: 'الرئيسية', icon: Home },
  { path: '/reports', label: 'التقارير', icon: BarChart3 },
  { path: '/import', label: 'إدخال', icon: Plus, primary: true },
  { path: '/intelligence', label: 'الذكاء', icon: Brain },
  { path: '/customers', label: 'العملاء', icon: Users },
];

export function MobileCommandRail() {
  const location = useLocation();
  return (
    <nav dir="rtl" aria-label="التنقل السريع" className="fixed inset-x-3 bottom-3 z-40 flex h-[72px] items-center justify-around rounded-[1.75rem] border border-emerald-100/80 bg-[#fbfcf8]/95 px-2 shadow-[0_18px_60px_rgba(6,78,59,.18)] backdrop-blur-2xl lg:hidden">
      {items.map(item => {
        const Icon = item.icon;
        const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
        if (item.primary) return (
          <Link key={item.path} to={item.path} aria-label={item.label} className="-mt-7 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-800 to-amber-700 text-white shadow-xl shadow-emerald-950/25 ring-4 ring-[#fbfcf8] transition-transform active:scale-95">
            <Icon size={23} strokeWidth={2.5} />
          </Link>
        );
        return (
          <Link key={item.path} to={item.path} aria-current={active ? 'page' : undefined} className={`flex min-w-[58px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 transition ${active ? 'bg-emerald-50 text-emerald-800' : 'text-ink-400 hover:bg-white hover:text-ink-700'}`}>
            <Icon size={18} strokeWidth={active ? 2.4 : 2} />
            <span className="text-[9px] font-bold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
