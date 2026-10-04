import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, FileSearch, FileInput, Lightbulb, Route, ShieldCheck, Target, Sparkles, BriefcaseBusiness } from 'lucide-react';

type JourneyStep = { path: string; label: string; description: string; icon: typeof Lightbulb; stage?: string };

const steps: JourneyStep[] = [
  { path: '/command-center', label: 'الصورة', description: 'حالة النشاط والأولوية', icon: Lightbulb },
  { path: '/import', label: 'المصدر', description: 'مستند → حقيقة', icon: FileInput },
  { path: '/trust', label: 'الدليل', description: 'Evidence → Trust', icon: FileSearch },
  { path: '/intelligence', label: 'الإشارة', description: 'Signal → Why → So What', icon: Sparkles },
  { path: '/advisor-cases', label: 'المستشار', description: 'Recommendation → Case', icon: BriefcaseBusiness },
  { path: '/decision-experience', label: 'القرار', description: 'Decision → Approval', icon: ShieldCheck, stage: 'decision' },
  { path: '/work-center', label: 'التنفيذ', description: 'Work → Next Action', icon: Target },
  { path: '/decision-experience', label: 'النتيجة', description: 'Expected → Actual', icon: CheckCircle2Compat, stage: 'outcome' },
  { path: '/replay', label: 'التعلّم', description: 'Replay → Learning', icon: BookOpen },
  { path: '/reports/executive', label: 'المخرجات', description: 'Executive report', icon: Route },
];

function CheckCircle2Compat(props: { size?: number }) {
  return <span className="inline-flex items-center justify-center" aria-hidden="true"><span className="h-3.5 w-3.5 rounded-full border-2 border-current" style={{ width: props.size ? props.size - 1 : 13, height: props.size ? props.size - 1 : 13 }} /></span>;
}

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
