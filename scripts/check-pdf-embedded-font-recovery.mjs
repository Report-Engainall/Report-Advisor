import fs from 'node:fs/promises';
import { parseFile, loadEmbeddedPdfGlyphMap } from '../src/lib/file-engine/adapters.ts';

const file = 'tests/fixtures/realistic-reports/الصراف العامري.pdf';
const bytes = await fs.readFile(file);
const buffer = Uint8Array.from(bytes).buffer;
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