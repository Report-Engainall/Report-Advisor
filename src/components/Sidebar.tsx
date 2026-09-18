import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity, BarChart3, Bell, Brain, BriefcaseBusiness, ChevronDown, ClipboardCheck, Crosshair,
  FileBarChart, Gauge, Layers3, LayoutDashboard, ListChecks, LogOut, Package, Presentation,
  Scale, ScanSearch, Settings, Sparkles, Target, Upload, UserCircle, Users, Warehouse,
  AlertCircle, PlugZap, WalletCards
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getDisplayEmail, getDisplayName } from '@/lib/profile-display';
import { useLanguage } from '@/lib/language';
import { isWorkspacePathVisible, readWorkspaceMode, type WorkspaceMode } from '@/lib/workspace-mode';

interface NavItem {
  path: string;
  label: string;
  enLabel: string;
  icon: ReactNode;
  hint?: string;
  enHint?: string;
}
interface NavSection {
  id: string;
  title: string;
  enTitle: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  { id: 'today', title: 'اليوم', enTitle: 'Today', items: [
    { path: '/', label: 'لوحة اليوم', enLabel: 'Today', icon: <LayoutDashboard size={18}/>, hint: 'ما يحدث الآن', enHint: 'What matters now' },
    { path: '/command-center', label: 'مركز القيادة', enLabel: 'Command Center', icon: <Crosshair size={18}/>, hint: 'الأولويات والإجراءات', enHint: 'Priorities and actions' },
    { path: '/decision-experience', label: 'قرار اليوم', enLabel: 'Today’s Decision', icon: <Scale size={18}/>, hint: 'دليل → قرار → إجراء', enHint: 'Evidence → decision → action' },
    { path: '/intelligence', label: 'التنبيهات المهمة', enLabel: 'Important Alerts', icon: <Bell size={18}/>, hint: 'ما يحتاج انتباهًا', enHint: 'What needs attention' },
  ]},
  { id: 'operations', title: 'التشغيل', enTitle: 'Operations', items: [
    { path: '/work-center', label: 'مركز العمل', enLabel: 'Work Center', icon: <Activity size={18}/>, hint: 'الحالات والاستثناءات', enHint: 'Execution and exceptions' },
    { path: '/import', label: 'إدخال البيانات', enLabel: 'Data Intake', icon: <Upload size={18}/>, hint: 'الاستيراد الحاكم', enHint: 'Governed ingestion' },
    { path: '/import/analyze', label: 'تحليل المستندات', enLabel: 'Document Analysis', icon: <ScanSearch size={18}/>, hint: 'استخراج وإثبات', enHint: 'Extraction and proof' },
    { path: '/data-quality', label: 'جودة البيانات', enLabel: 'Data Quality', icon: <AlertCircle size={18}/>, hint: 'مشكلات ونواقص', enHint: 'Issues and gaps' },
    { path: '/connections', label: 'المصادر والموصلات', enLabel: 'Sources & Connections', icon: <PlugZap size={18}/>, hint: 'متاجر وملفات وأنظمة', enHint: 'Stores, files, systems' },
  ]},
  { id: 'money', title: 'المال', enTitle: 'Money', items: [
    { path: '/reports/sales', label: 'المبيعات', enLabel: 'Sales', icon: <WalletCards size={18}/>, hint: 'الحركة والإيراد', enHint: 'Revenue and movement' },
    { path: '/reports/purchases', label: 'المشتريات', enLabel: 'Purchases', icon: <WalletCards size={18}/>, hint: 'التكلفة والتوريد', enHint: 'Cost and supply' },
    { path: '/reports/receivables', label: 'الذمم والتحصيل', enLabel: 'Receivables', icon: <WalletCards size={18}/>, hint: 'النقد المتعثر', enHint: 'Cash at risk' },
    { path: '/reports/profitability', label: 'الربحية', enLabel: 'Profitability', icon: <Gauge size={18}/>, hint: 'أين نصنع الهامش', enHint: 'Where margin comes from' },
  ]},
  { id: 'customers-products', title: 'العملاء والمنتجات', enTitle: 'Customers & Products', items: [
    { path: '/customers', label: 'العملاء', enLabel: 'Customers', icon: <Users size={18}/>, hint: 'القيمة والسلوك', enHint: 'Value and behavior' },
    { path: '/products', label: 'المنتجات', enLabel: 'Products', icon: <Package size={18}/>, hint: 'الأصناف والحركة', enHint: 'Items and movement' },
    { path: '/inventory', label: 'المخزون', enLabel: 'Inventory', icon: <Warehouse size={18}/>, hint: 'توفر ورأس المال', enHint: 'Availability and capital' },
    { path: '/alternative-groups', label: 'البدائل', enLabel: 'Alternatives', icon: <Layers3 size={18}/>, hint: 'فرص الاستبدال', enHint: 'Substitution opportunities' },
  ]},
  { id: 'intelligence', title: 'القرار والذكاء', enTitle: 'Decision & Intelligence', items: [
    { path: '/intelligence', label: 'مركز الذكاء', enLabel: 'Intelligence Center', icon: <Brain size={18}/>, hint: 'المساعد الذكي داخل السياق', enHint: 'Contextual intelligence' },
    { path: '/intelligence/recommendations', label: 'التوصيات', enLabel: 'Recommendations', icon: <Sparkles size={18}/>, hint: 'ماذا نفعل بعد ذلك', enHint: 'What to do next' },
    { path: '/intelligence/forecasts', label: 'التنبؤات', enLabel: 'Forecasts', icon: <Target size={18}/>, hint: 'ما قد يحدث', enHint: 'What may happen' },
    { path: '/intelligence/scenarios', label: 'السيناريوهات', enLabel: 'Scenarios', icon: <Crosshair size={18}/>, hint: 'ماذا لو؟', enHint: 'What if?' },
    { path: '/analytics/rfm', label: 'RFM', enLabel: 'RFM', icon: <BarChart3 size={18}/> },
    { path: '/analytics/abc', label: 'ABC', enLabel: 'ABC', icon: <BarChart3 size={18}/> },
    { path: '/analytics/aging', label: 'الأعمار', enLabel: 'Aging', icon: <BarChart3 size={18}/> },
    { path: '/metrics', label: 'مراقب المقاييس', enLabel: 'Metric Inspector', icon: <Gauge size={18}/>, hint: 'لماذا هذا الرقم؟', enHint: 'Why this number?' },
  ]},
  { id: 'reports', title: 'التقارير', enTitle: 'Reports', items: [
    { path: '/reports/executive', label: 'التقرير التنفيذي', enLabel: 'Executive Report', icon: <ClipboardCheck size={18}/>, hint: 'قصة جاهزة للإدارة', enHint: 'Board-ready story' },
    { path: '/reports', label: 'مركز التقارير', enLabel: 'Reports Center', icon: <FileBarChart size={18}/>, hint: 'كل المخرجات', enHint: 'All deliverables' },
    { path: '/reports/inventory', label: 'تقرير المخزون', enLabel: 'Inventory Report', icon: <Warehouse size={18}/> },
    { path: '/reports/inventory-intelligence', label: 'ذكاء المخزون', enLabel: 'Inventory Intelligence', icon: <Gauge size={18}/> },
    { path: '/reports/demand-velocity', label: 'الطلب والحركة', enLabel: 'Demand & Velocity', icon: <Activity size={18}/> },
    { path: '/analytics', label: 'التحليلات', enLabel: 'Analytics', icon: <BarChart3 size={18}/>, hint: 'المساحة التحليلية', enHint: 'Analytical workspace' },
  ]},
  { id: 'admin', title: 'الإدارة', enTitle: 'Administration', items: [
    { path: '/onboarding', label: 'تجهيز الشركة', enLabel: 'Company Setup', icon: <ListChecks size={18}/> },
    { path: '/settings', label: 'إعدادات الشركة', enLabel: 'Company Settings', icon: <Settings size={18}/> },
    { path: '/settings/profile', label: 'ملفي الشخصي', enLabel: 'My Profile', icon: <UserCircle size={18}/> },
    { path: '/proposal-demo', label: 'وضع العرض التقديمي', enLabel: 'Proposal Demo', icon: <Presentation size={18}/>, hint: 'غرفة إثبات القيمة', enHint: 'Proof room' },
  ]},
];

const quickActions = [
  { path: '/import', label: 'استيراد', enLabel: 'Import', icon: <Upload size={14}/> },
  { path: '/reports/executive', label: 'تقرير تنفيذي', enLabel: 'Executive', icon: <ClipboardCheck size={14}/> },
  { path: '/reports/receivables', label: 'الذمم', enLabel: 'Receivables', icon: <WalletCards size={14}/> },
  { path: '/inventory', label: 'المخزون', enLabel: 'Inventory', icon: <Warehouse size={14}/> },
  { path: '/decision-experience', label: 'قرار اليوم', enLabel: 'Decision', icon: <Scale size={14}/> },
];

export function Sidebar({ alertCount = 0, onNavigate, user }: { alertCount?: number; onNavigate?: () => void; user?: User | null }) {
  const { language } = useLanguage();
  const location = useLocation();
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>(readWorkspaceMode);
  const visibleSections = useMemo(
    () => navSections.map(section => ({
      ...section,
      items: section.items.filter(item => isWorkspacePathVisible(item.path, workspaceMode)),
    })).filter(section => section.items.length > 0),
    [workspaceMode],
  );
  const activeSection = useMemo(
    () => visibleSections.find(section => section.items.some(item => location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))))?.id ?? 'today',
    [location.pathname, visibleSections],
  );
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(navSections.map(section => [section.id, true]))
  );

  useEffect(() => {
    const sync = () => setWorkspaceMode(readWorkspaceMode());
    window.addEventListener('storage', sync);
    window.addEventListener('report-advisor:workspace-mode', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('report-advisor:workspace-mode', sync);
    };
  }, []);

  useEffect(() => {
    setCollapsed(prev => ({ ...prev, [activeSection]: false }));
  }, [activeSection]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) throw error;
    onNavigate?.();
  };

  return (
    <aside dir={language === 'ar' ? 'rtl' : 'ltr'} className={'flex h-screen w-[296px] shrink-0 flex-col overflow-y-auto bg-[#0d1510] text-white shadow-elevated ' + (language === 'ar' ? 'border-l' : 'border-r') + ' border-white/10'}>
      <div className="border-b border-white/10 px-5 py-5">
        <Link to="/" onClick={onNavigate} className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 text-lg font-black text-white shadow-lg shadow-primary-950/20">أ</div>
          <div className="min-w-0">
            <div className="text-[15px] font-black tracking-tight">{language === 'ar' ? 'الأغبري' : 'Report-Advisor'}</div>
            <div className="mt-0.5 text-[10px] font-medium text-slate-400">{language === 'ar' ? 'ذكاء الأعمال والقرار' : 'Business & Decision Intelligence'}</div>
          </div>
        </Link>
      </div>

      <div className="px-4 pt-4">
        <div className="rounded-2xl border border-primary-400/15 bg-primary-500/10 px-4 py-3">
          <div className="text-[10px] font-black tracking-[0.18em] text-primary-200">{language === 'ar' ? 'نموذج التشغيل' : 'OPERATING MODEL'}</div>
          <div className="mt-1 text-xs leading-5 text-slate-300">{language === 'ar' ? 'بيانات → دليل → قرار → إجراء → تعلّم' : 'Data → evidence → decision → action → learning'}</div>
          <div className="mt-2 text-[10px] font-semibold text-primary-100/80">{language === 'ar' ? 'المساحة: ' : 'Workspace: '}{workspaceMode === 'essential' ? (language === 'ar' ? 'أساسية' : 'Essential') : workspaceMode === 'advanced' ? (language === 'ar' ? 'متقدمة' : 'Advanced') : (language === 'ar' ? 'خبيرة' : 'Expert')}</div>
        </div>
      </div>

      <div className="px-4 pt-3">
        <div className="grid grid-cols-5 gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5">
          {quickActions.map(action => {
            const active = location.pathname === action.path || (action.path !== '/' && location.pathname.startsWith(action.path));
            return <Link key={action.path} to={action.path} onClick={onNavigate} className={'flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-center text-[9px] font-bold transition ' + (active ? 'bg-primary-500/15 text-primary-100' : 'text-slate-400 hover:bg-white/5 hover:text-white')}>
              {action.icon}<span className="truncate">{language === 'ar' ? action.label : action.enLabel}</span>
            </Link>;
          })}
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-3 py-4" aria-label={language === 'ar' ? 'التنقل التجاري الرئيسي' : 'Primary business navigation'}>
        {visibleSections.map(section => {
          const isOpen = !collapsed[section.id];
          const isActive = activeSection === section.id;
          return <section key={section.id}>
            <button type="button" onClick={() => setCollapsed(prev => ({ ...prev, [section.id]: !isOpen }))} className={'flex w-full items-center gap-2 rounded-xl px-3 py-2 ' + (language === 'ar' ? 'text-right ' : 'text-left ') + (isActive ? 'text-primary-200 bg-primary-500/5' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200')} aria-expanded={isOpen}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-400">
                {section.id === 'today' ? <LayoutDashboard size={15}/> : section.id === 'operations' ? <BriefcaseBusiness size={15}/> : section.id === 'money' ? <WalletCards size={15}/> : section.id === 'customers-products' ? <Package size={15}/> : section.id === 'intelligence' ? <Brain size={15}/> : section.id === 'reports' ? <FileBarChart size={15}/> : <Settings size={15}/>}
              </span>
              <span className="flex-1 text-[11px] font-black tracking-[0.04em]">{language === 'ar' ? section.title : section.enTitle}</span>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] font-bold text-slate-500">{section.items.length}</span>
              <ChevronDown size={14} className={'transition-transform ' + (isOpen ? '' : '-rotate-90')} />
            </button>
            {isOpen && <div className="mt-1 space-y-0.5">
              {section.items.map(item => {
                const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                return <Link key={item.path} to={item.path} onClick={onNavigate} className={'nav-item ' + (active ? 'nav-item-active' : 'nav-item-inactive')}>
                  <span className={'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ' + (active ? 'bg-primary-500/15 text-primary-200' : 'bg-white/5 text-slate-400')}>{item.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{language === 'ar' ? item.label : item.enLabel}</span>
                    {item.hint && <span className={'mt-0.5 block truncate text-[9px] font-normal ' + (active ? 'text-primary-100/70' : 'text-slate-500')}>{language === 'ar' ? item.hint : item.enHint}</span>}
                  </span>
                </Link>;
              })}
            </div>}
          </section>;
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-sm font-black text-primary-200">{getDisplayName(user ?? null).slice(0, 1) || 'م'}</div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">{getDisplayName(user ?? null)}</div>
            <div className="truncate text-[10px] text-slate-500" dir="ltr">{getDisplayEmail(user ?? null)}</div>
          </div>
        </div>
        <button type="button" onClick={() => void signOut()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white" aria-label={language === 'ar' ? 'تسجيل الخروج' : 'Sign out'}><LogOut size={15}/>{language === 'ar' ? 'تسجيل الخروج' : 'Sign out'}</button>
      </div>
    </aside>
  );
}
