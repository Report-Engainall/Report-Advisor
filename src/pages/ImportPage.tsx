import { Link } from 'react-router-dom';
import { BarChart3, BrainCircuit, FileText, FolderOpen, ArrowLeft } from 'lucide-react';
import { CanonicalImportPage } from '@/pages/CanonicalImportPage';
import { FolderBatchImportPanel } from '@/components/FolderBatchImportPanel';

const NEXT_STEPS = [
  { to: '/', label: 'لوحة القيادة', description: 'راجع مؤشرات الحساب بعد اعتماد البيانات.', icon: BarChart3 },
  { to: '/intelligence', label: 'مركز الذكاء والقرار', description: 'افتح التنبيهات والتوصيات والتنبؤات المتاحة من المصدر.', icon: BrainCircuit },
  { to: '/reports/executive', label: 'التقرير التنفيذي', description: 'حوّل البيانات المعتمدة إلى قراءة تنفيذية قابلة للطباعة.', icon: FileText },
];

function ImportJourneyNextSteps() {
  return <section aria-label="الخطوة التالية" className="rounded-2xl border border-primary-100 bg-primary-50/40 p-4">
    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
      <div>
        <h2 className="text-sm font-semibold text-ink-900">من البيانات إلى القرار</h2>
        <p className="text-xs text-ink-500 mt-1">بعد اعتماد البيانات، انتقل مباشرة إلى الشاشات التي تقرأ المصدر القانوني نفسه.</p>
      </div>
      <span className="text-[11px] text-ink-400">بدون بيانات مصطنعة</span>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {NEXT_STEPS.map(({ to, label, description, icon: Icon }) => <Link key={to} to={to} className="group rounded-xl border border-white bg-white p-3 shadow-sm hover:border-primary-200 hover:shadow transition-all">
        <div className="flex items-start justify-between gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600"><Icon size={18}/></span><ArrowLeft size={15} className="text-ink-300 group-hover:text-primary-500 transition-colors"/></div>
        <div className="mt-3 text-sm font-semibold text-ink-800">{label}</div>
        <div className="mt-1 text-xs leading-5 text-ink-500">{description}</div>
      </Link>)}
    </div>
  </section>;
}

export function ImportPage() {
  return <div className="space-y-6">
    <ImportJourneyNextSteps />
    <CanonicalImportPage />
    <FolderBatchImportPanel />
  </div>;
}