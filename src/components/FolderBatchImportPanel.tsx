import { useState } from 'react';
import { FolderOpen, Loader2, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { scanDirectory, processFolderFiles, type BatchEntityType, type BatchProgress } from '@/lib/import/batch-folder';

export function FolderBatchImportPanel() {
  const [entityType, setEntityType] = useState<BatchEntityType>('sales_invoices');
  const [folderName, setFolderName] = useState('');
  const [pathHint, setPathHint] = useState('');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<BatchProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const chooseAndRun = async () => {
    setError(null); setProgress(null);
    const picker = (window as any).showDirectoryPicker;
    if (typeof picker !== 'function') {
      setError('متصفحك لا يدعم اختيار المجلد الآمن. استخدم Edge أو Chrome حديثًا. لا يمكن لتطبيق الويب قراءة C:\\ أو مسار شبكة بمجرد كتابته لأسباب أمنية.');
      return;
    }
    try {
      setRunning(true);
      const handle = await picker({ mode: 'read' });
      setFolderName(handle.name || pathHint || 'المجلد المحدد');
      const files = await scanDirectory(handle);
      if (!files.length) throw new Error('لم يتم العثور على ملفات تقارير مدعومة داخل المجلد.');
      const result = await processFolderFiles(files, entityType, setProgress);
      setProgress(result);
    } catch (e: any) {
      if (e?.name !== 'AbortError') setError(e?.message || 'فشل الوصول إلى المجلد');
    } finally { setRunning(false); }
  };

  const completed = progress?.results.filter(r => r.status === 'completed').length || 0;
  const failed = progress?.results.filter(r => r.status === 'failed').length || 0;
  const skipped = progress?.results.filter(r => r.status === 'skipped').length || 0;
  const pct = progress?.total ? Math.round((progress.processed / progress.total) * 100) : 0;

  return <Card>
    <CardHeader title="سحب التقارير من مجلد جماعي" subtitle="يظل الإدخال اليدوي متاحًا أعلاه. هذا المسار يستخدم محرك الاستيراد المركزي نفسه مع الفحص الأمني، كشف الصيغة، منع التكرار، التحقق ثم الكتابة." />
    <CardBody>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
        <select value={entityType} onChange={e => setEntityType(e.target.value as BatchEntityType)} className="input">
          <option value="sales_invoices">فواتير المبيعات</option><option value="products">المنتجات</option><option value="customers">العملاء</option>
        </select>
        <input value={pathHint} onChange={e => setPathHint(e.target.value)} placeholder="وصف/مسار المجلد (للتعريف فقط)" className="input lg:col-span-2" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => void chooseAndRun()} disabled={running} className="btn-primary inline-flex items-center gap-2">
          {running ? <Loader2 size={16} className="animate-spin" /> : <FolderOpen size={16} />} {running ? 'جارٍ سحب ومعالجة التقارير...' : 'اختيار المجلد وسحب التقارير'}
        </button>
        {folderName && <Badge variant="neutral">المجلد: {folderName}</Badge>}
        <Badge variant="neutral"><ShieldCheck size={12}/> قراءة محلية آمنة</Badge>
      </div>
      <p className="text-xs text-ink-400 mt-3">يدعم الملفات المدعومة الموجودة مباشرة داخل المجلد. المجلدات الفرعية ومسارات UNC/الشبكة ستُربط لاحقًا عبر Local Sync Agent، لأن المتصفح لا يملك صلاحية قراءة مسار شبكة من نص فقط.</p>
      {error && <div className="mt-4 p-3 rounded-lg bg-danger-50 text-danger-700 text-sm flex gap-2"><AlertTriangle size={16}/>{error}</div>}
      {progress && <div className="mt-5 space-y-3">
        <div className="flex justify-between text-sm"><b>{progress.current ? `يعالج: ${progress.current}` : 'اكتملت العملية'}</b><span>{pct}%</span></div>
        <div className="h-2 bg-ink-100 rounded-full overflow-hidden"><div className="h-full bg-primary-500 transition-all" style={{ width: `${pct}%` }}/></div>
        <div className="flex flex-wrap gap-2"><Badge variant="success"><CheckCircle2 size={12}/> ناجح: {completed}</Badge><Badge variant="danger"><XCircle size={12}/> فشل: {failed}</Badge><Badge variant="warning">متجاوز/مكرر: {skipped}</Badge><Badge variant="neutral">الإجمالي: {progress.total}</Badge></div>
        {progress.results.length > 0 && <div className="border rounded-lg divide-y max-h-72 overflow-auto">{progress.results.map((r, i) => <div key={`${r.name}-${i}`} className="p-3 flex items-center justify-between gap-3 text-sm"><div className="min-w-0"><div className="font-medium truncate">{r.name}</div><div className="text-xs text-ink-400">{r.path} · {r.format} · {r.rows} صف</div>{r.error && <div className="text-xs text-danger-600 mt-1">{r.error}</div>}</div><Badge variant={r.status === 'completed' ? 'success' : r.status === 'failed' ? 'danger' : 'warning'}>{r.status === 'completed' ? `تم (${r.committed})` : r.status === 'failed' ? 'فشل' : 'متجاوز'}</Badge></div>)}</div>}
      </div>}
    </CardBody>
  </Card>;
}
