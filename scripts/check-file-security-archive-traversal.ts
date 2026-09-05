import { hasZipEntryTraversal, isUnsafeArchivePath } from '../src/lib/file-engine/archive-security.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Archive security regression failed: ${message}`);
}

function u16(value: number): number[] { return [value & 0xff, (value >>> 8) & 0xff]; }
function u32(value: number): number[] { return [value & 0xff, (value >>> 8) & 0xff, (value >>> 24) & 0xff]; }

function makeZipEntry(name: string): Uint8Array {
  const nameBytes = new TextEncoder().encode(name);
  const local = [0x50,0x4b,0x03,0x04, ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(0), ...u32(0), ...u16(nameBytes.length), ...u16(0), ...nameBytes];
  const central = [0x50,0x4b,0x01,0x02, ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(0), ...u32(0), ...u16(nameBytes.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(0), ...nameBytes];
  const eocd = [0x50,0x4b,0x05,0x06, ...u16(0), ...u16(0), ...u16(1), ...u16(1), ...u32(central.length), ...u32(local.length), ...u16(0)];
  return new Uint8Array([...local, ...central, ...eocd, ...new Array(100).fill(0)]);
}

function scan(name: string) {
  const bytes = makeZipEntry(name);
  return hasZipEntryTraversal(bytes.buffer);
}

assert(!isUnsafeArchivePath('reports/2026/report.csv'), 'normal nested ZIP entries must remain accepted');
assert(scan('../outside.txt'), 'parent traversal entry must be rejected');
assert(scan('reports/../../outside.txt'), 'nested parent traversal entry must be rejected');
assert(scan('/absolute/path.txt'), 'absolute POSIX entry path must be rejected');
assert(scan('C:/absolute/path.txt'), 'absolute Windows entry path must be rejected');

console.log('File security archive traversal: PASS');
