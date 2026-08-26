import { useEffect, useRef, useState } from 'react';
import { FolderOpen, Loader2, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Radio, Square } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { scanDirectory, processFolderFiles, type BatchEntityType, type BatchProgress } from '@/lib/import/batch-folder';
import { IndexedDbFolderSnapshotStore } from '@/lib/import-pipeline/folder-watch-store';
import { scanWatchedDirectory, startWatchedFolder, selectWatchedFolder, ensureFolderPermission } from '@/lib/import-pipeline/folder-watch-service';
import { saveFolderHandle, loadFolderHandle } from '@/lib/import-pipeline/folder-handle-store';
import { DEFAULT_FOLDER_POLICY } from '@/lib/import-pipeline/folder-monitor-contract';

export function FolderBatchImportPanel() {
  const [entityType,setEntityType]=useState<BatchEntityType>('sales_invoices');
  const [folderName,setFolderName]=useState(''); const [pathHint,setPathHint]=useState('');
  const [running,setRunning]=useState(false); const [watching,setWatching]=useState(false);
  const [progress,setProgress]=useState<BatchProgress|null>(null); const [error,setError]=useState<string|null>(null);
  const stopRef=useRef<(()=>void)|null>(null); const handleRef=useRef<FileSystemDirectoryHandle|null>(null);
  const storeRef=useRef(new IndexedDbFolderSnapshotStore());

  const processScan=async()=>{
    const handle=handleRef.current;if(!handle)throw new Error('لم يتم اختيار مجلد.');
    const scan=await scanWatchedDirectory(folderName||'watched-folder',handle,DEFAULT_FOLDER_POLICY,storeRef.current);
    const changed=scan.files.filter(f=>f.state==='new'||f.state==='changed');
    if(changed.length===0){setProgress(p=>p?{...p,processed:p.total,current:'',results:p.results}:null);return;}
    const all=await scanDirectory(handle); const selected=all.filter(f=>changed.some(c=>c.path===f.relativePath));
    if(selected.length)await processFolderFiles(selected,entityType,setProgress);
  };

  const chooseAndRun=async()=>{setError(null);setProgress(null);try{setRunning(true);const handle=await selectWatchedFolder();if(!handle)throw new Error('لم يتم اختيار مجلد.');handleRef.current=handle;await saveFolderHandle('default',handle);setFolderName(handle.name||pathHint||'المجلد المحدد');const files=await scanDirectory(handle);if(!files.length)throw new Error('لم يتم العثور على ملفات تقارير مدعومة داخل المجلد.');const result=await processFolderFiles(files,entityType,setProgress);setProgress(result);}catch(e:unknown){if(e instanceof DOMException && e.name==='AbortError')return;setError(e instanceof Error?e.message:'فشل الوصول إلى المجلد');}finally{setRunning(false);}};

  const startWatch=async()=>{setError(null);try{let handle=handleRef.current;if(!handle)handle=await loadFolderHandle('default');if(!handle)throw new Error('اختر المجلد أولاً ثم فعّل المزامنة.');if(!(await ensureFolderPermission(handle)))throw new Error('يجب السماح للتطبيق بقراءة المجلد لاستمرار المزامنة.');handleRef.current=handle;setFolderName(handle.name||'المجلد المحدد');stopRef.current=startWatchedFolder(handle,async()=>{const scan=await scanWatchedDirectory(handle.name,handle,DEFAULT_FOLDER_POLICY,storeRef.current);const changed=scan.files.filter(f=>f.state==='new'||f.state==='changed');if(changed.length){const all=await scanDirectory(handle);const selected=all.filter(f=>changed.some(c=>c.path===f.relativePath));if(selected.length)await processFolderFiles(selected,entityType,setProgress);}return scan;},DEFAULT_FOLDER_POLICY,()=>{});setWatching(true);}catch(e:unknown){setError(e instanceof Error?e.message:'تعذر تشغيل المزامنة التلقائية.');}};
  const stopWatch=()=>{stopRef.current?.();stopRef.current=null;setWatching(false);};
  useEffect(()=>()=>stopWatch(),[]);

  const completed=progress?.results.filter(r=>r.status==='completed').length||0;const failed=progress?.results.filter(r=>r.status==='failed').length||0;const skipped=progress?.results.filter(r=>r.status==='skipped').length||0;const pct=progress?.total?Math.round(progress.processed/progress.total*100):0;
  return <Card><CardHeader title="سحب ومزامنة التقارير من مجلد" subtitle="اختر مجلدًا مرة واحدة. يراقبه التطبيق، يكتشف الإضافات والتعديلات ببصمة SHA-256، ويتجاوز غير المتغير، ويواصل بقية التحليل حتى عند فشل استخراج ملف."/><CardBody>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4"><select value={entityType} onChange={e=>setEntityType(e.target.value as BatchEntityType)} className="input"><option value="sales_invoices">فواتير المبيعات</option><option value="products">المنتجات</option><option value="customers">العملاء</option></select><input value={pathHint} onChange={e=>setPathHint(e.target.value)} placeholder="وصف المجلد" className="input lg:col-span-2"/></div>
    <div className="flex flex-wrap items-center gap-3"><button onClick={()=>void chooseAndRun()} disabled={running||watching} className="btn-primary inline-flex items-center gap-2">{running?<Loader2 size={16} className="animate-spin"/>:<FolderOpen size={16}/>} {running?'جارٍ السحب والمعالجة...':'اختيار المجلد ومعالجته'}</button>{!watching?<button onClick={()=>void startWatch()} disabled={running} className="btn-secondary inline-flex items-center gap-2"><Radio size={16}/> تشغيل المزامنة التلقائية</button>:<button onClick={stopWatch} className="btn-secondary inline-flex items-center gap-2"><Square size={15}/> إيقاف المزامنة</button>}{folderName&&<Badge variant="neutral">المجلد: {folderName}</Badge>}<Badge variant={watching?'success':'neutral'}>{watching?<><Radio size={12}/> مراقبة مستمرة</>:<><ShieldCheck size={12}/> قراءة محلية آمنة</>}</Badge></div>
    <p className="text-xs text-ink-400 mt-3">تعمل المراقبة داخل المتصفح بعد منح صلاحية المجلد. تُحفظ البصمات محليًا، وتُحفظ أدلة المجلد/الملف في قاعدة البيانات عند ربط جلسة المؤسسة. مسارات الشبكة UNC تحتاج Local Sync Agent لاحقًا لأنها لا تُمنح للويب بمجرد كتابة المسار.</p>
    {error&&<div className="mt-4 p-3 rounded-lg bg-danger-50 text-danger-700 text-sm flex gap-2"><AlertTriangle size={16}/>{error}</div>}
    {progress&&<div className="mt-5 space-y-3"><div className="flex justify-between text-sm"><b>{progress.current?`يعالج: ${progress.current}`:'اكتملت الدفعة'}</b><span>{pct}%</span></div><div className="h-2 bg-ink-100 rounded-full overflow-hidden"><div className="h-full bg-primary-500 transition-all" style={{width:`${pct}%`}}/></div><div className="flex flex-wrap gap-2"><Badge variant="success"><CheckCircle2 size={12}/> ناجح: {completed}</Badge><Badge variant="danger"><XCircle size={12}/> فشل: {failed}</Badge><Badge variant="warning">متجاوز/مكرر: {skipped}</Badge><Badge variant="neutral">الإجمالي: {progress.total}</Badge></div>{progress.results.length>0&&<div className="border rounded-lg divide-y max-h-72 overflow-auto">{progress.results.map((r,i)=><div key={`${r.name}-${i}`} className="p-3 flex items-center justify-between gap-3 text-sm"><div className="min-w-0"><div className="font-medium truncate">{r.name}</div><div className="text-xs text-ink-400">{r.path} · {r.format} · {r.rows} صف</div>{(r.error||r.warning)&&<div className="text-xs text-danger-600 mt-1">{r.error||r.warning}</div>}</div><Badge variant={r.status==='completed'?'success':r.status==='failed'?'danger':'warning'}>{r.status==='completed'?`تم (${r.committed})`:r.status==='failed'?'فشل':'متجاوز'}</Badge></div>)}</div>}</div>}
  </CardBody></Card>;
}