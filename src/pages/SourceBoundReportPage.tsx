import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Database, FileText, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase, resolveCurrentCompanyId } from '@/lib/supabase';
import { formatCurrency, formatDateTime, formatNumber } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/ui/States';

type Row = { row_number:number; data:Record<string,unknown>; provenance:Record<string,unknown> };
type Job = { id:string; status:string; valid_rows:number|null; invalid_rows:number|null; source_fingerprint:string|null; result_summary:Record<string,unknown>|null; completed_at:string|null };
type Exec = { id:string; source_path:string; source_hash:string; status:string };
type Model = {
  sourcePath:string; sourceHash:string; importId:string; executionId:string|null; status:string; rowCount:number;
  from:string|null; to:string|null; sales:number|null; missingSales:number; invoices:number|null;
  missingInvoiceNumber:number; missingCustomer:number; missingType:number; amountDifferences:number;
  creditAmount:number|null; creditRows:number; mix:Array<{type:string;rows:number;amount:number|null}>; sample:Row[];
};

function txt(d:Record<string,unknown>, keys:string[]):string|null {
  for(const k of keys){ const v=d[k]; if(v==null) continue; const s=String(v).trim(); if(s) return s; }
  return null;
}
function num(d:Record<string,unknown>, keys:string[]):number|null {
  for(const k of keys){ const v=d[k]; if(v==null||v==='') continue; const n=typeof v==='number'?v:Number(String(v).replace(/,/g,'')); if(Number.isFinite(n)) return n; }
  return null;
}
function dateOf(v:string|null):string|null { if(!v) return null; const n=Date.parse(v); return Number.isFinite(n)?new Date(n).toISOString().slice(0,10):null; }

function build(job:Job, exec:Exec|null, rows:Row[]):Model {
  const amounts=rows.map(r=>num(r.data,['total','اجمالي الفاتوره','مبلغ الصافي بالمحلي']));
  const sales=amounts.every(v=>v!=null)?amounts.reduce((s,v)=>s+(v as number),0):amounts.filter((v):v is number=>v!=null).reduce((s,v)=>s+v,0);
  const invoiceNumbers=rows.map(r=>txt(r.data,['invoice_number','رقم الفاتوره']));
  const types=rows.map(r=>txt(r.data,['invoice_type','نوع الفاتوره']));
  const credits=rows.filter(r=>(txt(r.data,['invoice_type','نوع الفاتوره'])||'')==='آجل');
  const creditValues=credits.map(r=>num(r.data,['total','اجمالي الفاتوره','مبلغ الصافي بالمحلي']));
  const creditAmount=creditValues.every(v=>v!=null)?creditValues.reduce((s,v)=>s+(v as number),0):null;
  const mix=new Map<string,{rows:number;amount:number}>();
  rows.forEach(r=>{const t=txt(r.data,['invoice_type','نوع الفاتوره'])||'غير مصنف'; const a=num(r.data,['total','اجمالي الفاتوره','مبلغ الصافي بالمحلي']); const x=mix.get(t)||{rows:0,amount:0}; x.rows+=1; if(a!=null)x.amount+=a; mix.set(t,x);});
  const dates=rows.map(r=>dateOf(txt(r.data,['date','التاريخ']))).filter((v):v is string=>Boolean(v)).sort();
  return {
    sourcePath:exec?.source_path||String(job.result_summary?.file_name||'مصدر غير مسمى'),
    sourceHash:exec?.source_hash||job.source_fingerprint||'غير متاح',
    importId:job.id, executionId:exec?.id||null, status:exec?.status||job.status, rowCount:rows.length,
    from:dates[0]||null, to:dates[dates.length-1]||null, sales, missingSales:amounts.filter(v=>v==null).length,
    invoices:new Set(invoiceNumbers.filter(Boolean)).size||null, missingInvoiceNumber:invoiceNumbers.filter(v=>!v).length,
    missingCustomer:rows.filter(r=>!txt(r.data,['customer_name','اسم العميل'])).length,
    missingType:types.filter(v=>!v).length,
    amountDifferences:rows.filter(r=>{const a=num(r.data,['total','اجمالي الفاتوره']);const b=num(r.data,['مبلغ الصافي بالمحلي']);return a!=null&&b!=null&&Math.abs(a-b)>0.000001;}).length,
    creditAmount, creditRows:credits.length,
    mix:Array.from(mix.entries()).sort((a,b)=>b[1].amount-a[1].amount).map(([type,v])=>({type,rows:v.rows,amount:v.amount})),
    sample:rows.slice(0,5),
  };
}

function Metric(p:{label:string;value:string;hint:string}) {
  return <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-sm"><div className="text-[11px] font-bold text-ink-500">{p.label}</div><div className="mt-1 text-xl font-black">{p.value}</div><div className="mt-1 text-[10px] text-ink-400">{p.hint}</div></div>;
}

export function SourceBoundReportPage(){
  const [params]=useSearchParams();
  const [model,setModel]=useState<Model|null>(null);
  const [job,setJob]=useState<Job|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);

  const load=useCallback(async()=>{
    setLoading(true); setError(null);
    try{
      const companyId=await resolveCurrentCompanyId(); if(!companyId) throw new Error('TENANT_CONTEXT_REQUIRED');
      const importId=params.get('import')?.trim()||'';
      let query=supabase.from('import_jobs').select('id,status,valid_rows,invalid_rows,source_fingerprint,result_summary,completed_at').eq('company_id',companyId).eq('status','completed').order('created_at',{ascending:false}).limit(1);
      if(importId) query=supabase.from('import_jobs').select('id,status,valid_rows,invalid_rows,source_fingerprint,result_summary,completed_at').eq('company_id',companyId).eq('id',importId).eq('status','completed').limit(1);
      const {data:jobs,error:je}=await query; if(je) throw je;
      const importJob=jobs?.[0] as Job|undefined; if(!importJob) throw new Error('REPORT_IMPORT_NOT_FOUND_OR_FORBIDDEN');
      const hash=importJob.source_fingerprint; if(!hash) throw new Error('REPORT_SOURCE_HASH_MISSING');

      const [er,rr]=await Promise.all([
        supabase.from('report_execution_jobs').select('id,source_path,source_hash,status').eq('company_id',companyId).eq('source_hash',hash).order('updated_at',{ascending:false}).limit(1).maybeSingle(),
        supabase.from('canonical_dataset_records').select('row_number,data,provenance').eq('company_id',companyId).eq('source_hash',hash).eq('semantic_domain','sales').order('row_number',{ascending:true}).range(0,9999),
      ]);
      if(er.error) throw er.error; if(rr.error) throw rr.error; if(!rr.data?.length) throw new Error('REPORT_CANONICAL_ROWS_NOT_FOUND');
      setJob(importJob); setModel(build(importJob,er.data as Exec|null,rr.data as Row[]));
    }catch(cause){setModel(null);setError(cause instanceof Error?cause.message:'تعذر بناء التقرير المصدرّي.');}
    finally{setLoading(false);}
  },[params]);

  useEffect(()=>{void load();},[load]);
  const outputs=useMemo(()=>model?[
    {t:'تقرير المبيعات',s:model.missingSales===0&&model.missingCustomer===0&&model.missingType===0?'VERIFIED':'REVIEW',d:'المبيعات ومزيج الفواتير محسوبة من الصفوف الكانونية لهذا المصدر.'},
    {t:'الذمم والتحصيل',s:model.creditRows>0?'PARTIAL':'INSUFFICIENT DATA',d:model.creditRows>0?'يوجد مرشح آجل؛ لا يتم إعلان Aging نهائي دون استحقاق ودفعات.':'لا توجد ذمم قابلة للإثبات من المصدر.'},
    {t:'العملاء / RFM',s:model.missingCustomer>0?'REVIEW':'VERIFIED',d:model.missingCustomer>0?'جزء من الصفوف بلا عميل؛ التحليل الكامل يحتاج مراجعة.':'هوية العملاء مكتملة.'},
    {t:'الربحية',s:'INSUFFICIENT DATA',d:'لا توجد تكلفة/كمية مثبتة كافية لحساب ربحية.'},
    {t:'المخزون',s:'INSUFFICIENT DATA',d:'لا يتم تصنيع مخزون من تقرير مبيعات.'},
    {t:'المشتريات والموردون',s:'INSUFFICIENT DATA',d:'المصدر لا يحمل حقيقة مشتريات.'},
    {t:'التوقع',s:'INSUFFICIENT DATA',d:'لا توجد مدخلات كافية لتوقع مثبت.'},
    {t:'Benchmark',s:'INSUFFICIENT_SAMPLE',d:'لا توجد عينة peer مثبتة للمقارنة.'},
  ]:[],[model]);

  if(loading) return <LoadingState message="جارٍ بناء التقرير من الحقيقة الكانونية المرتبطة بالمصدر..." />;
  if(error) return <ErrorState message={error} onRetry={()=>void load()} />;
  if(!model||!job) return <EmptyState title="لا توجد نتيجة مصدرية" message="لم يتم العثور على عملية مكتملة مرتبطة بهذا المصدر." action={<Link to="/import" className="btn-primary">مركز المصادر</Link>} />;

  const proof=model.status==='completed'&&model.rowCount>0&&model.sourceHash.startsWith('sha256:');
  const period=model.from&&model.to?model.from+' → '+model.to:'الفترة غير مثبتة';

  return <div dir="rtl" className="space-y-5 animate-fade-in pb-12">
    <PageHeader title="التقرير الذكي المرتبط بالمصدر" subtitle="نتائج مصدرية مباشرة من الصفوف الكانونية؛ لا تعتمد على Dashboard عام." actions={<button type="button" onClick={()=>void load()} className="btn-secondary text-xs"><RefreshCw size={14}/> تحديث</button>} />
    <section className="rounded-2xl border border-primary-200 bg-ink-950 p-5 text-white shadow-elevated">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-[10px] font-black text-primary-300"><FileText size={15}/> SOURCE-BOUND REPORT</div><h1 className="mt-2 break-words text-xl font-black">{model.sourcePath}</h1><p className="mt-2 text-[11px] text-ink-300">Sales · {period} · import {model.importId}</p></div><div className="flex gap-2"><span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black">{proof?'مصدر مثبت':'إثبات غير مكتمل'}</span><span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black">{formatNumber(model.rowCount)} صف</span></div></div>
      <div className="mt-4 grid gap-2 text-[10px] text-ink-300 lg:grid-cols-3"><div>SHA: <span className="break-all font-mono">{model.sourceHash}</span></div><div>Import: <span className="font-mono">{model.importId}</span></div><div>Execution: <span className="font-mono">{model.executionId||'غير مثبت'}</span></div></div>
    </section>

    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Metric label="إجمالي المبيعات" value={model.sales==null?'غير متاح':formatCurrency(model.sales)} hint={model.missingSales?'صفوف بلا مبلغ: '+formatNumber(model.missingSales):'كل الصفوف تحمل مبلغاً'} />
      <Metric label="الفواتير الفريدة" value={model.invoices==null?'غير متاح':formatNumber(model.invoices)} hint={model.missingInvoiceNumber?'صفوف بلا رقم: '+formatNumber(model.missingInvoiceNumber):'ترقيم الفواتير مكتمل'} />
      <Metric label="مرشح الذمم الآجلة" value={model.creditAmount==null?'غير متاح':formatCurrency(model.creditAmount)} hint={formatNumber(model.creditRows)+' صف آجل'} />
      <Metric label="صفوف بلا عميل" value={formatNumber(model.missingCustomer)} hint="فجوة تؤثر في RFM والعملاء" />
    </section>

    <Card><CardHeader title="مزيج أنواع الفواتير" subtitle="من الصفوف المصدرية نفسها" /><CardBody><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{model.mix.map(item=><div key={item.type} className="rounded-xl border border-ink-100 bg-ink-50 p-3"><div className="text-[10px] text-ink-500">{item.type}</div><div className="mt-1 text-lg font-black">{formatNumber(item.rows)} <span className="text-[10px] text-ink-400">صف</span></div><div className="mt-1 text-xs font-bold">{formatCurrency(item.amount)}</div></div>)}</div></CardBody></Card>

    <section className="grid gap-4 lg:grid-cols-2">
      <Card><CardHeader title="التقارير الذكية" subtitle="ما يثبته هذا المصدر فقط" /><CardBody><div className="space-y-2">{outputs.map((o,i)=><div key={i} className="rounded-xl border border-ink-100 p-3"><div className="flex items-center justify-between gap-2"><div className="font-black text-sm">{o.t}</div><Badge variant={o.s==='VERIFIED'?'success':o.s==='REVIEW'||o.s==='PARTIAL'?'warning':'neutral'}>{o.s}</Badge></div><div className="mt-1 text-[11px] text-ink-600">{o.d}</div></div>)}</div></CardBody></Card>
      <Card><CardHeader title="Evidence Passport" subtitle="من النتيجة إلى المصدر" /><CardBody><div className="space-y-2 text-[11px]"><div className="rounded-xl bg-ink-50 p-3">المصدر: <b>{model.sourcePath}</b></div><div className="rounded-xl bg-ink-50 p-3 break-all">SHA: <span className="font-mono">{model.sourceHash}</span></div><div className="rounded-xl bg-ink-50 p-3">الصفوف الكانونية: <b>{formatNumber(model.rowCount)}</b></div><div className="rounded-xl bg-ink-50 p-3">الإغلاق: <b>{job.completed_at?formatDateTime(job.completed_at):'غير متاح'}</b></div></div></CardBody></Card>
    </section>

    <Card><CardHeader title="إشارات القرار" subtitle="اقتراحات مراجعة مبنية على استثناءات مثبتة؛ لا تنشئ قراراً تلقائياً" /><CardBody><div className="grid gap-2 sm:grid-cols-2">
      {[['صفوف بلا عميل',model.missingCustomer],['صفوف بلا نوع فاتورة',model.missingType],['فروقات مبلغ',model.amountDifferences],['فواتير بلا رقم',model.missingInvoiceNumber]].map(item=><div key={String(item[0])} className="rounded-xl border border-ink-100 p-3"><div className="flex justify-between gap-2"><b>{item[0]}</b><span className="badge-warning">{formatNumber(Number(item[1]))}</span></div><div className="mt-1 text-[10px] text-ink-500">تحتاج مراجعة مصدرية قبل أي قرار لاحق.</div></div>)}
    </div></CardBody></Card>

    <Card><CardHeader title="عينة الدليل" subtitle="صفوف حقيقية مع Evidence ID" /><CardBody><div className="space-y-2">{model.sample.map(row=><div key={row.row_number} className="rounded-xl border border-ink-100 bg-ink-50 p-3"><div className="flex justify-between gap-2 text-xs font-black"><span>Row {row.row_number}</span><span className="font-mono text-[9px] text-ink-400">{String(row.provenance.evidenceId||'غير متاح')}</span></div><div className="mt-2 grid grid-cols-2 gap-2 text-[10px] sm:grid-cols-4"><div>التاريخ: <b>{txt(row.data,['date','التاريخ'])||'غير متاح'}</b></div><div>الفاتورة: <b>{txt(row.data,['invoice_number','رقم الفاتوره'])||'غير متاح'}</b></div><div>النوع: <b>{txt(row.data,['invoice_type','نوع الفاتوره'])||'غير متاح'}</b></div><div>المبلغ: <b>{formatCurrency(num(row.data,['total','اجمالي الفاتوره','مبلغ الصافي بالمحلي']))}</b></div></div></div>)}</div></CardBody></Card>

    <section className={proof?'rounded-2xl border border-success-200 bg-success-50 p-4':'rounded-2xl border border-warning-200 bg-warning-50 p-4'}><div className="flex items-start gap-3">{proof?<CheckCircle2 size={18} className="text-success-700"/>:<XCircle size={18} className="text-warning-700"}/><div><b>{proof?'إثبات مصدر التقرير':'إثبات التقرير غير مكتمل'}</b><p className="mt-1 text-[11px]">هذه الشاشة قرأت الصفوف الكانونية المرتبطة بنفس بصمة المصدر. لا تُحوّل البيانات الناقصة إلى أصفار ولا تُنشئ benchmark أو outcomes وهمية.</p></div></div></section>
    <div className="flex flex-wrap gap-2"><Link to="/import" className="btn-secondary text-xs"><ArrowLeft size={14}/> مركز المصادر</Link><Link to={'/trust?import='+encodeURIComponent(model.importId)} className="btn-primary text-xs"><ShieldCheck size={14}/> فحص الدليل</Link><Link to={'/decision-experience?import='+encodeURIComponent(model.importId)} className="btn-primary text-xs"><Database size={14}/> مساحة القرار</Link></div>
  </div>;
}
