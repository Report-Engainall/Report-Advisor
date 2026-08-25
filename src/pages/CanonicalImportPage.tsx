import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, FileSpreadsheet, FileText, FileImage, FileType, Database, CheckCircle2, XCircle, AlertCircle, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { PageHeader, LoadingState, EmptyState } from '@/components/ui/States';
import { DataTable } from '@/components/ui/DataTable';
import { fetchImportRecords, createImportRecord, updateImportRecord } from '@/lib/queries';
import { supabase } from '@/lib/supabase';
import { formatDateTime, formatNumber } from '@/lib/format';
import { detectFormat } from '@/lib/file-engine/detector';
import { securityScan, computeSHA256, checkDuplicate } from '@/lib/file-engine/security';
import { parseFile } from '@/lib/file-engine/adapters';
import { FORMAT_LABELS, MAX_FILE_SIZE, type FileFormat, type Dataset } from '@/lib/file-engine/types';
import { commitImportBatch, type CanonicalImportRow } from '@/lib/import/canonical-commit';

type Step = 'upload' | 'scanning' | 'preview' | 'committing' | 'done';
type EntityType = 'sales_invoices' | 'products' | 'customers';
interface Row { rowNumber: number; data: Record<string, any>; valid: boolean; error?: string }

const ENTITIES: Array<{ value: EntityType; label: string; required: string[] }> = [
  { value: 'sales_invoices', label: 'فواتير المبيعات', required: ['invoice_number', 'invoice_date', 'customer_name', 'total'] },
  { value: 'products', label: 'المنتجات', required: ['sku', 'name', 'cost_price', 'selling_price'] },
  { value: 'customers', label: 'العملاء', required: ['name'] },
];

function icon(format: FileFormat) {
  if (['xlsx', 'xls', 'xlsm', 'csv', 'tsv', 'ods'].includes(format)) return <FileSpreadsheet size={16} />;
  if (['pdf', 'docx', 'doc', 'rtf'].includes(format)) return <FileText size={16} />;
  if (['jpg', 'jpeg', 'png', 'webp', 'tiff', 'bmp'].includes(format)) return <FileImage size={16} />;
  return <FileType size={16} />;
}

export function CanonicalImportPage() {
  const [step, setStep] = useState<Step>('upload');
  const [entityType, setEntityType] = useState<EntityType>('sales_invoices');
  const [file, setFile] = useState<{ name: string; size: number; format: FileFormat } | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [quality, setQuality] = useState(0);
  const [mappings, setMappings] = useState<Array<{ name: string; mappedField: string | null; confidence: number }>>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [securityPassed, setSecurityPassed] = useState(true);
  const [duplicate, setDuplicate] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try { setHistory(await fetchImportRecords()); } finally { setLoadingHistory(false); }
  }, []);
  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleFile = useCallback(async (selected: File) => {
    setError(null); setWarnings([]); setDuplicate(false); setStep('scanning');
    try {
      const buffer = await selected.arrayBuffer();
      const scan = securityScan(selected, buffer);
      setSecurityPassed(scan.passed);
      if (!scan.passed) throw new Error(scan.issues.join(' — '));
      const detection = detectFormat(selected, buffer);
      if (detection.format === 'unknown') throw new Error('تعذر تحديد صيغة الملف');
      setFile({ name: selected.name, size: selected.size, format: detection.format });
      if (detection.warnings.length) setWarnings(detection.warnings);
      const hash = await computeSHA256(buffer);
      const dup = await checkDuplicate(hash, supabase);
      setDuplicate(dup.isDuplicate);
      if (dup.isDuplicate) setWarnings(prev => [...prev, 'تم استيراد هذا الملف من قبل']);
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
    const valid = rows.filter(r => r.valid);
    if (!valid.length || !file) return;
    setStep('committing'); setProgress(0); setError(null);
    try {
      const rec = await createImportRecord({ file_name: file.name, file_size: file.size, source_type: file.format, status: 'processing', total_rows: rows.length, valid_rows: valid.length, invalid_rows: rows.length - valid.length, quarantined_rows: rows.length - valid.length, entity_type: entityType, progress: 0 });
      const batchSize = 50; let committed = 0;
      for (let i = 0; i < valid.length; i += batchSize) {
        const batch: CanonicalImportRow[] = valid.slice(i, i + batchSize).map(r => ({ rowNumber: r.rowNumber, data: r.data }));
        await commitImportBatch(entityType, batch);
        committed += batch.length;
        setProgress(Math.round((committed / valid.length) * 100));
      }
      await updateImportRecord(rec.id, { status: 'completed', progress: 100, completed_at: new Date().toISOString() });
      setResult({ total: rows.length, valid: valid.length, invalid: rows.length - valid.length, importId: rec.id });
      setStep('done'); await loadHistory();
    } catch (e: any) {
      setError(`فشل الاستيراد: ${e?.message || 'خطأ غير معروف'}`); setStep('preview');
    }
  }, [rows, file, entityType, loadHistory]);

  const reset = () => { setStep('upload'); setFile(null); setRows([]); setHeaders([]); setQuality(0); setMappings([]); setWarnings([]); setError(null); setDuplicate(false); setResult(null); setProgress(0); };
  const valid = rows.filter(r => r.valid).length;
  const invalid = rows.length - valid;

  return <div className="space-y-6 animate-fade-in">
    <PageHeader title="مركز الاستيراد" subtitle="استيراد آمن مع فحص الملف واكتشاف الصيغة والمعاينة قبل الكتابة" />
    {step === 'upload' && <Card><CardBody>
      <div className="mb-5"><label className="block text-sm font-medium text-ink-700 mb-2">نوع البيانات</label><div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{ENTITIES.map(e => <button key={e.value} onClick={() => setEntityType(e.value)} className={`p-4 rounded-lg border-2 text-right ${entityType === e.value ? 'border-primary-500 bg-primary-50/50' : 'border-ink-100'}`}><Database size={18}/><div className="text-sm font-medium mt-2">{e.label}</div><div className="text-[11px] text-ink-400">{e.required.length} حقول مطلوبة</div></button>)}</div></div>
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:border-primary-400 transition-colors"><input ref={inputRef} type="file" className="hidden" accept=".xlsx,.xls,.xlsm,.csv,.tsv,.ods,.json,.jsonl,.xml,.txt,.md,.pdf,.docx,.jpg,.jpeg,.png,.webp,.tiff,.bmp" onChange={e => { const f=e.target.files?.[0]; if(f) void handleFile(f); }} /><Upload className="mx-auto text-primary-500 mb-3" size={28}/><h3 className="font-semibold">اختر ملفًا للاستيراد</h3><p className="text-sm text-ink-500 mt-1">Excel، CSV، JSON، PDF، Word والصور</p><p className="text-xs text-ink-300 mt-3">الحد الأقصى: {MAX_FILE_SIZE / 1024 / 1024} MB</p></div>
      {error && <div className="mt-4 p-3 rounded-lg bg-danger-50 text-danger-700 text-sm flex gap-2"><AlertCircle size={16}/>{error}</div>}
    </CardBody></Card>}
    {step === 'scanning' && <Card><CardBody><div className="flex flex-col items-center py-10 gap-3"><Loader2 className="animate-spin text-primary-500" size={32}/><b>جارٍ فحص وتحليل الملف...</b>{file && <span className="text-sm text-ink-500">{file.name}</span>}</div></CardBody></Card>}
    {step === 'preview' && file && <div className="space-y-4">
      <Card><CardBody><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3">{icon(file.format)}<div><b>{file.name}</b><div className="text-xs text-ink-400">{FORMAT_LABELS[file.format]} — {formatNumber(file.size)} بايت</div></div></div><div className="flex gap-2 flex-wrap"><Badge variant="success"><CheckCircle2 size={12}/> {valid} صالح</Badge>{invalid>0&&<Badge variant="danger"><XCircle size={12}/> {invalid} مرفوض</Badge>}<Badge variant="neutral">{rows.length} إجمالي</Badge>{quality>0&&<Badge variant={quality>=80?'success':quality>=60?'warning':'danger'}>جودة: {quality}%</Badge>}</div></div></CardBody></Card>
      {(warnings.length>0||duplicate)&&<div className="space-y-2">{warnings.map((w,i)=><div key={i} className="p-3 rounded-lg bg-warning-50 text-warning-700 text-sm flex gap-2"><AlertTriangle size={16}/>{w}</div>)}</div>}
      {securityPassed&&warnings.length===0&&<div className="p-3 rounded-lg bg-success-50 text-success-700 text-sm flex gap-2"><ShieldCheck size={16}/> اجتاز الملف الفحص الأمني</div>}
      {mappings.length>0&&<Card><CardHeader title="تعيين الأعمدة" subtitle="الربط المكتشف من محرك الملفات"/><DataTable columns={[{key:'name',label:'عمود الملف'},{key:'mappedField',label:'الحقل المقابل',render:(r:any)=>r.mappedField||'غير معين'},{key:'confidence',label:'الثقة',align:'center',render:(r:any)=><Badge variant={r.confidence>=80?'success':r.confidence>=50?'warning':'danger'}>{r.mappedField?r.confidence+'%':'—'}</Badge>}]} data={mappings} emptyMessage="لا توجد أعمدة"/></Card>}
      <Card><CardHeader title="معاينة البيانات" subtitle="أول 10 صفوف" action={<div className="flex gap-2"><button onClick={reset} className="btn-secondary text-xs">إلغاء</button><button onClick={() => void commit()} className="btn-primary text-xs" disabled={!valid}>تأكيد الاستيراد ({valid})</button></div>}/><DataTable columns={[{key:'rowNumber',label:'#',align:'center' as const}, ...headers.slice(0,6).map(h=>({key:h,label:h,render:(r:Row)=>String(r.data[h]??'')})), {key:'status',label:'الحالة',align:'center' as const,render:(r:Row)=>r.valid?<Badge variant="success">صالح</Badge>:<Badge variant="danger">خطأ</Badge>}]} data={rows.slice(0,10)} emptyMessage="لا توجد بيانات"/></Card>
      {error&&<div className="p-3 rounded-lg bg-danger-50 text-danger-700 text-sm">{error}</div>}
    </div>}
    {step === 'committing' && <Card><CardBody><div className="flex flex-col items-center py-10 gap-4"><Loader2 className="animate-spin text-primary-500" size={32}/><b>جارٍ تنفيذ الاستيراد المركزي...</b><span>{progress}%</span><div className="w-full max-w-md h-2 bg-ink-100 rounded-full"><div className="h-full bg-primary-500 rounded-full" style={{width:`${progress}%`}}/></div></div></CardBody></Card>}
    {step === 'done' && result && <Card><CardBody><div className="flex flex-col items-center py-8 gap-4"><CheckCircle2 className="text-success-500" size={48}/><h3 className="text-lg font-semibold">تم الاستيراد بنجاح</h3><p className="text-sm text-ink-500">{formatNumber(result.valid)} صف صالح من أصل {formatNumber(result.total)}</p><button onClick={reset} className="btn-primary">استيراد ملف آخر</button></div></CardBody></Card>}
    <Card><CardHeader title="سجل الاستيرادات" subtitle="آخر العمليات"/>{loadingHistory?<LoadingState message="جارٍ تحميل السجل..."/>:history.length===0?<EmptyState icon={<Database size={32}/>} title="لا توجد استيرادات سابقة" message="ابدأ باستيراد ملفك الأول"/>:<DataTable columns={[{key:'file_name',label:'الملف'},{key:'entity_type',label:'النوع'},{key:'total_rows',label:'الصفوف',align:'center'},{key:'valid_rows',label:'صالح',align:'center'},{key:'invalid_rows',label:'مرفوض',align:'center'},{key:'status',label:'الحالة',align:'center',render:(r:any)=><StatusBadge status={r.status}/>},{key:'created_at',label:'التاريخ',render:(r:any)=>formatDateTime(r.created_at)}]} data={history}/>}</Card>
  </div>;
}
