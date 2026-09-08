import type { UniversalFolderProgress } from './folder-universal-sync';

const KEY = 'report-advisor:folder-sync:latest:v1';

export interface PersistedFolderSyncSession {
  folderName: string;
  folderPath: string;
  progress: UniversalFolderProgress;
}

export function saveFolderSyncSession(session: PersistedFolderSyncSession): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    // Storage can be unavailable in private/restricted browser contexts.
  }
}

export function loadFolderSyncSession(): PersistedFolderSyncSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as PersistedFolderSyncSession;
    if (!value?.progress || !Array.isArray(value.progress.results)) return null;
    return value;
  } catch {
    return null;
  }
}

export function clearFolderSyncSession(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Ignore storage failures.
  }
}
