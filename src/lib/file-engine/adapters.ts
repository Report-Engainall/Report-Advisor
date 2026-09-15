import * as XLSX from 'xlsx';
import type { FileFormat, Dataset, ColumnProfile, ColumnStatistics } from './types';
import { normalizeRows, normalizeColumnName, normalizeArabicDigits, parseNumber } from './normalizer';
import { detectColumnDataType, cleanValue } from './data-types';
import { mapColumns } from './synonyms';
import { detectHeaderRow, rowsFromDetectedHeader } from './header-detection';

type Row = Record<string, unknown>;
function generateId(): string { return Math.random().toString(36).substring(2, 9); }
function isRecord(value: unknown): value is Row { return typeof value === 'object' && value !== null && !Array.isArray(value); }
type PdfDocument = Awaited<ReturnType<typeof import('pdfjs-dist/legacy/build/pdf.mjs').getDocument>['promise'];

function buildColumnProfiles(rows: Row[], columns: string[], mappings: Awaited<ReturnType<typeof mapColumns>>): ColumnProfile[] {
  return columns.map((col, idx) => {
    const mapping = mappings[idx];
    const values = rows.map((row) => row[col]).filter((value) => value !== null && value !== undefined && value !== '');
    const sample = values.slice(0, 200);
    const dataType = mapping?.mappedField ? detectColumnDataType(sample, mapping.mappedField) : detectColumnDataType(sample, col);
    const nullCount = rows.filter((row) => row[col] === null || row[col] === undefined || row[col] === '').length;
    const uniqueCount = new Set(values.map((value) => String(value))).size;
    const uniqueRatio = values.length ? uniqueCount / values.length : 0;
    const mappingConfidence = mapping?.confidence ?? 0;
    const requiresReview = mapping?.requiresReview ?? true;
    const statistics: ColumnStatistics = { count: values.length };
    if (['integer', 'decimal', 'currency', 'percentage'].includes(dataType)) {
      const nums = values.map(parseNumber).filter((n): n is number => n !== null);
      if (nums.length) {
        const sorted = [...nums].sort((a, b) => a - b);
        const sum = nums.reduce((s, n) => s + n, 0);
        statistics.min = sorted[0]; statistics.max = sorted[sorted.length - 1]; statistics.sum = sum; statistics.mean = sum / nums.length;
        statistics.median = sorted.length % 2 === 0 ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 : sorted[Math.floor(sorted.length / 2)];
      }
    }
    return { name: col, mappedField: mapping?.mappedField ?? null, mappingConfidence, requiresReview,
      mappingEvidence: { sourceHeader: col, normalizedHeader: normalizeColumnName(col), matchedBy: mapping?.mappedField ? (mappingConfidence >= 80 ? 'exact' : 'partial') : 'unmapped', canonicalField: mapping?.mappedField ?? null, confidence: mappingConfidence, requiresReview },
      dataType, nullCount, uniqueCount, uniqueRatio, sampleValues: values.slice(0, 5), statistics, qualityIssues: [] };
  });
}

function materializeCanonicalFields(rows: Row[], columns: ColumnProfile[]): Row[] {
  const canonicalOwners = new Map<string, ColumnProfile>();
  for (const column of columns) { const field = column.mappedField; if (!field || column.mappingConfidence < 80) continue; const previous = canonicalOwners.get(field); if (!previous || column.mappingConfidence > previous.mappingConfidence) canonicalOwners.set(field, column); }
  return rows.map((row) => { const next: Row = { ...row }; for (const [field, column] of canonicalOwners) { if (Object.prototype.hasOwnProperty.call(next, field) && next[field] !== '' && next[field] != null) continue; const value = row[column.name]; if (value !== '' && value !== null && value !== undefined) next[field] = value; } return next; });
}

async function buildDataset(rows: Row[], name: string, source: string, sheet?: string): Promise<Dataset> {
  const normalized = normalizeRows(rows);
  if (!normalized.length) return { id: generateId(), name, source, sheet, rowCount: 0, columnCount: 0, columns: [], rows: [], preview: [], qualityScore: 0 };
  const columns = Object.keys(normalized[0]); const mappings = await mapColumns(columns); const columnProfiles = buildColumnProfiles(normalized, columns, mappings);
  for (const col of columnProfiles) { if (col.nullCount > normalized.length * 0.5) col.qualityIssues.push('أكثر من 50% من القيم فارغة'); if (col.mappingConfidence < 80 && col.mappedField) col.qualityIssues.push('تعيين منخفض الثقة — يحتاج مراجعة'); if (!col.mappedField) col.qualityIssues.push('لم يتم تعريف العمود'); }
  const cleanedRows = normalized.map((row) => Object.fromEntries(columnProfiles.map((col) => [col.name, cleanValue(row[col.name], col.dataType)])) as Row);
  const canonicalRows = materializeCanonicalFields(cleanedRows, columnProfiles);
  const qualityScore = columnProfiles.length ? Math.round(columnProfiles.reduce((s, c) => s + c.mappingConfidence, 0) / columnProfiles.length) : 0;
  return { id: generateId(), name, source, sheet, rowCount: canonicalRows.length, columnCount: columns.length, columns: columnProfiles, rows: canonicalRows, preview: canonicalRows.slice(0, 50), qualityScore };
}

function normalizeStructuredDocumentValue(value: string): string | number {
  const cleaned = normalizeArabicDigits(value.replace(/[٬،]/g, ',').replace(/٫/g, '.').replace(/\s+/g, ' ')).trim();
  const numeric = parseNumber(cleaned);
  return numeric === null ? cleaned : numeric;
}

function extractEmbeddedJson(text: string): unknown | null {
  const starts = ['{', '['];
  for (const startToken of starts) {
    const start = text.indexOf(startToken);
    if (start < 0) continue;
    let depth = 0; let inString = false; let escaped = false;
    for (let i = start; i < text.length; i += 1) {
      const ch = text[i];
      if (inString) { if (escaped) { escaped = false; continue; } if (ch === '\\') { escaped = true; continue; } if (ch === '"') inString = false; continue; }
      if (ch === '"') { inString = true; continue; }
      if (ch === startToken || (startToken === '{' && ch === '}') || (startToken === '[' && ch === ']')) {
        if (ch === startToken) depth += 1; else depth -= 1;
        if (depth === 0) { const candidate = text.slice(start, i + 1); try { return JSON.parse(candidate); } catch { break; } }
      }
    }
  }
  return null;
}

function tryParseStructuredPdfText(text: string): Row[] | null {
  const compact = text.replace(/^PAGE\s+\d+\s*/i, '').trim();
  const parsedCandidates: unknown[] = [];
  try { parsedCandidates.push(JSON.parse(compact)); } catch { /* continue with embedded JSON and label extraction */ }
  const embedded = extractEmbeddedJson(compact); if (embedded !== null) parsedCandidates.push(embedded);
  for (const parsed of parsedCandidates) { if (isRecord(parsed)) return [parsed]; if (Array.isArray(parsed) && parsed.length && parsed.every(isRecord)) return parsed; }
  const normalized = normalizeArabicDigits(compact.replace(/\s+/g, ' ').trim());
  const match = (pattern: RegExp): string | null => normalized.match(pattern)?.[1]?.trim() ?? null;
  const row: Row = {
    invoice_number: match(/(?:رقم\s*(?:الفاتورة|فاتورة)?|invoice(?:\s+number)?)\s*[:#]?\s*([^\s]+(?:\s+[^\s]+)*?)(?=\s*(?:التاريخ|date)(?:\s*[:：]?\s|$))/i),
    invoice_date: match(/(?:التاريخ|date)\s*[:：]?\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})/i),
    customer_name: match(/(?:العميل|اسم\s*العميل|customer(?:\s+name)?)\s*[:：]?\s*(.+?)(?=\s*(?:المجموع|الإجمالي|subtotal|total)(?:\s*[:：]?\s|$))/i),
    subtotal: normalizeStructuredDocumentValue(match(/(?:المجموع الفرعي|المجموع|subtotal)\s*[:：]?\s*([\d٠-٩٬،.,]+)/i) ?? ''),
    tax_amount: normalizeStructuredDocumentValue(match(/(?:الضريبة|ضريبة|tax)\s*[:：]?\s*([\d٠-٩٬،.,]+)/i) ?? ''),
    total: normalizeStructuredDocumentValue(match(/(?:الإجمالي|الاجمالي|total)\s*[:：]?\s*([\d٠-٩٬،.,]+)/i) ?? ''),
    paid_amount: normalizeStructuredDocumentValue(match(/(?:المدفوع|المبلغ\s*المدفوع|paid)\s*[:：]?\s*([\d٠-٩٬،.,]+)/i) ?? ''),
    currency: match(/(?:العملة|عمله|currency)\s*[:：]?\s*([A-Za-z]{3}|[A-Za-z]+)(?=\s|$)/i),
  };
  const required = ['invoice_number', 'invoice_date', 'customer_name', 'total'];
  if (required.some((key) => row[key] === null || row[key] === '')) return null;
  return [row];
}

async function buildTextDataset(text: string, fileName: string, sourceType: string, warning?: string): Promise<Dataset[]> {
  const normalized = normalizeArabicDigits(text.replace(/\uFEFF/g, '').replace(/\r\n?/g, '\n').replace(/[ \t]+$/gm, '').trim()); if (!normalized) return [];
  const structured = sourceType.startsWith('pdf') ? tryParseStructuredPdfText(normalized) : null;
  if (structured) { const dataset = await buildDataset(structured, fileName, sourceType); if (warning) dataset.columns.forEach((column) => column.qualityIssues.push(warning)); return [dataset]; }
  const rows: Row[] = normalized.split('\n').map((line) => line.trim()).filter(Boolean).map((line, index) => ({ line_number: index + 1, text: line }));
  const dataset = await buildDataset(rows, fileName, sourceType); for (const column of dataset.columns) column.qualityIssues.push('وثيقة نصية: لم يتم اختراع حقل أعمال؛ يلزم التعيين الدلالي قبل الكتابة'); if (warning) dataset.columns[1]?.qualityIssues.push(warning); return [dataset];
}

const PDF_OCR_MAX_PAGES = 20; const PDF_OCR_MAX_DIMENSION = 2200; const PDF_OCR_SCALE = 1.5; const OCR_CONFIDENCE_THRESHOLD = 70;
async function parsePdfText(buffer: ArrayBuffer, fileName: string): Promise<Dataset[]> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = typeof window === 'undefined'
    ? import.meta.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs')
    : new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString();
  const documentOptions = typeof window === 'undefined'
    ? {
        data: new Uint8Array(buffer),
        standardFontDataUrl: new URL(import.meta.resolve('pdfjs-dist/standard_fonts/')).pathname,
        cMapUrl: new URL(import.meta.resolve('pdfjs-dist/cmaps/')).pathname,
        cMapPacked: true,
        useSystemFonts: true,
        disableFontFace: true,
      }
    : { data: new Uint8Array(buffer) };
  const pdf: PdfDocument = await pdfjs.getDocument(documentOptions).promise; const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) { const page = await pdf.getPage(pageNumber); const content = await page.getTextContent(); const text = content.items.map((item) => 'str' in item && typeof item.str === 'string' ? item.str : '').filter(Boolean).join(' '); if (text.trim()) pages.push(`PAGE ${pageNumber}\n${text}`); }
  if (pages.length) return buildTextDataset(pages.join('\n\n'), fileName, 'pdf'); return parseScannedPdfWithOcr(pdf, fileName);
}

async function parseScannedPdfWithOcr(pdf: PdfDocument, fileName: string): Promise<Dataset[]> {
  if (typeof document === 'undefined') throw new Error('PDF_SCANNED_IMAGE_ONLY: OCR requires a browser runtime; no business data was fabricated.');
  if (pdf.numPages > PDF_OCR_MAX_PAGES) throw new Error(`PDF_OCR_PAGE_LIMIT_EXCEEDED: ${pdf.numPages} pages exceeds the safe OCR limit of ${PDF_OCR_MAX_PAGES}. Split the document before analysis.`);
  const tesseract = await import('tesseract.js'); const worker = await tesseract.createWorker('ara+eng'); const pages: string[] = []; const confidences: number[] = [];
  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber); const baseViewport = page.getViewport({ scale: PDF_OCR_SCALE }); const scale = Math.min(1, PDF_OCR_MAX_DIMENSION / Math.max(baseViewport.width, baseViewport.height)); const viewport = scale < 1 ? page.getViewport({ scale: PDF_OCR_SCALE * scale }) : baseViewport;
      const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.ceil(viewport.width)); canvas.height = Math.max(1, Math.ceil(viewport.height)); const context = canvas.getContext('2d');
      if (!context) throw new Error(`PDF_OCR_CANVAS_UNAVAILABLE: page ${pageNumber}`); await page.render({ canvasContext: context, viewport, canvas }).promise;
      const result = await worker.recognize(canvas); const text = typeof result?.data?.text === 'string' ? result.data.text.trim() : ''; const confidence = Number(result?.data?.confidence ?? 0); confidences.push(confidence); if (text) pages.push(`PAGE ${pageNumber}\n${text}`); canvas.width = 1; canvas.height = 1;
    }
  } finally { await worker.terminate(); }
  if (!pages.length) throw new Error('PDF_SCANNED_OCR_EMPTY: OCR produced no readable text; no business data was fabricated.');
  const minimumConfidence = confidences.length ? Math.min(...confidences) : 0; const warning = minimumConfidence < OCR_CONFIDENCE_THRESHOLD ? `OCR_LOW_CONFIDENCE:${Math.round(minimumConfidence)}%` : `OCR_CONFIDENCE_MIN:${Math.round(minimumConfidence)}%`;
  return buildTextDataset(pages.join('\n\n'), fileName, 'pdf-ocr', warning);
}

async function parseDocxText(buffer: ArrayBuffer, fileName: string): Promise<Dataset[]> { const mammoth = await import('mammoth'); const result = await mammoth.extractRawText({ arrayBuffer: buffer }); return buildTextDataset(result.value, fileName, 'docx', result.messages.length ? `DOCX_EXTRACTION_WARNINGS:${result.messages.length}` : undefined); }
async function parseImageText(buffer: ArrayBuffer, fileName: string): Promise<Dataset[]> { const tesseract: any = await import('tesseract.js'); const worker = await tesseract.createWorker('ara+eng'); try { const image = new Blob([buffer], { type: 'application/octet-stream' }); const { data } = await worker.recognize(image); return buildTextDataset(data.text, fileName, 'image', data.confidence < 70 ? `OCR_LOW_CONFIDENCE:${Math.round(data.confidence)}%` : `OCR_CONFIDENCE:${Math.round(data.confidence)}%`); } finally { await worker.terminate(); } }

export async function parseSpreadsheet(buffer: ArrayBuffer, fileName: string, _format: FileFormat): Promise<Dataset[]> {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true }); const datasets: Dataset[] = [];
  for (const sheetName of wb.SheetNames) { const matrix = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sheetName], { header: 1, defval: '', raw: true }); const candidate = detectHeaderRow(matrix); if (!candidate) continue; const rows = rowsFromDetectedHeader(matrix, candidate) as Row[]; if (rows.length) datasets.push(await buildDataset(rows, `${fileName} — ${sheetName}`, fileName, sheetName)); }
  return datasets;
}