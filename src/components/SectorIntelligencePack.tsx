import { Activity, ArrowUpLeft, BadgeCheck, Boxes, Building2, FileClock, FlaskConical, HeartPulse, Landmark, Pill, ShieldCheck, ShoppingBag, Truck, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

type SectorKey='pharmacy'|'distribution'|'retail'|'services'|'general';
type PackItem={title:string;detail:string;status:'ready'|'partial'|'requires-source';path:string;icon:typeof Pill;};
const normalize=(industry:string|null|undefined)=>(industry||'').trim().toLowerCase();
const detectSector=(industry:string|null|undefined):SectorKey=>{
  const v=normalize(industry);
  if(/صيدل|دواء|pharm|medical store|drug/.test(v)) return 'pharmacy';
  if(/توزيع|جملة|wholesale|distribution|distributor/.test(v)) return 'distribution';
  if(/تجزئة|تجارة|retail|store|shop/.test(v)) return 'retail';
  if(/خدمات|service|consult/.test(v)) return 'services';
  return 'general';
};
const sectorMeta:Record<SectorKey,{label:string;mission:string;icon:typeof Pill}>={
  pharmacy:{label:'حزمة الصيدليات والدواء',mission:'تجعل المال والمخزون والتحصيل أساسًا، وتُظهر قدرات الدواء الحساسة فقط عندما يكون مصدرها القانوني متاحًا.',icon:Pill},
  distribution:{label:'حزمة التوزيع والجملة',mission:'تربط المبيعات بالشراء والموردين والطلب ورأس المال المتحرك بدل قراءة كل وحدة منعزلة.',icon:Truck},
  retail:{label:'حزمة التجزئة والتجارة',mission:'تركز على سرعة المبيعات، العملاء، المنتجات، الهامش والسيولة مع مسارات قرار واضحة.',icon:ShoppingBag},
  services:{label:'حزمة الخدمات',mission:'تنقل مركز الثقل إلى الإيراد والتحصيل والربحية والعملاء، مع احترام حدود ما يثبته المصدر.',icon:UsersRound},
  general:{label:'حزمة الأعمال العامة',mission:'تبدأ من المؤشرات الكانونية وتبني فوقها intelligence تدريجيًا دون افتراض قطاع غير مثبت.',icon:Building2},
};
const makePack=(sector:SectorKey):PackItem[]=>{
  const core:PackItem[]=[
    {title:'المال والربحية',detail:'المبيعات والتكلفة والربح والهامش من المسار الكانوني.',status:'ready',path:'/reports/profitability',icon:Landmark},
    {title:'التحصيل والسيولة',detail:'الذمم والأعمار ومتابعة الضغط النقدي من البيانات المصدرية.',status:'ready',path:'/reports/receivables',icon:Activity},
    {title:'المخزون ورأس المال',detail:'قيمة المخزون والحركة وذكاء المخزون عندما تتوفر مدخلاته.',status:'ready',path:'/reports/inventory-intelligence',icon:Boxes},
  ];
  if(sector==='pharmacy') return [...core,
    {title:'Batch / Expiry / FEFO',detail:'هذه طبقة دوائية متخصصة؛ تبقى «تحتاج مصدرًا» حتى تكون الدفعة وتاريخ الصلاحية وقاعدة FEFO جزءًا من المصدر الكانوني.',status:'requires-source',path:'/import/analyze',icon:FileClock},
    {title:'الوصفات والصرف',detail:'لا تُعرض كقدرة جاهزة دون مصدر prescription/dispense موثق؛ يمكن إدخال هذا المصدر عبر المسار القانوني.',status:'requires-source',path:'/import/analyze',icon:HeartPulse},
    {title:'مخاطر التوريد',detail:'تحليل المورد والطلب وإعادة الشراء متاح كطبقة intelligence عند اكتمال تاريخ الاستهلاك والتوريد.',status:'partial',path:'/intelligence',icon:ShieldCheck},
  ];
  if(sector==='distribution') return [...core,
    {title:'الموردون والشراء',detail:'ابدأ من المشتريات وسياق المورد، ثم اربط ذلك بالطلب ورأس المال.',status:'partial',path:'/reports/purchases',icon:Truck},
    {title:'الطلب وإعادة التوريد',detail:'طبقة قرار كمية الطلب والتغطية تعتمد على مدخلات الطلب والزمن والمورد.',status:'partial',path:'/reports/inventory-intelligence',icon:Activity},
  ];
  if(sector==='retail') return [...core,
    {title:'محفظة العملاء',detail:'ركز على التركّز والزخم والقيمة وسياق التحصيل.',status:'ready',path:'/customers',icon:UsersRound},
    {title:'محفظة المنتجات',detail:'اربط المبيعات والهامش والمخزون بدخول واحد للتحقيق.',status:'ready',path:'/products',icon:ShoppingBag},
  ];
  if(sector==='services') return [...core,
    {title:'قيمة العميل والتحصيل',detail:'اجعل الذمم والعميل ومسار المتابعة في مساحة واحدة.',status:'ready',path:'/customers',icon:UsersRound},
    {title:'تحليل المزيج',detail:'ابحث عن مصادر الربحية والتغير قبل إصدار حكم على الأداء.',status:'ready',path:'/analytics',icon:FlaskConical},
  ];
  return [...core,
    {title:'العملاء والمنتجات',detail:'مساحات الكيانات تبقى مدخلًا للقرار وليست مجرد CRUD.',status:'ready',path:'/customers',icon:UsersRound},
    {title:'مركز الذكاء',detail:'التوصيات والتنبيهات والتنبؤات مع حدود الثقة والدليل.',status:'ready',path:'/intelligence',icon:ShieldCheck},
  ];
};
const statusLabel=(status:PackItem['status'])=>status==='ready'?'مسار متاح':status==='partial'?'يعتمد على اكتمال البيانات':'يتطلب مصدرًا متخصصًا';
const statusVariant=(status:PackItem['status']):'success'|'warning'|'neutral'=>status==='ready'?'success':status==='partial'?'warning':'neutral';

export function SectorIntelligencePack({industry}:{industry:string|null|undefined}){
  const sector=detectSector(industry); const meta=sectorMeta[sector]; const Icon=meta.icon; const items=makePack(sector);
  return <Card className="overflow-hidden">
    <CardHeader title="حزمة الذكاء القطاعية" subtitle={meta.mission} action={<Icon size={20} className="text-primary-600"/>}/>
    <CardBody>
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-primary-100 bg-primary-50/60 p-4"><Badge variant="primary">{meta.label}</Badge><span className="text-[11px] text-primary-900">القطاع المصدر: {industry?.trim()||'غير محدد'}</span></div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map(item=>{const ItemIcon=item.icon;return <article key={item.title} className="rounded-2xl border border-ink-200 bg-white p-4"><div className="flex items-start gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink-50 text-ink-700"><ItemIcon size={17}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-black text-ink-900">{item.title}</h3><Badge variant={statusVariant(item.status)}>{statusLabel(item.status)}</Badge></div><p className="mt-1 text-xs leading-5 text-ink-500">{item.detail}</p></div></div><Link to={item.path} className="mt-3 inline-flex items-center gap-1 text-[11px] font-black text-primary-700 hover:underline">فتح المسار <ArrowUpLeft size={13}/></Link></article>})}
      </div>
      <div className="mt-4 flex items-start gap-2 rounded-xl border border-ink-100 bg-ink-50/60 p-3 text-[10px] leading-5 text-ink-500"><BadgeCheck size={15} className="shrink-0 text-success-600"/><span>الحالة «يتطلب مصدرًا متخصصًا» مقصودة: لا نعرض batch/expiry/FEFO أو الوصفات كقدرة موثقة قبل وجود evidence canonical لها.</span></div>
    </CardBody>
  </Card>;
}
