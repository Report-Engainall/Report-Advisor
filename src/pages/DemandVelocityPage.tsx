import { lazy,useEffect,useMemo,useState,Suspense } from 'react';
import { Activity, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { Card,CardHeader,CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader,LoadingState,ErrorState } from '@/components/ui/States';
import type { InvestigationTarget } from '@/components/BusinessInvestigationDrawer';
import { fetchProductDemandSeries, type ProductDemandSeries } from '@/lib/free-toolbox/sales-demand-series';
import { formatNumber } from '@/lib/format';

const BusinessInvestigationDrawer = lazy(async () => ({ default: (await import('@/components/BusinessInvestigationDrawer')).BusinessInvestigationDrawer }));
export function DemandVelocityPage(){
  const [data,setData]=useState<ProductDemandSeries[]>([]);
  const [days,setDays]=useState(180);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const [investigation,setInvestigation]=useState<InvestigationTarget|null>(null);
  const load=async()=>{setLoading(true);setError(null);try{setData(await fetchProductDemandSeries(days))}catch(e:unknown){setError(e instanceof Error?e.message:'تعذر تحميل حركة الطلب')}finally{setLoading(false)}};
  useEffect(()=>{void load()},[days]);
  const summary=useMemo(()=>({items:data.length,units:data.reduce((s,x)=>s+x.totalQuantity,0),accelerating:data.filter(x=>x.trend>.2).length,declining:data.filter(x=>x.trend<-.2).length}),[data]);

  const openInvestigation=(row:ProductDemandSeries)=>{
    const trendLabel=row.trend>.2?'متسارع':row.trend<-.2?'متراجع':'مستقر نسبيًا';
    setInvestigation({
      title:row.name,
      eyebrow:'Demand Lens · سرعة الطلب',
      severity:row.trend<-.2?'warning':row.trend>.2?'opportunity':'info',
      summary:'هذه لقطة تاريخية لحركة الصنف خلال الفترة المختارة. الاتجاه يصف ما حدث في البيانات ولا يثبت سبب التغير أو نتيجة تجارية مستقبلية.',
      facts:[
        {label:'SKU',value:row.sku||'غير متاح'},
        {label:'إجمالي الوحدات',value:formatNumber(row.totalQuantity)},
        {label:'المتوسط اليومي',value:row.averageDaily.toFixed(2)},
        {label:'الذروة اليومية',value:formatNumber(row.peakDaily)},
        {label:'الاتجاه',value:String((row.trend*100).toFixed(1))+'% · '+trendLabel},
        {label:'الفترة',value:'آخر '+String(days)+' يومًا'},
      ],
      confirmedReasons:['المؤشرات معروضة من سلسلة المبيعات التاريخية التي أعادها مسار حركة الطلب الحالي.'],
      missingEvidence:['سبب التسارع أو التراجع.','الأثر المالي المؤكد الناتج عن الاتجاه.','الإجراء الفعلي والنتيجة بعد التنفيذ.'],
      actions:[
        {label:'افتح ذكاء المخزون',path:'/reports/inventory-intelligence',hint:'ضع سرعة الطلب بجانب الرصيد والتغطية عند توفر بيانات الطلب.'},
        {label:'افتح تجربة القرار',path:'/decision-experience?stage=evidence',hint:'راجع الدليل قبل تحويل الإشارة إلى قرار.'},
        {label:'افتح مركز العمل',path:'/work-center',hint:'انتقل للإجراء فقط عندما توجد مهمة قابلة للإثبات.'},
      ],
      evidence:{source:'fetchProductDemandSeries',asOf:'الفترة الحالية',status:'CANONICAL',period:'آخر '+String(days)+' يومًا',formula:'اتجاه مشتق من السلسلة التاريخية للمبيعات.'},
    });
  };

  if(loading)return <LoadingState message="جارٍ تحليل حركة الطلب التاريخية..."/>;
  if(error)return <ErrorState message={error} onRetry={load}/>;
  return <div dir="rtl" className="space-y-5 animate-fade-in">
    <PageHeader title="حركة الطلب وسرعة الأصناف" subtitle="تحليل فعلي للمبيعات التاريخية لاكتشاف التسارع والتراجع والذروة" actions={<button type="button" onClick={load} className="btn-secondary"><RefreshCw size={16}/> تحديث</button>} />
    <div className="filter-toolbar w-fit" role="toolbar" aria-label="الفترة الزمنية">{[30,90,180,365].map(n=><button type="button" key={n} aria-pressed={days===n} onClick={()=>setDays(n)} className={'filter-chip '+(days===n?'filter-chip-active':'hover:bg-white')}>{n} يوم</button>)}</div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Card><CardBody><div className="text-xs text-ink-500">الأصناف ذات الحركة</div><div className="display-number mt-1">{formatNumber(summary.items)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500">إجمالي الوحدات</div><div className="display-number mt-1">{formatNumber(summary.units)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500">طلب متسارع</div><div className="display-number mt-1 text-success-700">{summary.accelerating}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500">طلب متراجع</div><div className="display-number mt-1 text-danger-700">{summary.declining}</div></CardBody></Card></div>
    <Card><CardHeader title="الأصناف الأعلى حركة" subtitle="اضغط على أي صنف لفتح سياق الدليل والتحقيق"/><CardBody><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-right text-xs text-ink-400 border-b"><th className="py-3">الصنف</th><th>SKU</th><th>إجمالي الوحدات</th><th>المتوسط اليومي</th><th>الذروة اليومية</th><th>الاتجاه</th></tr></thead><tbody>{data.slice(0,50).map(x=>{const up=x.trend>.2,down=x.trend<-.2;return <tr key={x.productId} className="border-b border-ink-50"><td className="py-3"><button type="button" onClick={()=>openInvestigation(x)} className="rounded font-medium text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">{x.name}</button></td><td className="text-ink-500">{x.sku||'—'}</td><td>{formatNumber(x.totalQuantity)}</td><td>{x.averageDaily.toFixed(2)}</td><td>{formatNumber(x.peakDaily)}</td><td><Badge variant={up?'success':down?'danger':'neutral'}>{up?<TrendingUp size={13}/>:down?<TrendingDown size={13}/>:<Minus size={13}/>} {String((x.trend*100).toFixed(1))+'%'}</Badge></td></tr>})}</tbody></table>{data.length===0&&<div className="py-10 text-center text-sm text-ink-400"><Activity className="mx-auto mb-2" size={24}/>لا توجد مبيعات ضمن الفترة المحددة</div>}</div></CardBody></Card>
    <Suspense fallback={null}><BusinessInvestigationDrawer target={investigation} onClose={()=>setInvestigation(null)}/></Suspense>
  </div>
}
