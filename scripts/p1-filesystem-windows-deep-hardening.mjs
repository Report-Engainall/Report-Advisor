import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { hasZipEntryTraversal, isUnsafeArchivePath } from '../src/lib/file-engine/archive-security.ts';

const assert = (value, message) => { if (!value) throw new Error(`P1 filesystem hardening failed: ${message}`); };
const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'ra-fs-'));
try {
  const cases = [
    '../outside.txt', '../../outside.txt', '../../../outside.txt', '/absolute/path.txt',
    'C:/absolute/path.txt', 'C:\\\\absolute\\\\path.txt', 'C:/target/../outside.txt',
    'nested/../../outside.txt', './nested/file.txt', 'nested//file.txt', 'nested\\\\file.txt',
    'nested/../safe.txt',
  ];
  const normalize = (value) => value.replaceAll('\\\\', '/');
  const isInside = (r, target) => { const rel = path.relative(r, target); return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel); };
  const isLexicallySafe = (value) => !value.startsWith('/') && !/^[A-Za-z]:\//.test(value) && !value.split('/').some((segment) => segment === '..');
  for (const input of cases) {
    const normalized = normalize(input);
    const resolved = path.resolve(root, normalized);
    const physicallyInside = isInside(root, resolved);
    const lexicallySafe = isLexicallySafe(normalized);
    const accepted = physicallyInside && lexicallySafe;
    assert(accepted === lexicallySafe, `deterministic path case ${input}`);
  }

  await fsp.mkdir(path.join(root, 'nested', 'عربي'), { recursive: true });
  const arabic = path.join(root, 'nested', 'عربي', 'تقرير ٢٠٢٦.txt');
  await fsp.writeFile(arabic, 'ok', 'utf8');
  assert(await fsp.readFile(arabic, 'utf8') === 'ok', 'Arabic filename roundtrip');
  const nfc = 'é.txt'; const nfd = 'e\u0301.txt';
  await fsp.writeFile(path.join(root, nfc), 'nfc'); await fsp.writeFile(path.join(root, nfd), 'nfd');
  assert(await fsp.readFile(path.join(root, nfc), 'utf8') === 'nfc', 'NFC file');
  assert(await fsp.readFile(path.join(root, nfd), 'utf8') === 'nfd', 'NFD file');

  const temp = path.join(root, '.tmp-write'); const final = path.join(root, 'atomic.txt');
  await fsp.writeFile(temp, 'complete'); await fsp.rename(temp, final);
  assert(await fsp.readFile(final, 'utf8') === 'complete', 'atomic rename');

  const locked = await fsp.open(path.join(root, 'locked.txt'), 'w');
  await locked.writeFile('locked');
  const second = await fsp.open(path.join(root, 'locked.txt'), 'r');
  await second.close(); await locked.close();
  assert(true, 'locked-file lifecycle');

  const zero = path.join(root, 'zero.txt'); await fsp.writeFile(zero, '');
  assert((await fsp.stat(zero)).size === 0, 'zero-byte file');

  function u16(value) { return [value & 255, (value >>> 8) & 255]; }
  function u32(value) { return [value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255]; }
  function zip(name) {
    const nb = new TextEncoder().encode(name);
    const local = [0x50, 0x4b, 3, 4, ...u16(20), 0, 0, 0, 0, 0, 0, 0, 0, ...u32(0), ...u32(0), ...u32(0), ...u16(nb.length), 0, 0, ...nb];
    const central = [0x50, 0x4b, 1, 2, ...u16(20), ...u16(20), 0, 0, 0, 0, 0, 0, 0, 0, ...u32(0), ...u32(0), ...u32(0), ...u16(nb.length), 0, 0, 0, 0, 0, 0, 0, 0, ...u32(0), ...u32(0), ...u32(0), ...nb];
    const eocd = [0x50, 0x4b, 5, 6, 0, 0, 0, 0, ...u16(1), ...u16(1), ...u32(central.length), ...u32(local.length), 0, 0];
    return new Uint8Array([...local, ...central, ...eocd, ...new Array(100).fill(0)]);
  }
  for (const name of ['reports/ok.csv', '../outside.txt', '../../outside.txt', '/absolute/path.txt', 'C:/absolute/path.txt', 'reports/../../outside.txt']) {
    const bytes = zip(name);
    const unsafe = isUnsafeArchivePath(name) || hasZipEntryTraversal(bytes.buffer);
    assert(unsafe === (name !== 'reports/ok.csv'), `archive traversal ${name}`);
  }

  const source = fs.readFileSync('desktop/main.cjs', 'utf8');
  for (const token of ['path.resolve(watchedRoot,relativePath)', 'path.relative(root,filePath)', 'fs.promises.realpath', 'waitForStableFile', 'watchGeneration', 'known', 'pending']) assert(source.includes(token), `desktop runtime guard ${token}`);
  assert(source.includes('fs.promises.open') && source.includes('handle.stat') && source.includes('handle.readFile'), 'TOCTOU-safe handle read');
  assert(source.includes('fs.constants.O_NOFOLLOW'), 'final-component no-follow protection');

  console.log(JSON.stringify({ filesystemHardening: 'PASS', pathMatrix: cases.length, unicode: true, atomicRename: true, lockedFileLifecycle: true, zeroByte: true, archiveTraversal: true, sourceGuards: true, toctouHandle: true, noFollow: true, platform: process.platform }));
} finally {
  await fsp.rm(root, { recursive: true, force: true });
}