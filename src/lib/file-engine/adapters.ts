import * as XLSX from 'xlsx';
import type { FileFormat, Dataset, ColumnProfile, ColumnStatistics } from './types';
import { normalizeRows, normalizeColumnName, parseNumber } from './normalizer';
import { detectColumnDataType, cleanValue } from './data-types';
import { mapColumns } from './synonyms';
import { detectHeaderRow, rowsFromDetectedHeader } from './header-detection';

type Row = Record<string, unknown>;

function generateId(): string { return Math.random().toString(36).substring(2, 9); }
function isRecord(value: unknown): value is Row { return typeof value === 'object' && value !== null && !Array.isArray(value); }

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
        statistics.min = sorted[0];
        statistics.max = sorted[sorted.length - 1];
        statistics.sum = sum;
        statistics.mean = sum / nums.length;
        statistics.median = sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];
      }
    }
    return {
      name: col,
      mappedField: mapping?.mappedField ?? null,
      mappingConfidence,
      requiresReview,
      mappingEvidence: {
        sourceHeader: col,
        normalizedHeader: normalizeColumnName(col),
        matchedBy: mapping?.mappedField ? (mappingConfidence >= 80 ? 'exact' : 'partial') : 'unmapped',
        canonicalField: mapping?.mappedField ?? null,
        confidence: mappingConfidence,
        requiresReview,
      },
      dataType,
      nullCount,
      uniqueCount,
      uniqueRatio,
      sampleValues: values.slice(0, 5),
      statistics,
      qualityIssues: [],
    };
  });
}

/** Preserve source columns while materializing high-confidence canonical fields for imports. */
function materializeCanonicalFields(rows: Row[], columns: ColumnProfile[]): Row[] {
  const canonicalOwners = new Map<string, ColumnProfile>();
  for (const column of columns) {
    const field = column.mappedField;
    if (!field || column.mappingConfidence < 80) continue;
    const previous = canonicalOwners.get(field);
    if (!previous || column.mappingConfidence > previous.mappingConfidence) canonicalOwners.set(field, column);
  }
  return rows.map((row) => {
    const next: Row = { ...row };
    for (const [field, column] of canonicalOwners) {
      if (Object.prototype.hasOwnProperty.call(next, field) && next[field] !== '' && next[field] != null) continue;
      const value = row[column.name];
      if (value !== '' && value !== null && value !== undefined) next[field] = value;
    }
    return next;
  });
}

async function buildDataset(rows: Row[], name: string, source: string, sheet?: string): Promise<Dataset> {
  const normalized = normalizeRows(rows);
  if (!normalized.length) return { id: generateId(), name, source, sheet, rowCount: 0, columnCount: 0, columns: [], rows: [], preview: [], qualityScore: 0 };
  const columns = Object.keys(normalized[0]);
  const mappings = await mapColumns(columns);
  const columnProfiles = buildColumnProfiles(normalized, columns, mappings);
  for (const col of columnProfiles) {
    if (col.nullCount > normalized.length * 0.5) col.qualityIssues.push('أكثر من 50% من القيم فارغة');
    if (col.mappingConfidence < 80 && col.mappedField) col.qualityIssues.push('تعيين منخفض الثقة — يحتاج مراجعة');
    if (!col.mappedField) col.qualityIssues.push('لم يتم تعريف العمود');
  }
  const cleanedRows = normalized.map((row) => Object.fromEntries(columnProfiles.map((col) => [col.name, cleanValue(row[col.name], col.dataType)])) as Row);
  const canonicalRows = materializeCanonicalFields(cleanedRows, columnProfiles);
  const qualityScore = columnProfiles.length ? Math.round(columnProfiles.reduce((s, c) => s + c.mappingConfidence, 0) / columnProfiles.length) : 0;
  return { id: generateId(), name, source, sheet, rowCount: canonicalRows.length, columnCount: columns.length, columns: columnProfiles, rows: canonicalRows, preview: canonicalRows.slice(0, 50), qualityScore };
}

export async function parseSpreadsheet(buffer: ArrayBuffer, fileName: string, _format: FileFormat): Promise<Dataset[]> {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
  const datasets: Dataset[] = [];
  for (const sheetName of wb.SheetNames) {
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sheetName], { header: 1, defval: '', raw: true });
    const candidate = detectHeaderRow(matrix);
    if (!candidate) continue;
    const rows = rowsFromDetectedHeader(matrix, candidate) as Row[];
    if (rows.length) datasets.push(await buildDataset(rows, `${fileName} — ${sheetName}`, fileName, sheetName));
  }
  return datasets;
}

export async function parseCSV(buffer: ArrayBuffer, fileName: string, delimiter?: string): Promise<Dataset[]> {
  const rows = parseCSVText(decodeBuffer(buffer), delimiter);
  return rows.length ? [await buildDataset(rows, fileName, fileName)] : [];
}

function decodeBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const start = bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf ? 3 : 0;
  return new TextDecoder('utf-8').decode(bytes.slice(start));
}

function parseCSVText(text: string, delimiter?: string): Row[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];
  const delim = delimiter ?? detectDelimiter(lines[0]);
  const matrix = lines.map((line) => parseCSVLine(line, delim));
  const candidate = detectHeaderRow(matrix);
  if (!candidate) return [];
  return rowsFromDetectedHeader(matrix, candidate) as Row[];
}

function detectDelimiter(line: string): string {
  const candidates = [',', ';', '\t', '|'];
  const scored = candidates.map((delimiter) => ({ delimiter, fields: parseCSVLine(line, delimiter).length })).sort((a, b) => b.fields - a.fields);
  return scored[0]?.fields && scored[0].fields > 1 ? scored[0].delimiter : ',';
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') { current += '"'; i += 1; } else quoted = !quoted;
    } else if (ch === delimiter && !quoted) {
      result.push(current.trim());
      current = '';
    } else current += ch;
  }
  result.push(current.trim());
  return result;
}

export async function parseJSON(buffer: ArrayBuffer, fileName: string): Promise<Dataset[]> {
  return parseJSONData(JSON.parse(decodeBuffer(buffer)), fileName);
}

export async function parseJSONL(buffer: ArrayBuffer, fileName: string): Promise<Dataset[]> {
  const rows = decodeBuffer(buffer).split(/\r?\n/).filter(Boolean).map((line) => {
    const value: unknown = JSON.parse(line);
    if (!isRecord(value)) throw new Error('JSONL contains a non-object row');
    return value;
  });
  return rows.length ? [await buildDataset(rows, fileName, fileName)] : [];
}

async function parseJSONData(data: unknown, fileName: string, path = ''): Promise<Dataset[]> {
  if (Array.isArray(data)) {
    if (!data.length) return [];
    if (!data.every(isRecord)) throw new Error('JSON dataset contains non-object rows');
    return [await buildDataset(data, path || fileName, fileName)];
  }
  if (!isRecord(data)) return [];
  const datasets: Dataset[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value) && value.length) {
      if (!value.every(isRecord)) throw new Error(`JSON dataset ${key} contains non-object rows`);
      datasets.push(await buildDataset(value, path ? `${path} → ${key}` : key, fileName, key));
    }
  }
  return datasets.length ? datasets : [await buildDataset([data], path || fileName, fileName)];
}

/** Stable public adapter consumed by ImportPage and future import flows. */
export async function parseFile(buffer: ArrayBuffer, fileName: string, format: FileFormat): Promise<Dataset[]> {
  switch (format) {
    case 'xlsx': case 'xls': case 'xlsm': case 'ods': return parseSpreadsheet(buffer, fileName, format);
    case 'csv': return parseCSV(buffer, fileName);
    case 'tsv': return parseCSV(buffer, fileName, '\t');
    case 'json': return parseJSON(buffer, fileName);
    case 'jsonl': return parseJSONL(buffer, fileName);
    case 'txt': case 'markdown': return parseCSV(buffer, fileName);
    default: throw new Error(`Unsupported parser for format: ${format}`);
  }
}
