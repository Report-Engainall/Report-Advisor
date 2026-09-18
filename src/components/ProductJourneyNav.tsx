import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, FileSearch, FileInput, Lightbulb, Route, ShieldCheck, Target } from 'lucide-react';

type JourneyStep = { path: string; label: string; description: string; icon: typeof Lightbulb; stage?: string };

const steps: JourneyStep[] = [
  { path: '/command-center', label: 'الصورة', description: 'حالة النشاط والأولوية', icon: Lightbulb },
  { path: '/import', label: 'المصدر', description: 'مستند → استخراج', icon: FileInput },
  { path: '/decision-experience', label: 'الدليل', description: 'Evidence → Recommendation', icon: FileSearch, stage: 'evidence' },
  { path: '/decision-experience', label: 'الموافقة', description: 'قرار موثق', icon: ShieldCheck, stage: 'approval' },
  { path: '/decision-experience', label: 'الإجراء', description: 'Work → Next Action', icon: Target, stage: 'work' },
  { path: '/decision-experience', label: 'التعلّم', description: 'Expected → Actual', icon: BookOpen, stage: 'outcome' },
  { path: '/reports/executive', label: 'القصة', description: 'Executive report', icon: Route },
];

export function ProductJourneyNav() {
  const location = useLocation();
  const currentParams = new URLSearchParams(location.search);

  const hrefFor = (path: string, stage?: string) => {
    if (path !== '/decision-experience') return path;
    const query = new URLSearchParams(location.search);
    if (stage) query.set('stage', stage);
    const suffix = query.toString();
    return suffix ? path + '?' + suffix : path;
  };

  return (
    <nav aria-label="نموذج تشغيل الأغبري" className="mb-6">
      <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-ink-200/70 bg-white px-2.5 py-2 shadow-card">
        <div className="hidden shrink-0 px-2 text-[10px] font-black tracking-[0.12em] text-primary-700 md:block">MODEL</div>
        {steps.map(({ path, label, description, icon: Icon, stage }, index) => {
          const active = location.pathname === path && (!stage || currentParams.get('stage') === stage);
          return (
            <Link
              key={path + '-' + label}
              to={hrefFor(path, stage)}
              className={'group flex min-w-[145px] items-center gap-2 rounded-xl px-3 py-2 text-right transition ' + (active ? 'bg-ink-950 text-white' : 'text-ink-600 hover:bg-ink-50')}
              aria-current={active ? 'step' : undefined}
            >
              <span className={'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ' + (active ? 'bg-primary-600 text-white' : 'bg-ink-100 text-ink-500 group-hover:bg-primary-50 group-hover:text-primary-700')}><Icon size={15}/></span>
              <span className="min-w-0">
                <span className="block text-xs font-black">{String(index + 1).padStart(2,'0')} · {label}</span>
                <span className={'mt-0.5 block truncate text-[9px] ' + (active ? 'text-white/60' : 'text-ink-400')}>{description}</span>
              </span>
              {index < steps.length - 1 && <ArrowLeft size={13} className="mr-auto shrink-0 opacity-30"/>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
