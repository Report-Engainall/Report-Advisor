export type BenchmarkReference = 'TARGET' | 'PEER_MEDIAN' | 'NONE';
export type BenchmarkAvailability = 'AVAILABLE' | 'INSUFFICIENT_SAMPLE' | 'UNAVAILABLE';

export interface BenchmarkCohort {
  industry: string;
  region?: string;
  currency?: string;
  minPeers: number;
  peerCount: number;
  referenceValue: number | null;
  referenceType: BenchmarkReference;
}

export interface BenchmarkAssessment {
  availability: BenchmarkAvailability;
  referenceType: BenchmarkReference;
  value: number;
  referenceValue: number | null;
  gap: number | null;
  cohort?: BenchmarkCohort;
}

export function assessBenchmark(
  value: number,
  cohort?: BenchmarkCohort,
  fallbackTarget?: number | null,
): BenchmarkAssessment {
  if (!cohort && fallbackTarget == null) {
    return { availability: 'UNAVAILABLE', referenceType: 'NONE', value, referenceValue: null, gap: null };
  }
  if (cohort && cohort.peerCount < cohort.minPeers && cohort.referenceValue == null) {
    return { availability: 'INSUFFICIENT_SAMPLE', referenceType: 'NONE', value, referenceValue: null, gap: null, cohort };
  }
  const referenceValue = cohort?.referenceValue ?? fallbackTarget ?? null;
  const referenceType = cohort?.referenceValue != null ? cohort.referenceType : 'TARGET';
  return {
    availability: 'AVAILABLE',
    referenceType,
    value,
    referenceValue,
    gap: referenceValue == null ? null : value - referenceValue,
    cohort,
  };
}
