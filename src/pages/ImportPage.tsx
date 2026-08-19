import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Upload, FileSpreadsheet, CheckCircle2, AlertCircle, XCircle,
  Database, FileCheck, Loader2, FileText, FileImage, FileType,
  ShieldCheck, AlertTriangle,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { PageHeader, LoadingState, EmptyState } from '@/components/ui/States';
import { DataTable } from '@/components/ui/DataTable';
import { fetchImportRecords, createImportRecord, updateImportRecord } from '@/lib/queries';
import { supabase, COMPANY_ID } from '@/lib/supabase';
import { formatDateTime, formatNumber } from '@/lib/format';
import { detectFormat } from '@/lib/file-engine/detector';
import { securityScan, computeSHA256, checkDuplicate } from '@/lib/file-engine/security';
import { parseFile } from '@/lib/file-engine/adapters';
import { FORMAT_LABELS, MAX_FILE_SIZE, type FileFormat, type Dataset } from '@/lib/file-engine/types';

type ImportStep = 'upload' | 'scanning' | 'preview' | 'committing' | 'done';

interface ParsedRow {
  rowNumber: number;
  data: Record<string, any>;
  valid: boolean;
  error?: string;
}

const ENTITY_TYPES = [
  { value: 'sales_invoices', label: 'فواتير المبيعات', required: ['invoice_number', 'invoice_date', 'customer_name', 'total'] },
  { value: 'products', label: 'المنتجات', required: ['sku', 'name', 'cost_price', 'selling_price'] },
  { value: 'customers', label: 'العملاء', required: ['name'] },
];

function formatIcon(format: FileFormat) {
  if (['xlsx', 'xls', 'xlsm', 'csv', 'tsv', 'ods'].includes(format)) return <FileSpreadsheet size={16} className="text-success-500" />;
  if (['pdf', 'docx', 'doc', 'rtf'].includes(format)) return <FileText size={16} className="text-danger-500" />;
  if (['jpg', 'jpeg', 'png', 'webp', 'tiff', 'bmp'].includes(format)) return <FileImage size={16} className="text-primary-500" />;
  return <FileType size={16} className="text-ink-400" />;
}

export function ImportPage() {
  const [step, setStep] = useState<ImportStep>('upload');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [fileFormat, setFileFormat] = useState<FileFormat>('unknown');
  const [entityType, setEntityType] = useState('sales_invoices');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [securityPassed, setSecurityPassed] = useState(true);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [qualityScore, setQualityScore] = useState(0);
  const [columnMappings, setColumnMappings] = useState<{ name: string; mappedField: string | null; confidence: number }[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    const data = await fetchImportRecords();
    setHistory(data);
    setLoadingHistory(false);
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setWarnings([]);
    setFileName(file.name);
    setFileSize(file.size);
    setStep('scanning');

    try {
      const buffer = await file.arrayBuffer();

      // Security scan
      const scan = securityScan(file, buffer);
      setSecurityPassed(scan.passed);
      if (!scan.passed) {
        setError(scan.issues.join(' — '));
        setStep('upload');
        return;
      }

      // Format detection
      const detection = detectFormat(file, buffer);
      setFileFormat(detection.format);

      if (detection.format === 'unknown') {
        setError('تعذر تحديد صيغة الملف');
        setStep('upload');
        return;
      }

      if (detection.warnings.length > 0) {
        setWarnings(detection.warnings);
      }

      // Duplicate check
      const hash = await computeSHA256(buffer);
      const dupCheck = await checkDuplicate(hash, COMPANY_ID, supabase);
      setIsDuplicate(dupCheck.isDuplicate);
      if (dupCheck.isDuplicate) {
        setWarnings(prev => [...prev, 'تم استيراد هذا الملف من قبل']);
      }

      // Parse with file-engine
      const datasets: Dataset[] = await parseFile(buffer, file.name, detection.format);

      if (datasets.length === 0 || datasets[0].rowCount === 0) {
        setError('الملف فارغ أو لا يحتوي على بيانات قابلة للقراءة');
        setStep('upload');
        return;
      }

      const dataset = datasets[0];
      setQualityScore(dataset.qualityScore);
      setColumnMappings(dataset.columns.map(c => ({ name: c.name, mappedField: c.mappedField, confidence: c.mappingConfidence })));

      const hdrs = dataset.columns.map(c => c.name);
      setHeaders(hdrs);

      const entityConfig = ENTITY_TYPES.find(e => e.value === entityType)!;
      const parsed: ParsedRow[] = dataset.rows.map((row, i) => {
        const missing = entityConfig.required.filter(f => {
          const val = row[f] ?? row[hdrs.find(h => h.toLowerCase().includes(f.toLowerCase())) || ''];
          return !val && val !== 0;
        });
        return {
          rowNumber: i + 1,
          data: row,
          valid: missing.length === 0,
          error: missing.length > 0 ? `حقول مطلوبة ناقصة: ${missing.join(', ')}` : undefined,
        };
      });

      setRows(parsed);
      setStep('preview');
    } catch (e: any) {
      setError(`فشل قراءة الملف: ${e.message}`);
      setStep('upload');
    }
  }, [entityType]);

  const handleCommit = useCallback(async () => {
    setStep('committing');
    setProgress(0);

    const validRows = rows.filter(r => r.valid);
    const invalidRows = rows.filter(r => !r.valid);

    try {
      const importRec = await createImportRecord({
        file_name: fileName,
        file_size: fileSize,
        source_type: fileFormat,
        status: 'processing',
        total_rows: rows.length,
        valid_rows: validRows.length,
        invalid_rows: invalidRows.length,
        quarantined_rows: invalidRows.length,
        entity_type: entityType,
        progress: 0,
      });

      const batchSize = 50;
      let committed = 0;

      if (entityType === 'products') {
        for (let i = 0; i < validRows.length; i += batchSize) {
          const batch = validRows.slice(i, i + batchSize);
          const records = batch.map(r => ({
            company_id: COMPANY_ID,
            sku: r.data.sku || `SKU-${r.rowNumber}`,
            name: r.data.name,
            unit: r.data.unit || 'قطعة',
            cost_price: Number(r.data.cost_price) || 0,
            selling_price: Number(r.data.selling_price) || 0,
            min_stock: Number(r.data.min_stock) || 0,
            reorder_point: Number(r.data.reorder_point) || 0,
            is_active: true,
          }));
          await supabase.from('products').insert(records);
          committed += batch.length;
          setProgress(Math.round((committed / validRows.length) * 100));
        }
      } else if (entityType === 'customers') {
        for (let i = 0; i < validRows.length; i += batchSize) {
          const batch = validRows.slice(i, i + batchSize);
          const records = batch.map(r => ({
            company_id: COMPANY_ID,
            name: r.data.name,
            code: r.data.code || null,
            phone: r.data.phone || null,
            email: r.data.email || null,
            segment: r.data.segment || 'regular',
            credit_limit: Number(r.data.credit_limit) || 0,
            payment_terms_days: Number(r.data.payment_terms_days) || 30,
          }));
          await supabase.from('customers').insert(records);
          committed += batch.length;
          setProgress(Math.round((committed / validRows.length) * 100));
        }
      } else if (entityType === 'sales_invoices') {
        for (let i = 0; i < validRows.length; i += batchSize) {
          const batch = validRows.slice(i, i + batchSize);
          const records = batch.map(r => ({
            company_id: COMPANY_ID,
            invoice_number: r.data.invoice_number,
            invoice_date: r.data.invoice_date,
            customer_id: r.data.customer_id || null,
            subtotal: Number(r.data.subtotal) || Number(r.data.total) || 0,
            tax_amount: Number(r.data.tax_amount) || 0,
            total: Number(r.data.total) || 0,
            paid_amount: Number(r.data.paid_amount) || 0,
            status: r.data.status || 'confirmed',
          }));
          await supabase.from('sales_invoices').insert(records);
          committed += batch.length;
          setProgress(Math.round((committed / validRows.length) * 100));
        }
      }

      await updateImportRecord(importRec.id, {
        status: 'completed',
        progress: 100,
        completed_at: new Date().toISOString(),
      });

      setImportResult({
        total: rows.length,
        valid: validRows.length,
        invalid: invalidRows.length,
        importId: importRec.id,
      });
      setStep('done');
      loadHistory();
    } catch (e: any) {
      setError(`فشل الاستيراد: ${e.message}`);
      setStep('preview');
    }
  }, [rows, fileName, fileSize, fileFormat, entityType, loadHistory]);

  const reset = () => {
    setStep('upload');
    setFileName('');
    setRows([]);
    setHeaders([]);
    setProgress(0);
    setImportResult(null);
    setError(null);
    setWarnings([]);
    setSecurityPassed(true);
    setIsDuplicate(false);
    setQualityScore(0);
    setColumnMappings([]);
  };

  const validCount = rows.filter(r => r.valid).length;
  const invalidCount = rows.filter(r => !r.valid).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="مركز الاستيراد"
        subtitle="استيراد البيانات من Excel و CSV و JSON و PDF و الصور مع التحقق والمعاينة"
      />

      {/* Upload Zone */}
      {step === 'upload' && (
        <Card>
          <CardBody>
            <div className="mb-5">
              <label className="block text-sm font-medium text-ink-700 mb-2">نوع البيانات</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ENTITY_TYPES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setEntityType(t.value)}
                    className={`p-4 rounded-lg border-2 text-right transition-all ${
                      entityType === t.value
                        ? 'border-primary-500 bg-primary-50/50'
                        : 'border-ink-100 hover:border-ink-200'
                    }`}
                  >
                    <Database size={18} className={entityType === t.value ? 'text-primary-600' : 'text-ink-400'} />
                    <div className="text-sm font-medium text-ink-800 mt-2">{t.label}</div>
                    <div className="text-[11px] text-ink-400 mt-1">{t.required.length} حقول مطلوبة</div>
                  </button>
                ))}
              </div>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file) handleFile(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                dragOver ? 'border-primary-500 bg-primary-50/30' : 'border-ink-200 hover:border-ink-300'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.xlsm,.csv,.tsv,.ods,.json,.jsonl,.xml,.txt,.md,.pdf,.docx,.jpg,.jpeg,.png,.webp,.tiff,.bmp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
              <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
                <Upload className="text-primary-500" size={24} />
              </div>
              <h3 className="text-base font-semibold text-ink-800 mb-1">اسحب وأفلت الملف هنا</h3>
              <p className="text-sm text-ink-500">أو اضغط للاختيار</p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-ink-400">
                {(['xlsx', 'csv', 'json', 'pdf', 'docx', 'png'] as FileFormat[]).map(f => (
                  <span key={f} className="flex items-center gap-1 px-2 py-1 rounded bg-ink-50">
                    {formatIcon(f)} {FORMAT_LABELS[f]}
                  </span>
                ))}
                <span className="px-2 py-1 rounded bg-ink-50 text-ink-400">والمزيد...</span>
              </div>
              <div className="text-[11px] text-ink-300 mt-3">الحد الأقصى للحجم: {MAX_FILE_SIZE / 1024 / 1024} ميجابايت</div>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-danger-50 text-danger-700 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Scanning */}
      {step === 'scanning' && (
        <Card>
          <CardBody>
            <div className="flex flex-col items-center py-10 gap-4">
              <Loader2 className="animate-spin text-primary-500" size={32} />
              <div className="text-center">
                <h3 className="font-semibold text-ink-800">جارٍ فحص وتحليل الملف...</h3>
                <p className="text-sm text-ink-500 mt-1">{fileName}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Preview */}
      {step === 'preview' && (
        <div className="space-y-4">
          {/* File info */}
          <Card>
            <CardBody>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                    {formatIcon(fileFormat)}
                  </div>
                  <div>
                    <div className="font-medium text-ink-800 text-sm">{fileName}</div>
                    <div className="text-xs text-ink-400">
                      {FORMAT_LABELS[fileFormat]} — {formatNumber(fileSize)} بايت
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="success"><CheckCircle2 size={12} /> {validCount} صالح</Badge>
                  {invalidCount > 0 && <Badge variant="danger"><XCircle size={12} /> {invalidCount} غير صالح</Badge>}
                  <Badge variant="neutral">{rows.length} إجمالي</Badge>
                  {qualityScore > 0 && (
                    <Badge variant={qualityScore >= 80 ? 'success' : qualityScore >= 60 ? 'warning' : 'danger'}>
                      جودة: {qualityScore}%
                    </Badge>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Security & warnings */}
          {(warnings.length > 0 || isDuplicate) && (
            <div className="space-y-2">
              {warnings.map((w, i) => (
                <div key={i} className="p-3 rounded-lg bg-warning-50 text-warning-700 text-sm flex items-center gap-2">
                  <AlertTriangle size={16} />
                  {w}
                </div>
              ))}
            </div>
          )}

          {securityPassed && warnings.length === 0 && (
            <div className="p-3 rounded-lg bg-success-50 text-success-700 text-sm flex items-center gap-2">
              <ShieldCheck size={16} />
              اجتاز الملف الفحص الأمني — لا توجد مشاكل
            </div>
          )}

          {/* Column mappings */}
          {columnMappings.length > 0 && (
            <Card>
              <CardHeader title="تعيين الأعمدة" subtitle="ربط تلقائي بين أعمدة الملف وحقول النظام" />
              <DataTable
                columns={[
                  { key: 'name', label: 'عمود الملف', render: (r: any) => <span className="font-mono text-xs text-ink-600">{r.name}</span> },
                  { key: 'mappedField', label: 'الحقل المقابل', render: (r: any) => r.mappedField ? <span className="font-medium text-primary-600">{r.mappedField}</span> : <span className="text-ink-300">غير معين</span> },
                  { key: 'confidence', label: 'الثقة', align: 'center', render: (r: any) => {
                    if (!r.mappedField) return <Badge variant="neutral">—</Badge>;
                    return <Badge variant={r.confidence >= 80 ? 'success' : r.confidence >= 50 ? 'warning' : 'danger'}>{r.confidence}%</Badge>;
                  }},
                ]}
                data={columnMappings}
                emptyMessage="لا توجد أعمدة"
              />
            </Card>
          )}

          {/* Data preview */}
          <Card>
            <CardHeader title="معاينة البيانات" subtitle="أول 10 صفوف" action={
              <div className="flex gap-2">
                <button onClick={reset} className="btn-secondary text-xs">إلغاء</button>
                <button onClick={handleCommit} className="btn-primary text-xs" disabled={validCount === 0}>
                  تأكيد الاستيراد ({validCount})
                </button>
              </div>
            } />
            <DataTable
              columns={[
                { key: 'rowNumber', label: '#', width: '50px', align: 'center' },
                ...headers.slice(0, 6).map(h => ({ key: h, label: h, render: (r: ParsedRow) => String(r.data[h] ?? '') })),
                {
                  key: 'status',
                  label: 'الحالة',
                  align: 'center',
                  render: (r: ParsedRow) => r.valid
                    ? <Badge variant="success"><CheckCircle2 size={12} /> صالح</Badge>
                    : <Badge variant="danger"><XCircle size={12} /> خطأ</Badge>,
                },
              ]}
              data={rows.slice(0, 10)}
              emptyMessage="لا توجد بيانات للمعاينة"
            />
          </Card>
        </div>
      )}

      {/* Committing */}
      {step === 'committing' && (
        <Card>
          <CardBody>
            <div className="flex flex-col items-center py-10 gap-4">
              <Loader2 className="animate-spin text-primary-500" size={32} />
              <div className="text-center">
                <h3 className="font-semibold text-ink-800">جارٍ استيراد البيانات...</h3>
                <p className="text-sm text-ink-500 mt-1">{progress}% مكتمل</p>
              </div>
              <div className="w-full max-w-md h-2 bg-ink-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Done */}
      {step === 'done' && importResult && (
        <Card>
          <CardBody>
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center">
                <CheckCircle2 className="text-success-500" size={32} />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-ink-800">تم الاستيراد بنجاح!</h3>
                <p className="text-sm text-ink-500 mt-1">
                  {formatNumber(importResult.valid)} صف صالح من أصل {formatNumber(importResult.total)}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                <div className="text-center p-3 rounded-lg bg-success-50/50">
                  <div className="text-xl font-bold text-success-600">{importResult.valid}</div>
                  <div className="text-xs text-ink-500">صفوف مستوردة</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-danger-50/50">
                  <div className="text-xl font-bold text-danger-600">{importResult.invalid}</div>
                  <div className="text-xs text-ink-500">صفوف مرفوضة</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-primary-50/50">
                  <div className="text-xl font-bold text-primary-600">{importResult.total}</div>
                  <div className="text-xs text-ink-500">إجمالي الصفوف</div>
                </div>
              </div>
              <button onClick={reset} className="btn-primary">استيراد ملف آخر</button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Import History */}
      <Card>
        <CardHeader title="سجل الاستيرادات" subtitle="آخر عمليات الاستيراد" />
        {loadingHistory ? (
          <LoadingState message="جارٍ تحميل السجل..." />
        ) : history.length === 0 ? (
          <EmptyState icon={<Database size={32} />} title="لا توجد استيرادات سابقة" message="ابدأ باستيراد ملفك الأول" />
        ) : (
          <DataTable
            columns={[
              { key: 'file_name', label: 'الملف', render: (r: any) => (
                <div className="flex items-center gap-2">
                  <FileSpreadsheet size={16} className="text-ink-400" />
                  <span className="font-medium text-ink-700">{r.file_name}</span>
                </div>
              )},
              { key: 'entity_type', label: 'النوع', render: (r: any) => <Badge variant="neutral">{r.entity_type || '—'}</Badge> },
              { key: 'total_rows', label: 'الصفوف', align: 'center', render: (r: any) => formatNumber(r.total_rows) },
              { key: 'valid_rows', label: 'صالح', align: 'center', render: (r: any) => <span className="text-success-600 font-medium">{formatNumber(r.valid_rows)}</span> },
              { key: 'invalid_rows', label: 'مرفوض', align: 'center', render: (r: any) => <span className="text-danger-600 font-medium">{formatNumber(r.invalid_rows)}</span> },
              { key: 'status', label: 'الحالة', align: 'center', render: (r: any) => <StatusBadge status={r.status} /> },
              { key: 'created_at', label: 'التاريخ', render: (r: any) => formatDateTime(r.created_at) },
            ]}
            data={history}
          />
        )}
      </Card>
    </div>
  );
}
