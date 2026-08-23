import * as XLSX from 'xlsx';
import type { FileFormat, Dataset, ColumnProfile, ColumnStatistics } from './types';
import { normalizeRows, normalizeColumnName, parseNumber } from './normalizer';
import { detectColumnDataType, cleanValue } from './data-types';
import { mapColumns } from './synonyms';

function generateId(): string { return Math.random().toString(36).substring(2, 9); }

function buildColumnProfiles(rows: Record<string, any>[], columns: string[], mappings: Awaited<ReturnType<typeof mapColumns>>): ColumnProfile[] {
  return columns.map((col, idx) => {
    const mapping = mappings[idx];
    const values = rows.map(r => r[col]).filter(v => v !== null && v !== undefined && v !== '');
    const sample = values.slice(0, 200);
    const dataType = mapping?.mappedField ? detectColumnDataType(sample, mapping.mappedField) : detectColumnDataType(sample, col);
    const nullCount = rows.filter(r => r[col] === null || r[col] === undefined || r[col] === '').length;
    const uniqueCount = new Set(values.map(v => String(v))).size;
    const uniqueRatio = values.length ? uniqueCount / values.length : 0;
    const mappingConfidence = mapping?.confidence || 0;
    const requiresReview = mapping?.requiresReview ?? true;
    const statistics: ColumnStatistics = { count: values.length };
    if (['integer', 'decimal', 'currency', 'percentage'].includes(dataType)) {
      const nums = values.map(parseNumber).filter((n): n is number => n !== null);
      if (nums.length) {
        const sorted = [...nums].sort((a, b) => a - b);
        const sum = nums.reduce((s, n) => s + n, 0);
        statistics.min = sorted[0]; statistics.max = sorted[sorted.length - 1]; statistics.sum = sum;
        statistics.mean = sum / nums.length;
        statistics.median = sorted.length % 2 === 0 ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 : sorted[Math.floor(sorted.length / 2)];
      }
    }
    return {
      name: col, mappedField: mapping?.mappedField || null, mappingConfidence, requiresReview,
      mappingEvidence: { sourceHeader: col, normalizedHeader: normalizeColumnName(col), matchedBy: mapping?.mappedField ? (mappingConfidence >= 80 ? 'exact' : 'partial') : 'unmapped', canonicalField: mapping?.mappedField || null, confidence: mappingConfidence, requiresReview },
      dataType, nullCount, uniqueCount, uniqueRatio, sampleValues: values.slice(0, 5), statistics, qualityIssues: [],
    };
  });
}

async function buildDataset(rows: Record<string, any>[], name: string, source: string, sheet?: string): Promise<Dataset> {
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
  const cleanedRows = normalized.map(row => Object.fromEntries(columnProfiles.map(col => [col.name, cleanValue(row[col.name], col.dataType)])));
  const qualityScore = columnProfiles.length ? Math.round(columnProfiles.reduce((s, c) => s + c.mappingConfidence, 0) / columnProfiles.length) : 0;
  return { id: generateId(), name, source, sheet, rowCount: cleanedRows.length, columnCount: columns.length, columns: columnProfiles, rows: cleanedRows, preview: cleanedRows.slice(0, 50), qualityScore };
}

export async function parseSpreadsheet(buffer: ArrayBuffer, fileName: string, _format: FileFormat): Promise<Dataset[]> {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
  const datasets: Dataset[] = [];
  for (const sheetName of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(wb.Sheets[sheetName], { defval: '', raw: true });
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

function parseCSVText(text: string, delimiter?: string): Record<string, any>[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return [];
  const delim = delimiter || detectDelimiter(lines[0]);
  const headers = parseCSVLine(lines[0], delim);
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line, delim);
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
  });
}

function detectDelimiter(line: string): string {
  return [',', ';', '\t', '|'].sort((a, b) => (line.split(b).length - 1) - (line.split(a).length - 1))[0];
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = []; let current = ''; let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { if (quoted && line[i + 1] === '"') { current += '"'; i++; } else quoted = !quoted; }
    else if (ch === delimiter && !quoted) { result.push(current.trim()); current = ''; }
    else current += ch;
  }
  result.push(current.trim()); return result;
}

export async function parseJSON(buffer: ArrayBuffer, fileName: string): Promise<Dataset[]> { return parseJSONData(JSON.parse(decodeBuffer(buffer)), fileName); }
export async function parseJSONL(buffer: ArrayBuffer, fileName: string): Promise<Dataset[]> {
  const rows = decodeBuffer(buffer).split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
  return rows.length ? [await buildDataset(rows, fileName, fileName)] : [];
}

async function parseJSONData(data: any, fileName: string, path = ''): Promise<Dataset[]> {
  if (Array.isArray(data)) return data.length && typeof data[0] === 'object' ? [await buildDataset(data, path || fileName, fileName)] : [];
  if (!data || typeof data !== 'object') return [];
  const datasets: Dataset[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value) && value.length && typeof value[0] === 'object') datasets.push(await buildDataset(value as Record<string, any>[], path ? `${path} → ${key}` : key, fileName, key));
  }
  return datasets.length ? datasets : [await buildDataset([data], path || fileName, fileName)];
}

/** Stable public adapter consumed by ImportPage and future import flows. */
export async function parseFile(buffer: ArrayBuffer, fileName: string, format: FileFormat): Promise<Dataset[]> {
  switch (format) {
    case 'xlsx': case 'xls': case 'xlsm': case 'ods': return parseSpreadsheet(buffer, fileName, format);
    case 'csv': return parseCSV(buffer, fileName, ',');
    case 'tsv': return parseCSV(buffer, fileName, '\t');
    case 'json': return parseJSON(buffer, fileName);
    case 'jsonl': return parseJSONL(buffer, fileName);
    case 'txt': case 'markdown': return parseCSV(buffer, fileName);
    default: throw new Error(`Unsupported parser for format: ${format}`);
  }
}
