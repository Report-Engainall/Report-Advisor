import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Upload, FileSpreadsheet, FileText, FileImage, FileType, Database, CheckCircle2, XCircle, AlertCircle, AlertTriangle, ShieldCheck, Loader2, ArrowLeft, LockKeyhole, FileCheck2, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { PageHeader, LoadingState, EmptyState } from '@/components/ui/States';
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

type Step = 'upload' | 'scanning' | 'preview' | 'saving' | 'done';
interface Row { rowNumber: number; data: Record<string, any>; valid: boolean; error?: string }

const DOMAIN_LABELS: Record<string, string> = {
  inventory: 'بيانات تشغيلية',
  sales: 'نشاط تجاري',
  purchases: 'نشاط توريد',
  customerBalances: 'بيانات علاقات وأرصدة',
  supplierBalances: 'بيانات علاقات وأرصدة',
  stockMovement: 'حركة تشغيلية',
  unknown: 'نطاق دلالي غير محسوم',
};

function normalizeSemanticToken(value: unknown): string {
  return String(value ?? '').trim().toLowerCase().replace(/[\s_\-./]+/g, '');
}

function inferGenericDomain(dataset: Dataset): { domain: string; confidence: number; reason: string } {
  const columns = dataset.columns.map((column) => column.mappedField ?? column.name);
  const tokens = new Set(columns.map(normalizeSemanticToken));
  const scores: Array<{ domain: string; hits: number; hints: string[] }> = [
    { domain: 'inventory', hits: ['sku','productcode','productname','currentstock','warehouse','quantity'].filter(x => tokens.has(x)).length, hints: ['الصنف','الكمية','المخزن','الرصيد'] },
    { domain: 'sales', hits: ['productcode','quantity','netamount','price','documentdate'].filter(x => tokens.has(x)).length, hints: ['الحركة','القيمة','التاريخ','السعر'] },
    { domain: 'purchases', hits: ['productcode','quantity','netamount','suppliercode','cost'].filter(x => tokens.has(x)).length, hints: ['المورد','التكلفة','الكمية','القيمة'] },
    { domain: 'customerBalances', hits: ['customercode','customername','netamount','duedate'].filter(x => tokens.has(x)).length, hints: ['العميل','الرصيد','الاستحقاق'] },
    { domain: 'supplierBalances', hits: ['suppliercode','suppliername','netamount','duedate'].filter(x => tokens.has(x)).length, hints: ['المورد','الرصيد','الاستحقاق'] },
    { domain: 'stockMovement', hits: ['productcode','documentdate','quantity','warehouse'].filter(x => tokens.has(x)).length, hints: ['الحركة','الصنف','المخزن'] },
  ].sort((a,b) => b.hits - a.hits);

  const best = scores[0];
  if (!best || best.hits < 2) {
    return { domain: 'unknown', confidence: 0, reason: 'تم فهم بنية الملف، لكن لم تتوفر إشارات كافية لتثبيت نطاق أعمال بعينه.' };
  }
  const confidence = Math.min(99, Math.round(best.hits / 6 * 100));
  return {
    domain: best.domain,
    confidence,
    reason: `استند الاكتشاف إلى ${best.hits} إشارات دلالية من الأعمدة والمحتوى: ${best.hints.join('، ')}.`,
  };
}

const STEPS: Array<{ key: Step; label: string }> = [
  { key: 'upload', label: 'الملف' },
  { key: 'scanning', label: 'الفحص' },
  { key: 'preview', label: 'المراجعة' },
  { key: 'saving', label: 'حفظ التحليل' },
  { key: 'done', label: 'النتيجة' },
];

function icon(format: FileFormat) {
  if (['xlsx', 'xls', 'xlsm', 'csv', 'tsv', 'ods'].includes(format)) return <FileSpreadsheet size={18} />;
  if (['pdf', 'docx', 'doc', 'rtf'].includes(format)) return <FileText size={18} />;
  if (['jpg', 'jpeg', 'png', 'webp', 'tiff', 'bmp'].includes(format)) return <FileImage size={18} />;
  return <FileType size={18} />;
}

function Stepper({ step }: { step: Step }) {
  const current = STEPS.findIndex(s => s.key === step);
  return <div className="grid grid-cols-5 gap-2 mb-5" aria-label="مراحل الاستيراد">
    {STEPS.map((item, index) => {
      const complete = index < current || step === 'done';
      const active = index === current && step !== 'done';
      return <div key={item.key} className={`ag-import-step rounded-[12px] border px-2.5 py-2.5 text-center text-xs ${complete ? 'ag-import-step-complete' : active ? 'ag-import-step-active' : 'ag-import-step-idle'}`}>
        <div className="font-semibold">{complete ? '✓' : index + 1}</div><div className="mt-1">{item.label}</div>
      </div>;
    })}
  </div>;
}

export function CanonicalImportPage() {
  const [step, setStep] = useState<Step>('upload');
  const [detectedDomain, setDetectedDomain] = useState('unknown');
  const [detectionConfidence, setDetectionConfidence] = useState(0);
  const [detectionReason, setDetectionReason] = useState('لم يبدأ تحليل الملف بعد.');
  const [file, setFile] = useState<{ name: string; size: number; format: FileFormat; mime: string } | null>(null);
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
  const selectedFileRef = useRef<File | null>(null);

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
      selectedFileRef.current = selected;
      setFile({ name: selected.name, size: selected.size, format: detection.format, mime: selected.type || detection.mime });
      setWarnings(detection.warnings);
      const hash = await computeSHA256(buffer);
      setFileHash(hash);
      const companyId = await resolveCurrentCompanyId();
      if (!companyId) throw new Error('TENANT_CONTEXT_REQUIRED');
      const dup = await checkDuplicate(hash, companyId, supabase);
      setDuplicate(dup.isDuplicate);
      if (dup.isDuplicate) setWarnings(prev => [...prev, 'هذا المصدر موجود مسبقًا لهذا الحساب. لن يتم حفظ نسخة تحليل مكررة.']);
      const datasets: Dataset[] = await parseFile(buffer, selected.name, detection.format);
      const dataset = datasets[0];
      if (!dataset || dataset.rowCount === 0) throw new Error('الملف فارغ أو لا يحتوي على بيانات قابلة للقراءة');
      setQuality(dataset.qualityScore);
      setMappings(dataset.columns.map(c => ({ name: c.name, mappedField: c.mappedField, confidence: c.mappingConfidence })));
      const hdrs = dataset.columns.map(c => c.name);
      setHeaders(hdrs);
      const detectionResult = inferGenericDomain(dataset);
      setDetectedDomain(detectionResult.domain);
      setDetectionConfidence(detectionResult.confidence);
      setDetectionReason(detectionResult.reason);
      setRows(dataset.rows.map((data, i) => ({ rowNumber: i + 1, data, valid: true })));
      setStep('preview');
    } catch (e: any) {
      setError(e?.message || 'فشل قراءة الملف'); setStep('upload');
    }
  }, []);

  const finishImportJob = async (
    importJobId: string,
    status: 'completed' | 'partial' | 'failed' | 'cancelled',
    resultSummary: Record<string, unknown>,
    errorMessage?: string,
  ): Promise<void> => {
    const { error } = await supabase.rpc('import_finish_job', {
      p_job_id: importJobId,
      p_status: status,
      p_result_summary: resultSummary,
      p_error_message: errorMessage ?? null,
    });
    if (error) throw error;
  };

  const saveAnalysis = useCallback(async () => {
    const validRows = rows.filter(r => r.valid);
    if (detectedDomain === 'unknown') {
      setError('النطاق الدلالي غير محسوم بعد. راجع المطابقة قبل الاعتماد.');
      return;
    }
    if (!validRows.length || !file || !fileHash || duplicate || !securityPassed) return;
    if (quality < 50) { setError('جودة البيانات أقل من 50% — الاستيراد مرفوض.'); return; }
    if (quality < 75 && !qualityApproved) { setError('جودة البيانات بين 50% و74% وتتطلب موافقة صريحة قبل الاعتماد.'); return; }

    setStep('saving');
    setProgress(10);
    setError(null);
    let importJobId: string | null = null;

    try {
      const companyId = await resolveCurrentCompanyId();
      if (!companyId) throw new Error('TENANT_CONTEXT_REQUIRED');
      const sourceFile = selectedFileRef.current;
      if (!sourceFile) throw new Error('SOURCE_FILE_NOT_AVAILABLE');

      const extension = (sourceFile.name.split('.').pop() || 'bin')
        .toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) || 'bin';
      const sourceObjectPath = `${companyId}/imports/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(sourceObjectPath, sourceFile, { contentType: file.mime, upsert: false });
      if (uploadError) throw new Error(`SOURCE_UPLOAD_FAILED:${uploadError.message}`);

      setProgress(30);

      const entityType = `generic:${detectedDomain}`;
      const rec = await createImportRecord({
        file_name: file.name,
        file_size: file.size,
        source_type: file.format,
        file_mime: file.mime,
        source_object_path: sourceObjectPath,
        status: 'processing',
        total_rows: rows.length,
        valid_rows: validRows.length,
        invalid_rows: rows.length - validRows.length,
        quarantined_rows: rows.length - validRows.length,
        entity_type: entityType,
        progress: 0,
      });
      importJobId = rec.id;

      setProgress(45);

      const durableSourceHash = `sha256:${fileHash}`;
      const reconciled = reconcileForCanonical(
        entityType,
        companyId,
        file.name,
        durableSourceHash,
        rec.id,
        (data, rowNumber) => `${durableSourceHash}:${rowNumber}:${JSON.stringify(data)}`,
        validRows.map(r => ({ rowNumber: r.rowNumber, data: r.data })),
      );
      if (reconciled.rejected.length > 0) {
        throw new Error(`CANONICAL_RECONCILIATION_REJECTED:${reconciled.rejected.map(r => `${r.rowNumber}:${r.reason}`).join(',')}`);
      }

      setProgress(60);

      const execution = await runCanonicalImportThroughDurableRunner({
        importId: rec.id,
        fileName: file.name,
        sourceHash: durableSourceHash,
        entityType,
        rows: reconciled.rows,
        qualityScore: quality,
      });

      setProgress(88);

      const previewRows = validRows.slice(0, 25).map((row) => row.data);
      let snapshotId: string | null = null;
      try {
        const { data: snapshot, error: snapshotError } = await supabase
          .from('source_analysis_snapshots')
          .insert({
            company_id: companyId,
            import_job_id: rec.id,
            source_hash: durableSourceHash,
            source_path: sourceObjectPath,
            source_format: file.format,
            analysis_status: 'analyzed',
            entity_type: detectedDomain,
            quality_score: quality,
            row_count: rows.length,
            column_count: headers.length,
            datasets: [{
              name: file.name,
              rowCount: rows.length,
              columnCount: headers.length,
              columns: mappings,
              preview: previewRows,
            }],
            canonical_text: [
              `source=${file.name}`,
              `detected_domain=${detectedDomain}`,
              `detection_confidence=${detectionConfidence}%`,
              detectionReason,
            ].join(' | '),
            visual_assets: [],
            warnings,
            metadata: {
              fileName: file.name,
              fileSize: file.size,
              mappingCoverage,
              detectionConfidence,
              detectedDomain,
              detectionReason,
              canonicalWriteStatus: 'GENERAL_CANONICAL_DATASET',
              committed: validRows.length,
              jobId: execution.jobId,
            },
          })
          .select('id')
          .single();
        if (!snapshotError) snapshotId = snapshot?.id ?? null;
      } catch {
        snapshotId = null;
      }

      await finishImportJob(rec.id, 'completed', {
        total: rows.length,
        valid: validRows.length,
        invalid: rows.length - validRows.length,
        committed: validRows.length,
        importId: rec.id,
        jobId: execution.jobId,
        file_name: file.name,
        detected_domain: detectedDomain,
        snapshot_id: snapshotId,
      });

      setProgress(100);
      setResult({
        total: rows.length,
        valid: validRows.length,
        invalid: rows.length - validRows.length,
        snapshotId,
        importId: rec.id,
        jobId: execution.jobId,
        detectedDomain,
      });
      setStep('done');
      await loadHistory();
    } catch (cause) {
      const failureMessage = cause instanceof Error ? cause.message : 'تعذر اعتماد المصدر';
      if (importJobId) {
        try {
          await finishImportJob(importJobId, 'failed', {
            total: rows.length,
            valid: validRows.length,
            invalid: rows.length - validRows.length,
            importId: importJobId,
            detected_domain: detectedDomain,
          }, failureMessage);
        } catch (finishError) {
          setError(`فشل الاعتماد — وتعذر إغلاق سجل العملية بأمان: ${finishError instanceof Error ? finishError.message : 'IMPORT_FINISH_FAILED'}`);
          setStep('preview');
          return;
        }
      }
      setError(`فشل اعتماد المصدر: ${failureMessage}`);
      setStep('preview');
    }
  }, [
    rows, file, fileHash, detectedDomain, duplicate, securityPassed, quality,
    qualityApproved, headers.length, mappings, warnings, detectionConfidence,
    detectionReason, mappingCoverage, loadHistory,
  ]);

  const reset = () => { selectedFileRef.current = null; setStep('upload'); setFile(null); setFileHash(null); setRows([]); setHeaders([]); setQuality(0); setQualityApproved(false); setMappings([]); setWarnings([]); setError(null); setDuplicate(false); setSecurityPassed(false); setResult(null); setProgress(0); setDetectedDomain('unknown'); setDetectionConfidence(0); setDetectionReason('لم يبدأ تحليل الملف بعد.'); if (inputRef.current) inputRef.current.value = ''; };
  const valid = rows.filter(r => r.valid).length;
  const invalid = rows.length - valid;
  const mappingCoverage = useMemo(() => mappings.length ? Math.round((mappings.filter(m => m.mappedField).length / mappings.length) * 100) : 0, [mappings]);
  const qualityVariant = quality >= 75 ? 'success' : quality >= 50 ? 'warning' : 'danger';
  const ready = Boolean(detectedDomain !== 'unknown' && file && fileHash && securityPassed && !duplicate && valid > 0 && (quality >= 75 || (quality >= 50 && quality < 75 && qualityApproved)));

  return <div className="space-y-5 animate-fade-in">
    <PageHeader title="مركز الاستيراد" subtitle="مسار موحد: فحص أمني → فهم المحتوى → مطابقة → جودة → حفظ دليل التحليل" />
    <Stepper step={step} />

    {step === 'upload' && <Card><CardBody>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div><h2 className="text-lg font-semibold">ابدأ تحليل أي مصدر</h2><p className="text-sm text-ink-500 mt-1">لا يتم إدخال البيانات إلى الحقيقة الكانونية قبل اكتمال فهم المصدر وعقد الكتابة العام.</p></div>
        <Badge variant="neutral"><LockKeyhole size={13}/> عزل الحساب مفعل</Badge>
      </div>
      <div className="mb-5 rounded-[14px] border border-primary-100 bg-primary-50/50 p-4">
        <div className="flex items-start gap-3">
          <Database size={18} className="mt-0.5 shrink-0 text-primary-700"/>
          <div>
            <div className="text-sm font-black text-ink-900">لا تختَر نوع السجل قبل قراءة الملف</div>
            <p className="mt-1 text-xs leading-5 text-ink-600">يرفع المستخدم الملف أولًا؛ النظام يقرأ الصيغة والأعمدة والمحتوى ثم يقترح التخصص. النظام يحدد النطاق دلاليًا بعد الفهم، ويطلب مراجعة عندما لا تكون الأدلة كافية.</p>
          </div>
        </div>
      </div>
      <div onClick={() => inputRef.current?.click()} className="ag-import-dropzone border-2 border-dashed rounded-[18px] p-10 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/20 transition-colors"><input ref={inputRef} type="file" className="hidden" accept=".xlsx,.xls,.xlsm,.csv,.tsv,.ods,.json,.jsonl,.xml,.txt,.md,.pdf,.docx,.jpg,.jpeg,.png,.webp,.tiff,.bmp" onChange={e => { const f=e.target.files?.[0]; if(f) void handleFile(f); }} /><Upload className="mx-auto text-primary-500 mb-3" size={30}/><h3 className="font-semibold">اختر ملفًا أو اسحبه إلى هنا</h3><p className="text-sm text-ink-500 mt-1">Excel، CSV، JSON، PDF، Word والصور</p><p className="text-xs text-ink-300 mt-3">الحد الأقصى: {MAX_FILE_SIZE / 1024 / 1024} MB</p></div>
      {error && <div className="mt-4 p-3 rounded-lg bg-danger-50 text-danger-700 text-sm flex gap-2"><AlertCircle size={16}/>{error}</div>}
    </CardBody></Card>}

    {step === 'scanning' && <Card><CardBody><div className="flex flex-col items-center py-12 gap-4"><Loader2 className="animate-spin text-primary-500" size={34}/><div className="text-center"><b>جارٍ فحص وتحليل الملف</b><p className="text-sm text-ink-500 mt-1">أمان الملف، الصيغة، البصمة، التكرار وجودة البيانات</p></div></div></CardBody></Card>}

    {step === 'preview' && file && <div className="space-y-4">
      <Card><CardBody><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3">{icon(file.format)}<div><b className="break-all">{file.name}</b><div className="text-xs text-ink-400 mt-1">{FORMAT_LABELS[file.format]} · {formatNumber(file.size)} بايت</div></div></div><div className="flex gap-2 flex-wrap"><Badge variant="success"><ShieldCheck size={12}/> أمان: ناجح</Badge><Badge variant={qualityVariant}>جودة: {quality}%</Badge><Badge variant="neutral">مطابقة: {mappingCoverage}%</Badge></div></div></CardBody></Card>
      <Card>
        <CardBody>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="text-[10px] font-black tracking-[.08em] text-primary-700">AUTOMATIC DOMAIN DETECTION</div>
              <div className="mt-1 text-sm font-black text-ink-950">{DOMAIN_LABELS[detectedDomain] ?? 'نطاق أعمال مكتشف'}</div>
              <div className="mt-1 text-[11px] leading-5 text-ink-500">{detectionReason}</div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={detectionConfidence >= 75 ? 'badge-success' : detectionConfidence > 0 ? 'badge-warning' : 'badge-neutral'}>ثقة الاكتشاف {detectionConfidence || 0}%</span>
              <span className="badge-neutral">الاكتشاف تلقائي</span>
            </div>
          </div>
        </CardBody>
      </Card>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><Card><CardBody><div className="text-xs text-ink-400">إجمالي الصفوف</div><div className="text-xl font-bold mt-1">{formatNumber(rows.length)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-400">جاهز للتحليل</div><div className="text-xl font-bold mt-1 text-success-600">{formatNumber(valid)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-400">تحتاج مراجعة</div><div className="text-xl font-bold mt-1 text-danger-600">{formatNumber(invalid)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-400">حالة التكرار</div><div className={`text-sm font-semibold mt-2 ${duplicate ? 'text-danger-600' : 'text-success-600'}`}>{duplicate ? 'مكرر — محظور' : 'لا يوجد تكرار'}</div></CardBody></Card></div>
      {warnings.length>0 && <div className="space-y-2">{warnings.map((w,i)=><div key={i} className="p-3 rounded-lg bg-warning-50 text-warning-700 text-sm flex gap-2"><AlertTriangle size={16}/>{w}</div>)}</div>}
      {duplicate && <div className="p-4 rounded-xl border border-danger-200 bg-danger-50 text-danger-700 text-sm flex items-start gap-3"><XCircle size={18}/><div><b>الكتابة متوقفة لحماية البيانات.</b><div className="mt-1">تم اكتشاف بصمة ملف مطابقة داخل حسابك. أعد تصدير الملف أو استخدم مصدرًا جديدًا بدل إنشاء نسخة مكررة.</div></div></div>}
      {quality >= 50 && quality < 75 && !duplicate && <label className="p-4 rounded-xl border border-warning-200 bg-warning-50 text-warning-800 text-sm flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={qualityApproved} onChange={e => setQualityApproved(e.target.checked)} className="mt-1"/><span><b>موافقة جودة صريحة:</b> الجودة {quality}% تقع في نطاق المراجعة (50–74%) ويجب تأكيدك قبل الكتابة.</span></label>}
      {quality < 50 && <div className="p-4 rounded-xl border border-danger-200 bg-danger-50 text-danger-700 text-sm flex gap-2"><XCircle size={18}/> جودة البيانات أقل من 50% — الاستيراد مرفوض.</div>}
      {mappings.length>0&&<Card><CardHeader title="مطابقة الأعمدة" subtitle={`${mappingCoverage}% من أعمدة المصدر لها حقل مكتشف`}/><DataTable columns={[{key:'name',label:'عمود المصدر'},{key:'mappedField',label:'الحقل القانوني',render:(r:any)=>r.mappedField||'غير معين'},{key:'confidence',label:'الثقة',align:'center',render:(r:any)=><Badge variant={r.confidence>=80?'success':r.confidence>=50?'warning':'danger'}>{r.mappedField?r.confidence+'%':'—'}</Badge>}]} data={mappings} emptyMessage="لا توجد أعمدة"/></Card>}
      <Card><CardHeader title="مراجعة قبل الكتابة" subtitle="تظهر أول 10 صفوف مع حالة كل صف" action={<div className="flex gap-2"><button type="button" onClick={reset} className="btn-secondary text-xs"><ArrowLeft size={13}/> اختيار ملف آخر</button><button type="button" onClick={() => void saveAnalysis()} className="btn-primary text-xs" aria-label="تأكيد الاستيراد" disabled={!ready}><FileCheck2 size={13}/> حفظ التحليل الموثق — {formatNumber(valid)} صف</button></div>}/><DataTable columns={[{key:'rowNumber',label:'#',align:'center' as const}, ...headers.slice(0,6).map(h=>({key:h,label:h,render:(r:Row)=>String(r.data[h]??'')})), {key:'status',label:'الحالة',align:'center' as const,render:(r:Row)=>r.valid?<Badge variant="success">صالح</Badge>:<Badge variant="danger">مرفوض</Badge>}, {key:'error',label:'الملاحظة',render:(r:Row)=>r.error||'—'}]} data={rows.slice(0,10)} emptyMessage="لا توجد بيانات"/></Card>
      {!ready && <div className="p-3 rounded-lg bg-ink-50 text-ink-600 text-sm">الحفظ متوقف حتى تتوفر بيانات قابلة للقراءة، جودة لا تقل عن 75% أو موافقة صريحة ضمن 50–74%، وعدم وجود مصدر مكرر، مع نجاح الفحص الأمني.</div>}
      {error&&<div className="p-3 rounded-lg bg-danger-50 text-danger-700 text-sm flex gap-2"><AlertCircle size={16}/>{error}</div>}
    </div>}

    {step === 'saving' && <Card><CardBody><div className="flex flex-col items-center py-12 gap-4"><Loader2 className="animate-spin text-primary-500" size={34}/><b>جارٍ حفظ المصدر والتحليل الدلالي...</b><span className="text-lg font-semibold">{progress}%</span><div className="w-full max-w-xl h-2 bg-ink-100 rounded-full overflow-hidden"><div className="h-full bg-primary-500 rounded-full transition-all" style={{width:`${progress}%`}}/></div><p className="text-xs text-ink-400">هذا الحفظ يسجل المصدر والتحليل والأدلة الأولية. لا يُعلن committed ولا يكتب إلى الحقيقة الكانونية العامة.</p></div></CardBody></Card>}

    {step === 'done' && result && <Card><CardBody><div className="flex flex-col items-center py-10 gap-4"><CheckCircle2 className="text-success-500" size={52}/><h3 className="text-xl font-semibold">تم حفظ تحليل المصدر</h3><div className="grid grid-cols-2 gap-3 w-full max-w-lg text-center"><div className="p-3 rounded-lg bg-ink-50"><div className="text-xs text-ink-400">الصفوف المقروءة</div><b>{formatNumber(result.total)}</b></div><div className="p-3 rounded-lg bg-primary-50"><div className="text-xs text-primary-700">النطاق المكتشف</div><b>{DOMAIN_LABELS[result.detectedDomain] ?? result.detectedDomain}</b></div></div><p className="text-xs text-ink-400">Snapshot ID: {result.snapshotId ?? 'غير متاح'}</p><p className="max-w-xl text-center text-[11px] leading-5 text-ink-500">تم اعتماد المصدر في طبقة البيانات الكانونية العامة مع بصمته وسياقه وجودته؛ لم يُنشأ مستورد متخصص ولم يُطلب اختيار جدول مستهدف.</p><button type="button" onClick={reset} className="btn-primary"><Upload size={14}/> تحليل ملف آخر</button></div></CardBody></Card>}

    <Card><CardHeader title="سجل الاستيرادات" subtitle="تاريخ عمليات المصادر والتحليل المرتبطة بحسابك" action={<button type="button" onClick={() => void loadHistory()} className="btn-secondary text-xs"><RefreshCw size={13}/> تحديث</button>}/>{loadingHistory?<LoadingState message="جارٍ تحميل السجل..."/>:history.length===0?<EmptyState icon={<Database size={32}/>} title="لا توجد عمليات سابقة" message="ابدأ بتحليل أول مصدر"/>:<DataTable columns={[{key:'file_name',label:'المصدر'},{key:'total_rows',label:'الصفوف',align:'center'},{key:'valid_rows',label:'صالح',align:'center'},{key:'invalid_rows',label:'مراجعة',align:'center'},{key:'status',label:'الحالة',align:'center',render:(r:any)=><StatusBadge status={r.status}/>},{key:'created_at',label:'التاريخ',render:(r:any)=>formatDateTime(r.created_at)}]} data={history} emptyMessage="لا توجد عمليات سابقة"/>}</Card>
  </div>;
}
