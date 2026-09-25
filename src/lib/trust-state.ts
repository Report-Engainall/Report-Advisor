export type TrustState = 'VERIFIED' | 'TRUSTED' | 'PARTIAL' | 'REVIEW' | 'BLOCKED' | 'INSUFFICIENT_DATA' | 'INSUFFICIENT_SAMPLE';

export function trustStateFromDataStatus(status?: string): TrustState {
  switch (status) {
    case 'CONFIRMED': return 'VERIFIED';
    case 'CALCULATED': return 'TRUSTED';
    case 'ESTIMATED': return 'PARTIAL';
    case 'FORECAST': return 'REVIEW';
    case 'INSUFFICIENT_SAMPLE':
    case 'SAMPLE_TOO_SMALL': return 'INSUFFICIENT_SAMPLE';
    case 'INSUFFICIENT_DATA': return 'INSUFFICIENT_DATA';
    case 'UNAVAILABLE': return 'BLOCKED';
    default: return 'REVIEW';
  }
}
