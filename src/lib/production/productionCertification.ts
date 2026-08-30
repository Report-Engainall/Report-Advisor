export type CertificationEvidenceKey = 'tenant' | 'backup' | 'rollback' | 'artifact' | 'security';

export const PRODUCTION_CERTIFICATION_EVIDENCE_KEYS: readonly CertificationEvidenceKey[] = [
  'tenant',
  'backup',
  'rollback',
  'artifact',
  'security',
];

export type CertificationCheck = { key: string; passed: boolean; severity: 'BLOCKER' | 'WARNING' | 'INFO'; evidence?: string };
export type CertificationResult = { certified: boolean; score: number; blockers: string[]; warnings: string[]; evidence: CertificationCheck[] };

export function certifyProduction(checks: CertificationCheck[]): CertificationResult {
  const seen = new Set<string>();
  const blockers = checks.filter(c => !c.passed && c.severity === 'BLOCKER').map(c => c.key);
  const warnings = checks.filter(c => !c.passed && c.severity === 'WARNING').map(c => c.key);

  for (const check of checks) {
    if (seen.has(check.key)) blockers.push(`DUPLICATE_EVIDENCE:${check.key}`);
    seen.add(check.key);
  }

  for (const key of PRODUCTION_CERTIFICATION_EVIDENCE_KEYS) {
    const check = checks.find(c => c.key === key);
    if (!check) blockers.push(`MISSING_EVIDENCE:${key}`);
    else if (!check.passed) blockers.push(`FAILED_EVIDENCE:${key}`);
  }

  const score = checks.length ? checks.filter(c => c.passed).length / checks.length : 0;
  return { certified: blockers.length === 0 && score >= 0.95, score, blockers, warnings, evidence: checks };
}
