import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, BarChart3, Brain, ChevronDown, ClipboardCheck, FileBarChart, Gauge, Layers3, LayoutDashboard, ListChecks, LogOut, Package, Presentation, Scale, ScanSearch, Settings, Target, Upload, UserCircle, Users, Warehouse, AlertCircle, PlugZap } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getDisplayEmail, getDisplayName } from '@/lib/profile-display';
import { useLanguage } from '@/lib/language';
import { isWorkspacePathVisible, readWorkspaceMode, readWorkspacePreferences, type WorkspaceMode, type WorkspacePreferences } from '@/lib/workspace-mode';

import { NAVIGATION_SECTIONS, type NavigationIconKey, type NavigationItem } from '@/lib/navigation-registry';

interface NavItem extends NavigationItem { iconNode: ReactNode }
interface NavSection {
  id: NavigationItem['section'];
  title: string;
  enTitle: string;
  items: NavItem[];
}

const iconFor: Record<NavigationIconKey, ReactNode> = {
  dashboard: <LayoutDashboard size={16}/>,
  'command-center': <Scale size={16}/>,
  decision: <ClipboardCheck size={16}/>,
  intelligence: <Brain size={16}/>,
  'work-center': <Activity size={16}/>,
  import: <Upload size={16}/>,
  document: <ScanSearch size={16}/>,
  quality: <AlertCircle size={16}/>,
  connections: <PlugZap size={16}/>,
  money: <FileBarChart size={16}/>,
  purchases: <FileBarChart size={16}/>,
  receivables: <CreditMark/>,
  profitability: <Gauge size={16}/>,
  customers: <Users size={16}/>,
  products: <Package size={16}/>,
  inventory: <Warehouse size={16}/>,
  alternatives: <Layers3 size={16}/>,
  recommendations: <Brain size={16}/>,
  forecasts: <Target size={16}/>,
  scenarios: <ScenarioMark/>,
  rfm: <BarChart3 size={16}/>,
  abc: <BarChart3 size={16}/>,
  aging: <BarChart3 size={16}/>,
  metrics: <Gauge size={16}/>,
  'executive-report': <ClipboardCheck size={16}/>,
  reports: <FileBarChart size={16}/>,
  'inventory-report': <Warehouse size={16}/>,
  'inventory-intelligence': <Gauge size={16}/>,
  demand: <Activity size={16}/>,
  analytics: <BarChart3 size={16}/>,
  onboarding: <ListChecks size={16}/>,
  settings: <Settings size={16}/>,
  profile: <UserCircle size={16}/>,
  proposal: <Presentation size={16}/>,
};

const navSections: NavSection[] = NAVIGATION_SECTIONS.map(section => ({
  ...section,
  items: section.items.map(item => ({ ...item, iconNode: iconFor[item.icon] })),
}));

function CreditMark(){return <span className="text-[13px] font-black">◫</span>}
function ScenarioMark(){return <span className="text-[12px] font-black">◎</span>}
const sectionIcons:Record<string,ReactNode>={today:<LayoutDashboard size={17}/>,operations:<Activity size={17}/>,money:<FileBarChart size={17}/>,'customers-products':<Package size={17}/>,intelligence:<Brain size={17}/>,reports:<ClipboardCheck size={17}/>,admin:<Settings size={17}/>};

export function Sidebar({alertCount=0,onNavigate,user}:{alertCount?:number;onNavigate?:()=>void;user?:User|null}){
 const{language}=useLanguage();const location=useLocation();const[workspaceMode,setWorkspaceMode]=useState<WorkspaceMode>(readWorkspaceMode);
 const [workspacePreferences,setWorkspacePreferences]=useState<WorkspacePreferences>(readWorkspacePreferences); const visibleSections=useMemo(()=>navSections.map(s=>({...s,items:s.items.filter(i=>isWorkspacePathVisible(i.path,workspaceMode,workspacePreferences))})).filter(s=>s.items.length).sort((a,b)=>workspacePreferences.sectionOrder.indexOf(a.id)-workspacePreferences.sectionOrder.indexOf(b.id)),[workspaceMode,workspacePreferences]); const favoriteItems=useMemo(()=>{const visible=new Map(navSections.flatMap(section=>section.items).map(item=>[item.path,item]));return workspacePreferences.favoritePaths.map(path=>visible.get(path)).filter((item):item is NavItem=>item !== undefined).filter(item=>isWorkspacePathVisible(item.path,workspaceMode,workspacePreferences)).slice(0,4)},[workspacePreferences,workspaceMode]);
 const activeSection=useMemo(()=>visibleSections.find(s=>s.items.some(i=>location.pathname===i.path||(i.path!=='/'&&location.pathname.startsWith(i.path))))?.id??'today',[location.pathname,visibleSections]);
 const[expandedSection,setExpandedSection]=useState(activeSection);
 useEffect(()=>{const sync=()=>{setWorkspaceMode(readWorkspaceMode());setWorkspacePreferences(readWorkspacePreferences())};window.addEventListener('storage',sync);window.addEventListener('report-advisor:workspace-mode',sync);window.addEventListener('report-advisor:workspace-preferences',sync);return()=>{window.removeEventListener('storage',sync);window.removeEventListener('report-advisor:workspace-mode',sync);window.removeEventListener('report-advisor:workspace-preferences',sync)}},[]);
 useEffect(()=>setExpandedSection(activeSection),[activeSection]);
 const signOut=async()=>{const{error}=await supabase.auth.signOut({scope:'local'});if(error)throw error;onNavigate?.()};
 return <aside dir={language==='ar'?'rtl':'ltr'} className={'flex h-screen w-[238px] shrink-0 flex-col border-l border-ink-200 bg-white text-ink-900 '+(language==='ar'?'border-l':'border-r')}>
  <div className="border-b border-ink-200 px-4 py-3.5"><Link to="/" onClick={onNavigate} className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-ink-950 text-sm font-black text-white">أ</div><div className="min-w-0"><div className="text-[14px] font-black">الأغبري</div><div className="mt-0.5 text-[10px] text-ink-400">Business Intelligence</div></div></Link></div>
  <div className="px-3 py-3"><div className="flex items-center justify-between rounded-[9px] border border-ink-200 bg-ink-50 px-2.5 py-2"><span className="text-[10px] font-semibold text-ink-500">كثافة المساحة</span><span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-ink-700 ring-1 ring-inset ring-ink-200">{workspaceMode==='essential'?'أساسية':workspaceMode==='advanced'?'متقدمة':'خبيرة'}</span></div></div>
  <div className="px-3"><div className="section-kicker px-2 pb-2">المفضلة</div><div className="grid grid-cols-2 gap-1.5">{(favoriteItems.length?favoriteItems:navSections.flatMap(section=>section.items).filter(item=>isWorkspacePathVisible(item.path,workspaceMode,workspacePreferences)).slice(0,4)).map(item=><Link key={item.path} to={item.path} onClick={onNavigate} className="flex items-center gap-1.5 rounded-[8px] border border-ink-200 bg-white px-2 py-2 text-[11px] font-semibold text-ink-600 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800">{item.iconNode}<span className="truncate">{language==='ar'?item.label:item.enLabel}</span></Link>)}</div></div>
  <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label={language==='ar'?'التنقل التجاري الرئيسي':'Primary business navigation'}><div className="space-y-1">{visibleSections.map(section=>{const active=activeSection===section.id,open=expandedSection===section.id;return <div key={section.id}><button type="button" onClick={()=>setExpandedSection(open?'':section.id)} className={'flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-right transition '+(active?'bg-ink-100 text-ink-950':'text-ink-600 hover:bg-ink-50 hover:text-ink-950')} aria-expanded={open}><span className={'flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] '+(active?'bg-white text-primary-700':'bg-ink-50 text-ink-400')}>{sectionIcons[section.id]}</span><span className="min-w-0 flex-1 text-[13px] font-bold">{language==='ar'?section.title:section.enTitle}</span>{section.id==='today'&&alertCount>0&&<span className="min-w-4 rounded-full bg-danger-600 px-1 text-center text-[9px] font-black text-white">{alertCount}</span>}<ChevronDown size={14} className={'shrink-0 text-ink-300 transition-transform '+(open?'':'-rotate-90')}/></button>{open&&<div className="mr-3 mt-0.5 space-y-0.5 border-r border-ink-200 pr-2">{section.items.map(item=>{const activeItem=location.pathname===item.path||(item.path!=='/'&&location.pathname.startsWith(item.path));return <Link key={item.path} to={item.path} onClick={onNavigate} className={'nav-item '+(activeItem?'nav-item-active':'nav-item-inactive')}><span className="shrink-0">{item.icon}</span><span className="min-w-0 flex-1 truncate">{language==='ar'?item.label:item.enLabel}</span></Link>})}</div>}</div>})}</div></nav>
  <div className="border-t border-ink-200 p-3"><div className="flex items-center gap-2.5"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-ink-100 text-[11px] font-black text-ink-700">{getDisplayName(user??null).slice(0,1)||'م'}</div><div className="min-w-0 flex-1"><div className="truncate text-[12px] font-bold text-ink-800">{getDisplayName(user??null)}</div><div className="truncate text-[10px] text-ink-400" dir="ltr">{getDisplayEmail(user??null)}</div></div><button type="button" onClick={()=>void signOut()} className="rounded-[8px] p-2 text-ink-400 hover:bg-ink-100 hover:text-ink-800" aria-label={language==='ar'?'تسجيل الخروج':'Sign out'}><LogOut size={15}/></button></div></div>
 </aside>
}
