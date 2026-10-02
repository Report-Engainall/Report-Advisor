import { resolveLegacyReportType } from './archetype-registry.ts';
import type { ReportSignal } from './report-smart-insights.ts';

export type AdvisorQuestionStatus = 'ANSWERED'|'NOT_AVAILABLE'|'INSUFFICIENT_SAMPLE'|'REVIEW_REQUIRED'|'BLOCKED';
export type AdvisorQuestionId = 'WHAT'|'WHERE'|'WHO_CONTRIBUTED'|'WHY'|'SO_WHAT'|'WHAT_NEXT'|'PROOF'|'AFTER_ACTION';
export type AdvisorFinding = {
  title: string; statement: string; value: number|null; period: string|null; dimension: string|null;
  evidence: string[]; sampleSize: number; contribution: number|null; limitations: string[];
};
export type AdvisorQuestion = {
  id: AdvisorQuestionId; status: AdvisorQuestionStatus; question: string; answer: string;
  numbers: string[]; fields: string[]; sampleSize: number; evidence: string[]; limitations: string[];
  nextQuestionId: AdvisorQuestionId|null;
};
export type AdvisorRecommendation = {
  problem: string; evidence: string[]; whyNow: string; action: string; owner: string;
  expectedOutcome: string; measurement: string; risksBlockers: string[]; limitations: string[];
};
export type AdvisorBrief = {
  archetypeId: string; profileVersion: string; health: { status: string; rationale: string };
  topFindings: AdvisorFinding[]; topRisk: AdvisorFinding|null; topOpportunity: AdvisorFinding|null;
  why: AdvisorQuestion; soWhat: string; recommendedAction: AdvisorRecommendation|null;
  owner: string|null; expectedOutcome: string|null; proofState: 'VERIFIED'|'REVIEW_REQUIRED'|'INSUFFICIENT_SAMPLE'|'BLOCKED';
  questions: AdvisorQuestion[]; lineage: { jobId:string; sourceHash:string; evidenceSnapshotId:string|null };
};

type Input = {
  jobId:string; sourceHash:string; evidenceSnapshotId:string|null; specialty:string|null;
  rowCount:number|null; sourceAnalysis?:{datasets?:unknown[]}|null;
  canonicalRows:Array<{row_number?:number; data:Record<string,unknown>}>;
  existingSignals?:ReportSignal[];
};
type Column = Record<string,unknown>;

function t(v:unknown){ return String(v??'').trim(); }
function n(v:unknown){ const s=t(v).replace(/[,٬]/g,''); const x=Number(s); return s!==''&&Number.isFinite(x)?x:null; }
function d(v:unknown){ const x=new Date(t(v)); return t(v)&&!Number.isNaN(x.getTime())?x:null; }
function norm(v:unknown){ return t(v).toLowerCase().normalize('NFKC').replace(/[\s_\-./]+/g,''); }
function cols(i:Input){ const out:Column[]=[]; const seen=new Set<string>(); for(const ds of i.sourceAnalysis?.datasets??[]){ if(!ds||typeof ds!=='object') continue; const cs=(ds as Column).columns; if(!Array.isArray(cs)) continue; for(const c of cs){ if(!c||typeof c!=='object') continue; const x=c as Column; const k=norm(x.mappedField??x.name); if(k&&!seen.has(k)){seen.add(k);out.push(x);} } } return out; }
function pick(cs:Column[], names:string[]){ return cs.find(c=>names.some(a=>norm(c.mappedField??c.name).includes(norm(a))))??null; }
function key(c:Column|null){ return t(c?.mappedField)||t(c?.name); }
function profile(s:string|null){ return resolveLegacyReportType(s==='sales'?'sales':s==='purchases'?'purchases':s==='inventory'?'inventory':s==='receivables'?'customerBalances':'unknown'); }
function proof(i:Input,e:string[]=[]){ return ['jobId='+i.jobId,'sourceHash='+i.sourceHash,...(i.evidenceSnapshotId?['evidenceSnapshotId='+i.evidenceSnapshotId]:[]),...e]; }
function q(id:AdvisorQuestionId,status:AdvisorQuestionStatus,question:string,answer:string,numbers:string[],fields:string[],sampleSize:number,evidence:string[],limitations:string[],next:AdvisorQuestionId|null):AdvisorQuestion{ return {id,status,question,answer,numbers,fields,sampleSize,evidence,limitations,nextQuestionId:next}; }
function f(title:string,statement:string,value:number|null,period:string|null,dimension:string|null,evidence:string[],sampleSize:number,contribution:number|null,limitations:string[]):AdvisorFinding{ return {title,statement,value,period,dimension,evidence,sampleSize,contribution,limitations}; }
function money(v:number){ return new Intl.NumberFormat('ar-YE',{maximumFractionDigits:2}).format(v); }

function salesAdvisor(i:Input):AdvisorBrief {
  const p=profile('sales'), r=i.canonicalRows.filter(x=>x?.data), c=cols(i);
  const dateC=pick(c,['documentDate','invoiceDate','date','التاريخ']), amountC=pick(c,['netAmount','total','grossAmount','amount','sales','المبيعات','الإجمالي']);
  const entityC=pick(c,['customerName','customer_name','customer','client','العميل']);
  const dateK=key(dateC), amountK=key(amountC), entityK=key(entityC);
  const dated=r.map(x=>({x,date:d(x.data?.[dateK]),amount:n(x.data?.[amountK])})).filter(x=>x.date&&x.amount!=null) as Array<{x:{row_number?:number;data:Record<string,unknown>};date:Date;amount:number}>;
  const min=dated.reduce<Date|null>((m,x)=>!m||x.date<m?x.date:m,null), max=dated.reduce<Date|null>((m,x)=>!m||x.date>m?x.date:m,null);
  const span=min&&max?Math.floor((Date.UTC(max.getUTCFullYear(),max.getUTCMonth(),max.getUTCDate())-Date.UTC(min.getUTCFullYear(),min.getUTCMonth(),min.getUTCDate()))/86400000)+1:0;
  const base=proof(i,['archetypeId='+p.archetypeId,'profileVersion='+p.profileVersion,'rowCount='+r.length]);
  const limits=['المساهمة وصفية في التغير المرصود وليست إثباتًا للسببية.','لا يوجد أثر فعلي أو تعلّم قبل تسجيل نتيجة بعد التنفيذ.'];
  if(!dateK||!amountK||!entityK||dated.length<30||span<28){
    const why=q('WHY','INSUFFICIENT_SAMPLE','لماذا حدث هذا؟','لا توجد بنية زمنية/كيانية كافية لإثبات المساهمات.',[],[dateK,amountK,entityK].filter(Boolean),dated.length,base,[...limits,'يلزم تاريخ وقيمة وهوية عميل وعينة زمنية كافية.'],'SO_WHAT');
    const qs=[
      q('WHAT','INSUFFICIENT_SAMPLE','ماذا حدث؟','العينة الحالية لا تدعم مقارنة استشارية كاملة.',[],[dateK,amountK].filter(Boolean),dated.length,base,limits,'WHERE'),
      q('WHERE','NOT_AVAILABLE','أين؟','لا يمكن تحديد نافذتي قياس موثوقتين.',[],[dateK].filter(Boolean),dated.length,base,limits,'WHO_CONTRIBUTED'),
      q('WHO_CONTRIBUTED','NOT_AVAILABLE','من ساهم؟','لا توجد مساهمات قابلة للحساب.',[],[entityK].filter(Boolean),dated.length,base,limits,'WHY'),
      why,q('SO_WHAT','REVIEW_REQUIRED','ماذا يعني؟','أكمل البيانات قبل القرار.',[],[],dated.length,base,limits,'WHAT_NEXT'),
      q('WHAT_NEXT','REVIEW_REQUIRED','ماذا نفعل؟','أكمل البيانات ثم أعد التحليل.',[],[],dated.length,base,limits,'PROOF'),
      q('PROOF',i.evidenceSnapshotId?'ANSWERED':'REVIEW_REQUIRED','ما الدليل?',i.evidenceSnapshotId?'المصدر مرتبط بلقطة دليل.':'لقطة الدليل غير متاحة.',[],[],r.length,base,limits,'AFTER_ACTION'),
      q('AFTER_ACTION','NOT_AVAILABLE','ماذا حدث بعد التنفيذ؟','لا توجد نتيجة فعلية.',[],[],0,base,['Outcome غير مقاس.'],null)
    ];
    return {archetypeId:p.archetypeId,profileVersion:p.profileVersion,health:{status:'عينة غير كافية',rationale:'البنية الحالية لا تدعم استشارة كمية كاملة.'},topFindings:[],topRisk:null,topOpportunity:null,why,soWhat:'لا توجد كمية كافية للانتقال إلى توصية تنفيذية.',recommendedAction:null,owner:'مسؤول المبيعات',expectedOutcome:null,proofState:i.evidenceSnapshotId?'VERIFIED':'INSUFFICIENT_SAMPLE',questions:qs,lineage:{jobId:i.jobId,sourceHash:i.sourceHash,evidenceSnapshotId:i.evidenceSnapshotId}};
  }
  const start=new Date(Date.UTC(min!.getUTCFullYear(),min!.getUTCMonth(),min!.getUTCDate())), end=new Date(Date.UTC(max!.getUTCFullYear(),max!.getUTCMonth(),max!.getUTCDate()));
  const firstEnd=new Date(start); firstEnd.setUTCDate(firstEnd.getUTCDate()+13);
  const lastStart=new Date(end); lastStart.setUTCDate(lastStart.getUTCDate()-13);
  const inside=(x:Date,a:Date,b:Date)=>x>=a&&x<=b;
  const first=dated.filter(x=>inside(x.date,start,firstEnd)), last=dated.filter(x=>inside(x.date,lastStart,end));
  const firstTotal=first.reduce((s,x)=>s+x.amount,0), lastTotal=last.reduce((s,x)=>s+x.amount,0);
  const change=firstTotal===0?null:((lastTotal-firstTotal)/Math.abs(firstTotal))*100;

  const groups=new Map<string,{first:number;last:number}>();
  for(const row of dated){ const entity=t(row.x.data?.[entityK]); if(!entity) continue; const g=groups.get(entity)??{first:0,last:0}; if(inside(row.date,start,firstEnd))g.first+=row.amount; if(inside(row.date,lastStart,end))g.last+=row.amount; groups.set(entity,g); }
  const delta=[...groups.entries()].map(([value,g])=>({value,first:g.first,last:g.last,delta:g.last-g.first}));
  const dec=delta.filter(x=>x.delta<0).sort((a,b)=>a.delta-b.delta).slice(0,5), gain=delta.filter(x=>x.delta>0).sort((a,b)=>b.delta-a.delta).slice(0,5);
  const declineAbs=dec.reduce((s,x)=>s+Math.abs(x.delta),0), gainTotal=gain.reduce((s,x)=>s+x.delta,0);
  const basePeriod=start.toISOString().slice(0,10)+' → '+end.toISOString().slice(0,10);
  const main=f(change!=null&&change<0?'انخفاض صافي المبيعات':'تغير في خط الأساس',
    change!=null&&change<0?'انخفضت المبيعات في آخر 14 يومًا بنسبة '+Math.abs(change).toFixed(2)+'% مقارنة بأول 14 يومًا.':'تغيرت القيمة بين نافذتي المقارنة بنسبة '+change?.toFixed(2)+'%.',
    lastTotal-firstTotal,basePeriod,'الفترة',[...base,'firstWindowTotal='+firstTotal,'lastWindowTotal='+lastTotal,'changePercent='+(change??'NA')],first.length+last.length,null,limits);
  const drivers=dec.slice(0,3).map(x=>f('مساهم في التراجع: '+x.value,x.value+' ساهم بانخفاض وصفي قدره '+money(Math.abs(x.delta))+' بين نافذتي المقارنة.',x.delta,basePeriod,entityK,[...base,'entity='+x.value,'first='+x.first,'last='+x.last,'delta='+x.delta],first.length+last.length,declineAbs?Math.abs(x.delta)/declineAbs*100:null,limits));
  const opportunity=gain.length?f('فرصة موصوفة من العملاء النشطين',gain.slice(0,3).map(x=>x.value+' (+'+money(x.delta)+')').join('، '),gainTotal,basePeriod,entityK,[...base,'topGainers='+gain.slice(0,3).map(x=>x.value).join('|')],first.length+last.length,null,['هذه فرصة وصفية وليست توقعًا للنتيجة.']):null;
  const decline=change!=null&&change<=-10, health=decline?'ضغط في اتجاه المبيعات':change!=null&&change>=10?'تحسن في اتجاه المبيعات':'حركة ضمن نطاق المقارنة';
  const why=q('WHY',decline&&drivers.length?'REVIEW_REQUIRED':'ANSWERED','لماذا حدث هذا؟',decline?'المصدر يثبت أن التراجع تركز لدى العملاء المبينين، لكنه لا يثبت أن سلوكهم هو السبب السببي.':'المصدر لا يثبت سببًا سببيًا محددًا من المتغيرات المتاحة.',change==null?[]:['changePercent='+change.toFixed(2)], [dateK,amountK,entityK],first.length+last.length,[...base,...drivers.flatMap(x=>x.evidence.slice(-2))].slice(0,12),[...limits,'السببية REVIEW_REQUIRED دون دليل سببي مستقل.'],'SO_WHAT');
  const what=q('WHAT','ANSWERED','ماذا حدث؟',main.statement,[money(firstTotal),money(lastTotal),...(change==null?[]:[change.toFixed(2)+'%'])],[dateK,amountK],dated.length,main.evidence,limits,'WHERE');
  const where=q('WHERE','ANSWERED','أين حدث؟','في مقارنة أول 14 يومًا بآخر 14 يومًا من الفترة المرصودة.',['first='+firstTotal,'last='+lastTotal],[dateK,amountK],first.length+last.length,base,limits,'WHO_CONTRIBUTED');
  const who=q('WHO_CONTRIBUTED',drivers.length?'ANSWERED':'NOT_AVAILABLE','من ساهم؟',drivers.length?drivers.map(x=>x.statement).join(' '):'لا تتوفر هوية كيان كافية.',drivers.map(x=>x.statement),[entityK,amountK,dateK],first.length+last.length,drivers.flatMap(x=>x.evidence),limits,'WHY');
  const so=decline?'الأولوية الإدارية هي مراجعة العملاء الأعلى مساهمة في التراجع، لا إطلاق حكم عام على المبيعات.':'لا توجد إشارة انخفاض تستدعي تدخلًا عامًا من هذا المصدر وحده.';
  const next=decline?'راجع معاملات العملاء الثلاثة الأعلى مساهمة، اثبت السبب من المصدر/المستندات، ثم أنشئ قرارًا وقياس نتيجة.':'احتفظ بخط الأساس الحالي وراقب نفس المقياس قبل إجراء جديد.';

  const whatNext=q('WHAT_NEXT','ANSWERED','ماذا نفعل الآن؟',next,['owner=مسؤول المبيعات','measure=14-day-sales-window'],[dateK,amountK,entityK],first.length+last.length,[...base,'measurement=14-day-window-comparison'],['النتيجة ليست مضمونة؛ الحكم يتم من Outcome لاحق.'],'PROOF');
  const proofQ=q('PROOF',i.evidenceSnapshotId?'ANSWERED':'REVIEW_REQUIRED','ما الذي يثبت الإجابة?',i.evidenceSnapshotId?'الإجابات مربوطة بالبصمة وJob ولقطة الدليل.':'لا توجد لقطة دليل مرتبطة.',[],[dateK,amountK,entityK],dated.length,base,limits,'AFTER_ACTION');
  const after=q('AFTER_ACTION','NOT_AVAILABLE','ماذا حدث بعد التنفيذ؟','لا توجد نتيجة فعلية مسجلة؛ لا يعرض المستشار Impact أو Learning كحقيقة قبل READBACK.',[],[],0,base,['Outcome الفعلي غير متاح.'],null);
  const rec:AdvisorRecommendation=decline?{
    problem:'انخفاض مبيعات ظاهر في آخر 14 يومًا مقارنة بأول 14 يومًا.',
    evidence:[...base,'firstWindowTotal='+firstTotal,'lastWindowTotal='+lastTotal,'changePercent='+change.toFixed(2),'topContributors='+dec.slice(0,3).map(x=>x.value).join('|')],
    whyNow:'التغير مرصود في أحدث نافذة داخل المصدر نفسه.',
    action:'راجع معاملات العملاء الثلاثة الأعلى مساهمة في التراجع، اثبت سبب كل فجوة، ثم أنشئ قرار متابعة محدد.',
    owner:'مسؤول المبيعات',
    expectedOutcome:'هدف قياس: مقارنة نافذة 14 يومًا بعد التنفيذ بخط الأساس المرصود، دون افتراض تحسن.',
    measurement:'14-day sales total + customer-level delta using the same fields.',
    risksBlockers:['السببية غير مثبتة من التقرير وحده.','اختلاف جودة/اكتمال المصدر قد يغير القراءة.','لا توجد نتيجة فعلية قبل تنفيذ Work Item.'],
    limitations:limits,
  }:{
    problem:'لا توجد إشارة انخفاض ≥10% من هذا المصدر وحده.',
    evidence:[...base,'firstWindowTotal='+firstTotal,'lastWindowTotal='+lastTotal,'changePercent='+(change??'NA')],
    whyNow:'الهدف هو الحفاظ على خط أساس قابل لإعادة القياس.',
    action:'احتفظ بخط أساس 14 يومًا وراقب نفس المقياس.',
    owner:'مسؤول المبيعات',
    expectedOutcome:'هدف قياس: وجود خط أساس موثق للمقارنة اللاحقة.',
    measurement:'14-day sales total and customer contribution deltas.',
    risksBlockers:['العينة لا تثبت سببية أو توقعًا.'],
    limitations:limits,
  };
  const questions=[what,where,who,why,q('SO_WHAT','ANSWERED','ماذا يعني ذلك؟',so,[main.statement],[dateK,amountK,entityK],first.length+last.length,[...base],limits,'WHAT_NEXT'),whatNext,proofQ,after];
  return {
    archetypeId:p.archetypeId,profileVersion:p.profileVersion,
    health:{status:health,rationale:main.statement},topFindings:[main,...drivers].slice(0,4),
    topRisk:decline?(drivers[0]??main):main,topOpportunity:opportunity,why,soWhat:so,recommendedAction:rec,
    owner:rec.owner,expectedOutcome:rec.expectedOutcome,proofState:i.evidenceSnapshotId?'VERIFIED':'REVIEW_REQUIRED',
    questions,lineage:{jobId:i.jobId,sourceHash:i.sourceHash,evidenceSnapshotId:i.evidenceSnapshotId},
  };
}
export function buildReportAdvisorBrief(i:Input):AdvisorBrief {
  if(i.specialty==='sales') return salesAdvisor(i);
  const p=profile(i.specialty), s=(i.existingSignals??[]).filter(x=>x.severity!=='info'), risk=s[0]??null;
  const evidence=proof(i,risk?.evidence??[]), limits=['التحليل الحالي لا يثبت سببية دون دليل مستقل.'];
  const rf=risk?f(risk.title,risk.message,null,null,null,evidence,i.canonicalRows.length,null,limits):null;
  const why=q('WHY','NOT_AVAILABLE','لماذا حدث هذا؟','لا يوجد تحليل سببي موثوق من الحقول المتاحة لهذا archetype في هذه الدفعة.',[],[],i.canonicalRows.length,evidence,limits,'SO_WHAT');
  const qs=[
    q('WHAT',risk?'ANSWERED':'NOT_AVAILABLE','ماذا حدث؟',risk?.message??'لا توجد نتيجة كمية كافية.',[],[],i.canonicalRows.length,evidence,limits,'WHERE'),
    q('WHERE','NOT_AVAILABLE','أين؟','يتطلب هذا الحقول البعدية التخصصية.',[],[],i.canonicalRows.length,evidence,limits,'WHO_CONTRIBUTED'),
    q('WHO_CONTRIBUTED','NOT_AVAILABLE','من ساهم؟','لم تُبن مساهمات تخصصية لهذا archetype في هذه الدفعة.',[],[],i.canonicalRows.length,evidence,limits,'WHY'),
    why,q('SO_WHAT',risk?'ANSWERED':'NOT_AVAILABLE','ماذا يعني؟',risk?'تحتاج الإدارة إلى مراجعة الإشارة قبل القرار.':'لا توجد إشارة كافية.',[],[],i.canonicalRows.length,evidence,limits,'WHAT_NEXT'),
    q('WHAT_NEXT',risk?'ANSWERED':'NOT_AVAILABLE','ماذا نفعل؟',risk?'افحص الدليل المرتبط ثم حوّلها إلى قرار إذا ثبتت.':'انتظر بيانات كافية.',[],[],i.canonicalRows.length,evidence,limits,'PROOF'),
    q('PROOF',i.evidenceSnapshotId?'ANSWERED':'REVIEW_REQUIRED','ما الدليل؟',i.evidenceSnapshotId?'الدليل مرتبط بالبصمة وJob.':'لقطة الدليل غير متاحة.',[],[],i.canonicalRows.length,evidence,limits,'AFTER_ACTION'),
    q('AFTER_ACTION','NOT_AVAILABLE','ماذا حدث بعد التنفيذ؟','لا توجد نتيجة فعلية حتى الآن.',[],[],0,evidence,['Outcome غير مقاس.'],null)
  ];
  return {
    archetypeId:p.archetypeId,profileVersion:p.profileVersion,
    health:{status:risk?'مراجعة مطلوبة':'لا إشارة مثبتة',rationale:risk?.message??'لا توجد إشارة كمية مثبتة.'},
    topFindings:rf?[rf]:[],topRisk:rf,topOpportunity:null,why,soWhat:risk?'تحتاج الإدارة إلى مراجعة الدليل قبل اعتماد أي إجراء.':'لا توجد فرصة كمية مثبتة من المصدر.',
    recommendedAction:risk?{problem:rf!.title,evidence:rf!.evidence,whyNow:'الإشارة موجودة في المصدر الحالي.',action:'افحص الدليل المرتبط ثم حوّل النتيجة إلى قرار إذا ثبتت.',owner:'المسؤول التخصصي',expectedOutcome:'لا أثر متوقع مثبت قبل التنفيذ.',measurement:'المقياس يحدده الـprofile عند اختيار القرار.',risksBlockers:['لا سببية مثبتة.'],limitations:limits}:null,
    owner:risk?'المسؤول التخصصي':null,expectedOutcome:risk?'غير متاح كأثر متوقع قبل التنفيذ.':null,
    proofState:i.evidenceSnapshotId?'VERIFIED':'REVIEW_REQUIRED',questions:qs,
    lineage:{jobId:i.jobId,sourceHash:i.sourceHash,evidenceSnapshotId:i.evidenceSnapshotId},
  };
}
