import { useEffect,useState,useCallback } from 'react';
import { DollarSign,ShoppingCart,TrendingUp,Users,Package,Brain,ArrowLeftRight,Wallet,Receipt,RefreshCw,CalendarRange,CheckCircle2,ArrowUpLeft,Database,FileSearch,BarChart3, Sparkles } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { Card,CardHeader,CardBody } from '@/components/ui/Card';
import { Badge,SeverityBadge,PriorityBadge } from '@/components/ui/Badge';
import { LoadingState,ErrorState } from '@/components/ui/States';
import { TrendChart,CategoryPieChart,HorizontalBarChart } from '@/components/ui/Charts';
import { fetchDashboardSnapshot,fetchDashboardIntelligence } from '@/lib/dashboard-canonical';
import { formatCurrency,relativeTime } from '@/lib/format';
import type { Recommendation,Alert } from '@/lib/types';
import type { DashboardKPIs,MonthlyTrend,TopEntity,CategoryBreakdown,AgingDashboard } from '@/lib/dashboard-canonical';
import { Link } from 'react-router-dom';

const TREND_RANGES=[{value:3,label:'3 أشهر'},{value:6,label:'6 أشهر'},{value:12,label:'12 شهرًا'}] as const;
const metricStatus=(value:number|null):'CONFIRMED'|'INSUFFICIENT_DATA'=>value===null?'INSUFFICIENT_DATA':'CONFIRMED';

const QUICK_ACTIONS=[
 {path:'/import',label:'استيراد البيانات',description:'أدخل ملفًا جديدًا وابدأ دورة التحقق',icon:ArrowLeftRight},
 {path:'/reports',label:'مركز التقارير',description:'حوّل البيانات إلى مخرجات تنفيذية',icon:Receipt},
 {path:'/analytics',label:'التحليلات',description:'اكتشف الاتجاهات والشرائح المهمة',icon:BarChart3},
 {path:'/intelligence',label:'الذكاء والقرار',description:'راجع التوصيات والتنبؤات',icon:Brain},
 {path:'/customers',label:'العملاء',description:'راجع القيمة والتحصيل والنشاط',icon:Users},
 {path:'/inventory',label:'المخزون',description:'راقب القيمة والحركة والطلب',icon:Package},
] as const;

export function DashboardPage(){
 const [kpis,setKpis]=useState<DashboardKPIs|null>(null),[trend,setTrend]=useState<MonthlyTrend[]>([]),[topCustomers,setTopCustomers]=useState<TopEntity[]>([]),[topProducts,setTopProducts]=useState<TopEntity[]>([]),[categories,setCategories]=useState<CategoryBreakdown[]>([]),[recommendations,setRecommendations]=useState<Recommendation[]>([]),[alerts,setAlerts]=useState<Alert[]>([]),[aging,setAging]=useState<AgingDashboard|null>(null),[trendMonths,setTrendMonths]=useState(6),[loading,setLoading]=useState(true),[refreshing,setRefreshing]=useState(false),[error,setError]=useState<string|null>(null);
 const load=useCallback(async(silent=false)=>{try{if(silent)setRefreshing(true);else setLoading(true);setError(null);const [{kpis:k,trend:t,topCustomers:tc,topProducts:tp,categories:cat,aging:ag},intelligence]=await Promise.all([fetchDashboardSnapshot(trendMonths),fetchDashboardIntelligence()]);setKpis(k);setTrend(t);setTopCustomers(tc.slice(0,5));setTopProducts(tp.slice(0,5));setCategories(cat);setAging(ag);setRecommendations(intelligence.recommendations);setAlerts(intelligence.alerts);}catch(e:unknown){setError(e instanceof Error?e.message:'فشل تحميل البيانات');}finally{setLoading(false);setRefreshing(false);}},[trendMonths]);
 useEffect(()=>{void load();},[load]);
 if(loading)return <LoadingState message="جارٍ تحميل لوحة القيادة..."/>;
 if(error)return <ErrorState message={error} onRetry={()=>void load()}/>;
 if(!kpis||!aging)return null;
 const categoryDisplay=categories.map(c=>({...c,name:c.categoryStatus==='UNKNOWN'?'UNKNOWN':c.name??'UNKNOWN'}));
 const dataStatusLabel=kpis.status==='INSUFFICIENT_DATA'?'بعض المؤشرات تحتاج بيانات مكتملة':'بيانات محسوبة من المصدر';
 const activeRecommendations=recommendations.filter(r=>r.status==='new'||r.status==='accepted').slice(0,4);
 const activeAlerts=alerts.slice(0,4);
 const confirmedMetrics=[kpis.totalSales,kpis.grossProfit,kpis.totalReceivables,kpis.inventoryValue,kpis.totalCustomers,kpis.totalProducts,kpis.invoiceCount,kpis.collectionRate].filter(v=>v!==null).length;
 const metricCoverage=Math.round((confirmedMetrics/8)*100);
 return <div className="space-y-6 animate-fade-in">
  <section className="relative overflow-hidden rounded-3xl border border-primary-100 bg-gradient-to-br from-white via-primary-50/70 to-accent-50/60 p-5 shadow-card lg:p-7">
   <div className="absolute -left-16 -top-20 h-48 w-48 rounded-full bg-primary-200/20 blur-3xl" aria-hidden="true"/>
   <div className="absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-accent-200/20 blur-3xl" aria-hidden="true"/>
   <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
    <div className="max-w-3xl">
     <div className="mb-3 flex flex-wrap items-center gap-2"><Badge variant="primary"><Sparkles size={13}/> مركز التحكم</Badge><span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-ink-600 ring-1 ring-inset ring-ink-100"><Database size={12}/>{dataStatusLabel}</span></div>
     <h1 className="text-2xl font-black tracking-tight text-ink-950 sm:text-3xl lg:text-4xl">قرارك التجاري يبدأ من هنا</h1>
     <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-600 lg:text-base">لوحة واحدة تجمع الأداء، العملاء، المخزون، الذمم، التقارير والذكاء التنفيذي — مع الحفاظ على حقيقة البيانات بدل اختراع أرقام ناقصة.</p>
     <div className="mt-5 flex flex-wrap gap-2.5"><Link to="/command-center" className="btn-primary"><Brain size={16}/> مركز القيادة</Link><Link to="/reports/executive" className="btn-secondary"><FileSearch size={16}/> التقرير التنفيذي</Link></div>
    </div>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:min-w-[360px]">
     <div className="rounded-2xl border border-white/80 bg-white/75 p-3 backdrop-blur"><div className="text-[11px] text-ink-400">تغطية المؤشرات</div><div className="mt-1 text-xl font-black text-ink-900">{metricCoverage}%</div><div className="mt-1 text-[10px] text-ink-500">من 8 مؤشرات رئيسية</div></div>
     <div className="rounded-2xl border border-white/80 bg-white/75 p-3 backdrop-blur"><div className="text-[11px] text-ink-400">تنبيهات نشطة</div><div className="mt-1 text-xl font-black text-ink-900">{alerts.length}</div><div className="mt-1 text-[10px] text-ink-500">مركز الانتباه</div></div>
     <div className="rounded-2xl border border-white/80 bg-white/75 p-3 backdrop-blur"><div className="text-[11px] text-ink-400">توصيات</div><div className="mt-1 text-xl font-black text-ink-900">{activeRecommendations.length}</div><div className="mt-1 text-[10px] text-ink-500">قابلة للمراجعة الآن</div></div>
    </div>
   </div>
  </section>

  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
   <div><h2 className="text-lg font-bold text-ink-900">المؤشرات الأساسية</h2><p className="mt-0.5 text-xs text-ink-400">لقطة سريعة على صحة النشاط التجاري</p></div>
   <div className="flex flex-wrap items-center gap-2"><div className="flex items-center gap-1 rounded-xl border border-ink-200 bg-white p-1" aria-label="الفترة الزمنية للرسم"><CalendarRange size={16} className="mx-2 text-ink-400"/>{TREND_RANGES.map(r=><button key={r.value} type="button" onClick={()=>setTrendMonths(r.value)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${trendMonths===r.value?'bg-primary-600 text-white shadow-sm':'text-ink-500 hover:bg-ink-50'}`} aria-pressed={trendMonths===r.value}>{r.label}</button>)}</div><button type="button" onClick={()=>void load(true)} disabled={refreshing} className="btn-secondary"><RefreshCw size={16}/><span className="hidden sm:inline">تحديث</span></button></div>
  </div>
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4"><KPICard label="إجمالي المبيعات" value={kpis.totalSales} format="currency" icon={<DollarSign size={16}/>} status={metricStatus(kpis.totalSales)}/><KPICard label="إجمالي الربح" value={kpis.grossProfit} format="currency" icon={<TrendingUp size={16}/>} status={metricStatus(kpis.grossProfit)} hint={kpis.grossMargin===null?undefined:`هامش: ${kpis.grossMargin.toFixed(1)}%`}/><KPICard label="الذمم المدينة" value={kpis.totalReceivables} format="currency" icon={<Receipt size={16}/>} status={metricStatus(kpis.totalReceivables)}/><KPICard label="قيمة المخزون" value={kpis.inventoryValue} format="currency" icon={<Package size={16}/>} status={metricStatus(kpis.inventoryValue)}/><KPICard label="عدد العملاء" value={kpis.totalCustomers} format="number" icon={<Users size={16}/>} status={metricStatus(kpis.totalCustomers)}/><KPICard label="عدد المنتجات" value={kpis.totalProducts} format="number" icon={<Package size={16}/>} status={metricStatus(kpis.totalProducts)}/><KPICard label="عدد الفواتير" value={kpis.invoiceCount} format="number" icon={<ShoppingCart size={16}/>} status={metricStatus(kpis.invoiceCount)}/><KPICard label="معدل التحصيل" value={kpis.collectionRate} format="percent" icon={<Wallet size={16}/>} status={metricStatus(kpis.collectionRate)}/></div>

  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><Card className="lg:col-span-2"><CardHeader title="اتجاه المبيعات والربح" subtitle={`آخر ${trendMonths} أشهر`} action={<Badge variant="primary">تفاعلي</Badge>}/><CardBody>{trend.some(x=>x.status==='CALCULATED')?<TrendChart data={trend}/>:<p className="py-12 text-center text-sm text-ink-400">لا توجد بيانات اتجاه قابلة للحساب</p>}</CardBody></Card><Card><CardHeader title="توزيع المبيعات حسب الفئة" subtitle="الحقيقة المصنفة من الخادم"/><CardBody>{categoryDisplay.length?<CategoryPieChart data={categoryDisplay}/>:<p className="py-12 text-center text-sm text-ink-400">لا توجد بيانات فئات</p>}</CardBody></Card></div>

  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><Card><CardHeader title="مركز الانتباه" subtitle="الأحداث التي تستحق المراجعة الآن"/><CardBody><div className="space-y-3">{activeAlerts.map(a=><div key={a.id} className="group flex items-start gap-3 rounded-xl border border-transparent bg-ink-50/60 p-3 transition hover:border-ink-100 hover:bg-white"><div><SeverityBadge severity={a.severity}/></div><div className="min-w-0 flex-1"><span className="text-sm font-medium text-ink-800">{a.title}</span>{a.description&&<p className="mt-0.5 truncate text-xs text-ink-500">{a.description}</p>}</div><span className="whitespace-nowrap text-[11px] text-ink-400">{relativeTime(a.created_at)}</span></div>)}{activeAlerts.length===0&&<p className="py-6 text-center text-sm text-ink-400">لا توجد تنبيهات</p>}</div></CardBody></Card><Card><CardHeader title="التوصيات النشطة" subtitle="فرص وإجراءات مقترحة من محرك الذكاء"/><CardBody><div className="space-y-3">{activeRecommendations.map(r=><div key={r.id} className="flex items-start gap-3 rounded-xl border border-transparent bg-ink-50/60 p-3 transition hover:border-ink-100 hover:bg-white"><div className="mt-0.5 rounded-lg bg-primary-50 p-2 text-primary-600"><Brain size={15}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-medium text-ink-800">{r.title}</span><PriorityBadge priority={r.priority}/></div>{r.description&&<p className="mt-1 text-xs leading-5 text-ink-500">{r.description}</p>}</div><ArrowUpLeft size={15} className="text-ink-300"/></div>)}{activeRecommendations.length===0&&<p className="py-6 text-center text-sm text-ink-400">لا توجد توصيات نشطة</p>}</div></CardBody></Card></div>

  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><Card><CardHeader title="أفضل العملاء"/><CardBody>{topCustomers.length?<HorizontalBarChart data={topCustomers} dataKey="value" nameKey="name" height={220}/>:<p className="py-12 text-center text-sm text-ink-400">لا توجد بيانات عملاء قابلة للترتيب</p>}</CardBody></Card><Card><CardHeader title="أفضل المنتجات"/><CardBody>{topProducts.length?<HorizontalBarChart data={topProducts} dataKey="value" nameKey="name" height={220}/>:<p className="py-12 text-center text-sm text-ink-400">لا توجد بيانات منتجات قابلة للترتيب</p>}</CardBody></Card><Card><CardHeader title="تحليل أعمار الذمم" subtitle={aging.status==='CALCULATED'&&aging.totalAmount!==null?`الإجمالي: ${formatCurrency(aging.totalAmount)}`:aging.status==='NO_DATA'?'لا توجد بيانات ذمم':'بيانات غير كافية'} /><CardBody><div className="space-y-3">{aging.rows.map(b=><div key={b.bucket} className="flex items-center justify-between border-b border-ink-100 py-2"><span className="text-xs font-medium text-ink-600">{b.bucket}</span><span className="text-xs text-ink-500">{b.amount===null?'UNKNOWN':formatCurrency(b.amount)} · {b.count} فاتورة</span></div>)}{aging.unknownRows>0&&<p className="text-xs text-ink-400">UNKNOWN: {aging.unknownRows} فاتورة بلا تاريخ استحقاق</p>}</div></CardBody></Card></div>

  <section><div className="mb-3 flex items-end justify-between"><div><h2 className="text-lg font-bold text-ink-900">ماذا تريد أن تنجز؟</h2><p className="mt-0.5 text-xs text-ink-400">الوصول المباشر إلى أهم مسارات العمل</p></div></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{QUICK_ACTIONS.map(({path,label,description,icon:Icon})=><Link key={path} to={path} className="card card-hover group flex items-center gap-4 p-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white"><Icon size={20}/></div><div className="min-w-0 flex-1"><div className="font-semibold text-ink-800">{label}</div><p className="mt-0.5 text-xs leading-5 text-ink-400">{description}</p></div><ArrowUpLeft size={17} className="text-ink-300 transition group-hover:-translate-x-0.5 group-hover:text-primary-500"/></Link>)}</div></section>
 </div>;
}
