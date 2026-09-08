import { useCallback, useEffect, useRef, useState } from 'react';
import { FolderOpen, Loader2, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Radio, Square, Monitor, FileSearch, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { scanDirectory } from '@/lib/import/batch-folder';
import { processFolderFilesUniversal, type UniversalFolderProgress } from '@/lib/import/folder-universal-sync';
import { saveFolderSyncSession, loadFolderSyncSession } from '@/lib/import/folder-sync-session-store';
import { IndexedDbFolderSnapshotStore } from '@/lib/import-pipeline/folder-watch-store';
import { scanWatchedDirectory, startWatchedFolder, selectWatchedFolder, ensureFolderPermission, type BrowserDirectoryHandle } from '@/lib/import-pipeline/folder-watch-service';
import { saveFolderHandle, loadFolderHandle } from '@/lib/import/folder-handle-store';
import { DEFAULT_FOLDER_POLICY } from '@/lib/import-pipeline/folder-monitor-contract';

function nativeFileName(relativePath: string): string { return relativePath.split(/[\\/]/).pop() || 'report'; }
type NativeFilePayload = { relativePath: string; reason: string; size: number; modifiedAt: string };

export function FolderBatchImportPanel() {
  const [folderName, setFolderName] = useState('');
  const [pathHint, setPathHint] = useState('');
  const [running, setRunning] = useState(false);
  const [watching, setWatching] = useState(false);
  const [progress, setProgress] = useState<UniversalFolderProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const handleRef = useRef<BrowserDirectoryHandle | null>(null);
  const nativeRootRef = useRef<string | null>(null);
  const storeRef = useRef(new IndexedDbFolderSnapshotStore());
  const nativeInFlightRef = useRef(new Set<string>());
  const isDesktop = Boolean(window.desktopFolderWatch?.isAvailable);

  const persist = useCallback((next: UniversalFolderProgress) => {
    setProgress(next);
    saveFolderSyncSession({ folderName, folderPath: nativeRootRef.current || pathHint, progress: next });
  }, [folderName, pathHint]);

  useEffect(() => {
    const saved = loadFolderSyncSession();
    if (!saved) return;
    setFolderName(saved.folderName || 'المجلد السابق');
    setPathHint(saved.folderPath || '');
    setProgress(saved.progress);
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== 'report-advisor:folder-sync:latest:v1') return;
      const saved = loadFolderSyncSession();
      if (saved) setProgress(saved.progress);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const processNativeFile = useCallback(async (payload: NativeFilePayload) => {
    const api = window.desktopFolderWatch;
    if (!api || nativeInFlightRef.current.has(payload.relativePath)) return;
    nativeInFlightRef.current.add(payload.relativePath);
    try {
      const buffer = await api.readFile(payload.relativePath);
      const file = new File([buffer], nativeFileName(payload.relativePath), { type: 'application/octet-stream', lastModified: Date.parse(payload.modifiedAt) || Date.now() });
      await processFolderFilesUniversal([{ file, format: 'unknown', relativePath: payload.relativePath }], persist);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'فشل تحليل الملف من مجلد سطح المكتب');
    } finally {
      nativeInFlightRef.current.delete(payload.relativePath);
    }
  }, [persist]);

  useEffect(() => {
    const api = window.desktopFolderWatch;
    if (!api?.isAvailable) return;
    const off = api.onFile((payload) => { void processNativeFile(payload); });
    return () => off();
  }, [processNativeFile]);

  useEffect(() => {
    const api = window.desktopFolderWatch;
    if (!api?.isAvailable) return;
    void api.getSelectedDirectory().then((selected) => {
      if (!selected) return;
      nativeRootRef.current = selected.path;
      setFolderName(selected.name || selected.path);
      setPathHint(selected.path);
    }).catch(() => undefined);
  }, []);

  const applyNativeSelection = (selected: { path: string; name: string }) => {
    nativeRootRef.current = selected.path;
    setFolderName(selected.name || selected.path);
    setPathHint(selected.path);
  };

  const runFolder = async (handle: BrowserDirectoryHandle) => {
    const files = await scanDirectory(handle);
    if (!files.length) throw new Error('لم يتم العثور على ملفات مدعومة داخل المجلد.');
    setError(null);
    setRunning(true);
    try { await processFolderFilesUniversal(files, persist); }
    finally { setRunning(false); }
  };

  const chooseAndRun = async () => {
    setError(null);
    if (isDesktop) {
      try {
        setRunning(true);
        const api = window.desktopFolderWatch;
        if (!api) throw new Error('DESKTOP_WATCH_UNAVAILABLE');
        const selected = await api.selectDirectory();
        if (!selected) return;
        applyNativeSelection(selected);
        await api.start();
        setWatching(true);
      } catch (e: unknown) { setError(e instanceof Error ? e.message : 'فشل اختيار مجلد سطح المكتب'); }
      finally { setRunning(false); }
      return;
    }
    try {
      const handle = await selectWatchedFolder();
      handleRef.current = handle;
      await saveFolderHandle('default', handle);
      setFolderName(handle.name || pathHint || 'المجلد المحدد');
      await runFolder(handle);
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setError(e instanceof Error ? e.message : 'فشل الوصول إلى المجلد');
      setRunning(false);
    }
  };

  const startWatch = async () => {
    setError(null);
    if (isDesktop) {
      try {
        const api = window.desktopFolderWatch;
        if (!api) throw new Error('DESKTOP_WATCH_UNAVAILABLE');
        if (!nativeRootRef.current) {
          const selected = await api.getSelectedDirectory();
          if (selected) applyNativeSelection(selected);
        }
        if (!nativeRootRef.current) {
          const selected = await api.selectDirectory();
          if (!selected) throw new Error('لم يتم اختيار مجلد.');
          applyNativeSelection(selected);
        }
        await api.start();
        setWatching(true);
      } catch (e: unknown) { setError(e instanceof Error ? e.message : 'تعذر تشغيل المزامنة الأصلية لسطح المكتب.'); }
      return;
    }
    try {
      const handle = handleRef.current ?? await loadFolderHandle('default');
      if (!handle) throw new Error('اختر المجلد أولاً ثم فعّل المزامنة.');
      if (!(await ensureFolderPermission(handle))) throw new Error('يجب السماح للتطبيق بقراءة المجلد لاستمرار المزامنة.');
      handleRef.current = handle;
      setFolderName(handle.name || 'المجلد المحدد');
      stopRef.current = startWatchedFolder(handle, async () => {
        const scan = await scanWatchedDirectory(handle.name, handle, DEFAULT_FOLDER_POLICY, storeRef.current);
        const changed = scan.files.filter((f) => f.state === 'new' || f.state === 'changed');
        if (changed.length) {
          const all = await scanDirectory(handle);
          const selected = all.filter((f) => changed.some((c) => c.path === f.relativePath));
          if (selected.length) await processFolderFilesUniversal(selected, persist);
        }
        return scan;
      }, DEFAULT_FOLDER_POLICY, () => undefined);
      setWatching(true);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'تعذر تشغيل المزامنة التلقائية.'); }
  };

  const stopWatch = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
    if (window.desktopFolderWatch?.isAvailable) void window.desktopFolderWatch.stop();
    setWatching(false);
  }, []);
  useEffect(() => () => stopWatch(), [stopWatch]);

  const completed = progress?.results.filter((r) => r.status === 'completed').length || 0;
  const analyzed = progress?.results.filter((r) => r.status === 'analyzed').length || 0;
  const failed = progress?.results.filter((r) => r.status === 'failed').length || 0;
  const skipped = progress?.results.filter((r) => r.status === 'skipped').length || 0;
  const importedRows = progress?.results.reduce((sum, r) => sum + r.committed, 0) || 0;
  const totalRows = progress?.results.reduce((sum, r) => sum + r.rows, 0) || 0;
  const pct = progress?.total ? Math.round((progress.processed / progress.total) * 100) : 0;

  return (
    <Card>
      <CardHeader title="مزامنة ذكية شاملة من مجلد" subtitle={isDesktop ? 'المجلد يُراقب محليًا عبر Windows Native Host، وكل ملف يمر بمحرك أمان واكتشاف وصيغة وتحليل وMapping تلقائي قبل قرار الكتابة.' : 'لا تختار نوع الملف مسبقًا. التطبيق يقرأ كل الملفات المدعومة، يكتشف نوع البيانات تلقائيًا، يحللها، ويحفظ التقدم حتى لو انتقلت إلى شاشة أخرى.'} />
      <CardBody>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg border p-3 bg-surface-50 flex items-center gap-2"><FileSearch size={18} /><div><div className="text-xs text-ink-400">محرك المعالجة</div><b>Universal File Intelligence</b></div></div>
          <input value={pathHint} onChange={(e) => setPathHint(e.target.value)} placeholder={isDesktop ? 'مسار المجلد يظهر هنا بعد الاختيار' : 'وصف المجلد'} className="input lg:col-span-2" readOnly={isDesktop} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => void chooseAndRun()} disabled={running || watching} className="btn-primary inline-flex items-center gap-2">{running ? <Loader2 size={16} className="animate-spin" /> : <FolderOpen size={16} />}{running ? 'جارٍ التحليل والمزامنة...' : 'اختيار المجلد وتحليله'}</button>
          {!watching ? <button onClick={() => void startWatch()} disabled={running} className="btn-secondary inline-flex items-center gap-2">{isDesktop ? <Monitor size={16} /> : <Radio size={16} />} تشغيل المزامنة التلقائية</button> : <button onClick={stopWatch} className="btn-secondary inline-flex items-center gap-2"><Square size={15} /> إيقاف المزامنة</button>}
          {progress && progress.processed > 0 && !running && <button onClick={() => void (async () => { const handle = handleRef.current ?? await loadFolderHandle('default'); if (!handle) { setError('صلاحية المجلد غير متاحة؛ اختر المجلد مرة أخرى.'); return; } await runFolder(handle); })()} className="btn-secondary inline-flex items-center gap-2"><RotateCcw size={15} /> إعادة فحص</button>}
          {folderName && <Badge variant="neutral">المجلد: {folderName}</Badge>}
          <Badge variant={watching ? 'success' : 'neutral'}>{watching ? <><Radio size={12} /> مراقبة مستمرة</> : <><ShieldCheck size={12} /> جاهز</>}</Badge>
        </div>
        <p className="text-xs text-ink-400 mt-3">كل ملف يُفحص أمنيًا، يُبصم SHA-256، ويُحلل بجميع أوراقه وحقوله. الحقول غير المعروفة لا تُرمى. الملفات التي لا تكفي لبناء كيان أعمال تُسجل كـ«محللة» بدل عرضها كفشل كاذب.</p>
        {error && <div className="mt-4 p-3 rounded-lg bg-danger-50 text-danger-700 text-sm flex gap-2"><AlertTriangle size={16} /> {error}</div>}
        {progress && <div className="mt-5 space-y-3">
          <div className="flex justify-between text-sm"><b>{progress.current ? `يعالج: ${progress.current}` : 'اكتملت آخر دورة'}</b><span>{pct}%</span></div>
          <div className="h-2 bg-ink-100 rounded-lg overflow-hidden"><div className="h-full bg-primary-500 transition-all" style={{ width: `${pct}%` }} /></div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="success"><CheckCircle2 size={12} /> مستورد: {completed}</Badge>
            <Badge variant="neutral"><FileSearch size={12} /> محلل: {analyzed}</Badge>
            <Badge variant="danger"><XCircle size={12} /> فشل حقيقي: {failed}</Badge>
            <Badge variant="warning">مكرر: {skipped}</Badge>
            <Badge variant="neutral">الملفات: {progress.total}</Badge>
            <Badge variant="success">الصفوف المكتوبة: {importedRows}</Badge>
            <Badge variant="neutral">الصفوف المحللة: {totalRows}</Badge>
          </div>
          {progress.results.length > 0 && <div className="border rounded-lg divide-y max-h-96 overflow-auto">{progress.results.map((r, i) => <div key={`${r.name}-${r.path}-${i}`} className="p-3 flex items-center justify-between gap-3 text-sm"><div className="min-w-0"><div className="font-medium truncate">{r.name}</div><div className="text-xs text-ink-400">{r.path} · {r.format} · {r.rows} صف · {r.datasets} مجموعة · {r.qualityScore}% جودة · {r.entityType}</div>{(r.error || r.warning) && <div className={`text-xs mt-1 ${r.status === 'failed' ? 'text-danger-600' : 'text-ink-500'}`}>{r.error || r.warning}</div>}</div><Badge variant={r.status === 'completed' ? 'success' : r.status === 'failed' ? 'danger' : r.status === 'skipped' ? 'warning' : 'neutral'}>{r.status === 'completed' ? `تم (${r.committed})` : r.status === 'failed' ? 'فشل' : r.status === 'skipped' ? 'مكرر' : 'محلل'}</Badge></div>)}</div>}
        </div>}
      </CardBody>
    </Card>
  );
}
