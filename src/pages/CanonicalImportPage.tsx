import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Upload, FileSpreadsheet, FileText, FileImage, FileType, Database, CheckCircle2, XCircle, AlertCircle, AlertTriangle, ShieldCheck, Loader2, ArrowLeft, LockKeyhole, FileCheck2, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { PageHeader, LoadingState, EmptyState, TruthRail } from '@/components/ui/States';
import { DataTable } from '@/components/ui/DataTable';
import { fetchImportRecords, createImportRecord } from '@/lib/queries';
import { supabase, resolveCurrentCompanyId } from '@/lib/supabase';
import { formatDateTime, formatNumber } from '@/lib/format';
import { detectFormat } from '@/lib/file-engine/detector';
import { securityScan, computeSHA256, checkDuplicate } from '@/lib/file-engine/security';
import { parseFile } from '@/lib/file-engine/adapters';
import { FORMAT_LABELS, MAX_FILE_SIZE, type FileFormat, type Dataset } from '@/lib/file-engine/types';
import { reconcileForCanonical } from '@/lib/import/canonical-truth-boundary';
import { runCanonicalImportThroughDurableRunner } from '@/lib/import/canonical-production-adapter';

type Step = 'upload' | 'scanning' | 'preview' | 'committing' | 'done';
type EntityType = 'sales_invoices' | 'products' | 'customers';
interface Row { rowNumber: number; data: Record<string, any>; valid: boolean; error?: string }

const ENTITIES: Array<{ value: EntityType; label: string; description: string; required: string[] }> = [
  { value: 'sales_invoices', label: 'فواتير المبيعات', description: 'حركة المبيعات والتحصيل', required: ['invoice_number', 'invoice_date', 'customer_name', 'total'] },
  { value: 'products', label: 'المنتجات', description: 'الأصناف والأسعار والتكلفة', required: ['sku', 'name', 'cost_price', 'selling_price'] },
  { value: 'customers', label: 'العملاء', description: 'بيانات العملاء الأساسية', required: ['name'] },
];

const STEPS: Array<{ key: Step; label: string }> = [
  { key: 'upload', label: 'الملف' },
  { key: 'scanning', label: 'الفحص' },
  { key: 'preview', label: 'المراجعة' },
  { key: 'committing', label: 'الكتابة' },
  { key: 'done', label: 'النتيجة' },
];

function icon(format: FileFormat) {
  if (['xlsx', 'xls', 'xlsm', 'csv', 'tsv', 'ods'].includes(format)) return <FileSpreadsheet size={18} />;
  if (['pdf', 'docx', 'doc', 'rtf'].includes(format)) return <FileText size={18} />;
  if (['jpg', 'jpeg', 'png', 'webp', 'tiff', 'bmp'].includes(format)) return <FileImage size={18} />;
  return <FileType size={18} />;
}

async function finishImportJob(
  importJobId: string,
  status: 'completed' | 'partial' | 'failed' | 'cancelled',
  resultSummary: Record<string, unknown>,
  errorMessage?: string,
): Promise<void> {
  const { error } = await supabase.rpc('import_finish_job', {
    p_job_id: importJobId,
    p_status: status,
    p_result_summary: resultSummary,
    p_error_message: errorMessage ?? null,
  });
  if (error) throw error;
}

function Stepper({ step }: { step: Step }) {
  const current = STEPS.findIndex(s => s.key === step);
  return <div className="grid grid-cols-5 gap-2 mb-5" aria-label="مراحل الاستيراد">
    {STEPS.map((item, index) => {
      const complete = index < current || step === 'done';
      const active = index === current && step !== 'done';
      return <div key={item.key} className={`rounded-lg border px-2 py-2 text-center text-xs ${complete ? 'border-success-200 bg-success-50 text-success-700' : active ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-ink-100 bg-white text-ink-400'}`}>
        <div className="font-semibold">{complete ? '✓' : index + 1}</div><div className="mt-1">{item.label}</div>
      </div>;
    })}
  </div>;
}

export function CanonicalImportPage() {
  const [step, setStep] = useState<Step>('upload');
  const [entityType, setEntityType] = useState<EntityType>('sales_invoices');
  const [file, setFile] = useState<{ name: string; size: number; format: FileFormat } | null>(null);
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [quality, setQuality] = useState(0);
  const [qualityApproved, setQualityApproved] = useState(false);
  const [mappings, setMappings] = useState<Array<{ name: string; mappedField: string | null; confidence: number }>>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [securityPassed, setSecurityPassed] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try { setHistory(await fetchImportRecords()); } catch { setHistory([]); } finally { setLoadingHistory(false); }
  }, []);
  useEffect(() => { void loadHistory(); }, [loadHistory]);

  const handleFile = useCallback(async (selected: File) => {
    setError(null); setWarnings([]); setDuplicate(false); setSecurityPassed(false); setQualityApproved(false); setStep('scanning');
    try {
      const buffer = await selected.arrayBuffer();
      const scan = securityScan(selected, buffer);
      if (!scan.passed) throw new Error(scan.issues.join(' — '));
      setSecurityPassed(true);
      const detection = detectFormat(selected, buffer);
      if (detection.format === 'unknown') throw new Error('تعذر تحديد صيغة الملف');
      setFile({ name: selected.name, size: selected.size, format: detection.format });
      setWarnings(detection.warnings);
      const hash = await computeSHA256(buffer);
      setFileHash(hash);
      const companyId = await resolveCurrentCompanyId();
      if (!companyId) throw new Error('TENANT_CONTEXT_REQUIRED');
      const dup = await checkDuplicate(hash, companyId, supabase);
      setDuplicate(dup.isDuplicate);
      if (dup.isDuplicate) setWarnings(prev => [...prev, 'هذا الملف موجود في سجل الاستيراد لهذا الحساب. لن يتم السماح بكتابة مكررة.']);
      const datasets: Dataset[] = await parseFile(buffer, selected.name, detection.format);
      const dataset = datasets[0];
      if (!dataset || dataset.rowCount === 0) throw new Error('الملف فارغ أو لا يحتوي على بيانات قابلة للقراءة');
      setQuality(dataset.qualityScore);
      setMappings(dataset.columns.map(c => ({ name: c.name, mappedField: c.mappedField, confidence: c.mappingConfidence })));
      const hdrs = dataset.columns.map(c => c.name);
      setHeaders(hdrs);
      const config = ENTITIES.find(e => e.value === entityType)!;
      setRows(dataset.rows.map((data, i) => {
        const missing = config.required.filter(field => {
          const key = Object.keys(data).find(k => k === field) ?? Object.keys(data).find(k => k.toLowerCase().includes(field.toLowerCase()));
          const value = key ? data[key] : undefined;
          return value == null || String(value).trim() === '';
        });
        return { rowNumber: i + 1, data, valid: missing.length === 0, error: missing.length ? `حقول مطلوبة ناقصة: ${missing.join(', ')}` : undefined };
      }));
      setStep('preview');
    } catch (e: any) {
      setError(e?.message || 'فشل قراءة الملف'); setStep('upload');
    }
  }, [entityType]);

  const commit = useCallback(async () => {
    const validRows = rows.filter(r => r.valid);
    if (!validRows.length || !file || !fileHash || duplicate || !securityPassed) return;
    if (quality < 50) { setError('جودة البيانات أقل من 50% — الاستيراد مرفوض.'); return; }
    if (quality < 75 && !qualityApproved) { setError('جودة البيانات بين 50% و74% وتتطلب موافقة صريحة قبل الاستيراد.'); return; }
    setStep('committing'); setProgress(10); setError(null);
    let rec: Awaited<ReturnType<typeof createImportRecord>> | null = null;
    try {
      const companyId = await resolveCurrentCompanyId();
      if (!companyId) throw new Error('TENANT_CONTEXT_REQUIRED');
      rec = await createImportRecord({ file_name: file.name, file_size: file.size, source_type: file.format, status: 'processing', total_rows: rows.length, valid_rows: validRows.length, invalid_rows: rows.length - validRows.length, quarantined_rows: rows.length - validRows.length, entity_type: entityType, progress: 0 });
      const durableSourceHash = `sha256:${fileHash}`;
      const reconciled = reconcileForCanonical(entityType, companyId, file.name, durableSourceHash, rec.id, (data, rowNumber) => `${durableSourceHash}:${rowNumber}:${JSON.stringify(data)}`, validRows.map(r => ({ rowNumber: r.rowNumber, data: r.data })));
      if (reconciled.rejected.length > 0) throw new Error(`CANONICAL_RECONCILIATION_REJECTED:${reconciled.rejected.map(r => `${r.rowNumber}:${r.reason}`).join(',')}`);
      const execution = await runCanonicalImportThroughDurableRunner({ importId: rec.id, fileName: file.name, sourceHash: durableSourceHash, entityType, rows: reconciled.rows, qualityScore: quality });
      await finishImportJob(rec.id, 'completed', {
        total: rows.length,
        valid: validRows.length,
        invalid: rows.length - validRows.length,
        importId: rec.id,
        jobId: execution.jobId,
      });
      setProgress(100);
      setResult({ total: rows.length, valid: validRows.length, invalid: rows.length - validRows.length, importId: rec.id, jobId: execution.jobId });
      setStep('done'); await loadHistory();
    } catch (e: any) {
      const failureMessage = e?.message || 'خطأ غير معروف';
      if (rec?.id) {
        try {
          await finishImportJob(rec.id, 'failed', {
            importId: rec.id,
            entityType,
            total: rows.length,
            valid: validRows.length,
            invalid: rows.length - validRows.length,
          }, failureMessage);
        } catch (finishError: any) {
          setError(`فشل الاستيراد — وتعذر إغلاق سجل العملية بأمان: ${finishError?.message || 'IMPORT_FINISH_FAILED'}`);
          setStep('preview');
          return;
        }
      }
      setError(`فشل الاستيراد: ${failureMessage}`); setStep('preview');
    }
  }, [rows, file, fileHash, entityType, duplicate, securityPassed, quality, qualityApproved, loadHistory]);

  const reset = () => { setStep('upload'); setFile(null); setFileHash(null); setRows([]); setHeaders([]); setQuality(0); setQualityApproved(false); setMappings([]); setWarnings([]); setError(null); setDuplicate(false); setSecurityPassed(false); setResult(null); setProgress(0); if (inputRef.current) inputRef.current.value = ''; };
  const valid = rows.filter(r => r.valid).length;
  const invalid = rows.length - valid;
  const mappingCoverage = useMemo(() => mappings.length ? Math.round((mappings.filter(m => m.mappedField).length / mappings.length) * 100) : 0, [mappings]);
  const qualityVariant = quality >= 75 ? 'success' : quality >= 50 ? 'warning' : 'danger';
  const ready = Boolean(file && fileHash && securityPassed && !duplicate && valid > 0 && (quality >= 75 || (quality >= 50 && quality < 75 && qualityApproved)));

  return <div dir="rtl" className="space-y-5 animate-fade-in">
    <PageHeader title="مركز الاستيراد" subtitle="مسار موحد: فحص أمني → تحليل → مطابقة → مراجعة → كتابة قانونية في البيانات الأساسية" />
    <TruthRail status={step === 'done' ? 'live' : error ? 'review' : step === 'upload' ? 'limited' : 'review'} period={file ? `المصدر الحالي · ${file.name}` : 'بانتظار المصدر'} />
    <Stepper step={step} />

    {step === 'upload' && <Card><CardBody>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div><h2 className="text-lg font-semibold">ابدأ عملية استيراد موثوقة</h2><p className="text-sm text-ink-500 mt-1">لا تتم الكتابة قبل اجتياز الفحص والمراجعة والتحقق من سياق الحساب.</p></div>
        <Badge variant="neutral"><LockKeyhole size={13}/> عزل الحساب مفعل</Badge>
      </div>
      <div className="mb-5"><label className="block text-sm font-medium text-ink-700 mb-2">ما الذي ستستورده؟</label><div className="grid grid-cols-1 md:grid-cols-3 gap-3">{ENTITIES.map(e => <button type="button" key={e.value} onClick={() => setEntityType(e.value)} className={`p-4 rounded-xl border-2 text-right transition-all ${entityType === e.value ? 'border-primary-500 bg-primary-50/60 shadow-sm' : 'border-ink-100 hover:border-ink-200'}`}><div className="flex items-center justify-between"><Database size={18}/>{entityType === e.value && <CheckCircle2 size={17}/>}</div><div className="text-sm font-semibold mt-3">{e.label}</div><div className="text-xs text-ink-400 mt-1">{e.description}</div></button>)}</div></div>
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/20 transition-colors"><input ref={inputRef} type="file" className="hidden" accept=".xlsx,.xls,.xlsm,.csv,.tsv,.ods,.json,.jsonl,.xml,.txt,.md,.pdf,.docx,.jpg,.jpeg,.png,.webp,.tiff,.bmp" onChange={e => { const f=e.target.files?.[0]; if(f) void handleFile(f); }} /><Upload className="mx-auto text-primary-500 mb-3" size={30}/><h3 className="font-semibold">اختر ملفًا أو اسحبه إلى هنا</h3><p className="text-sm text-ink-500 mt-1">Excel، CSV، JSON، PDF، Word والصور</p><p className="text-xs text-ink-300 mt-3">الحد الأقصى: {MAX_FILE_SIZE / 1024 / 1024} MB</p></div>
      {error && <div className="mt-4 p-3 rounded-lg bg-danger-50 text-danger-700 text-sm flex gap-2"><AlertCircle size={16}/>{error}</div>}
    </CardBody></Card>}

    {step === 'scanning' && <Card><CardBody><div className="flex flex-col items-center py-12 gap-4"><Loader2 className="animate-spin text-primary-500" size={34}/><div className="text-center"><b>جارٍ فحص وتحليل الملف</b><p className="text-sm text-ink-500 mt-1">أمان الملف، الصيغة، البصمة، التكرار وجودة البيانات</p></div></div></CardBody></Card>}

    {step === 'preview' && file && <div className="space-y-4">
      <Card><CardBody><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3">{icon(file.format)}<div><b className="break-all">{file.name}</b><div className="text-xs text-ink-400 mt-1">{FORMAT_LABELS[file.format]} · {formatNumber(file.size)} بايت</div></div></div><div className="flex gap-2 flex-wrap"><Badge variant="success"><ShieldCheck size={12}/> أمان: ناجح</Badge><Badge variant={qualityVariant}>جودة: {quality}%</Badge><Badge variant="neutral">مطابقة: {mappingCoverage}%</Badge></div></div></CardBody></Card>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><Card><CardBody><div className="text-xs text-ink-400">إجمالي الصفوف</div><div className="text-xl font-bold mt-1">{formatNumber(rows.length)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-400">جاهز للكتابة</div><div className="text-xl font-bold mt-1 text-success-600">{formatNumber(valid)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-400">سيتم عزلها</div><div className="text-xl font-bold mt-1 text-danger-600">{formatNumber(invalid)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-400">حالة التكرار</div><div className={`text-sm font-semibold mt-2 ${duplicate ? 'text-danger-600' : 'text-success-600'}`}>{duplicate ? 'مكرر — محظور' : 'لا يوجد تكرار'}</div></CardBody></Card></div>
      {warnings.length>0 && <div className="space-y-2">{warnings.map((w,i)=><div key={i} className="p-3 rounded-lg bg-warning-50 text-warning-700 text-sm flex gap-2"><AlertTriangle size={16}/>{w}</div>)}</div>}
      {duplicate && <div className="p-4 rounded-xl border border-danger-200 bg-danger-50 text-danger-700 text-sm flex items-start gap-3"><XCircle size={18}/><div><b>الكتابة متوقفة لحماية البيانات.</b><div className="mt-1">تم اكتشاف بصمة ملف مطابقة داخل حسابك. أعد تصدير الملف أو استخدم مصدرًا جديدًا بدل إنشاء نسخة مكررة.</div></div></div>}
      {quality >= 50 && quality < 75 && !duplicate && <label className="p-4 rounded-xl border border-warning-200 bg-warning-50 text-warning-800 text-sm flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={qualityApproved} onChange={e => setQualityApproved(e.target.checked)} className="mt-1"/><span><b>موافقة جودة صريحة:</b> الجودة {quality}% تقع في نطاق المراجعة (50–74%) ويجب تأكيدك قبل الكتابة.</span></label>}
      {quality < 50 && <div className="p-4 rounded-xl border border-danger-200 bg-danger-50 text-danger-700 text-sm flex gap-2"><XCircle size={18}/> جودة البيانات أقل من 50% — الاستيراد مرفوض.</div>}
      {mappings.length>0&&<Card><CardHeader title="مطابقة الأعمدة" subtitle={`${mappingCoverage}% من أعمدة المصدر لها حقل مكتشف`}/><DataTable columns={[{key:'name',label:'عمود المصدر'},{key:'mappedField',label:'الحقل القانوني',render:(r:any)=>r.mappedField||'غير معين'},{key:'confidence',label:'الثقة',align:'center',render:(r:any)=><Badge variant={r.confidence>=80?'success':r.confidence>=50?'warning':'danger'}>{r.mappedField?r.confidence+'%':'—'}</Badge>}]} data={mappings} emptyMessage="لا توجد أعمدة"/></Card>}
      <Card><CardHeader title="مراجعة قبل الكتابة" subtitle="تظهر أول 10 صفوف مع حالة كل صف" action={<div className="flex gap-2"><button type="button" onClick={reset} className="btn-secondary text-xs"><ArrowLeft size={13}/> اختيار ملف آخر</button><button type="button" onClick={() => void commit()} className="btn-primary text-xs" aria-label="تأكيد الاستيراد" disabled={!ready}><FileCheck2 size={13}/> اعتماد وكتابة {formatNumber(valid)} صف</button></div>}/><DataTable columns={[{key:'rowNumber',label:'#',align:'center' as const}, ...headers.slice(0,6).map(h=>({key:h,label:h,render:(r:Row)=>String(r.data[h]??'')})), {key:'status',label:'الحالة',align:'center' as const,render:(r:Row)=>r.valid?<Badge variant="success">صالح</Badge>:<Badge variant="danger">مرفوض</Badge>}, {key:'error',label:'الملاحظة',render:(r:Row)=>r.error||'—'}]} data={rows.slice(0,10)} emptyMessage="لا توجد بيانات"/></Card>
      {!ready && <div className="p-3 rounded-lg bg-ink-50 text-ink-600 text-sm">الاعتماد متوقف حتى تتوفر بيانات صالحة، جودة لا تقل عن 75% أو موافقة صريحة ضمن 50–74%، وعدم وجود تكرار، مع نجاح الفحص الأمني.</div>}
      {error&&<div className="p-3 rounded-lg bg-danger-50 text-danger-700 text-sm flex gap-2"><AlertCircle size={16}/>{error}</div>}
    </div>}

    {step === 'committing' && <Card><CardBody><div className="flex flex-col items-center py-12 gap-4"><Loader2 className="animate-spin text-primary-500" size={34}/><b>جارٍ تنفيذ دورة الإنتاج الكاملة...</b><span className="text-lg font-semibold">{progress}%</span><div className="w-full max-w-xl h-2 bg-ink-100 rounded-full overflow-hidden"><div className="h-full bg-primary-500 rounded-full transition-all" style={{width:`${progress}%`}}/></div><p className="text-xs text-ink-400">المعاملة المركزية تُنفذ مرة واحدة، ولا يُثبت committed قبل نجاح الكتابة الذرية.</p></div></CardBody></Card>}

    {step === 'done' && result && <Card><CardBody><div className="flex flex-col items-center py-10 gap-4"><CheckCircle2 className="text-success-500" size={52}/><h3 className="text-xl font-semibold">اكتملت عملية الاستيراد</h3><div className="grid grid-cols-3 gap-3 w-full max-w-lg text-center"><div className="p-3 rounded-lg bg-ink-50"><div className="text-xs text-ink-400">الإجمالي</div><b>{formatNumber(result.total)}</b></div><div className="p-3 rounded-lg bg-success-50"><div className="text-xs text-success-700">تمت الكتابة</div><b>{formatNumber(result.valid)}</b></div><div className="p-3 rounded-lg bg-danger-50"><div className="text-xs text-danger-700">مرفوض</div><b>{formatNumber(result.invalid)}</b></div></div><p className="text-xs text-ink-400">معرّف العملية: {result.importId}</p><p className="text-xs text-ink-400">Durable job: {result.jobId}</p><button type="button" onClick={reset} className="btn-primary"><Upload size={14}/> استيراد ملف آخر</button></div></CardBody></Card>}

    <Card><CardHeader title="سجل الاستيرادات" subtitle="تاريخ العمليات المرتبطة بحسابك" action={<button type="button" onClick={() => void loadHistory()} className="btn-secondary text-xs"><RefreshCw size={13}/> تحديث</button>}/>{loadingHistory?<LoadingState message="جارٍ تحميل السجل..."/>:history.length===0?<EmptyState icon={<Database size={32}/>} title="لا توجد استيرادات سابقة" message="ابدأ باستيراد ملفك الأول"/>:<DataTable columns={[{key:'file_name',label:'الملف'},{key:'entity_type',label:'النوع'},{key:'total_rows',label:'الصفوف',align:'center'},{key:'valid_rows',label:'صالح',align:'center'},{key:'invalid_rows',label:'مرفوض',align:'center'},{key:'status',label:'الحالة',align:'center',render:(r:any)=><StatusBadge status={r.status}/>},{key:'created_at',label:'التاريخ',render:(r:any)=>formatDateTime(r.created_at)}]} data={history} emptyMessage="لا توجد استيرادات"/>}</Card>
  </div>;
}
