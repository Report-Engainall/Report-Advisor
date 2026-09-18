import * as XLSX from 'xlsx';
import type { FileFormat, Dataset, ColumnProfile, ColumnStatistics } from './types';
import { normalizeRows, normalizeColumnName, normalizeArabicDigits, parseNumber } from './normalizer';
import { detectColumnDataType, cleanValue } from './data-types';
import { mapColumns } from './synonyms';
import { detectHeaderRow, rowsFromDetectedHeader } from './header-detection';

type Row = Record<string, unknown>;

function generateId(): string { return Math.random().toString(36).substring(2, 9); }
function isRecord(value: unknown): value is Row { return typeof value === 'object' && value !== null && !Array.isArray(value); }

type PdfDocument = Awaited<ReturnType<typeof import('pdfjs-dist').getDocument>['promise']>;

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
  for (const startToken of ['{', '['] as const) {
    const start = text.indexOf(startToken);
    if (start < 0) continue;
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = start; i < text.length; i += 1) {
      const ch = text[i];
      if (inString) {
        if (escaped) { escaped = false; continue; }
        if (ch === '\\') { escaped = true; continue; }
        if (ch === '"') inString = false;
        continue;
      }
      if (ch === '"') { inString = true; continue; }
      if (ch === startToken) depth += 1;
      else if ((startToken === '{' && ch === '}') || (startToken === '[' && ch === ']')) {
        depth -= 1;
        if (depth === 0) {
          const candidate = text.slice(start, i + 1);
          try { return JSON.parse(candidate); } catch { break; }
        }
      }
    }
  }
  return null;
}

function stripControlCharacters(value: string): string {
  return Array.from(value, (character) => {
    const code = character.charCodeAt(0);
    return code <= 0x1f || code === 0x7f ? ' ' : character;
  }).join('');
}

function tryParseStructuredPdfText(text: string): Row[] | null {
  const compact = text.replace(/^PAGE\s+\d+\s*/i, '').trim();
  const candidates: unknown[] = [];
  try { candidates.push(JSON.parse(compact)); } catch { /* continue with embedded JSON and label extraction */ }
  const embedded = extractEmbeddedJson(compact);
  if (embedded !== null) candidates.push(embedded);

  const normalizeStructuredRecord = (record: Row): Row => {
    const normalizedRecord: Row = { ...record };
    for (const field of ['subtotal', 'tax_amount', 'total', 'paid_amount']) {
      const value = normalizedRecord[field];
      if (typeof value === 'string') normalizedRecord[field] = normalizeStructuredDocumentValue(value);
    }
    if (typeof normalizedRecord.invoice_date === 'string') {
      normalizedRecord.invoice_date = normalizeArabicDigits(normalizedRecord.invoice_date);
    }
    return normalizedRecord;
  };

  for (const parsed of candidates) {
    if (isRecord(parsed)) return [normalizeStructuredRecord(parsed)];
    if (Array.isArray(parsed) && parsed.length && parsed.every(isRecord)) return parsed.map(normalizeStructuredRecord);
  }

  const normalized = normalizeArabicDigits(
    stripControlCharacters(compact)
      .normalize('NFKC')
      .replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
  const match = (pattern: RegExp): string | null => normalized.match(pattern)?.[1]?.trim() ?? null;
  const row: Row = {};
  const setIfPresent = (key: string, value: string | number | null): void => {
    if (value !== null && value !== '') row[key] = value;
  };

  setIfPresent('invoice_number', match(/(?:رقم\s*(?:الفاتورة|فاتورة)?|invoice\s*(?:number|no\.?)?)\s*[:：#-]?\s*(.*?)\s+(?=(?:التاريخ|date)\b)/i));
  const parsedInvoiceDate = match(/(?:التاريخ|date)\s*[:：-]?\s*(\d{4}\s*[-/]\s*\d{1,2}\s*[-/]\s*\d{1,2})/i);
  setIfPresent('invoice_date', parsedInvoiceDate?.replace(/\s*([-/])\s*/g, '$1') ?? null);
  setIfPresent('customer_name', match(/(?:العميل|اسم\s*العميل|customer\s*(?:name|customer)?)\s*[:：-]?\s*(.+?)\s+(?=(?:المجموع\s*الفرعي|المجموع|الإجمالي|subtotal|tax|total)\b)/i));
  setIfPresent('subtotal', normalizeStructuredDocumentValue(match(/(?:المجموع\s*الفرعي|subtotal)\s*[:：-]?\s*([\d٠-٩٬،.,\s]+)/i) ?? ''));
  setIfPresent('tax_amount', normalizeStructuredDocumentValue(match(/(?:الضريبة|ضريبة|tax)\s*[:：-]?\s*([\d٠-٩٬،.,\s]+)/i) ?? ''));
  setIfPresent('total', normalizeStructuredDocumentValue(match(/(?:الإجمالي|الاجمالي|\btotal\b)\s*[:：-]?\s*([\d٠-٩٬،.,\s]+)/i) ?? ''));
  setIfPresent('paid_amount', normalizeStructuredDocumentValue(match(/(?:المدفوع|المبلغ\s*المدفوع|paid)\s*[:：-]?\s*([\d٠-٩٬،.,\s]+)/i) ?? ''));
  setIfPresent('currency', match(/(?:العملة|عمله|currency)\s*[:：-]?\s*([A-Za-z]{3}|[A-Za-z]+)\b/i));

  const structuredLabelPatterns: Array<{ key: string; pattern: RegExp; numeric?: boolean }> = [
    { key: 'invoice_number', pattern: /(?:رقم\s*(?:الفاتورة|فاتورة)|invoice\s*(?:number|no\.?))/i },
    { key: 'invoice_date', pattern: /(?:التاريخ|date)/i },
    { key: 'customer_name', pattern: /(?:اسم\s*العميل|العميل|customer\s*name)/i },
    { key: 'subtotal', pattern: /(?:المجموع\s*الفرعي|subtotal)/i, numeric: true },
    { key: 'tax_amount', pattern: /(?:الضريبة|ضريبة|tax)/i, numeric: true },
    { key: 'paid_amount', pattern: /(?:المدفوع|المبلغ\s*المدفوع|paid)/i, numeric: true },
    { key: 'total', pattern: /(?:الإجمالي|الاجمالي|\btotal\b)/i, numeric: true },
    { key: 'currency', pattern: /(?:العملة|عمله|currency)/i },
  ];

  const missingRequired = ['invoice_number', 'invoice_date', 'customer_name', 'total']
    .some((key) => row[key] === null || row[key] === undefined || row[key] === '');
  if (missingRequired) {
    const matches: Array<{ key: string; start: number; end: number; numeric?: boolean }> = [];
    for (const definition of structuredLabelPatterns) {
      const found = definition.pattern.exec(normalized);
      if (found) matches.push({ key: definition.key, start: found.index, end: found.index + found[0].length, numeric: definition.numeric });
    }
    matches.sort((a, b) => a.start - b.start);
    for (let index = 0; index < matches.length; index += 1) {
      const current = matches[index];
      const next = matches[index + 1];
      const rawValue = normalized
        .slice(current.end, next?.start ?? normalized.length)
        .replace(/^[\s:：#-]+/, '')
        .trim();
      if (!rawValue || row[current.key] !== undefined) continue;
      const value = current.numeric ? rawValue.split(/\s+/)[0] ?? '' : rawValue;
      setIfPresent(current.key, current.numeric ? normalizeStructuredDocumentValue(value) : value);
    }
    if (row.total === undefined) {
      const totalMatch = normalized.match(/(?:^|\s)(?:الإجمالي|الاجمالي|\btotal\b)\s*[:：-]?\s*([\d٠-٩٬،.,\s]+)/i);
      setIfPresent('total', normalizeStructuredDocumentValue(totalMatch?.[1] ?? ''));
    }
  }

  const required = ['invoice_number', 'invoice_date', 'customer_name', 'total'];
  if (required.some((key) => row[key] === null || row[key] === undefined || row[key] === '')) return null;
  return [row];
}

export type OcrDisposition = 'REJECT' | 'REVIEW' | 'TRUSTED';
export const OCR_REJECT_THRESHOLD = 50;
export const OCR_TRUSTED_THRESHOLD = 75;

export function classifyOcrConfidence(score: number): OcrDisposition {
  if (!Number.isFinite(score) || score < OCR_REJECT_THRESHOLD) return 'REJECT';
  if (score < OCR_TRUSTED_THRESHOLD) return 'REVIEW';
  return 'TRUSTED';
}

async function buildTextDataset(
  text: string,
  fileName: string,
  sourceType: string,
  warning?: string,
  confidenceFloor?: number,
): Promise<Dataset[]> {
  const normalized = normalizeArabicDigits(
    text.replace(/\uFEFF/g, '').replace(/\r\n?/g, '\n').replace(/[ \t]+$/gm, '').trim(),
  );
  if (!normalized) return [];

  const structured = sourceType.startsWith('pdf') ? tryParseStructuredPdfText(normalized) : null;
  if (structured) {
    const dataset = await buildDataset(structured, fileName, sourceType);
    const requiredStructuredFields = ['invoice_number', 'invoice_date', 'customer_name', 'total'];
    const structurallyVerified = requiredStructuredFields.every(
      (field) => structured[0]?.[field] !== null && structured[0]?.[field] !== undefined && structured[0]?.[field] !== '',
    );
    // Only native PDF text is structurally trusted at extraction time. OCR retains
    // its real confidence and can never be upgraded to trusted by the structured path.
    if (sourceType === 'pdf' && structurallyVerified) dataset.qualityScore = Math.max(dataset.qualityScore, 95);
    if (confidenceFloor != null) dataset.qualityScore = Math.min(dataset.qualityScore, Math.round(confidenceFloor));
    if (warning) dataset.columns.forEach((column) => column.qualityIssues.push(warning));
    return [dataset];
  }

  const rows: Row[] = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => ({ line_number: index + 1, text: line }));
  const dataset = await buildDataset(rows, fileName, sourceType);
  for (const column of dataset.columns) {
    column.qualityIssues.push('وثيقة نصية: لم يتم اختراع حقل أعمال؛ يلزم التعيين الدلالي قبل الكتابة');
    if (warning) column.qualityIssues.push(warning);
  }
  if (confidenceFloor != null) dataset.qualityScore = Math.min(dataset.qualityScore, Math.round(confidenceFloor));
  return [dataset];
}

const PDF_OCR_MAX_PAGES = 20;

const PDF_OCR_MAX_DIMENSION = 2200;
const PDF_OCR_SCALE = 1.5;
type PromiseConstructorWithTry = PromiseConstructor & { try?: (fn: (...args: unknown[]) => unknown, ...args: unknown[]) => Promise<unknown> };
type Uint8ArrayWithToHex = Uint8Array & { toHex?: () => string };

function ensurePdfJsRuntimeCompatibility(): void {
  const uint8ArrayPrototype = Uint8Array.prototype as Uint8ArrayWithToHex;
  if (typeof uint8ArrayPrototype.toHex !== 'function') {
    Object.defineProperty(Uint8Array.prototype, 'toHex', {
      configurable: true,
      writable: true,
      value: function toHex(this: Uint8Array): string {
        return Array.from(this, (byte) => byte.toString(16).padStart(2, '0')).join('');
      },
    });
  }

  const promiseConstructor = Promise as PromiseConstructorWithTry;
  if (typeof promiseConstructor.try !== 'function') {
    Object.defineProperty(Promise, 'try', {
      configurable: true,
      writable: true,
      value: (fn: (...args: unknown[]) => unknown, ...args: unknown[]) =>
        new Promise((resolve, reject) => {
          try { resolve(fn(...args)); } catch (error) { reject(error); }
        }),
    });
  }
}

async function parsePdfText(buffer: ArrayBuffer, fileName: string): Promise<Dataset[]> {
  ensurePdfJsRuntimeCompatibility();
  const pdfjs = await import('pdfjs-dist');
  if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();
  }
  const pdf: PdfDocument = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
  }).promise;
  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) { const page = await pdf.getPage(pageNumber); const content = await page.getTextContent(); const text = content.items.map((item) => 'str' in item && typeof item.str === 'string' ? item.str : '').filter(Boolean).join(' '); if (text.trim()) pages.push(`PAGE ${pageNumber}\n${text}`); }
  if (pages.length) return buildTextDataset(pages.join('\n\n'), fileName, 'pdf');
  return parseScannedPdfWithOcr(pdf, fileName);
}

async function parseScannedPdfWithOcr(pdf: PdfDocument, fileName: string): Promise<Dataset[]> {
  if (typeof document === 'undefined') throw new Error('PDF_SCANNED_IMAGE_ONLY: OCR requires a browser runtime; no business data was fabricated.');
  if (pdf.numPages > PDF_OCR_MAX_PAGES) throw new Error(`PDF_OCR_PAGE_LIMIT_EXCEEDED: ${pdf.numPages} pages exceeds the safe OCR limit of ${PDF_OCR_MAX_PAGES}. Split the document before analysis.`);
  const tesseract = await import('tesseract.js');
  const worker = await tesseract.createWorker('ara+eng');
  const pages: string[] = [];
  const confidences: number[] = [];
  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: PDF_OCR_SCALE });
      const scale = Math.min(1, PDF_OCR_MAX_DIMENSION / Math.max(baseViewport.width, baseViewport.height));
      const viewport = scale < 1 ? page.getViewport({ scale: PDF_OCR_SCALE * scale }) : baseViewport;
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.ceil(viewport.width));
      canvas.height = Math.max(1, Math.ceil(viewport.height));
      const context = canvas.getContext('2d');
      if (!context) throw new Error(`PDF_OCR_CANVAS_UNAVAILABLE: page ${pageNumber}`);
      await page.render({ canvasContext: context, viewport, canvas }).promise;
      const result = await worker.recognize(canvas);
      const text = typeof result?.data?.text === 'string' ? result.data.text.trim() : '';
      const confidence = Number(result?.data?.confidence ?? 0);
      confidences.push(confidence);
      if (text) pages.push(`PAGE ${pageNumber}\n${text}`);
      canvas.width = 1; canvas.height = 1;
    }
  } finally {
    await worker.terminate();
  }
  if (!pages.length) throw new Error('PDF_SCANNED_OCR_EMPTY: OCR produced no readable text; no business data was fabricated.');
  const minimumConfidence = confidences.length ? Math.min(...confidences) : 0;
  const disposition = classifyOcrConfidence(minimumConfidence);
  if (disposition === 'REJECT') {
    throw new Error(`PDF_OCR_LOW_CONFIDENCE_REJECT:${Math.round(minimumConfidence)}% (threshold < ${OCR_REJECT_THRESHOLD})`);
  }
  const warning = disposition === 'REVIEW'
    ? `OCR_REVIEW_REQUIRED:${Math.round(minimumConfidence)}%`
    : `OCR_TRUSTED:${Math.round(minimumConfidence)}%`;
  return buildTextDataset(pages.join('\n\n'), fileName, 'pdf-ocr', warning, minimumConfidence);
}

async function parseDocxText(buffer: ArrayBuffer, fileName: string): Promise<Dataset[]> {
  const mammoth = await import('mammoth'); const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return buildTextDataset(result.value, fileName, 'docx', result.messages.length ? `DOCX_EXTRACTION_WARNINGS:${result.messages.length}` : undefined);
}

async function parseImageText(buffer: ArrayBuffer, fileName: string): Promise<Dataset[]> {
  const tesseract: any = await import('tesseract.js');
  const worker = await tesseract.createWorker('ara+eng');
  try {
    const image = new Blob([buffer], { type: 'application/octet-stream' });
    const { data } = await worker.recognize(image);
    const confidence = Number(data?.confidence ?? 0);
    const disposition = classifyOcrConfidence(confidence);
    if (disposition === 'REJECT') {
      throw new Error(`OCR_LOW_CONFIDENCE_REJECT:${Math.round(confidence)}% (threshold < ${OCR_REJECT_THRESHOLD})`);
    }
    const warning = disposition === 'REVIEW'
      ? `OCR_REVIEW_REQUIRED:${Math.round(confidence)}%`
      : `OCR_TRUSTED:${Math.round(confidence)}%`;
    return buildTextDataset(data.text, fileName, 'image', warning, confidence);
  } finally {
    await worker.terminate();
  }
}

export async function parseSpreadsheet(buffer: ArrayBuffer, fileName: string, _format: FileFormat): Promise<Dataset[]> {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true }); const datasets: Dataset[] = [];
  for (const sheetName of wb.SheetNames) { const matrix = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sheetName], { header: 1, defval: '', raw: true }); const candidate = detectHeaderRow(matrix); if (!candidate) continue; const rows = rowsFromDetectedHeader(matrix, candidate) as Row[]; if (rows.length) datasets.push(await buildDataset(rows, `${fileName} — ${sheetName}`, fileName, sheetName)); }
  return datasets;
}

export async function parseCSV(buffer: ArrayBuffer, fileName: string, delimiter?: string): Promise<Dataset[]> { const rows = parseCSVText(decodeBuffer(buffer), delimiter); return rows.length ? [await buildDataset(rows, fileName, fileName)] : []; }
function decodeBuffer(buffer: ArrayBuffer): string { const bytes = new Uint8Array(buffer); const start = bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf ? 3 : 0; return new TextDecoder('utf-8').decode(bytes.slice(start)); }
function parseCSVText(text: string, delimiter?: string): Row[] { const lines = text.split(/\r?\n/).filter((line) => line.trim()); if (!lines.length) return []; const delim = delimiter ?? detectDelimiter(lines[0]); const matrix = lines.map((line) => parseCSVLine(line, delim)); const candidate = detectHeaderRow(matrix); if (!candidate) return []; return rowsFromDetectedHeader(matrix, candidate) as Row[]; }
function detectDelimiter(line: string): string { const candidates = [',', ';', '\t', '|']; const scored = candidates.map((delimiter) => ({ delimiter, fields: parseCSVLine(line, delimiter).length })).sort((a, b) => b.fields - a.fields); return scored[0]?.fields && scored[0].fields > 1 ? scored[0].delimiter : ','; }
function parseCSVLine(line: string, delimiter: string): string[] { const result: string[] = []; let current = ''; let quoted = false; for (let i = 0; i < line.length; i += 1) { const ch = line[i]; if (ch === '"') { if (quoted && line[i + 1] === '"') { current += '"'; i += 1; } else quoted = !quoted; } else if (ch === delimiter && !quoted) { result.push(current.trim()); current = ''; } else current += ch; } result.push(current.trim()); return result; }

export async function parseJSON(buffer: ArrayBuffer, fileName: string): Promise<Dataset[]> { return parseJSONData(JSON.parse(decodeBuffer(buffer)), fileName); }
export async function parseJSONL(buffer: ArrayBuffer, fileName: string): Promise<Dataset[]> { const rows = decodeBuffer(buffer).split(/\r?\n/).filter(Boolean).map((line) => { const value: unknown = JSON.parse(line); if (!isRecord(value)) throw new Error('JSONL contains a non-object row'); return value; }); return rows.length ? [await buildDataset(rows, fileName, fileName)] : []; }
async function parseJSONData(data: unknown, fileName: string, path = ''): Promise<Dataset[]> { if (Array.isArray(data)) { if (!data.length) return []; if (!data.every(isRecord)) throw new Error('JSON dataset contains non-object rows'); return [await buildDataset(data, path || fileName, fileName)]; } if (!isRecord(data)) return []; const datasets: Dataset[] = []; for (const [key, value] of Object.entries(data)) { if (Array.isArray(value) && value.length) { if (!value.every(isRecord)) throw new Error(`JSON dataset ${key} contains non-object rows`); datasets.push(await buildDataset(value, path ? `${path} → ${key}` : key, fileName, key)); } } return datasets.length ? datasets : [await buildDataset([data], path || fileName, fileName)]; }

export async function parseFile(buffer: ArrayBuffer, fileName: string, format: FileFormat): Promise<Dataset[]> {
  switch (format) {
    case 'xlsx': case 'xls': case 'xlsm': case 'ods': return parseSpreadsheet(buffer, fileName, format);
    case 'csv': return parseCSV(buffer, fileName); case 'tsv': return parseCSV(buffer, fileName, '\t'); case 'json': return parseJSON(buffer, fileName); case 'jsonl': return parseJSONL(buffer, fileName); case 'txt': case 'markdown': return parseCSV(buffer, fileName);
    case 'pdf': return parsePdfText(buffer, fileName); case 'docx': return parseDocxText(buffer, fileName);
    case 'jpg': case 'jpeg': case 'png': case 'webp': case 'tiff': case 'bmp': return parseImageText(buffer, fileName);
    case 'doc': case 'rtf': case 'xml': case 'yaml': case 'zip': throw new Error(`${format.toUpperCase()}_PARSER_UNAVAILABLE: هذا التنسيق يحتاج محولًا مخصصًا قبل الكتابة؛ لم يتم تخمين محتواه.`);
    default: throw new Error(`Unsupported parser for format: ${format}`);
  }
}
