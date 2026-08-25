/**
 * Low-bandwidth / intermittent-network policy primitives.
 *
 * This module is intentionally framework-agnostic and does not perform I/O.
 * It provides safe decisions for UI/read layers without changing canonical
 * data truth, authentication, or persistence.
 */

export type NetworkQuality = 'offline' | 'slow' | 'normal' | 'fast' | 'unknown';

export type DataFreshness =
  | 'live'
  | 'fresh-cache'
  | 'stale-cache'
  | 'unknown';

export interface CachedReadMeta {
  cachedAt: string;
  expiresAt?: string;
  source: 'memory' | 'browser-cache' | 'indexeddb' | 'server-cache';
  freshness: DataFreshness;
}

export interface ReadPolicy {
  network: NetworkQuality;
  allowCache: boolean;
  allowStaleCache: boolean;
  maxRows: number;
  maxPayloadBytes: number;
  progressive: boolean;
  retry: boolean;
}

const DEFAULT_MAX_ROWS = 250;
const DEFAULT_MAX_PAYLOAD_BYTES = 512 * 1024;

export function classifyNetwork(effectiveType?: string | null, online = true): NetworkQuality {
  if (!online) return 'offline';
  switch ((effectiveType ?? '').toLowerCase()) {
    case 'slow-2g':
    case '2g':
      return 'slow';
    case '3g':
      return 'normal';
    case '4g':
      return 'fast';
    default:
      return 'unknown';
  }
}

export function getReadPolicy(network: NetworkQuality): ReadPolicy {
  switch (network) {
    case 'offline':
      return {
        network,
        allowCache: true,
        allowStaleCache: true,
        maxRows: 100,
        maxPayloadBytes: 128 * 1024,
        progressive: true,
        retry: true,
      };
    case 'slow':
      return {
        network,
        allowCache: true,
        allowStaleCache: true,
        maxRows: 100,
        maxPayloadBytes: 192 * 1024,
        progressive: true,
        retry: true,
      };
    case 'normal':
      return {
        network,
        allowCache: true,
        allowStaleCache: true,
        maxRows: DEFAULT_MAX_ROWS,
        maxPayloadBytes: DEFAULT_MAX_PAYLOAD_BYTES,
        progressive: true,
        retry: true,
      };
    case 'fast':
      return {
        network,
        allowCache: true,
        allowStaleCache: false,
        maxRows: 500,
        maxPayloadBytes: 1024 * 1024,
        progressive: true,
        retry: true,
      };
    default:
      return {
        network,
        allowCache: true,
        allowStaleCache: true,
        maxRows: DEFAULT_MAX_ROWS,
        maxPayloadBytes: DEFAULT_MAX_PAYLOAD_BYTES,
        progressive: true,
        retry: true,
      };
  }
}

export function retryDelayMs(attempt: number, baseMs = 500, maxMs = 8000): number {
  const safeAttempt = Math.max(0, Math.min(attempt, 8));
  const exponential = baseMs * 2 ** safeAttempt;
  const jitter = Math.floor(exponential * 0.2 * Math.random());
  return Math.min(maxMs, exponential + jitter);
}

export function freshnessOf(meta: CachedReadMeta | undefined, now = Date.now()): DataFreshness {
  if (!meta) return 'unknown';
  const cachedAt = Date.parse(meta.cachedAt);
  if (!Number.isFinite(cachedAt)) return 'unknown';
  if (meta.expiresAt && Number.isFinite(Date.parse(meta.expiresAt)) && now <= Date.parse(meta.expiresAt)) {
    return 'fresh-cache';
  }
  return 'stale-cache';
}

export function canUseCachedRead(
  meta: CachedReadMeta | undefined,
  policy: ReadPolicy,
  now = Date.now(),
): boolean {
  if (!policy.allowCache || !meta) return false;
  const freshness = freshnessOf(meta, now);
  return freshness === 'fresh-cache' || (freshness === 'stale-cache' && policy.allowStaleCache);
}
