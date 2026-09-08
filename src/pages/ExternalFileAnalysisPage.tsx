import { useMemo, useRef, useState } from 'react';
import { AlertCircle, BarChart3, CheckCircle2, Download, FileImage, FileSpreadsheet, FileText, Loader2, ShieldCheck, Sparkles, Upload } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/States';
import { detectFormat } from '@/lib/file-engine/detector';
import { securityScan, computeSHA256 } from '@/lib/file-engine/security';
import { parseFile } from '@/lib/file-engine/adapters';
import { FORMAT_LABELS, MAX_FILE_SIZE, type FileFormat, type Dataset } from '@/lib/file-engine/types';

function fileIcon(format: FileFormat) {
  if (['xlsx','xls','xlsm','csv','tsv','ods'].includes(format)) return <FileSpreadsheet size={18}/>;
  if (['pdf','docx','doc','rtf','txt','markdown'].includes(format)) return <FileText size={18}/>;
  if (['jpg','jpeg','png','webp','tiff','bmp'].includes(format)) return <FileImage size={18}/>;
  return <FileText size={18}/>;
}

function downloadCsv(dataset: Dataset) {
  const columns = dataset.columns.map(c => c.name);
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const body = [columns, ...dataset.rows.slice(0, 50000).map(row => columns.map(c => row[c]))].map(row => row.map(esc).join(',')).join('\n');
  const blob = new Blob([new TextEncoder().encode('\uFEFF' + body)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${dataset.name.replace(/[^\p{L}\p{N}_-]+/gu, '_')}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  setTimeout(() => { anchor.remove(); URL.revokeObjectURL(url); }, 0);
}

export function ExternalFileAnalysisPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<{name:string;size:number;format:FileFormat;hash:string}|null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  async function analyze(selected: File) {
    setLoading(true); setError(null); setDatasets([]); setActive(0);
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

  const dataset = datasets[active] ?? null;
  const summary = useMemo(() => dataset ? {
    mapped: dataset.columns.filter(c => !!c.mappedField).length,
    unmapped: dataset.columns.filter(c => !c.mappedField).length,
    review: dataset.columns.filter(c => c.requiresReview).length,
    issues: dataset.columns.reduce((n,c) => n + c.qualityIssues.length, 0),
  } : null, [dataset]);

  return <div className="space-y-6" dir="rtl">
    <PageHeader title="مختبر الملفات والبيانات" subtitle="حلّل أي ملف خارجي دون إجباره على نموذج أعمال مسبق، مع إبقاء الحقول الأصلية متاحة للمراجعة." />
    <Card><CardBody>
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] items-center">
        <div><div className="flex items-center gap-2"><Sparkles size={18}/><h2 className="font-semibold">Universal File Intelligence</h2></div><p className="mt-2 text-sm leading-6 text-ink-500">فحص أمني → كشف الصيغة → استخراج → profiling → mapping → جودة → جاهزية للتحليل. هذا المسار تحليلي ولا يكتب سجلات الأعمال تلقائيًا.</p><div className="mt-3 flex flex-wrap gap-2"><Badge variant="neutral">كل الأعمدة</Badge><Badge variant="neutral">أنواع البيانات</Badge><Badge variant="neutral">Mapping Evidence</Badge><Badge variant="neutral">Quality Signals</Badge><Badge variant="neutral">OCR عربي + English</Badge><Badge variant="neutral">SHA-256</Badge></div></div>
        <button type="button" onClick={() => inputRef.current?.click()} disabled={loading} className="btn-primary inline-flex items-center justify-center gap-2 min-w-52"><Upload size={18}/>{loading ? 'جارٍ التحليل...' : 'تحليل أي ملف خارجي'}</button>
      </div>
      <input ref={inputRef} type="file" className="hidden" accept=".xlsx,.xls,.xlsm,.csv,.tsv,.ods,.json,.jsonl,.xml,.txt,.md,.markdown,.pdf,.docx,.doc,.rtf,.jpg,.jpeg,.png,.webp,.tiff,.bmp" onChange={e => { const f=e.target.files?.[0]; if(f) void analyze(f); e.currentTarget.value=''; }}/>
      <div onClick={() => inputRef.current?.click()} className="mt-5 cursor-pointer rounded-2xl border-2 border-dashed border-ink-200 p-8 text-center hover:border-primary-400 transition-colors"><Upload className="mx-auto mb-2 text-primary-500" size={30}/><b>اسحب الملف هنا أو اضغط للاختيار</b><p className="mt-1 text-xs text-ink-400">الحد الآمن {Math.round(MAX_FILE_SIZE / 1024 / 1024)} MB · لا توجد كتابة تلقائية لبيانات الأعمال</p></div>
      {error && <div className="mt-4 rounded-xl bg-danger-50 p-3 text-sm text-danger-700 flex gap-2"><AlertCircle size={17}/>{error}</div>}
    </CardBody></Card>
    {file && <Card><CardBody><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3">{fileIcon(file.format)}<div><b>{file.name}</b><div className="text-xs text-ink-400">{FORMAT_LABELS[file.format]} · {file.size.toLocaleString()} بايت · SHA-256: {file.hash.slice(0,16)}…</div></div></div><Badge variant="success"><ShieldCheck size={13}/> اجتاز الفحص الأمني</Badge></div></CardBody></Card>}
    {datasets.length > 1 && <Card><CardBody><div className="flex gap-2 overflow-x-auto">{datasets.map((d,i)=><button key={`${d.id}-${i}`} type="button" onClick={()=>setActive(i)} className={`whitespace-nowrap rounded-xl border px-4 py-2 text-xs font-semibold ${i===active?'border-primary-500 bg-primary-50 text-primary-700':'border-ink-200 bg-white text-ink-600'}`}>ورقة/مجموعة {i+1}: {d.name}</button>)}</div></CardBody></Card>}
    {dataset && <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">{[['الصفوف',dataset.rowCount],['الأعمدة',dataset.columnCount],['المعيّنة',summary?.mapped??0],['غير المعيّنة',summary?.unmapped??0],['مشاكل الجودة',summary?.issues??0]].map(([label,value])=><Card key={String(label)}><CardBody><div className="text-xs text-ink-400">{label}</div><div className="mt-1 text-xl font-bold">{Number(value).toLocaleString()}</div></CardBody></Card>)}</div>
      <Card><CardHeader title="ذكاء المخطط" subtitle="كل حقل يحتفظ بهويته الأصلية ويُعامل كمرشح مستقل للمطابقة والتحليل" action={<button type="button" onClick={()=>downloadCsv(dataset)} className="btn-secondary text-xs inline-flex items-center gap-1"><Download size={14}/> تصدير البيانات المحللة</button>}/><CardBody><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b border-ink-100"><th className="p-2 text-right">الحقل الأصلي</th><th className="p-2 text-right">الحقل القياسي</th><th className="p-2 text-right">النوع</th><th className="p-2 text-right">الثقة</th><th className="p-2 text-right">الفرادة</th><th className="p-2 text-right">القيم الفارغة</th></tr></thead><tbody>{dataset.columns.map(c=><tr key={c.name} className="border-b border-ink-50"><td className="p-2 font-medium">{c.name}</td><td className="p-2">{c.mappedField||<span className="text-ink-400">غير معين — محفوظ</span>}</td><td className="p-2">{c.dataType}</td><td className="p-2">{c.mappingConfidence}%</td><td className="p-2">{Math.round(c.uniqueRatio*100)}%</td><td className="p-2">{c.nullCount.toLocaleString()}</td></tr>)}</tbody></table></div></CardBody></Card>
      <Card><CardHeader title="المعاينة" subtitle={`عرض ${Math.min(dataset.preview.length, 50)} صفًا مع ${dataset.columnCount} عمودًا`}/><CardBody><div className="overflow-x-auto"><DataTable columns={dataset.columns.map(c=>({key:c.name,label:c.name,render:(r:any)=>String(r[c.name]??'')}))} data={dataset.preview.slice(0,50)} emptyMessage="لا توجد صفوف للعرض"/></div></CardBody></Card>
      <Card><CardHeader title="إشارات الجودة والتوصيات"/><CardBody><div className="grid gap-2 md:grid-cols-2">{dataset.columns.flatMap(c=>c.qualityIssues.map(issue=><div key={`${c.name}-${issue}`} className="flex gap-2 rounded-xl bg-warning-50 p-3 text-xs text-warning-800"><AlertCircle size={14}/><span><b>{c.name}</b>: {issue}</span></div>))}{!dataset.columns.some(c=>c.qualityIssues.length)&&<div className="flex gap-2 text-sm text-success-700"><CheckCircle2 size={16}/> لا توجد إشارات جودة على الحقول المفحوصة.</div>}</div></CardBody></Card>
      <div className="rounded-2xl border border-primary-100 bg-primary-50/50 p-5"><div className="flex items-center gap-2 font-semibold"><BarChart3 size={18}/> قرار المعالجة</div><p className="mt-2 text-sm leading-6 text-ink-600">{summary?.unmapped ? `تم اكتشاف ${summary.unmapped} حقل غير معيّن. هذه الحقول لا تُحذف؛ تبقى متاحة للتحليل والتعيين اللاحق.` : 'المخطط المكتشف قابل للربط مع النموذج القياسي، مع بقاء المصدر الأصلي محفوظًا.'}</p></div>
    </>}
    {loading && <Card><CardBody><div className="py-10 text-center"><Loader2 className="mx-auto animate-spin text-primary-500" size={30}/><p className="mt-3 text-sm">جارٍ بناء ملف التعريف والتحليل…</p></div></CardBody></Card>}
  </div>;
}
