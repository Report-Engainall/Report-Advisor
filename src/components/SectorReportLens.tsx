import { BadgeCheck, Boxes, ClipboardCheck, FileClock, HeartPulse, ShieldCheck, Truck, UsersRound } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { DashboardKPIs } from '@/lib/dashboard-canonical';

type LensStatus='ready'|'partial'|'requires-source';
type LensItem={title:string;detail:string;status:LensStatus;icon:typeof Boxes;};
const normalize=(value:string|null|undefined)=>(value||'').trim().toLowerCase();
const sectorOf=(industry:string|null|undefined)=>{const v=normalize(industry);if(/صيدل|دواء|pharm|drug|medical store/.test(v))return'pharmacy';if(/توزيع|جملة|wholesale|distribution|distributor/.test(v))return'distribution';if(/تجزئة|تجارة|retail|store|shop/.test(v))return'retail';if(/خدمات|service|consult/.test(v))return'services';return'general';};
const statusLabel=(status:LensStatus)=>status==='ready'?'متاح الآن':status==='partial'?'يتوسع مع اكتمال المصدر':'يتطلب مصدرًا متخصصًا';
const statusVariant=(status:LensStatus):'success'|'warning'|'neutral'=>status==='ready'?'success':status==='partial'?'warning':'neutral';
function itemsFor(sector:string,kpis:DashboardKPIs|null):LensItem[]{
  const money:LensItem={title:'المال والمخزون',detail:kpis?.inventoryValue==null?'قيمة المخزون غير متاحة في اللقطة الحالية':'قيمة المخزون مربوطة بالتقرير التنفيذي الكانوني.',status:kpis?.inventoryValue==null?'partial':'ready',icon:Boxes};
  if(sector==='pharmacy')return[
    money,
    {title:'Batch / Expiry / FEFO',detail:'لا يظهر رقم دوائي مصطنع؛ هذه الطبقة تحتاج سجل دفعات وتواريخ صلاحية وقاعدة صرف FEFO من المصدر.',status:'requires-source',icon:FileClock},
    {title:'الوصفات والصرف',detail:'تحتاج بيانات prescription/dispense موثقة قبل إصدار معدل صرف أو تحليل علاجي.',status:'requires-source',icon:HeartPulse},
    {title:'الجودة والاستدعاء',detail:'يمكن ربط تقارير الجودة والاستدعاء عند وجود lot/recall evidence موثق.',status:'requires-source',icon:ClipboardCheck},
    {title:'التوريد وإعادة الطلب',detail:'الطلب والتوريد يمكن رفعهما إلى قرار عندما تكتمل سلسلة الاستهلاك والموردين.',status:'partial',icon:Truck},
  ];
  if(sector==='distribution')return[
    money,
    {title:'الموردون والشراء',detail:'تقرير المشتريات ومسار المورد متاحان من المسارات الحالية، ويحتاجان ربطًا تشغيليًا أعمق للمورد.',status:'partial',icon:Truck},
    {title:'التغطية وإعادة التوريد',detail:'القرار يتطلب سلسلة طلب/استهلاك وتوريد كافية قبل كمية إعادة طلب.',status:'partial',icon:Boxes},
    {title:'العملاء والتحصيل',detail:'ربط العميل بالمبيعات والتحصيل هو مركز متابعة أساسي.',status:'ready',icon:UsersRound},
  ];
  if(sector==='retail')return[
    money,
    {title:'زخم المبيعات',detail:'الرادار التجاري والتقرير التنفيذي يعرضان تغير الحركة عندما توجد سلسلة شهرية.',status:'ready',icon:Boxes},
    {title:'تركيز العملاء',detail:'أعلى العملاء المرئيين يمكن وضعهم داخل سياق المبيعات والتحصيل.',status:'ready',icon:UsersRound},
    {title:'تركيز المنتجات',detail:'أعلى المنتجات المرئية تتحول إلى نقطة تحقيق قبل قرار المخزون أو التسعير.',status:'ready',icon:ShieldCheck},
  ];
  if(sector==='services')return[
    {title:'الإيراد والربحية',detail:'مسار الربحية التنفيذي هو نقطة البداية.',status:'ready',icon:ShieldCheck},
    {title:'التحصيل والعملاء',detail:'الذمم والعملاء ومسار المتابعة مرتبطون بالتقرير التنفيذي.',status:'ready',icon:UsersRound},
    {title:'مخرجات قطاعية',detail:'أي مؤشرات تشغيلية خاصة بالخدمة تحتاج مصدرًا متخصصًا قبل إظهارها.',status:'requires-source',icon:ClipboardCheck},
  ];
  return[
    money,
    {title:'الرادار التجاري',detail:'يكتشف ضغط التحصيل والتركيز والزخم وفرص الهامش من المصدر الكانوني.',status:'ready',icon:ShieldCheck},
    {title:'مركز القرار',detail:'التنبيهات والتوصيات تنتقل إلى التحقيق قبل التنفيذ.',status:'ready',icon:ClipboardCheck},
  ];
}
export function SectorReportLens({industry,kpis}:{industry:string|null|undefined;kpis:DashboardKPIs|null}){
  const sector=sectorOf(industry);
  const title=sector==='pharmacy'?'عدسة تقرير الصيدلية':sector==='distribution'?'عدسة تقرير التوزيع والجملة':sector==='retail'?'عدسة تقرير التجارة والتجزئة':sector==='services'?'عدسة تقرير الخدمات':'عدسة تقرير الأعمال';
  const items=itemsFor(sector,kpis);
  return <Card className="overflow-hidden print:break-inside-avoid"><CardHeader title={title} subtitle="تكييف التقرير بحسب القطاع، مع فصل ما هو مثبت عما يحتاج مصدرًا متخصصًا." action={<ShieldCheck size={19} className="text-primary-600"/>}/><CardBody>
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-primary-100 bg-primary-50/60 p-3"><Badge variant="primary">{industry?.trim()||'قطاع غير محدد'}</Badge><span className="text-[10px] text-primary-900">هذه العدسة تغير المخرجات، لا الحقيقة المصدرية.</span></div>
    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{items.map(item=>{const Icon=item.icon;return <article key={item.title} className="rounded-2xl border border-ink-200 bg-white p-4"><div className="flex items-start gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink-50 text-ink-700"><Icon size={16}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-black text-ink-900">{item.title}</h3><Badge variant={statusVariant(item.status)}>{statusLabel(item.status)}</Badge></div><p className="mt-1 text-[11px] leading-5 text-ink-500">{item.detail}</p></div></div></article>})}</div>
    <div className="mt-4 flex items-start gap-2 rounded-xl border border-ink-100 bg-ink-50/70 p-3 text-[10px] leading-5 text-ink-500"><BadgeCheck size={15} className="shrink-0 text-success-600"/><span>في الصيدليات تحديدًا، لا تتحول غياب بيانات الدفعات أو الصلاحية أو الصرف إلى «صفر» ولا إلى تنبيه مصطنع.</span></div>
  </CardBody></Card>;
}
