import fs from 'node:fs/promises';
import { parseFile, loadEmbeddedPdfGlyphMap } from '../src/lib/file-engine/adapters.ts';

const file = 'tests/fixtures/realistic-reports/الصراف العامري.pdf';
globalThis.__PDF_FONT_DEBUG__ = true;
const bytes = await fs.readFile(file);
const buffer = Uint8Array.from(bytes).buffer;
const raw = bytes.toString('latin1');
const refMatches = [...raw.matchAll(/\/FontFile2\s+(\d+)\s+0\s+R/g)].map(match => Number(match[1]));
console.log('FONTFILE2_REFS=' + JSON.stringify(refMatches));
const objectStart = raw.search(/(?:^|[\\r\\n])\\s*8\\s+0\\s+obj\\b/);
const streamStart = raw.indexOf('stream', objectStart);
const streamEnd = raw.indexOf('endstream', streamStart);
let streamText = streamStart >= 0 && streamEnd >= 0 ? raw.slice(streamStart + 6, streamEnd) : '';
streamText = streamText.replace(/^[\\r\\n]+/, '');
const streamBytes = Uint8Array.from(streamText, character => character.charCodeAt(0) & 0xff);
console.log('FONT_STREAM=' + JSON.stringify({objectStart,streamStart,streamEnd,length:streamBytes.length,first:[...streamBytes.slice(0,8)]}));
try {
  const stream = new Blob([streamBytes]).stream().pipeThrough(new DecompressionStream('deflate'));
  const inflated = new Uint8Array(await new Response(stream).arrayBuffer());
  console.log('DECOMPRESSION_STREAM=' + JSON.stringify({bytes:inflated.length,header:[...inflated.slice(0,8)]}));
} catch (error) {
  console.log('DECOMPRESSION_STREAM_ERROR=' + (error instanceof Error ? error.message : String(error)));
}

const glyphMap = await loadEmbeddedPdfGlyphMap(buffer);
if (!glyphMap || glyphMap.size < 20) throw new Error('PDF_EMBEDDED_FONT_REGRESSION: glyphMap=' + (glyphMap?.size ?? 0));
console.log('EMBEDDED_GLYPH_MAP_SIZE=' + glyphMap.size);
const datasets = await parseFile(buffer, file, 'pdf');
if (!datasets.length) throw new Error('PDF_EMBEDDED_FONT_REGRESSION: no dataset produced');
const dataset = datasets[0];
const mapped = new Set(dataset.columns.map((column) => column.mappedField).filter(Boolean));
const required = ['description', 'document_no', 'date', 'currency', 'total', 'balance', 'credit', 'debit'];
const missing = required.filter((field) => !mapped.has(field));
if (dataset.qualityScore <= 0) throw new Error('PDF_EMBEDDED_FONT_REGRESSION: quality=' + dataset.qualityScore);
if (dataset.rowCount < 1) throw new Error('PDF_EMBEDDED_FONT_REGRESSION: rowCount=' + dataset.rowCount);
if (missing.length > 3) throw new Error('PDF_EMBEDDED_FONT_REGRESSION: missing=' + missing.join(','));
console.log(JSON.stringify({file,quality:dataset.qualityScore,rows:dataset.rowCount,columns:dataset.columnCount,mapped_fields:[...mapped],missing,sample:dataset.rows.slice(0,3)},null,2));