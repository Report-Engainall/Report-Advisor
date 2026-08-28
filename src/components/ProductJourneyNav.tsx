import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, FileSearch, Lightbulb, Route, ShieldCheck, Target } from 'lucide-react';

type JourneyStep = {
  path: string;
  label: string;
  description: string;
  icon: typeof Route;
};

const steps: JourneyStep[] = [
  { path: '/command-center', label: 'المعلومة والأولوية', description: 'Business Health → Critical Insights', icon: Lightbulb },
  { path: '/decision-experience', label: 'الدليل والقرار', description: 'Evidence → Recommendation → Decision', icon: FileSearch },
  { path: '/decision-experience', label: 'الموافقة', description: 'Accountability → Approval', icon: ShieldCheck },
  { path: '/decision-experience', label: 'التنفيذ', description: 'Work → Next Action', icon: Target },
  { path: '/decision-experience', label: 'النتيجة والتعلّم', description: 'Expected → Actual → Learning', icon: BookOpen },
  { path: '/reports/executive', label: 'القصة التنفيذية', description: 'Decision Story → Executive Report', icon: Route },
];

export function ProductJourneyNav() {
  const location = useLocation();
  const activePath = location.pathname;

  return (
    <nav aria-label="دورة قيمة Report-Advisor" className="mb-5 overflow-x-auto rounded-2xl border border-ink-200 bg-white p-2 shadow-sm">
      <div className="flex min-w-max items-stretch gap-2">
        {steps.map(({ path, label, description, icon: Icon }, index) => {
          const active = activePath === path || (path === '/decision-experience' && activePath.startsWith('/decision-experience'));
          return (
            <Link
              key={`${path}-${label}`}
              to={path}
              aria-current={active ? 'page' : undefined}
              className={`group flex min-w-[180px] items-center gap-3 rounded-xl px-3 py-2.5 text-right transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${active ? 'bg-primary-50 text-primary-950' : 'text-ink-700 hover:bg-ink-50'}`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-primary-100 text-primary-700' : 'bg-ink-100 text-ink-500 group-hover:bg-white'}`}>
                <Icon size={17} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 text-xs font-bold">
                  <span className="text-[10px] text-ink-400">{String(index + 1).padStart(2, '0')}</span>
                  {label}
                </span>
                <span className="mt-0.5 block truncate text-[10px] text-ink-500">{description}</span>
              </span>
              {index < steps.length - 1 && <ArrowLeft size={14} className="mr-auto shrink-0 text-ink-300" aria-hidden="true" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
