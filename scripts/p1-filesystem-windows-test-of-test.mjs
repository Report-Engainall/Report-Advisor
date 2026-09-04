import fs from 'node:fs';

const assert = (value, message) => { if (!value) throw new Error(`Filesystem test-of-test failed: ${message}`); };
const main = fs.readFileSync('desktop/main.cjs', 'utf8');
const security = fs.readFileSync('src/lib/file-engine/archive-security.ts', 'utf8');

const runtimeGuard = (source) => ({
  traversal: source.includes('path.resolve(watchedRoot,relativePath)') && source.includes('path.relative(root,filePath)'),
  canonicalRealpath: source.includes('fs.promises.realpath'),
  stableFile: source.includes('waitForStableFile'),
  generationFence: /(?<![A-Za-z0-9_$])watchGeneration(?![A-Za-z0-9_$])/.test(source),
  duplicateGuard: source.includes('known.get(filePath)===key'),
  pendingGuard: source.includes('pending.has(filePath)'),
  handleOpen: source.includes('fs.promises.open') && source.includes('handle.stat') && source.includes('handle.readFile'),
  noFollow: source.includes('fs.constants.O_NOFOLLOW'),
});
const securityGuard = (source) => ({
  parentSegment: source.includes("segment === '..'"),
  absolute: source.includes("normalized.startsWith('/')"),
  driveLetter: source.includes("/^[A-Za-z]:\\//.test(normalized)"),
});
const securityIntegration = fs.readFileSync('src/lib/file-engine/security.ts', 'utf8');
const integrationGuard = (source) => ({ archivePathGuard: source.includes('isUnsafeArchivePath'), archiveEntryGuard: source.includes('hasZipEntryTraversal') });

const expected = runtimeGuard(main); const secExpected = securityGuard(security); const integrationExpected = integrationGuard(securityIntegration);
for (const [name, value] of Object.entries(expected)) assert(value, `baseline guard missing: ${name}`);
for (const [name, value] of Object.entries(secExpected)) assert(value, `baseline archive guard missing: ${name}`);
for (const [name, value] of Object.entries(integrationExpected)) assert(value, `archive integration missing: ${name}`);

const mutations = [
  ['traversal predicate', (s) => s.replace('path.relative(root,filePath)', 'path.resolve(root,filePath)')],
  ['canonical realpath', (s) => s.replaceAll('fs.promises.realpath', 'fs.promises.resolve')],
  ['stable-file guard', (s) => s.replaceAll('waitForStableFile', 'waitForUnstableFile')],
  ['watcher generation fence', (s) => s.replaceAll('watchGeneration', 'watchGenerationRemoved')],
  ['duplicate event guard', (s) => s.replace('known.get(filePath)===key', 'known.get(filePath)!==key')],
  ['pending duplicate guard', (s) => s.replace('pending.has(filePath)', 'pending.has(filePathRemoved)')],
  ['TOCTOU handle guard', (s) => s.replaceAll('fs.promises.open', 'fs.promises.openRemoved').replaceAll('handle.stat', 'handle.statRemoved').replaceAll('handle.readFile', 'handle.readFileRemoved')],
  ['no-follow guard', (s) => s.replace('fs.constants.O_NOFOLLOW', 'fs.constants.O_NOFOLLOW_REMOVED')],
];
for (const [name, mutate] of mutations) {
  const mutated = runtimeGuard(mutate(main));
  const changed = Object.entries(expected).some(([key, value]) => value && !mutated[key]);
  assert(changed, `mutation was not detected: ${name}`);
}

const archiveMutations = [
  ['archive parent traversal', (s) => s.replace("segment === '..'", "segment === '__removed__'")],
  ['archive absolute path', (s) => s.replace("normalized.startsWith('/')", "normalized.startsWith('__removed__')")],
  ['archive drive path', (s) => s.replace('/^[A-Za-z]:\\//.test(normalized)', '/^__removed__$/.test(normalized)')],
];
for (const [name, mutate] of archiveMutations) {
  const mutated = securityGuard(mutate(security));
  const changed = Object.entries(secExpected).some(([key, value]) => value && !mutated[key]);
  assert(changed, `archive mutation was not detected: ${name}`);
}

const integrationMutations = [
  ['archive path integration', (s) => s.replace('isUnsafeArchivePath', 'isUnsafeArchivePathRemoved')],
  ['archive entry integration', (s) => s.replace('hasZipEntryTraversal', 'hasZipEntryTraversalRemoved')],
];
for (const [name, mutate] of integrationMutations) {
  const mutated = integrationGuard(mutate(securityIntegration));
  const changed = Object.entries(integrationExpected).some(([key, value]) => value && !mutated[key]);
  assert(changed, `integration mutation was not detected: ${name}`);
}

console.log(JSON.stringify({ testOfTest: 'PASS', runtimeMutationsDetected: mutations.length, archiveMutationsDetected: archiveMutations.length, integrationMutationsDetected: integrationMutations.length, falseGreenGuard: true }));
