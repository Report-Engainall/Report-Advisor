export type TrustState = 'VERIFIED' | 'TRUSTED' | 'PARTIAL' | 'REVIEW' | 'BLOCKED' | 'INSUFFICIENT_DATA' | 'INSUFFICIENT_SAMPLE';

export function trustStateFromDataStatus(status?: string): TrustState {
  const normalized = status?.trim().toUpperCase();
  switch (normalized) {
    case 'CONFIRMED': return 'VERIFIED';
    case 'CALCULATED': return 'TRUSTED';
    case 'ESTIMATED': return 'PARTIAL';
    case 'FORECAST':
    case 'REVIEW':
    case 'REVIEW_REQUIRED': return 'REVIEW';
    case 'INSUFFICIENT_SAMPLE':
    case 'SAMPLE_TOO_SMALL': return 'INSUFFICIENT_SAMPLE';
    case 'INSUFFICIENT_DATA':
    case 'NO_DATA': return 'INSUFFICIENT_DATA';
    case 'UNAVAILABLE':
    case 'BLOCKED': return 'BLOCKED';
    default: return 'REVIEW';
  }
}
