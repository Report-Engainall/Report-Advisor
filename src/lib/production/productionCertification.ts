export type CertificationCheck = { key: string; passed: boolean; severity: 'BLOCKER' | 'WARNING' | 'INFO'; evidence?: string };
export type CertificationResult = { certified: boolean; score: number; blockers: string[]; warnings: string[]; evidence: CertificationCheck[] };

export function certifyProduction(checks: CertificationCheck[]): CertificationResult {
  const blockers = checks.filter(c => !c.passed && c.severity === 'BLOCKER').map(c => c.key);
  const warnings = checks.filter(c => !c.passed && c.severity === 'WARNING').map(c => c.key);
  const score = checks.length ? checks.filter(c => c.passed).length / checks.length : 0;
  return { certified: blockers.length === 0 && score >= 0.95, score, blockers, warnings, evidence: checks };
}
