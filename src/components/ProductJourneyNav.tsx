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
  { path: '/reports/executive', label: 'المخرجات', description: 'Executive report', icon: Route },
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
    <nav aria-label="مسار المنتج" className="ag-journey mb-5" role="navigation">
      <div className="ag-journey-track">
        <div className="ag-journey-brand">
          <span className="ag-journey-brand-mark"><Target size={13}/></span>
          <span>مسار القرار</span>
        </div>
        {steps.map(({ path, label, description, icon: Icon, stage }, index) => {
          const active = location.pathname === path && (!stage || currentParams.get('stage') === stage);
          return (
            <Link
              key={path + '-' + label}
              to={hrefFor(path, stage)}
              className={'ag-journey-link ' + (active ? 'ag-journey-link-active' : '')}
              aria-current={active ? 'step' : undefined}
              title={description}
            >
              <span className="ag-journey-index">{String(index + 1).padStart(2, '0')}</span>
              <span className={'ag-journey-icon ' + (active ? 'ag-journey-icon-active' : '')}><Icon size={14}/></span>
              <span className="ag-journey-copy">
                <span className="ag-journey-label">{label}</span>
                <span className="ag-journey-description">{description}</span>
              </span>
              {index < steps.length - 1 && <ArrowLeft size={12} className="ag-journey-arrow" aria-hidden="true"/>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}