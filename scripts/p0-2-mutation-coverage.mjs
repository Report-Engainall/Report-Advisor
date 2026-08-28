import { CHILD_TABLES } from './runtime-evidence-matrix.mjs';

export const MUTATION_OPERATIONS = ['INSERT', 'UPDATE', 'DELETE'];

export function mutationCoverageKey(table, operation) {
  return `${table}::${operation}`;
}

export function requiredChildMutationKeys() {
  return CHILD_TABLES.flatMap((table) => MUTATION_OPERATIONS.map((operation) => mutationCoverageKey(table, operation)));
}

export function validateChildMutationCoverage(fixtures) {
  if (!Array.isArray(fixtures)) throw new Error('NOT VERIFIED: mutation fixtures must be an array.');
  const keys = fixtures.map((item) => mutationCoverageKey(item.table, item.operation));
  const required = requiredChildMutationKeys();
  const seen = new Set();
  const duplicates = keys.filter((key) => {
    if (seen.has(key)) return true;
    seen.add(key);
    return false;
  });
  const missing = required.filter((key) => !seen.has(key));
  const invalid = fixtures.filter((item) => !CHILD_TABLES.includes(item.table) || !MUTATION_OPERATIONS.includes(item.operation));
  if (duplicates.length) throw new Error(`NOT VERIFIED: duplicate child mutation cases: ${[...new Set(duplicates)].join(', ')}`);
  if (invalid.length) throw new Error(`NOT VERIFIED: invalid child mutation cases: ${invalid.map((item) => `${item.table}::${item.operation}`).join(', ')}`);
  if (missing.length) throw new Error(`NOT VERIFIED: F13 child mutation coverage incomplete: ${missing.join(', ')}`);
  return { required, actual: [...seen] };
}
