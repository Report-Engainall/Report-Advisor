export function resolveReportEvidenceStatus(
  rendered: Record<string, unknown>,
  canonicalCommitVerified: boolean,
): string {
  const renderedStatus =
    rendered.evidenceStatus == null ? null : String(rendered.evidenceStatus);
  const evidenceSnapshotId =
    typeof rendered.evidenceSnapshotId === 'string'
      ? rendered.evidenceSnapshotId.trim()
      : '';

  if (renderedStatus === 'VERIFIED') {
    if (canonicalCommitVerified && evidenceSnapshotId) return 'VERIFIED';
    return canonicalCommitVerified ? 'AWAITING_EVIDENCE_SNAPSHOT' : 'PENDING_EVIDENCE';
  }

  return renderedStatus ?? (canonicalCommitVerified ? 'AWAITING_EVIDENCE_SNAPSHOT' : 'PENDING_EVIDENCE');
}

export function resolveReportTrustState(
  rendered: Record<string, unknown>,
  passport: Record<string, unknown> | null | undefined,
  evidenceStatus: string,
  canonicalCommitVerified: boolean,
): string {
  const renderedTrust = rendered.trustState == null ? '' : String(rendered.trustState).trim();
  if (renderedTrust) return renderedTrust;

  const verificationStatus = String(passport?.verification_status ?? '').trim().toUpperCase();
  const decisionReadiness = String(passport?.decision_readiness ?? '').trim().toUpperCase();
  const acceptanceStatus = String(passport?.acceptance_status ?? '').trim().toUpperCase();

  if (
    verificationStatus === 'VERIFIED' &&
    decisionReadiness === 'READY' &&
    acceptanceStatus === 'ACCEPTED' &&
    canonicalCommitVerified &&
    evidenceStatus === 'VERIFIED'
  ) {
    return 'TRUSTED';
  }

  if (verificationStatus === 'BLOCKED') return 'BLOCKED';
  if (verificationStatus === 'REVIEW') return 'REVIEW';

  if (
    verificationStatus === 'VERIFIED' &&
    canonicalCommitVerified &&
    evidenceStatus === 'VERIFIED'
  ) {
    return 'VERIFIED';
  }

  if (
    evidenceStatus === 'PENDING_EVIDENCE' ||
    evidenceStatus === 'AWAITING_EVIDENCE_SNAPSHOT'
  ) {
    return evidenceStatus;
  }

  return 'REVIEW';
}
