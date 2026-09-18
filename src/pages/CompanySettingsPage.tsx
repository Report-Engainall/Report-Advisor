import { useEffect, useState, useCallback } from 'react';
import { Check, Eye, EyeOff, MoveDown, MoveUp, RotateCcw, SlidersHorizontal, Star } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader, LoadingState, ErrorState } from '@/components/ui/States';
import { resolveCurrentCompanyId, supabase } from '@/lib/supabase';
import { WORKSPACE_MODE_KEY, readWorkspaceMode, type WorkspaceMode } from '@/lib/workspace-mode';
import {
  readWorkspacePreferences,
  resetWorkspacePreferences,
  moveSection,
  preferencesForRole,
  writeWorkspacePreferences,
  type DashboardWidgetId,
  type WorkspacePreferences,
  type WorkspaceRolePreset,
  type WorkspaceSectionId,
} from '@/lib/workspace-preferences';

interface CompanySettings {
  id:string; name:string; legal_name:string|null; tax_id:string|null; currency:string|null;
  timezone:string|null; industry:string|null; phone:string|null; email:string|null; address:string|null;
}
const modules=[
  ['/','نبض الأعمال'],['/command-center','مركز القيادة'],['/work-center','مركز العمل'],['/import','الاستيراد'],
  ['/import/analyze','تحليل المستندات'],['/data-quality','صحة البيانات'],['/connections','مصادر البيانات'],
  ['/reports/sales','الإيرادات والمبيعات'],['/reports/profitability','الربحية والهامش'],['/reports/receivables','النقد والتحصيل'],
  ['/inventory','المخزون'],['/reports/purchases','المشتريات'],['/reports/inventory','تقرير المخزون'],
  ['/reports/inventory-intelligence','ذكاء المخزون'],['/reports/demand-velocity','الطلب والحركة'],
  ['/intelligence','مركز الذكاء'],['/intelligence/recommendations','التوصيات'],['/intelligence/forecasts','التنبؤات'],
  ['/intelligence/scenarios','السيناريوهات'],['/analytics','التحقيق والتحليل'],['/analytics/rfm','ذكاء العملاء RFM'],
  ['/analytics/abc','اقتصاد الأصناف ABC'],['/analytics/aging','أعمار التعرض'],['/metrics','تفسير المقاييس'],
  ['/reports/executive','القصة التنفيذية'],['/reports','مركز التقارير'],['/customers','العملاء'],
  ['/products','المنتجات'],['/alternative-groups','مجموعات البدائل'],['/decision-experience','قرار اليوم'],
  ['/onboarding','تجهيز الشركة'],['/settings','الإعدادات'],['/settings/profile','ملفي'],['/proposal-demo','عرض العميل'],
] as const;
const roleOptions:{id:WorkspaceRolePreset;label:string}[]=[
  {id:'owner',label:'مالك / مدير'},{id:'finance',label:'مالية'},{id:'sales',label:'مبيعات'},
  {id:'collections',label:'تحصيل'},{id:'inventory',label:'مخزون'},{id:'operations',label:'تشغيل'},
  {id:'analyst',label:'محلل'},{id:'import',label:'مشغل بيانات'},
];
const sectionLabels:Record<WorkspaceSectionId,string>={today:'اليوم',operations:'التشغيل',money:'المال',intelligence:'الذكاء والقرار',reports:'المخرجات',reference:'البيانات المرجعية',admin:'الإدارة'};
const widgetOptions:{id:DashboardWidgetId;label:string}[]=[
  {id:'signals',label:'الإشارات التنفيذية'},{id:'kpis',label:'مؤشرات المال'},{id:'trend',label:'اتجاه المال'},
  {id:'attention',label:'مركز الانتباه'},{id:'decisions',label:'طابور القرار'},{id:'portfolios',label:'محافظ العملاء والمنتجات'},{id:'workpaths',label:'مسارات العمل'},
];

export function CompanySettingsPage() {
  const [company,setCompany]=useState<CompanySettings|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const [workspaceMode,setWorkspaceMode]=useState<WorkspaceMode>(readWorkspaceMode);
  const [preferences,setPreferences]=useState<WorkspacePreferences>(()=>readWorkspacePreferences(null));

  const load=useCallback(async()=>{
    setLoading(true);setError(null);
    try{
      const companyId=await resolveCurrentCompanyId();
      if(!companyId) throw new Error('تعذر تحديد الشركة الحالية بشكل موثوق');
      const {data, error:queryError}=await supabase.from('companies')
        .select('id,name,legal_name,tax_id,currency,timezone,industry,phone,email,address').eq('id',companyId).single();
      if(queryError) throw queryError;
      if(!data) throw new Error('بيانات الشركة الحالية غير متاحة');
      setCompany(data as CompanySettings);
      setPreferences(readWorkspacePreferences(companyId));
    }catch(cause){setCompany(null);setError(cause instanceof Error?cause.message:'تعذر تحميل إعدادات الشركة');}
    finally{setLoading(false);}
  },[]);

  useEffect(()=>{void load();},[load]);

  if(loading)return <LoadingState/>;
  if(error)return <ErrorState message={error} onRetry={load}/>;
  if(!company)return <ErrorState message="بيانات الشركة غير متاحة" onRetry={load}/>;

  const save=(next:WorkspacePreferences)=>{
    setPreferences(next);
    writeWorkspacePreferences(company.id,next);
  };
  const setMode=(mode:WorkspaceMode)=>{
    setWorkspaceMode(mode);window.localStorage.setItem(WORKSPACE_MODE_KEY,mode);
    window.dispatchEvent(new Event('report-advisor:workspace-mode'));
  };
  const togglePath=(path:string)=>{
    const hidden=new Set(preferences.hiddenPaths);
    if(hidden.has(path)) hidden.delete(path); else hidden.add(path);
    const fallback = modules.find(([candidate]) => candidate !== path && !hidden.has(candidate))?.[0] ?? '/';
    save({...preferences,hiddenPaths:[...hidden],defaultLanding:preferences.defaultLanding===path?fallback:preferences.defaultLanding});
  };
  const toggleFavorite=(path:string)=>{
    const favorites=new Set(preferences.favoritePaths);
    if(favorites.has(path))favorites.delete(path);else favorites.add(path);
    save({...preferences,favoritePaths:[...favorites]});
  };
  const setRole=(role:WorkspaceRolePreset)=>save(preferencesForRole(preferences,role));
  const setLanding=(path:string)=>save({...preferences,defaultLanding:path});
  const setWidget=(id:DashboardWidgetId)=>{
    const widgets=new Set(preferences.dashboardWidgets);
    if(widgets.has(id))widgets.delete(id);else widgets.add(id);
    save({...preferences,dashboardWidgets:[...widgets]});
  };
  const shiftSection=(section:WorkspaceSectionId,direction:-1|1)=>save({...preferences,sectionOrder:moveSection(preferences.sectionOrder,section,direction)});
  const reset=()=>{
    const next=resetWorkspacePreferences(company.id);
    setPreferences(next);setMode('essential');
  };
  const field=(value:string|null)=>value?.trim()||'غير متوفر';
  const landingOptions=modules.filter(([path])=>!preferences.hiddenPaths.includes(path)).slice(0,18);

  return (
    <div dir="rtl" className="space-y-6 animate-fade-in">
      <PageHeader title="إعدادات الشركة" subtitle="تهيئة مساحة العمل دون تغيير الصلاحيات أو مصدر الحقيقة" />
      <Card>
        <CardHeader title="هوية مساحة العمل" />
        <CardBody>
          <div className="grid gap-3 lg:grid-cols-[1.1fr_.9fr]">
            <div className="rounded-2xl border border-ink-100 bg-ink-50/60 p-4">
              <div className="flex items-start gap-3"><SlidersHorizontal className="mt-0.5 text-primary-600" size={20}/>
                <div><div className="text-sm font-black text-ink-900">غيّر ما تراه، لا ما يملكه النظام</div>
                  <div className="mt-1 text-xs leading-5 text-ink-500">كل التخصيصات هنا محلية ومسندة للشركة الحالية؛ التفويض والعزل يظلان في backend/RLS.</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <button type="button" aria-pressed={workspaceMode === 'essential'} onClick={() => setMode('essential')} className={workspaceMode === 'essential' ? 'rounded-xl border border-primary-500 bg-primary-50 p-3 text-right' : 'rounded-xl border border-ink-200 bg-white p-3 text-right hover:bg-ink-50'}>
                  <div className="flex items-center justify-between"><span className="text-xs font-black">أساسية</span>{workspaceMode === 'essential' && <Check size={16} className="text-primary-600" />}</div>
                  <div className="mt-1 text-[10px] leading-4 text-ink-500">العمل اليومي فقط</div>
                </button>
                <button type="button" aria-pressed={workspaceMode === 'advanced'} onClick={() => setMode('advanced')} className={workspaceMode === 'advanced' ? 'rounded-xl border border-primary-500 bg-primary-50 p-3 text-right' : 'rounded-xl border border-ink-200 bg-white p-3 text-right hover:bg-ink-50'}>
                  <div className="flex items-center justify-between"><span className="text-xs font-black">متقدمة</span>{workspaceMode === 'advanced' && <Check size={16} className="text-primary-600" />}</div>
                  <div className="mt-1 text-[10px] leading-4 text-ink-500">تضيف التحليل المتخصص</div>
                </button>
                <button type="button" aria-pressed={workspaceMode === 'expert'} onClick={() => setMode('expert')} className={workspaceMode === 'expert' ? 'rounded-xl border border-primary-500 bg-primary-50 p-3 text-right' : 'rounded-xl border border-ink-200 bg-white p-3 text-right hover:bg-ink-50'}>
                  <div className="flex items-center justify-between"><span className="text-xs font-black">خبيرة</span>{workspaceMode === 'expert' && <Check size={16} className="text-primary-600" />}</div>
                  <div className="mt-1 text-[10px] leading-4 text-ink-500">تكشف المساحة كاملة</div>
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-ink-100 bg-white p-4">
              <div className="text-sm font-black text-ink-900">القالب الوظيفي</div>
              <div className="mt-1 text-xs text-ink-500">يضبط نقطة البداية والرؤية المقترحة دون تغيير أدوار Supabase.</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {roleOptions.map(role=><button key={role.id} type="button" aria-pressed={preferences.rolePreset===role.id} onClick={()=>setRole(role.id)} className={preferences.rolePreset===role.id?'rounded-xl border border-primary-500 bg-primary-50 px-3 py-2 text-right text-xs font-bold':'rounded-xl border border-ink-200 px-3 py-2 text-right text-xs font-semibold text-ink-600 hover:bg-ink-50'}>{role.label}</button>)}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="الوحدات والمفضلة" subtitle="أخفِ الضوضاء وثبّت المسارات التي تفتحها يوميًا" />
        <CardBody>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {modules.map(([path,label])=>{const hidden=preferences.hiddenPaths.includes(path);const favorite=preferences.favoritePaths.includes(path);return <div key={path} className={'flex items-center gap-2 rounded-xl border p-3 '+(hidden?'border-ink-100 bg-ink-50':'border-ink-200 bg-white')}>
              <button type="button" aria-pressed={!hidden} aria-label={hidden?'إظهار '+label:'إخفاء '+label} onClick={()=>togglePath(path)} className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">{hidden?<EyeOff size={16}/>:<Eye size={16}/>}</button>
              <button type="button" aria-pressed={favorite} aria-label={(favorite?'إزالة من المفضلة ':'إضافة للمفضلة ')+label} onClick={()=>toggleFavorite(path)} className={'rounded-lg p-1.5 '+(favorite?'text-amber-500':'text-ink-300 hover:text-amber-500')}><Star size={15} fill={favorite?'currentColor':'none'}/></button>
              <span className={'min-w-0 flex-1 truncate text-xs font-bold '+(hidden?'text-ink-400 line-through':'text-ink-800')}>{label}</span>
              <span dir="ltr" className="text-[9px] text-ink-300">{path}</span>
            </div>})}
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="صفحة البداية وترتيب الأقسام" />
          <CardBody>
            <label className="block text-xs font-bold text-ink-700">الهبوط الافتراضي</label>
            <select value={preferences.defaultLanding} onChange={e=>setLanding(e.target.value)} className="mt-2 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none">
              {landingOptions.map(([path,label])=><option key={path} value={path}>{label}</option>)}
            </select>
            <div className="mt-5 space-y-2">
              {preferences.sectionOrder.map((section,index)=><div key={section} className="flex items-center gap-2 rounded-xl border border-ink-100 bg-ink-50/50 px-3 py-2.5">
                <span className="flex-1 text-xs font-bold">{sectionLabels[section]}</span>
                <button type="button" disabled={index===0} onClick={()=>shiftSection(section,-1)} className="rounded-lg p-1.5 text-ink-400 disabled:opacity-25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500" aria-label={'رفع '+sectionLabels[section]}><MoveUp size={15}/></button>
                <button type="button" disabled={index===preferences.sectionOrder.length-1} onClick={()=>shiftSection(section,1)} className="rounded-lg p-1.5 text-ink-400 disabled:opacity-25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500" aria-label={'خفض '+sectionLabels[section]}><MoveDown size={15}/></button>
              </div>)}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="كروت لوحة القيادة" subtitle="تحكم في كثافة الصورة التنفيذية، لا في البيانات نفسها" />
          <CardBody>
            <div className="grid gap-2 sm:grid-cols-2">
              {widgetOptions.map(widget=>{const enabled=preferences.dashboardWidgets.includes(widget.id);return <button key={widget.id} type="button" aria-pressed={enabled} onClick={()=>setWidget(widget.id)} className={enabled?'rounded-xl border border-primary-200 bg-primary-50 p-3 text-right':'rounded-xl border border-ink-200 bg-white p-3 text-right hover:bg-ink-50'}>
                <div className="flex items-center justify-between gap-2"><span className="text-xs font-bold">{widget.label}</span>{enabled?<Check size={15} className="text-primary-600"/>:<EyeOff size={15} className="text-ink-300"/>}</div>
              </button>})}
            </div>
            <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/60 p-3 text-[11px] leading-5 text-amber-900">الإخفاء يغيّر العرض فقط. لا يزيل البيانات ولا يغيّر صلاحية أي مسار.</div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="معلومات الشركة" action={<button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-ink-200 px-3 py-2 text-xs font-bold text-ink-600 hover:bg-ink-50"><RotateCcw size={14}/>إعادة إعدادات مساحة العمل</button>} />
        <CardBody>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div><div className="text-xs text-ink-500">اسم الشركة</div><div className="mt-1 text-sm font-medium text-ink-800">{field(company.name)}</div></div>
            <div><div className="text-xs text-ink-500">الاسم القانوني</div><div className="mt-1 text-sm font-medium text-ink-800">{field(company.legal_name)}</div></div>
            <div><div className="text-xs text-ink-500">السجل الضريبي</div><div className="mt-1 text-sm font-medium text-ink-800">{field(company.tax_id)}</div></div>
            <div><div className="text-xs text-ink-500">العملة</div><div className="mt-1 text-sm font-medium text-ink-800">{field(company.currency)}</div></div>
            <div><div className="text-xs text-ink-500">المنطقة الزمنية</div><div className="mt-1 text-sm font-medium text-ink-800">{field(company.timezone)}</div></div>
            <div><div className="text-xs text-ink-500">القطاع</div><div className="mt-1 text-sm font-medium text-ink-800">{field(company.industry)}</div></div>
            <div><div className="text-xs text-ink-500">الهاتف</div><div className="mt-1 text-sm font-medium text-ink-800">{field(company.phone)}</div></div>
            <div><div className="text-xs text-ink-500">البريد الإلكتروني</div><div className="mt-1 text-sm font-medium text-ink-800">{field(company.email)}</div></div>
            <div className="md:col-span-2"><div className="text-xs text-ink-500">العنوان</div><div className="mt-1 text-sm font-medium text-ink-800">{field(company.address)}</div></div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
