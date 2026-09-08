import { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, FileImage, FileSpreadsheet, FileText, Loader2, ShieldCheck, Upload } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/States';
import { detectFormat } from '@/lib/file-engine/detector';
import { securityScan, computeSHA256 } from '@/lib/file-engine/security';
import { parseFile } from '@/lib/file-engine/adapters';
import { FORMAT_LABELS, MAX_FILE_SIZE, type FileFormat, type Dataset } from '@/lib/file-engine/types';

function icon(format: FileFormat) {
  if (['xlsx','xls','xlsm','csv','tsv','ods'].includes(format)) return <FileSpreadsheet size={18}/>;
  if (['pdf','docx','doc','rtf','txt','markdown'].includes(format)) return <FileText size={18}/>;
  if (['jpg','jpeg','png','webp','tiff','bmp'].includes(format)) return <FileImage size={18}/>;
  return <FileText size={18}/>;
}

export function ExternalFileAnalysisPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<{name:string;size:number;format:FileFormat;hash:string}|null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  async function analyze(selected: File) {
    setLoading(true); setError(null); setDatasets([]);
    try {
      if (selected.size > MAX_FILE_SIZE) throw new Error(`حجم الملف يتجاوز الحد الآمن (${Math.round(MAX_FILE_SIZE / 1024 / 1024)} MB)`);
      const buffer = await selected.arrayBuffer();
      const scan = securityScan(selected, buffer);
      if (!scan.passed) throw new Error(scan.issues.join(' — '));
      const detection = detectFormat(selected, buffer);
      if (detection.format === 'unknown') throw new Error('تعذر تحديد صيغة الملف');
      const hash = await computeSHA256(buffer);
      const parsed = await parseFile(buffer, selected.name, detection.format);
      if (!parsed.length) throw new Error('لم يتم العثور على بيانات قابلة للتحليل داخل الملف');
      setFile({ name:selected.name, size:selected.size, format:detection.format, hash });
      setDatasets(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل تحليل الملف');
    } finally { setLoading(false); }
  }

  return <div className="space-y-6" dir="rtl">
    <PageHeader title="تحليل ملف خارجي" subtitle="ارفع أي ملف مدعوم لتحليله وفهم بنيته وجودة بياناته قبل ربطه ببيانات النظام" />
    <Card><CardBody>
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] items-center">
        <div><h2 className="font-semibold text-ink-900">منطقة التحليل العام</h2><p className="mt-1 text-sm text-ink-500">Excel وCSV وJSON وJSONL وPDF وWord والصور والملفات النصية. لا يلزم اختيار عملاء أو منتجات أو فواتير.</p><div className="mt-3 flex flex-wrap gap-2"><Badge variant="neutral">فحص أمني</Badge><Badge variant="neutral">كشف الصيغة</Badge><Badge variant="neutral">استخراج البيانات</Badge><Badge variant="neutral">تعيين الأعمدة</Badge><Badge variant="neutral">درجة الجودة</Badge><Badge variant="neutral">OCR عربي + إنجليزي</Badge></div></div>
        <button type="button" onClick={() => inputRef.current?.click()} disabled={loading} className="btn-primary inline-flex items-center justify-center gap-2 min-w-48"><Upload size={18}/>{loading ? 'جارٍ التحليل...' : 'اختيار ملف للتحليل'}</button>
      </div>
      <input ref={inputRef} type="file" className="hidden" accept=".xlsx,.xls,.xlsm,.csv,.tsv,.ods,.json,.jsonl,.xml,.txt,.md,.markdown,.pdf,.docx,.doc,.rtf,.jpg,.jpeg,.png,.webp,.tiff,.bmp" onChange={e => { const f=e.target.files?.[0]; if(f) void analyze(f); e.currentTarget.value=''; }}/>
      <div onClick={() => inputRef.current?.click()} className="mt-5 cursor-pointer rounded-2xl border-2 border-dashed border-ink-200 p-8 text-center hover:border-primary-400 transition-colors"><Upload className="mx-auto mb-2 text-primary-500" size={30}/><b>اسحب الملف إلى هنا أو اضغط للاختيار</b><p className="mt-1 text-xs text-ink-400">التحليل لا يكتب أي بيانات في قاعدة البيانات</p></div>
      {error && <div className="mt-4 rounded-xl bg-danger-50 p-3 text-sm text-danger-700 flex gap-2"><AlertCircle size={17}/>{error}</div>}
    </CardBody></Card>

    {file && <Card><CardBody><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3">{icon(file.format)}<div><b>{file.name}</b><div className="text-xs text-ink-400">{FORMAT_LABELS[file.format]} · {file.size.toLocaleString()} بايت · SHA-256: {file.hash.slice(0,16)}…</div></div></div><Badge variant="success"><ShieldCheck size={13}/> فحص أمني ناجح</Badge></div></CardBody></Card>}

    {datasets.map((dataset,index) => <Card key={`${dataset.id}-${index}`}><CardHeader title={dataset.name} subtitle={`${dataset.rowCount.toLocaleString()} صف · ${dataset.columnCount.toLocaleString()} عمود · جودة التعيين ${dataset.qualityScore}%`} /><CardBody><div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5"><div className="rounded-xl bg-ink-50 p-3"><div className="text-xs text-ink-400">الصفوف</div><b>{dataset.rowCount.toLocaleString()}</b></div><div className="rounded-xl bg-ink-50 p-3"><div className="text-xs text-ink-400">الأعمدة</div><b>{dataset.columnCount.toLocaleString()}</b></div><div className="rounded-xl bg-ink-50 p-3"><div className="text-xs text-ink-400">جودة التعيين</div><b>{dataset.qualityScore}%</b></div><div className="rounded-xl bg-ink-50 p-3"><div className="text-xs text-ink-400">البيانات القابلة للعرض</div><b>{Math.min(dataset.preview.length,50)}</b></div></div><DataTable columns={dataset.columns.slice(0,8).map(c=>({key:c.name,label:c.name,render:(r:any)=>String(r[c.name]??'')}))} data={dataset.preview.slice(0,10)} emptyMessage="لا توجد صفوف للعرض"/><div className="mt-4 space-y-2">{dataset.columns.filter(c=>c.qualityIssues.length).slice(0,12).map(c=><div key={c.name} className="flex gap-2 text-xs text-warning-700"><AlertCircle size={14}/><span><b>{c.name}:</b> {c.qualityIssues.join('، ')}</span></div>)}{dataset.columns.every(c=>!c.qualityIssues.length) && <div className="text-sm text-success-700 flex gap-2"><CheckCircle2 size={16}/> لم تظهر مشاكل جودة على الأعمدة المفحوصة.</div>}</div></CardBody></Card>)}

    {loading && <Card><CardBody><div className="py-10 text-center"><Loader2 className="mx-auto animate-spin text-primary-500" size={30}/><p className="mt-3 text-sm">جارٍ الفحص والكشف والاستخراج والتحليل…</p></div></CardBody></Card>}
  </div>;
}
