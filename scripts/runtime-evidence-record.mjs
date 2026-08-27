export const RUNTIME_EVIDENCE_FIELDS = [
  'TEST_ID', 'ENVIRONMENT', 'RELEASE', 'COMMIT_SHA', 'TIMESTAMP', 'ACTOR',
  'AUTHORIZED_TENANT', 'TARGET_TENANT', 'SURFACE', 'OPERATION', 'INPUT',
  'EXPECTED', 'ACTUAL', 'ROWS_RETURNED', 'ROWS_AFFECTED', 'ERROR_CODE',
  'RESULT', 'EVIDENCE_REFERENCE',
];

const FORBIDDEN_KEY_PATTERNS = /(password|token|secret|service[-_]?role|api[-_]?key|access[-_]?key|authorization|cookie|pii)/i;

export function sanitizeEvidence(value) {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(sanitizeEvidence);
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [
    key,
    FORBIDDEN_KEY_PATTERNS.test(key) ? '[REDACTED]' : sanitizeEvidence(entry),
  ]));
}

export function createEvidenceRecord(input) {
  const missing = RUNTIME_EVIDENCE_FIELDS.filter((field) => input?.[field] === undefined || input?.[field] === null || input?.[field] === '');
  if (missing.length) throw new Error(`NOT VERIFIED: incomplete evidence record: ${missing.join(', ')}`);
  const result = String(input.RESULT);
  if (!['PASS', 'FAIL', 'NOT VERIFIED'].includes(result)) throw new Error(`Invalid evidence result: ${result}`);
  if (result === 'PASS' && (!Number.isInteger(input.ROWS_RETURNED) || !Number.isInteger(input.ROWS_AFFECTED))) {
    throw new Error('NOT VERIFIED: a PASS record requires integer row counts.');
  }
  return Object.freeze(sanitizeEvidence({ ...input }));
}
