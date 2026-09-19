import type { DashboardKPIs, MonthlyTrend, TopEntity, CategoryBreakdown, AgingDashboard } from '@/lib/dashboard-canonical';

export type CommercialSignalKind = 'cash' | 'concentration' | 'momentum' | 'margin' | 'inventory';
export interface CommercialOpportunityInput {
  kpis: DashboardKPIs; trend: MonthlyTrend[]; topCustomers: TopEntity[]; topProducts: TopEntity[];
  categories: CategoryBreakdown[]; aging: AgingDashboard; months: number;
}
export interface CommercialSignal {
  id:string; kind:CommercialSignalKind; priority:1|2|3|4|5; title:string; detail:string;
  metricLabel:string; metricValue:string; source:string; actionLabel:string; actionPath:string; evidence:string[];
}
const pct=(value:number)=>value.toFixed(1)+'%';
const finite=(value:number|null): value is number=>value!=null&&Number.isFinite(value);

export function buildCommercialOpportunityRadar(input:CommercialOpportunityInput):CommercialSignal[]{
  const out:CommercialSignal[]=[]; const {kpis,trend,topCustomers,topProducts,categories,months}=input;
  if(finite(kpis.totalReceivables)&&finite(kpis.overdueReceivables)&&kpis.totalReceivables>0&&kpis.overdueReceivables>0){
    const rate=kpis.overdueReceivables/kpis.totalReceivables*100;
    out.push({id:'collection-pressure',kind:'cash',priority:rate>=50?5:rate>=25?4:3,title:'التحصيل يستحق أن يدخل غرفة القيادة',detail:'جزء من الذمم الحالية متأخر؛ افتح التحصيل بدل قراءة المبيعات بمعزل عن النقد.',metricLabel:'نسبة المتأخر من الذمم',metricValue:pct(rate),source:'get_dashboard_snapshot → aging',actionLabel:'فتح التحصيل',actionPath:'/reports/receivables',evidence:['إجمالي الذمم = '+kpis.totalReceivables,'الذمم المتأخرة = '+kpis.overdueReceivables]});
  }
  if(finite(kpis.totalSales)&&kpis.totalSales>0&&topCustomers[0]?.value>0){
    const share=topCustomers[0].value/kpis.totalSales*100;
    if(share>=20) out.push({id:'customer-concentration',kind:'concentration',priority:share>=40?5:4,title:'الإيراد يملك نقطة تركّز تستحق التحقيق',detail:'أكبر عميل يمثل حصة ملحوظة من المبيعات المرئية؛ راجع الاعتماد والعلاقة والتحصيل قبل توسعة هذا المسار.',metricLabel:'حصة أكبر عميل',metricValue:pct(share),source:'get_dashboard_snapshot → topCustomers',actionLabel:'فتح العملاء',actionPath:'/customers',evidence:['أعلى عميل = '+topCustomers[0].name,'قيمة العميل = '+topCustomers[0].value,'مبيعات الفترة = '+kpis.totalSales]});
  }
  if(finite(kpis.totalSales)&&kpis.totalSales>0&&topProducts[0]?.value>0){
    const share=topProducts[0].value/kpis.totalSales*100;
    if(share>=15) out.push({id:'product-concentration',kind:'concentration',priority:share>=35?5:3,title:'صنف واحد يحمل جزءًا مهمًا من الحركة',detail:'استخدم هذه الإشارة لمراجعة التوريد والتسعير والبدائل؛ التركّز ليس حكمًا سلبيًا بحد ذاته.',metricLabel:'حصة أكبر منتج',metricValue:pct(share),source:'get_dashboard_snapshot → topProducts',actionLabel:'فتح المنتجات',actionPath:'/products',evidence:['أعلى منتج = '+topProducts[0].name,'قيمة المنتج = '+topProducts[0].value,'مبيعات الفترة = '+kpis.totalSales]});
  }
  const knownTrend=trend.filter(row=>finite(row.sales));
  if(knownTrend.length>=2){
    const first=knownTrend[0].sales as number,last=knownTrend.at(-1)?.sales as number;
    if(first>0){const delta=(last-first)/first*100;if(Math.abs(delta)>=10) out.push({id:'sales-momentum',kind:'momentum',priority:Math.abs(delta)>=25?5:4,title:delta>0?'المبيعات في موجة صعود واضحة':'المبيعات في موجة هبوط واضحة',detail:delta>0?'هذه إشارة لفتح تحليل ما الذي يقود النمو قبل أن يتحول إلى قرار شراء أو توسع.':'هذه إشارة لفتح التحليل ومعرفة أين انكمشت الحركة قبل تخفيضات أو إعادة توزيع.',metricLabel:'تغير أول → آخر شهر',metricValue:(delta>=0?'+':'')+pct(delta),source:'get_dashboard_snapshot → trend',actionLabel:'فتح التحليل',actionPath:'/analytics',evidence:['أول قيمة متاحة = '+first,'آخر قيمة متاحة = '+last,'نطاق العرض = '+months+' أشهر']});}
  }
  const marginCategory=categories.filter(row=>row.sales>0&&Number.isFinite(row.profit)).map(row=>({...row,margin:row.profit/row.sales*100})).sort((a,b)=>b.margin-a.margin)[0];
  if(marginCategory&&finite(kpis.grossMargin)){const gap=marginCategory.margin-kpis.grossMargin;if(gap>=5) out.push({id:'margin-opportunity',kind:'margin',priority:gap>=15?5:4,title:'هناك فئة تتفوق على هامش الشركة',detail:'افتح الربحية لمعرفة ما إذا كان المزيج أو التسعير أو تكلفة هذه الفئة يستحق التوسعة.',metricLabel:'فارق الهامش عن الشركة',metricValue:'+'+pct(gap),source:'get_dashboard_snapshot → categories',actionLabel:'فتح الربحية',actionPath:'/reports/profitability',evidence:['الفئة = '+(marginCategory.name||'غير مسماة'),'هامش الفئة = '+pct(marginCategory.margin),'هامش الشركة = '+pct(kpis.grossMargin)]});}
  if(finite(kpis.inventoryValue)&&finite(kpis.totalSales)&&kpis.totalSales>0){const ratio=kpis.inventoryValue/kpis.totalSales*100;if(ratio>=40) out.push({id:'inventory-capital',kind:'inventory',priority:ratio>=100?5:4,title:'رأس المال المخزون يستحق الفحص مقابل حركة الفترة',detail:'ليست إشارة بيع أو شراء آلية؛ إنها نقطة دخول لفحص سرعة الحركة والتغطية والأصناف البطيئة.',metricLabel:'المخزون / مبيعات الفترة',metricValue:pct(ratio),source:'get_dashboard_snapshot → inventoryValue',actionLabel:'فتح ذكاء المخزون',actionPath:'/reports/inventory-intelligence',evidence:['قيمة المخزون = '+kpis.inventoryValue,'مبيعات الفترة = '+kpis.totalSales,'النسبة محسوبة من القيم المصدرية']});}
  return out.sort((a,b)=>b.priority-a.priority).slice(0,6);
}
