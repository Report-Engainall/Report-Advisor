import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Upload, FileBarChart, BarChart3, Brain, Users, Package, Warehouse, Settings, AlertCircle, Layers3, Gauge, Activity, Crosshair, LogOut, UserCircle } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getDisplayEmail, getDisplayName } from '@/lib/profile-display';

interface NavItem { path:string; label:string; icon:ReactNode }
interface NavSection { title:string; items:NavItem[] }
const navSections:NavSection[]=[
 {title:'الرئيسية',items:[{path:'/',label:'لوحة القيادة',icon:<LayoutDashboard size={18}/>},{path:'/command-center',label:'مركز القيادة التنفيذية',icon:<Crosshair size={18}/>} ]},
 {title:'البيانات',items:[{path:'/import',label:'مركز الاستيراد',icon:<Upload size={18}/>},{path:'/data-quality',label:'جودة البيانات',icon:<AlertCircle size={18}/>} ]},
 {title:'التقارير',items:[{path:'/reports',label:'مركز التقارير',icon:<FileBarChart size={18}/>},{path:'/reports/sales',label:'المبيعات',icon:<FileBarChart size={18}/>},{path:'/reports/purchases',label:'المشتريات',icon:<FileBarChart size={18}/>},{path:'/reports/inventory',label:'المخزون',icon:<FileBarChart size={18}/>},{path:'/reports/inventory-intelligence',label:'ذكاء المخزون والمجموعات',icon:<Gauge size={18}/>},{path:'/reports/demand-velocity',label:'حركة الطلب',icon:<Activity size={18}/>},{path:'/reports/receivables',label:'الذمم والتحصيل',icon:<FileBarChart size={18}/>},{path:'/reports/profitability',label:'الأرباح والربحية',icon:<FileBarChart size={18}/>} ]},
 {title:'التحليلات',items:[{path:'/analytics',label:'مركز التحليلات',icon:<BarChart3 size={18}/>},{path:'/analytics/rfm',label:'تحليل RFM',icon:<BarChart3 size={18}/>},{path:'/analytics/abc',label:'تحليل ABC',icon:<BarChart3 size={18}/>},{path:'/analytics/aging',label:'تحليل الأعمار',icon:<BarChart3 size={18}/>} ]},
 {title:'الذكاء والقرار',items:[{path:'/intelligence',label:'مركز الذكاء',icon:<Brain size={18}/>},{path:'/intelligence/recommendations',label:'التوصيات',icon:<Brain size={18}/>},{path:'/intelligence/forecasts',label:'التنبؤات',icon:<Brain size={18}/>},{path:'/intelligence/scenarios',label:'محاكاة السيناريوهات',icon:<Brain size={18}/>} ]},
 {title:'الكيانات',items:[{path:'/customers',label:'العملاء',icon:<Users size={18}/>},{path:'/products',label:'المنتجات',icon:<Package size={18}/>},{path:'/inventory',label:'المخزون',icon:<Warehouse size={18}/>},{path:'/alternative-groups',label:'مجموعات البدائل',icon:<Layers3 size={18}/>} ]},
 {title:'النظام',items:[{path:'/settings',label:'الإعدادات',icon:<Settings size={18}/>},{path:'/settings/profile',label:'الملف الشخصي',icon:<UserCircle size={18}/>} ]},
];

export function Sidebar({alertCount=0,onNavigate,user}:{alertCount?:number;onNavigate?:()=>void;user?:User|null}){
  const location=useLocation();
  const handleSignOut = async () => { await supabase.auth.signOut(); onNavigate?.(); };
  return <aside className="w-64 bg-white border-l border-ink-100 flex flex-col h-screen sticky top-0 overflow-y-auto">
    <div className="px-5 py-5 border-b border-ink-100"><Link to="/" onClick={onNavigate} className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white font-bold text-lg">N</div><div><div className="font-bold text-ink-900 text-base">Nasr</div><div className="text-[11px] text-ink-400">منصة ذكاء الأعمال والقرار</div></div></Link></div>
    <nav className="flex-1 px-3 py-4 space-y-5">{navSections.map(section=><div key={section.title}><div className="px-3 mb-1.5 text-[11px] font-semibold text-ink-400 uppercase tracking-wider">{section.title}</div><div className="space-y-0.5">{section.items.map(item=>{const active=location.pathname===item.path||(item.path!=='/'&&location.pathname.startsWith(item.path));return <Link key={item.path} to={item.path} onClick={onNavigate} className={`nav-item ${active?'nav-item-active':'nav-item-inactive'}`}>{item.icon}<span className="flex-1">{item.label}</span>{item.path==='/intelligence'&&alertCount>0&&<span className="badge-danger text-[10px] px-1.5 py-0.5">{alertCount}</span>}</Link>})}</div></div>)}</nav>
    <div className="px-4 py-4 border-t border-ink-100"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">م</div><div className="flex-1 min-w-0"><div className="text-sm font-medium text-ink-800 truncate">{getDisplayName(user ?? null)}</div><div className="text-[11px] text-ink-400 truncate" dir="ltr">{getDisplayEmail(user ?? null)}</div></div></div><button type="button" onClick={() => void handleSignOut()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-ink-200 px-3 py-2 text-xs font-medium text-ink-600 transition hover:bg-ink-50 hover:text-danger-600" aria-label="تسجيل الخروج"><LogOut size={15}/> تسجيل الخروج</button></div>
  </aside>;
}
