import { Brain, Home, Settings, Upload, Workflow } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [
  { path: '/', label: 'اليوم', icon: Home, exact: true },
  { path: '/work-center', label: 'العمل', icon: Workflow },
  { path: '/import', label: 'استيراد', icon: Upload },
  { path: '/intelligence', label: 'الذكاء', icon: Brain },
  { path: '/settings', label: 'الإدارة', icon: Settings },
] as const;

export function MobileActionBar() {
  return (
    <nav
      dir="rtl"
      aria-label="التنقل السريع للجوال"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-10px_30px_-24px_rgb(9_9_11_/_35%)] backdrop-blur lg:hidden"
    >
      <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
        {items.map(({ path, label, icon: Icon, exact }) => (
          <NavLink
            key={path}
            to={path}
            end={exact}
            className={({ isActive }) =>
              `flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[9px] font-bold transition ${
                isActive
                  ? 'bg-primary-50 text-primary-800'
                  : 'text-ink-400 hover:bg-ink-50 hover:text-ink-700'
              }`
            }
          >
            <Icon size={18} strokeWidth={1.9} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
