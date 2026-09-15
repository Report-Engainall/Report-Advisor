import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Upload, FileBarChart, BarChart3, Brain, Users, Package, Warehouse, Settings, AlertCircle, Layers3, Gauge, Activity, Crosshair, LogOut, UserCircle, Scale, ClipboardCheck, Target, ScanSearch, ChevronDown, ShoppingCart, WalletCards, Sparkles } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getDisplayEmail, getDisplayName } from '@/lib/profile-display';

interface NavItem { path:string; label:string; icon:ReactNode; description?:string }
interface NavSection { title:string; items:NavItem[] }

// Business-first information architecture. Existing routes remain intact; only
// their presentation is grouped around the decisions users need to make.
const navSections:NavSection[] = [
  {
    title:'مركز الأعمال',
    items:[
      {path:'/command-center',label:'مركز القيادة التنفيذية',icon:<Crosshair size={18}/>,description:'الصورة التنفيذية والإجراءات ذات الأولوية'},
      {path:'/',label:'لوحة الأداء',icon:<LayoutDashboard size={18}/>,description:'لقطة النشاط والمؤشرات'},
      {path:'/reports/sales',label:'المبيعات',icon:<ShoppingCart size={18}/>,description:'الأداء والاتجاهات'},
      {path:'/customers',label:'العملاء والتحصيل',icon:<Users size={18}/>,description:'القيمة والذمم والنشاط'},
      {path:'/inventory',label:'المخزون',icon:<Warehouse size={18}/>,description:'القيمة والحركة والسيولة'},
      {path:'/reports/demand-velocity',label:'الطلب والحركة',icon:<Activity size={18}/>,description:'السرعة والطلب ومؤشرات الحركة'},
    ]
  },
  {
    title:'البيانات والمصدر',
    items:[
      {path:'/import',label:'مركز الاستيراد',icon:<Upload size={18}/>,description:'إدخال البيانات عبر المسار المحكوم'},
      {path:'/import/analyze',label:'تحليل الملفات',icon:<ScanSearch size={18}/>,description:'فهم المصدر قبل الاعتماد'},
      {path:'/data-quality',label:'جودة البيانات',icon:<AlertCircle size={18}/>,description:'الاكتمال والتحقق والثقة'},
    ]
  },
  {
    title:'الذكاء والقرار',
    items:[
      {path:'/decision-experience',label:'مساحة القرار',icon:<Scale size={18}/>,description:'قرار → إجراء → نتيجة → دليل'},
      {path:'/intelligence',label:'مركز الذكاء',icon:<Brain size={18}/>,description:'تنبيهات وتوصيات وتنبؤات'},
      {path:'/intelligence/recommendations',label:'التوصيات',icon:<Sparkles size={18}/>,description:'الفرص والإجراءات القابلة للمراجعة'},
      {path:'/intelligence/forecasts',label:'التنبؤات',icon:<Gauge size={18}/>,description:'توقعات الطلب والاتجاه'},
      {path:'/intelligence/scenarios',label:'السيناريوهات',icon:<Brain size={18}/>,description:'اختبار البدائل دون تغيير الحقيقة'},
      {path:'/metrics',label:'فحص المقاييس',icon:<Target size={18}/>,description:'مصدر وقاعدة وحالة المقياس'},
    ]
  },
  {
    title:'التقارير والتحليل',
    items:[
      {path:'/reports',label:'مركز التقارير',icon:<FileBarChart size={18}/>,description:'المخرجات التنفيذية والتشغيلية'},
      {path:'/reports/executive',label:'التقرير التنفيذي',icon:<ClipboardCheck size={18}/>,description:'ملخص القرار والأدلة'},
      {path:'/reports/purchases',label:'المشتريات',icon:<FileBarChart size={18}/>},
      {path:'/reports/inventory',label:'تقرير المخزون',icon:<FileBarChart size={18}/>},
      {path:'/reports/inventory-intelligence',label:'ذكاء المخزون والمجموعات',icon:<Gauge size={18}/>},
      {path:'/reports/receivables',label:'الذمم والتحصيل',icon:<WalletCards size={18}/>},
      {path:'/reports/profitability',label:'الأرباح والربحية',icon:<FileBarChart size={18}/>},
      {path:'/analytics',label:'مركز التحليلات',icon:<BarChart3 size={18}/>},
      {path:'/analytics/rfm',label:'تحليل RFM',icon:<BarChart3 size={18}/>},
      {path:'/analytics/abc',label:'تحليل ABC',icon:<BarChart3 size={18}/>},
      {path:'/analytics/aging',label:'تحليل الأعمار',icon:<BarChart3 size={18}/>},
    ]
  },
  {
    title:'الكتالوج والكيانات',
    items:[
      {path:'/products',label:'المنتجات',icon:<Package size={18}/>},
      {path:'/alternative-groups',label:'مجموعات البدائل',icon:<Layers3 size={18}/>},
    ]
  },
  {
    title:'النظام',
    items:[
      {path:'/settings',label:'إعدادات الشركة',icon:<Settings size={18}/>},
      {path:'/settings/profile',label:'الملف الشخصي',icon:<UserCircle size={18}/>},
    ]
  },
];

export function Sidebar({alertCount=0,onNavigate,user}:{alertCount?:number;onNavigate?:()=>void;user?:User|null}) {
  const location=useLocation();
  const activeSection=useMemo(()=>navSections.find(section=>section.items.some(item=>location.pathname===item.path||(item.path!=='/'&&location.pathname.startsWith(item.path))))?.title ?? 'مركز الأعمال',[location.pathname]);
  const [collapsed,setCollapsed]=useState<Record<string,boolean>>({});
  const [signOutError,setSignOutError]=useState(false);
  useEffect(()=>{setCollapsed(prev=>({...prev,[activeSection]:false}));},[activeSection]);

  const handleSignOut = async () => {
    setSignOutError(false);
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) throw error;
    onNavigate?.();
  };

  return <aside className="w-64 bg-white/95 border-l border-ink-100 flex flex-col h-screen sticky top-0 overflow-y-auto backdrop-blur-sm">
    <div className="px-5 py-5 border-b border-ink-100">
      <Link to="/" onClick={onNavigate} className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 text-lg font-bold text-white shadow-sm">ع</div>
        <div><div className="font-bold text-ink-900 text-base">الأغبري</div><div className="text-[11px] text-ink-400">منصة ذكاء الأعمال والقرار</div></div>
      </Link>
    </div>
    <nav className="flex-1 px-3 py-4 space-y-3" aria-label="التنقل الرئيسي">
      {navSections.map(section=>{
        const isOpen=!collapsed[section.title];
        const isActive=activeSection===section.title;
        return <section key={section.title} className="rounded-2xl">
          <button type="button" onClick={()=>setCollapsed(prev=>({...prev,[section.title]:!isOpen}))} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-right transition ${isActive?'text-primary-700 bg-primary-50/50':'text-ink-400 hover:bg-ink-50 hover:text-ink-700'}`} aria-expanded={isOpen}>
            <span className="flex-1 text-[11px] font-bold tracking-wide">{section.title}</span><ChevronDown size={14} className={`transition-transform ${isOpen?'':'-rotate-90'}`}/>
          </button>
          {isOpen&&<div className="mt-1 space-y-0.5">
            {section.items.map(item=>{
              const active=location.pathname===item.path||(item.path!=='/'&&location.pathname.startsWith(item.path));
              return <Link key={item.path} to={item.path} onClick={onNavigate} title={item.description} className={`nav-item ${active?'nav-item-active':'nav-item-inactive'}`}>
                {item.icon}<span className="flex-1 min-w-0 truncate">{item.label}</span>
                {item.path==='/intelligence'&&alertCount>0&&<span className="badge-danger text-[10px] px-1.5 py-0.5">{alertCount}</span>}
              </Link>;
            })}
          </div>}
        </section>;
      })}
    </nav>
    <div className="px-4 py-4 border-t border-ink-100">
      <div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">م</div><div className="flex-1 min-w-0"><div className="text-sm font-medium text-ink-800 truncate">{getDisplayName(user ?? null)}</div><div className="text-[11px] text-ink-400 truncate" dir="ltr">{getDisplayEmail(user ?? null)}</div></div></div>
      {signOutError&&<div role="alert" className="mt-3 rounded-xl border border-danger-200 bg-danger-50 px-3 py-2 text-[11px] leading-5 text-danger-700">تعذر تسجيل الخروج. لم يتم تغيير الجلسة، أعد المحاولة.</div>}
      <button type="button" onClick={()=>void handleSignOut().catch(()=>setSignOutError(true))} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-ink-200 px-3 py-2 text-xs font-medium text-ink-600 transition hover:bg-ink-50 hover:text-danger-600" aria-label="تسجيل الخروج"><LogOut size={15}/> تسجيل الخروج</button>
    </div>
  </aside>;
}