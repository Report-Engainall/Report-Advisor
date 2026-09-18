import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity, BarChart3, Brain, ChevronDown, ClipboardCheck, Crosshair, FileBarChart, Gauge,
  Layers3, LayoutDashboard, ListChecks, LogOut, Package, Presentation, Scale, ScanSearch,
  Settings, Target, Upload, UserCircle, Users, Warehouse, AlertCircle, PlugZap
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getDisplayEmail, getDisplayName } from '@/lib/profile-display';
import { useLanguage } from '@/lib/language';

interface NavItem { path: string; label: string; icon: ReactNode; hint?: string; enLabel?: string; enHint?: string }
interface NavSection { title: string; items: NavItem[] }

const navSections: NavSection[] = [
  { title: 'مركز القرار', items: [
    { path: '/', label: 'لوحة التحكم', icon: <LayoutDashboard size={18}/>, hint: 'الصورة التنفيذية' },
    { path: '/command-center', label: 'مركز القيادة', icon: <Crosshair size={18}/>, hint: 'الأولويات والإجراءات' },
    { path: '/decision-experience', label: 'تجربة القرار', icon: <Scale size={18}/>, hint: 'دليل → قرار → إجراء' },
    { path: '/reports/executive', label: 'التقرير التنفيذي', icon: <ClipboardCheck size={18}/>, hint: 'القصة التنفيذية' },
  ]},
  { title: 'العمل والبيانات', items: [
    { path: '/work-center', label: 'مركز العمل', enLabel: 'Work Center', icon: <Activity size={18}/>, hint: 'الحالات والاستثناءات', enHint: 'Execution and exceptions' },
    { path: '/connections', label: 'المصادر والموصلات', enLabel: 'Sources & Connections', icon: <PlugZap size={18}/>, hint: 'متاجر وملفات وأنظمة', enHint: 'Stores, files, systems' },
    { path: '/import', label: 'إدخال البيانات', icon: <Upload size={18}/>, hint: 'الاستيراد الحاكم' },
    { path: '/import/analyze', label: 'تحليل المستندات', icon: <ScanSearch size={18}/>, hint: 'استخراج وإثبات' },
    { path: '/data-quality', label: 'جودة البيانات', icon: <AlertCircle size={18}/>, hint: 'مشكلات ونواقص' },
  ]},
  { title: 'التحليل التجاري', items: [
    { path: '/reports', label: 'مركز التقارير', icon: <FileBarChart size={18}/> },
    { path: '/reports/sales', label: 'تقرير المبيعات', icon: <FileBarChart size={18}/> },
    { path: '/reports/purchases', label: 'تقرير المشتريات', icon: <FileBarChart size={18}/> },
    { path: '/reports/inventory', label: 'تقرير المخزون', icon: <Warehouse size={18}/> },
    { path: '/analytics', label: 'التحليلات', icon: <BarChart3 size={18}/> },
    { path: '/reports/inventory-intelligence', label: 'ذكاء المخزون والمجموعات', icon: <Gauge size={18}/> },
    { path: '/reports/demand-velocity', label: 'الطلب والحركة', icon: <Activity size={18}/> },
    { path: '/reports/receivables', label: 'الذمم والتحصيل', icon: <FileBarChart size={18}/> },
    { path: '/reports/profitability', label: 'الربحية', icon: <FileBarChart size={18}/> },
    { path: '/analytics/rfm', label: 'RFM', icon: <BarChart3 size={18}/> },
    { path: '/analytics/abc', label: 'ABC', icon: <BarChart3 size={18}/> },
    { path: '/analytics/aging', label: 'الأعمار', icon: <BarChart3 size={18}/> },
  ]},
  { title: 'الذكاء والاستشراف', items: [
    { path: '/intelligence', label: 'مركز الذكاء', icon: <Brain size={18}/>, hint: 'المساعد الذكي هنا' },
    { path: '/intelligence/recommendations', label: 'التوصيات', icon: <Brain size={18}/> },
    { path: '/intelligence/forecasts', label: 'التنبؤات', icon: <Brain size={18}/> },
    { path: '/intelligence/scenarios', label: 'السيناريوهات', icon: <Target size={18}/> },
    { path: '/metrics', label: 'مراقب المقاييس', icon: <Target size={18}/> },
  ]},
  { title: 'البيانات المرجعية', items: [
    { path: '/customers', label: 'العملاء', icon: <Users size={18}/> },
    { path: '/products', label: 'المنتجات', icon: <Package size={18}/> },
    { path: '/inventory', label: 'المخزون', icon: <Warehouse size={18}/> },
    { path: '/alternative-groups', label: 'البدائل', icon: <Layers3 size={18}/> },
  ]},
  { title: 'الإعداد والتجهيز', items: [
    { path: '/onboarding', label: 'تجهيز الشركة', icon: <ListChecks size={18}/> },
    { path: '/proposal-demo', label: 'عرض تقديمي', icon: <Presentation size={18}/> },
    { path: '/settings', label: 'إعدادات الشركة', icon: <Settings size={18}/> },
    { path: '/settings/profile', label: 'ملفي الشخصي', icon: <UserCircle size={18}/> },
  ]},
];

export function Sidebar({ alertCount = 0, onNavigate, user }: { alertCount?: number; onNavigate?: () => void; user?: User | null }) {
  const { language } = useLanguage();
  const location = useLocation();
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>(readWorkspaceMode);
  const visibleSections = useMemo(() => navSections.map(section => ({
    ...section,
    items: section.items.filter(item => isWorkspacePathVisible(item.path, workspaceMode)),
  })).filter(section => section.items.length > 0), [workspaceMode]);
  const activeSection = useMemo(
    () => navSections.find(section => section.items.some(item => location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))))?.title ?? 'مركز القرار',
    [location.pathname],
  );
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

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
    <aside dir={language === "ar" ? "rtl" : "ltr"} className={"flex h-screen w-[288px] shrink-0 flex-col overflow-y-auto bg-[#0d1510] text-white shadow-elevated " + (language === "ar" ? "border-l" : "border-r") + " border-white/10"}>
      <div className="border-b border-white/10 px-5 py-5">
        <Link to="/" onClick={onNavigate} className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 text-lg font-black text-white shadow-lg shadow-primary-950/20">أ</div>
          <div className="min-w-0">
            <div className="text-[15px] font-black tracking-tight">الأغبري</div>
            <div className="mt-0.5 text-[10px] font-medium text-slate-400">ذكاء الأعمال والقرار</div>
          </div>
        </Link>
      </div>

      <div className="px-4 pt-4">
        <div className="rounded-2xl border border-primary-400/15 bg-primary-500/10 px-4 py-3">
          <div className="text-[10px] font-black tracking-[0.18em] text-primary-200">نموذج التشغيل</div>
          <div className="mt-1 text-xs leading-5 text-slate-300">بيانات → دليل → قرار → إجراء → تعلّم</div>
          <div className="mt-2 text-[10px] font-semibold text-primary-100/80">مساحة: {workspaceMode === 'essential' ? 'أساسية' : workspaceMode === 'advanced' ? 'متقدمة' : 'خبيرة'}</div>
        </div>
      </div>

      <nav className="flex-1 space-y-3 px-3 py-4" aria-label={language === "ar" ? "التنقل الرئيسي" : "Main navigation"}>
        {visibleSections.map(section => {
          const isOpen = !collapsed[section.title];
          const isActive = activeSection === section.title;
          return (
            <section key={section.title}>
              <button
                type="button"
                onClick={() => setCollapsed(prev => ({ ...prev, [section.title]: !isOpen }))}
                className={'flex w-full items-center gap-2 rounded-xl px-3 py-2 ' + (language === "ar" ? "text-right " : "text-left ") + (isActive ? 'text-primary-200' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200')}
                aria-expanded={isOpen}
              >
                <span className="flex-1 text-[10px] font-black tracking-[0.08em]">{language === "en" ? ({ "مركز القرار": "Decision", "العمل والبيانات": "Work & Data", "التحليل التجاري": "Business Analytics", "الذكاء والاستشراف": "Intelligence", "البيانات المرجعية": "Reference Data", "الإعداد والتجهيز": "Setup & Demo" }[section.title] ?? section.title) : section.title}</span>
                <ChevronDown size={14} className={'transition-transform ' + (isOpen ? '' : '-rotate-90')} />
              </button>
              {isOpen && (
                <div className="mt-1 space-y-0.5">
                  {section.items.map(item => {
                    const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                    return (
                      <Link key={item.path} to={item.path} onClick={onNavigate} className={'nav-item ' + (active ? 'nav-item-active' : 'nav-item-inactive')} aria-current={active ? 'page' : undefined}>
                        <span className={'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ' + (active ? 'bg-primary-500/15 text-primary-200' : 'bg-white/5 text-slate-400')}>{item.icon}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{language === "en" ? (item.enLabel ?? item.label) : item.label}</span>
                          {item.hint && <span className={'mt-0.5 block truncate text-[9px] font-normal ' + (active ? 'text-primary-100/70' : 'text-slate-500')}>{language === "en" ? (item.enHint ?? item.hint) : item.hint}</span>}
                        </span>
                        {item.path === '/intelligence' && alertCount > 0 && <span className="rounded-full bg-danger-500 px-1.5 py-0.5 text-[10px] font-black text-white">{alertCount}</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          );
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
        <button type="button" onClick={() => void signOut()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white" aria-label="تسجيل الخروج"><LogOut size={15}/> تسجيل الخروج</button>
      </div>
    </aside>
  );
}
