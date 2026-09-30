export type ActiveReportContext = {
  jobId: string;
  sourceHash: string;
  savedAt: number;
};

const KEY = 'aghbari.active-report-context.v1';

export function saveActiveReportContext(context: Omit<ActiveReportContext, 'savedAt'>): void {
  if (!context.jobId.trim() || !context.sourceHash.trim() || typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify({ ...context, savedAt: Date.now() }));
  } catch {
    // Best effort only; the source-bound URL remains authoritative.
  }
}

export function readActiveReportContext(): ActiveReportContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return null;
    const record = value as Record<string, unknown>;
    const jobId = typeof record.jobId === 'string' ? record.jobId.trim() : '';
    const sourceHash = typeof record.sourceHash === 'string' ? record.sourceHash.trim() : '';
    const savedAt = typeof record.savedAt === 'number' ? record.savedAt : 0;
    if (!jobId || !sourceHash || !savedAt) return null;
    return { jobId, sourceHash, savedAt };
  } catch {
    return null;
  }
}

export function clearActiveReportContext(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // Best effort.
  }
}
