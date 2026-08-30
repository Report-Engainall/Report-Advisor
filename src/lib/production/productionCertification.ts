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

const REQUIRED_EVIDENCE_KEYS = new Set<string>(PRODUCTION_CERTIFICATION_EVIDENCE_KEYS);

export function certifyProduction(checks: CertificationCheck[]): CertificationResult {
  const blockers = checks.filter(c => !c.passed && c.severity === 'BLOCKER').map(c => c.key);
  const warnings = checks.filter(c => !c.passed && c.severity === 'WARNING').map(c => c.key);
  const checksByKey = new Map<string, CertificationCheck>();
  const duplicateEvidence = new Set<string>();
  for (const check of checks) {
    if (checksByKey.has(check.key)) duplicateEvidence.add(check.key);
    else checksByKey.set(check.key, check);
  }

  const missingEvidence = PRODUCTION_CERTIFICATION_EVIDENCE_KEYS.filter(key => !checksByKey.has(key));
  const failedEvidence = PRODUCTION_CERTIFICATION_EVIDENCE_KEYS.filter(key => {
    const check = checksByKey.get(key);
    return check !== undefined && !check.passed;
  });
  const duplicateMandatoryEvidence = PRODUCTION_CERTIFICATION_EVIDENCE_KEYS.filter(key => duplicateEvidence.has(key));
  const evidenceComplete = missingEvidence.length === 0 && failedEvidence.length === 0 && duplicateMandatoryEvidence.length === 0;

  // Certification score is scoped to the five mandatory evidence domains; supplementary warnings remain visible without diluting a complete evidence package.
  const mandatoryChecks = PRODUCTION_CERTIFICATION_EVIDENCE_KEYS.map(key => checksByKey.get(key)).filter(
    (check): check is CertificationCheck => check !== undefined,
  );
  const score = PRODUCTION_CERTIFICATION_EVIDENCE_KEYS.length
    ? mandatoryChecks.filter(c => c.passed).length / PRODUCTION_CERTIFICATION_EVIDENCE_KEYS.length
    : 0;

  const certificationBlockers = [
    ...blockers,
    ...missingEvidence.map(key => `MISSING_EVIDENCE:${key}`),
    ...failedEvidence.map(key => `FAILED_EVIDENCE:${key}`),
    ...duplicateMandatoryEvidence.map(key => `DUPLICATE_EVIDENCE:${key}`),
  ];

  return {
    certified: certificationBlockers.length === 0 && score >= 0.95 && evidenceComplete,
    score,
    blockers: [...new Set(certificationBlockers)],
    warnings,
    evidence: checks,
  };
}

export function isMandatoryCertificationEvidenceKey(key: string): key is CertificationEvidenceKey {
  return REQUIRED_EVIDENCE_KEYS.has(key);
}
