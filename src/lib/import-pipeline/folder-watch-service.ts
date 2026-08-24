import { isSupportedReportExtension } from './report-file-contract';
import { classifyFolderFile, type FolderFileRecord, type FolderMonitorPolicy, type FolderScanResult } from './folder-monitor-contract';
import { decideIncrementalImport, type ImportFingerprint } from './incremental-import-ledger';

export interface FolderEntry { name: string; path: string; size: number; lastModified: number; file: File; }
export interface FolderSnapshotStore { get(key: string): Promise<FolderFileRecord | undefined>; put(key: string, value: FolderFileRecord): Promise<void>; }

export async function sha256File(file: File): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function* walk(handle: FileSystemDirectoryHandle, prefix = ''): AsyncGenerator<FolderEntry> {
  for await (const [name, child] of handle.entries()) {
    const relative = prefix ? `${prefix}/${name}` : name;
    if (child.kind === 'directory') yield* walk(child, relative);
    else yield { name, path: relative, file: await child.getFile(), size: (await child.getFile()).size, lastModified: (await child.getFile()).lastModified };
  }
}

export async function scanWatchedDirectory(folderId: string, handle: FileSystemDirectoryHandle, policy: FolderMonitorPolicy, store: FolderSnapshotStore, now = new Date().toISOString()): Promise<FolderScanResult> {
  const files: FolderFileRecord[] = [];
  let newFiles = 0, changedFiles = 0, unchangedFiles = 0, failedFiles = 0;
  for await (const entry of walk(handle)) {
    if (!policy.acceptedExtensions.some(ext => entry.path.toLowerCase().endsWith(ext)) || !isSupportedReportExtension(entry.path)) continue;
    const key = `${folderId}:${entry.path}`;
    try {
      const contentHash = await sha256File(entry.file);
      const current = { path: entry.path, fingerprint: contentHash, size: entry.size, modifiedAt: new Date(entry.lastModified).toISOString() };
      const previous = await store.get(key);
      const state = classifyFolderFile(previous, current);
      const fp: ImportFingerprint = { sourceKey: key, contentHash, sizeBytes: entry.size, modifiedAt: current.modifiedAt };
      const decision = decideIncrementalImport(fp, previous ? { sourceKey: key, contentHash: previous.fingerprint, sizeBytes: previous.size, modifiedAt: previous.modifiedAt } : undefined);
      const finalState = decision.action === 'skip_unchanged' ? 'unchanged' : state === 'new' ? 'new' : 'changed';
      if (finalState === 'new') newFiles++; else if (finalState === 'changed') changedFiles++; else unchangedFiles++;
      files.push({ path: entry.path, fingerprint: contentHash, size: entry.size, modifiedAt: current.modifiedAt, state: finalState });
      await store.put(key, { path: entry.path, fingerprint: contentHash, size: entry.size, modifiedAt: current.modifiedAt, state: finalState, lastProcessedAt: previous?.lastProcessedAt, lastSuccessfulCheckpoint: previous?.lastSuccessfulCheckpoint });
    } catch (error) {
      failedFiles++;
      files.push({ path: entry.path, fingerprint: '', size: entry.size, modifiedAt: new Date(entry.lastModified).toISOString(), state: 'failed', error: error instanceof Error ? error.message : String(error) });
    }
  }
  return { folder: folderId, scannedAt: now, files, newFiles, changedFiles, unchangedFiles, failedFiles };
}

export function startWatchedFolder(handle: FileSystemDirectoryHandle, scan: () => Promise<FolderScanResult>, policy: FolderMonitorPolicy, onScan: (result: FolderScanResult) => void): () => void {
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const loop = async () => {
    if (stopped) return;
    try { onScan(await scan()); } finally { if (!stopped) timer = setTimeout(loop, Math.max(1000, policy.pollIntervalMs)); }
  };
  void handle;
  void loop();
  return () => { stopped = true; if (timer) clearTimeout(timer); };
}
