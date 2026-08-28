export function mutationTargetId(fixture) {
  if (!fixture || typeof fixture !== 'object') throw new Error('NOT VERIFIED: mutation fixture is required.');
  const ownId = fixture.own?.id ?? null;
  const restoreId = fixture.restore?.id ?? null;
  if (fixture.operation === 'INSERT') {
    const targetId = ownId ?? restoreId;
    if (!targetId) throw new Error(`NOT VERIFIED: INSERT mutation target identity is missing for ${fixture.table}`);
    if (ownId && restoreId && ownId !== restoreId) {
      throw new Error(`NOT VERIFIED: mutation target identity diverges for ${fixture.table}/INSERT: own=${ownId}, restore=${restoreId}`);
    }
    return targetId;
  }
  if (!ownId || !restoreId) throw new Error(`NOT VERIFIED: mutation target identity is required for ${fixture.table}/${fixture.operation}`);
  if (ownId !== restoreId) {
    throw new Error(`NOT VERIFIED: mutation target identity diverges for ${fixture.table}/${fixture.operation}: own=${ownId}, restore=${restoreId}`);
  }
  return ownId;
}

export function assertMutationTargetIdentity(fixture, targetId, observedId = targetId) {
  const canonicalId = mutationTargetId(fixture);
  if (targetId !== canonicalId || observedId !== canonicalId) {
    throw new Error(`NOT VERIFIED: mutation target identity mismatch for ${fixture.table}/${fixture.operation}: canonical=${canonicalId}, target=${targetId}, observed=${observedId}`);
  }
  return canonicalId;
}

export function assertMutationResponseIdentity(fixture, targetId, responseData = []) {
  const canonicalId = assertMutationTargetIdentity(fixture, targetId);
  const ids = responseData.map((row) => row?.id).filter(Boolean);
  if (ids.length && ids.some((id) => id !== canonicalId)) {
    throw new Error(`NOT VERIFIED: mutation response identity mismatch for ${fixture.table}/${fixture.operation}: canonical=${canonicalId}, response=${ids.join(',')}`);
  }
  return canonicalId;
}
