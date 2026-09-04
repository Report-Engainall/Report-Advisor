const ZIP_EOCD = 0x06054b50;
const ZIP_CENTRAL = 0x02014b50;
const ZIP64_SENTINEL = 0xffffffff;

export const ARCHIVE_RESOURCE_LIMITS = Object.freeze({
  maxEntries: 5000,
  maxExpandedBytes: 250 * 1024 * 1024,
  maxSingleEntryBytes: 100 * 1024 * 1024,
  maxCompressionRatio: 100,
});

export function isUnsafeArchivePath(name: string): boolean {
  const normalized = name.replaceAll('\\', '/');
  return normalized.includes('\0')
    || normalized.startsWith('/')
    || /^[A-Za-z]:\//.test(normalized)
    || normalized.split('/').some(segment => segment === '..');
}

interface ZipEntryResource {
  name: string;
  compressedSize: number;
  uncompressedSize: number;
}

function findEocd(view: DataView, length: number): number {
  const minEocd = 22;
  const maxComment = 0xffff;
  const start = Math.max(0, length - minEocd - maxComment);
  for (let i = length - minEocd; i >= start; i -= 1) {
    if (i >= 0 && view.getUint32(i, true) === ZIP_EOCD) return i;
  }
  return -1;
}

function readCentralDirectory(buffer: ArrayBuffer): ZipEntryResource[] {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const eocd = findEocd(view, bytes.length);
  if (eocd < 0) throw new Error('ARCHIVE_INVALID_EOCD');

  const entryCount = view.getUint16(eocd + 10, true);
  const centralDirectorySize = view.getUint32(eocd + 12, true);
  const centralDirectoryOffset = view.getUint32(eocd + 16, true);
  if (entryCount === 0xffff || centralDirectorySize === ZIP64_SENTINEL || centralDirectoryOffset === ZIP64_SENTINEL) {
    throw new Error('ARCHIVE_ZIP64_UNSUPPORTED');
  }
  if (centralDirectoryOffset + centralDirectorySize > bytes.length) throw new Error('ARCHIVE_INVALID_CENTRAL_DIRECTORY');

  const entries: ZipEntryResource[] = [];
  let offset = centralDirectoryOffset;
  for (let i = 0; i < entryCount; i += 1) {
    if (offset + 46 > bytes.length || view.getUint32(offset, true) !== ZIP_CENTRAL) throw new Error('ARCHIVE_INVALID_CENTRAL_ENTRY');
    const compressedSize = view.getUint32(offset + 20, true);
    const uncompressedSize = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    if (compressedSize === ZIP64_SENTINEL || uncompressedSize === ZIP64_SENTINEL) throw new Error('ARCHIVE_ZIP64_UNSUPPORTED');
    const end = offset + 46 + nameLength + extraLength + commentLength;
    if (end > bytes.length || end > centralDirectoryOffset + centralDirectorySize) throw new Error('ARCHIVE_INVALID_CENTRAL_ENTRY');
    const name = new TextDecoder().decode(bytes.slice(offset + 46, offset + 46 + nameLength));
    entries.push({ name, compressedSize, uncompressedSize });
    offset = end;
  }
  if (offset !== centralDirectoryOffset + centralDirectorySize) throw new Error('ARCHIVE_CENTRAL_DIRECTORY_SIZE_MISMATCH');
  return entries;
}

export function assertSafeZipResources(buffer: ArrayBuffer, format: string): void {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 4 || bytes[0] !== 0x50 || bytes[1] !== 0x4b) throw new Error(`${format.toUpperCase()}_INVALID_ARCHIVE`);
  const entries = readCentralDirectory(buffer);
  if (entries.length > ARCHIVE_RESOURCE_LIMITS.maxEntries) throw new Error(`${format.toUpperCase()}_ENTRY_LIMIT_EXCEEDED`);
  let expandedBytes = 0;
  for (const entry of entries) {
    if (isUnsafeArchivePath(entry.name)) throw new Error(`${format.toUpperCase()}_UNSAFE_ENTRY_PATH`);
    if (entry.uncompressedSize > ARCHIVE_RESOURCE_LIMITS.maxSingleEntryBytes) throw new Error(`${format.toUpperCase()}_ENTRY_SIZE_LIMIT_EXCEEDED`);
    expandedBytes += entry.uncompressedSize;
    if (expandedBytes > ARCHIVE_RESOURCE_LIMITS.maxExpandedBytes) throw new Error(`${format.toUpperCase()}_EXPANDED_SIZE_LIMIT_EXCEEDED`);
    if (entry.compressedSize === 0 && entry.uncompressedSize > 0) throw new Error(`${format.toUpperCase()}_INVALID_COMPRESSION_SIZE`);
    if (entry.compressedSize > 0 && entry.uncompressedSize / entry.compressedSize > ARCHIVE_RESOURCE_LIMITS.maxCompressionRatio) {
      throw new Error(`${format.toUpperCase()}_COMPRESSION_RATIO_EXCEEDED`);
    }
  }
}

export function hasZipEntryTraversal(buffer: ArrayBuffer): boolean {
  try {
    return readCentralDirectory(buffer).some(entry => isUnsafeArchivePath(entry.name));
  } catch {
    return true;
  }
}
