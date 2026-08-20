import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Database, FileImage, FileSpreadsheet, FileText, FileType, Loader2, ShieldCheck, Upload, XCircle } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState, LoadingState, PageHeader } from '@/components/ui/States';
import { createImportRecord, fetchImportRecords, updateImportRecord } from '@/lib/queries';
import { supabase, COMPANY_ID } from '@/lib/supabase';
import { computeSHA256, checkDuplicate, securityScan } from '@/lib/file-engine/security';
import { detectFormat } from '@/lib/file-engine/detector';
import { parseFile } from '@/lib/file-engine/adapters';
import { FORMAT_LABELS, MAX_FILE_SIZE, type Dataset, type FileFormat } from '@/lib/file-engine/types';

type ImportStep = 'upload' | 'scanning' | 'preview' | 'committing' | 'done';
type EntityType = 'products' | 'customers' | 'sales_invoices';
type Row = { rowNumber: number; data: Record<string, any>; valid: boolean; error?: string };

const ENTITY_CONFIG: Record<EntityType, { label: string; required: string[]; aliases: Record<string, string[]> }> = {
  products: {
    label: 'المنتجات',
    required: ['sku', 'name'],
    aliases: {
      sku: ['sku', 'item code', 'product code', 'item number', 'رقم الصنف', 'كود الصنف'],
      name: ['name', 'item name', 'product name', 'description', 'اسم الصنف', 'اسم المنتج', 'الوصف'],
      unit: ['unit', 'uom', 'الوحدة'],
      cost_price: ['cost', 'cost price', 'purchase price', 'التكلفة', 'سعر التكلفة'],
      selling_price: ['price', 'selling price', 'sale price', 'السعر', 'سعر البيع'],
      min_stock: ['min stock', 'minimum stock', 'الحد الأدنى'],
      reorder_point: ['reorder point', 'reorder', 'نقطة إعادة الطلب'],
    },
  },
  customers: {
    label: 'العملاء',
    required: ['name'],
    aliases: {
      name: ['name', 'customer name', 'client', 'الاسم', 'اسم العميل', 'العميل'],
      code: ['code', 'customer code', 'customer number', 'رقم العميل', 'كود العميل'],
      phone: ['phone', 'mobile', 'telephone', 'الهاتف', 'الجوال'],
      email: ['email', 'البريد', 'البريد الإلكتروني'],
      segment: ['segment', 'classification', 'التصنيف'],
      credit_limit: ['credit limit', 'حد الائتمان'],
      payment_terms_days: ['payment terms', 'terms days', 'أيام الائتمان'],
    },
  },
  sales_invoices: {
    label: 'فواتير المبيعات',
    required: ['invoice_number', 'invoice_date', 'customer_name', 'total'],
    aliases: {
      invoice_number: ['invoice', 'invoice number', 'invoice no', 'رقم الفاتورة', 'الفاتورة'],
      invoice_date: ['date', 'invoice date', 'transaction date', 'التاريخ', 'تاريخ الفاتورة'],
      customer_name: ['customer', 'customer name', 'client', 'العميل', 'اسم العميل'],
      customer_code: ['customer code', 'customer number', 'رقم العميل', 'كود العميل'],
      customer_id: ['customer id', 'معرف العميل'],
      subtotal: ['subtotal', 'net', 'صافي'],
      discount_amount: ['discount', 'discount amount', 'الخصم'],
      tax_amount: ['tax', 'tax amount', 'الضريبة'],
      total: ['total', 'grand total', 'amount', 'الإجمالي', 'المبلغ'],
      paid_amount: ['paid', 'paid amount', 'المدفوع'],
      due_date: ['due date', 'تاريخ الاستحقاق'],
      status: ['status', 'الحالة'],
      sales_rep: ['sales rep', 'representative', 'مندوب المبيعات'],
    },
  },
};

function normalizeHeader(value: string) {
  return value.toLowerCase().normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/[\s_\-./]+/g, ' ').trim();
}

function normalizeDigits(value: any): any {
  if (typeof value !== 'string') return value;
  return value.replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).trim();
}

function numeric(value: any) {
  const cleaned = normalizeDigits(value);
  if (cleaned === null || cleaned === undefined || cleaned === '') return '';
  const text = String(cleaned).replace(/,/g, '').replace(/[^0-9.\-]/g, '');
  const n = Number(text);
  return Number.isFinite(n) ? n : cleaned;
}

function mapRow(row: Record<string, any>, entity: EntityType) {
  const aliases = ENTITY_CONFIG[entity].aliases;
  const sourceKeys = Object.keys(row);
  const result: Record<string, any> = {};
  for (const [canonical, candidates] of Object.entries(aliases)) {
    const normalizedCandidates = candidates.map(normalizeHeader);
    const source = sourceKeys.find(key => normalizedCandidates.includes(normalizeHeader(key)))
      || sourceKeys.find(key => normalizedCandidates.some(candidate => normalizeHeader(key).includes(candidate) || candidate.includes(normalizeHeader(key))));
    if (source) result[canonical] = normalizeDigits(row[source]);
  }
  if (entity === 'products') {
    for (const key of ['cost_price', 'selling_price', 'min_stock', 'reorder_point']) result[key] = numeric(result[key]);
  }
  if (entity === 'customers') {
    for (const key of ['credit_limit', 'payment_terms_days']) result[key] = numeric(result[key]);
  }
  if (entity === 'sales_invoices') {
    for (const key of ['subtotal', 'discount_amount', 'tax_amount', 'total', 'paid_amount']) result[key] = numeric(result[key]);
  }
  return result;
}

function validateRow(data: Record<string, any>, entity: EntityType) {
  const missing = ENTITY_CONFIG[entity].required.filter(field => !data[field] && data[field] !== 0);
  if (entity === 'sales_invoices' && !data.customer_id && !data.customer_code && !data.customer_name) missing.push('customer_name');
  return missing.length ? `حقول مطلوبة ناقصة: ${Array.from(new Set(missing)).join(', ')}` : undefined;
}

function iconFor(format: FileFormat) {
  if (['xlsx', 'xls', 'xlsm', 'csv', 'tsv', 'ods'].includes(format)) return <FileSpreadsheet size={16} />;
  if (['pdf', 'docx', 'doc', 'rtf'].includes(format)) return <FileText size={16} />;
  if (['jpg', 'jpeg', 'png', 'webp', 'tiff', 'bmp'].includes(format)) return <FileImage size={16} />;
  return <FileType size={16} />;
}

export function ImportPageV2() {
  const [step, setStep] = useState<ImportStep>('upload');
  const [entity, setEntity] = useState<EntityType>('products');
  const [file, setFile] = useState<{ name: string; size: number; format: FileFormat } | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [quality, setQuality] = useState(0);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [duplicate, setDuplicate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    setHistory(await fetchImportRecords());
    setLoadingHistory(false);
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleFile = useCallback(async (selected: File) => {
    setError(null); setWarnings([]); setDuplicate(false); setRows([]); setProgress(0); setStep('scanning');
    try {
      const buffer = await selected.arrayBuffer();
      const scan = securityScan(selected, buffer);
      if (!scan.passed) throw new Error(scan.issues.join(' — '));
      const detection = detectFormat(selected, buffer);
      if (detection.format === 'unknown') throw new Error('تعذر تحديد صيغة الملف من المحتوى الفعلي.');
      setFile({ name: selected.name, size: selected.size, format: detection.format });
      setWarnings(detection.warnings);
      const hash = await computeSHA256(buffer);
      const dup = await checkDuplicate(hash, COMPANY_ID, supabase);
      setDuplicate(dup.isDuplicate);
      if (dup.isDuplicate) setWarnings(prev => [...prev, 'هذا الملف موجود مسبقًا في سجل الاستيراد. لن يتم اعتباره سببًا لإعادة الكتابة تلقائيًا.']);
      const datasets: Dataset[] = await parseFile(buffer, selected.name, detection.format);
      if (!datasets.length || !datasets[0].rows.length) throw new Error('الملف لا يحتوي على بيانات قابلة للقراءة.');
      const dataset = datasets[0];
      const mapped = dataset.rows.map((raw, index) => {
        const data = mapRow(raw, entity);
        const validationError = validateRow(data, entity);
        return { rowNumber: index + 1, data, valid: !validationError, error: validationError };
      });
      setHeaders(Object.keys(mapped[0]?.data || {}));
      setRows(mapped);
      setQuality(dataset.qualityScore);
      setStep('preview');
    } catch (e: any) {
      setError(e?.message || 'فشل تحليل الملف.');
      setStep('upload');
    }
  }, [entity]);

  const commit = useCallback(async () => {
    if (!file) return;
    const valid = rows.filter(r => r.valid);
    if (!valid.length) { setError('لا توجد صفوف صالحة للاستيراد.'); return; }
    setError(null); setProgress(0); setStep('committing');
    try {
      const importRecord = await createImportRecord({
        file_name: file.name,
        file_size: file.size,
        source_type: file.format,
        status: 'processing',
        total_rows: rows.length,
        valid_rows: valid.length,
        invalid_rows: rows.length - valid.length,
        quarantined_rows: rows.length - valid.length,
        entity_type: entity,
        progress: 0,
      });
      const { data: jobId, error: jobError } = await supabase.rpc('start_import_job', {
        p_company_id: COMPANY_ID,
        p_file_record_id: null,
        p_profile_id: null,
        p_job_type: entity,
        p_total_rows: valid.length,
      });
      if (jobError) throw jobError;
      const chunkSize = 500;
      let processed = 0;
      let inserted = 0;
      let updated = 0;
      let failed = 0;
      for (let i = 0; i < valid.length; i += chunkSize) {
        const chunk = valid.slice(i, i + chunkSize);
        const { data, error: chunkError } = await supabase.rpc('import_upsert_chunk', {
          p_job_id: jobId,
          p_entity_type: entity,
          p_rows: chunk,
        });
        if (chunkError) throw chunkError;
        processed += Number(data?.processed || chunk.length);
        inserted += Number(data?.inserted || 0);
        updated += Number(data?.updated || 0);
        failed += Number(data?.failed || 0);
        setProgress(Math.round((processed / valid.length) * 100));
      }
      await updateImportRecord(importRecord.id, {
        status: failed > 0 ? 'completed_with_errors' : 'completed',
        progress: 100,
        completed_at: new Date().toISOString(),
        valid_rows: inserted + updated,
        invalid_rows: (rows.length - valid.length) + failed,
        quarantined_rows: (rows.length - valid.length) + failed,
      });
      setResult({ total: rows.length, accepted: valid.length, inserted, updated, failed: failed + rows.length - valid.length, importId: importRecord.id, jobId });
      setStep('done');
      loadHistory();
    } catch (e: any) {
      setError(`فشل التنفيذ الموحد للاستيراد: ${e?.message || 'خطأ غير معروف'}`);
      setStep('preview');
    }
  }, [entity, file, rows, loadHistory]);

  const reset = () => { setStep('upload'); setFile(null); setRows([]); setHeaders([]); setQuality(0); setWarnings([]); setDuplicate(false); setError(null); setProgress(0); setResult(null); };
  const validCount = useMemo(() => rows.filter(r => r.valid).length, [rows]);
  const invalidCount = rows.length - validCount;

  return <div className="space-y-6 animate-fade-in">
    <PageHeader title="مركز الاستيراد الموحد" subtitle="قراءة متعددة الصيغ، مطابقة الحقول، معاينة، ثم UPSERT آمن عبر مسار واحد فقط" />

    {step === 'upload' && <Card><CardBody>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        {(Object.entries(ENTITY_CONFIG) as [EntityType, typeof ENTITY_CONFIG[EntityType]][]).map(([key, config]) => <button key={key} onClick={() => setEntity(key)} className={`p-4 rounded-lg border-2 text-right ${entity === key ? 'border-primary-500 bg-primary-50/50' : 'border-ink-100 hover:border-ink-200'}`}>
          <Database size={18} className={entity === key ? 'text-primary-600' : 'text-ink-400'} /><div className="font-medium text-sm mt-2">{config.label}</div><div className="text-xs text-ink-400 mt-1">{config.required.length} حقول أساسية</div>
        </button>)}
      </div>
      <div onClick={() => inputRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }} className="border-2 border-dashed border-ink-200 rounded-xl p-10 text-center cursor-pointer hover:border-primary-300">
        <input ref={inputRef} className="hidden" type="file" accept=".xlsx,.xls,.xlsm,.csv,.tsv,.ods,.json,.jsonl,.xml,.txt,.md,.pdf,.docx,.rtf,.jpg,.jpeg,.png,.webp,.tiff,.bmp" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        <Upload className="mx-auto text-primary-500" size={28} /><h3 className="font-semibold mt-3">اسحب الملف هنا أو اضغط للاختيار</h3><p className="text-sm text-ink-500 mt-1">Excel, CSV, JSON, XML, PDF, Word والصور</p><p className="text-xs text-ink-300 mt-2">الحد الأقصى {MAX_FILE_SIZE / 1024 / 1024}MB</p>
      </div>
      {error && <div className="mt-4 p-3 rounded-lg bg-danger-50 text-danger-700 text-sm flex gap-2"><AlertCircle size={16} />{error}</div>}
    </CardBody></Card>}

    {step === 'scanning' && <Card><CardBody><div className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-primary-500" size={32} /><div className="font-semibold mt-3">جارٍ فحص الملف وتحليل بنيته...</div><div className="text-sm text-ink-500 mt-1">لا يتم تعديل قاعدة البيانات في هذه المرحلة.</div></div></CardBody></Card>}

    {step === 'preview' && file && <div className="space-y-4">
      <Card><CardBody><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3">{iconFor(file.format)}<div><div className="font-medium">{file.name}</div><div className="text-xs text-ink-400">{FORMAT_LABELS[file.format]} — {formatSize(file.size)}</div></div></div><div className="flex gap-2 flex-wrap"><Badge variant="success"><CheckCircle2 size={12} /> {validCount} صالح</Badge><Badge variant="danger"><XCircle size={12} /> {invalidCount} يحتاج مراجعة</Badge><Badge variant="neutral">جودة {quality}%</Badge>{duplicate && <Badge variant="warning"><AlertTriangle size={12} /> مكرر</Badge>}</div></div></CardBody></Card>
      {(warnings.length > 0 || duplicate) && <div className="space-y-2">{warnings.map((w, i) => <div key={i} className="p-3 rounded-lg bg-warning-50 text-warning-700 text-sm flex gap-2"><AlertTriangle size={16} />{w}</div>)}</div>}
      {warnings.length === 0 && <div className="p-3 rounded-lg bg-success-50 text-success-700 text-sm flex gap-2"><ShieldCheck size={16} />اجتاز الملف الفحص الأمني ولم يبدأ أي تعديل.</div>}
      <Card><CardHeader title="المعاينة والمطابقة" subtitle="القيم التي ستصل إلى محرك الاستيراد الموحد" action={<div className="flex gap-2"><button className="btn-secondary text-xs" onClick={reset}>إلغاء</button><button className="btn-primary text-xs" disabled={!validCount} onClick={commit}>تنفيذ الاستيراد ({validCount})</button></div>} /><DataTable columns={[{key:'rowNumber',label:'#',width:'50px',align:'center'}, ...headers.slice(0,8).map(h => ({key:h,label:h,render:(r:Row) => String(r.data[h] ?? '')})), {key:'status',label:'الحالة',align:'center',render:(r:Row) => r.valid ? <Badge variant="success">صالح</Badge> : <Badge variant="danger">{r.error || 'خطأ'}</Badge>}]} data={rows.slice(0,25)} emptyMessage="لا توجد بيانات" /></Card>
    </div>}

    {step === 'committing' && <Card><CardBody><div className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-primary-500" size={32} /><div className="font-semibold mt-3">جارٍ تنفيذ الاستيراد الموحد...</div><div className="text-sm text-ink-500 mt-1">المعالجة على دفعات 500 صف، مع تسجيل lineage لكل صف.</div><div className="w-full max-w-md h-2 bg-ink-100 rounded-full mx-auto mt-5 overflow-hidden"><div className="h-full bg-primary-500 transition-all" style={{width:`${progress}%`}} /></div><div className="text-xs text-ink-400 mt-2">{progress}%</div></div></CardBody></Card>}

    {step === 'done' && result && <Card><CardBody><div className="py-8 text-center"><CheckCircle2 className="mx-auto text-success-500" size={42}/><h3 className="text-lg font-semibold mt-3">اكتمل الاستيراد عبر المسار الموحد</h3><p className="text-sm text-ink-500 mt-1">تمت حماية المطابقة حسب الشركة وتسجيل نتيجة كل صف.</p><div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mt-6"><Stat label="الإجمالي" value={result.total}/><Stat label="جديد" value={result.inserted}/><Stat label="محدث" value={result.updated}/><Stat label="مرفوض" value={result.failed}/></div><button className="btn-primary mt-6" onClick={reset}>استيراد ملف آخر</button></div></CardBody></Card>}

    <Card><CardHeader title="سجل الاستيرادات" subtitle="آخر العمليات المسجلة" />{loadingHistory ? <LoadingState message="جارٍ التحميل..."/> : history.length === 0 ? <EmptyState icon={<Database size={32}/>} title="لا توجد عمليات" message="ابدأ باستيراد ملفك الأول"/> : <DataTable columns={[{key:'file_name',label:'الملف'},{key:'entity_type',label:'النوع'},{key:'total_rows',label:'الصفوف',align:'center'},{key:'valid_rows',label:'صالح',align:'center'},{key:'invalid_rows',label:'مرفوض',align:'center'},{key:'status',label:'الحالة',align:'center',render:(r:any)=><StatusBadge status={r.status}/> }]} data={history.slice(0,20)} />}</Card>
  </div>;
}

function formatSize(bytes:number){if(bytes<1024)return `${bytes} B`;if(bytes<1024*1024)return `${(bytes/1024).toFixed(1)} KB`;return `${(bytes/1024/1024).toFixed(1)} MB`;}
function Stat({label,value}:{label:string;value:number}){return <div className="p-3 rounded-lg bg-ink-50"><div className="text-xl font-bold">{value}</div><div className="text-xs text-ink-500">{label}</div></div>;}
