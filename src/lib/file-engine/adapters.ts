import * as XLSX from 'xlsx';
import type { FileFormat, Dataset, ColumnProfile } from './types';
import { normalizeRows, normalizeColumnName, parseNumber } from './normalizer';
import { detectColumnDataType, cleanValue } from './data-types';
import { mapColumns } from './synonyms';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function buildColumnProfiles(rows: Record<string, any>[], columns: string[], mappings: Awaited<ReturnType<typeof mapColumns>>): ColumnProfile[] {
  return columns.map((col, idx) => {
    const mapping = mappings[idx];
    const values = rows.map(r => r[col]).filter(v => v !== null && v !== undefined && v !== '');
    const nonNullValues = values.slice(0, 200);
    const dataType = mapping?.mappedField
      ? detectColumnDataType(nonNullValues, mapping.mappedField)
      : detectColumnDataType(nonNullValues, col);

    const nullCount = rows.filter(r => r[col] === null || r[col] === undefined || r[col] === '').length;
    const uniqueValues = new Set(values.map(v => String(v)));
    const uniqueCount = uniqueValues.size;
    const uniqueRatio = values.length > 0 ? uniqueCount / values.length : 0;
    const mappingConfidence = mapping?.confidence || 0;
    const requiresReview = mapping?.requiresReview ?? true;

    const stats: Record<string, any> = { count: values.length };
    if (dataType === 'integer' || dataType === 'decimal' || dataType === 'currency' || dataType === 'percentage') {
      const nums = values.map(parseNumber).filter((n): n is number => n !== null);
      if (nums.length > 0) {
        stats.min = Math.min(...nums);
        stats.max = Math.max(...nums);
        stats.sum = nums.reduce((s, n) => s + n, 0);
        stats.mean = stats.sum / nums.length;
        const sorted = [...nums].sort((a, b) => a - b);
        stats.median = sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];
      }
    }

    return {
      name: col,
      mappedField: mapping?.mappedField || null,
      mappingConfidence,
      requiresReview,
      mappingEvidence: {
        sourceHeader: col,
        normalizedHeader: normalizeColumnName(col),
        matchedBy: mapping?.mappedField ? (mappingConfidence >= 80 ? 'exact' : 'partial') : 'unmapped',
        canonicalField: mapping?.mappedField || null,
        confidence: mappingConfidence,
        requiresReview,
      },
      dataType,
      nullCount,
      uniqueCount,
      uniqueRatio,
      sampleValues: values.slice(0, 5),
      statistics: stats,
      qualityIssues: [],
    };
  });
}

async function buildDataset(rows: Record<string, any>[], name: string, source: string, sheet?: string): Promise<Dataset> {
  const normalized = normalizeRows(rows);
  if (normalized.length === 0) {
    return {
      id: generateId(),
      name, source, sheet,
      rowCount: 0, columnCount: 0,
      columns: [], rows: [], preview: [],
      qualityScore: 0,
    };
  }

  const columns = Object.keys(normalized[0]);
  const mappings = await mapColumns(columns);
  const columnProfiles = buildColumnProfiles(normalized, columns, mappings);

  for (const col of columnProfiles) {
    if (col.nullCount > normalized.length * 0.5) {
      col.qualityIssues.push('أكثر من 50% من القيم فارغة');
    }
    if (col.mappingConfidence < 80 && col.mappedField) {
      col.qualityIssues.push('تعيين منخفض الثقة — يحتاج مراجعة');
    }
    if (!col.mappedField) {
      col.qualityIssues.push('لم يتم تعريف العمود');
    }
  }

  const cleanedRows = normalized.map(row => {
    const cleaned: Record<string, any> = {};
    for (const col of columnProfiles) {
      cleaned[col.name] = cleanValue(row[col.name], col.dataType);
    }
    return cleaned;
  });

  const qualityScore = columnProfiles.length > 0
    ? Math.round(columnProfiles.reduce((s, c) => s + c.mappingConfidence, 0) / columnProfiles.length)
    : 0;

  return {
    id: generateId(),
    name, source, sheet,
    rowCount: normalized.length,
    columnCount: columns.length,
    columns: columnProfiles,
    rows: cleanedRows,
    preview: cleanedRows.slice(0, 50),
    qualityScore,
  };
}

export async function parseSpreadsheet(buffer: ArrayBuffer, fileName: string, format: FileFormat): Promise<Dataset[]> {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
  const datasets: Dataset[] = [];

  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '', raw: true });
    if (jsonData.length === 0) continue;
    const ds = await buildDataset(jsonData, `${fileName} — ${sheetName}`, fileName, sheetName);
    datasets.push(ds);
  }

  return datasets;
}

export async function parseCSV(buffer: ArrayBuffer, fileName: string, delimiter?: string): Promise<Dataset[]> {
  const text = decodeBuffer(buffer);
  const rows = parseCSVText(text, delimiter);
  if (rows.length === 0) return [];
  const ds = await buildDataset(rows, fileName, fileName);
  return [ds];
}

function decodeBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
    return new TextDecoder('utf-8').decode(bytes.slice(3));
  }
  return new TextDecoder('utf-8').decode(bytes);
}

function parseCSVText(text: string, delimiter?: string): Record<string, any>[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return [];

  const delim = delimiter || detectDelimiter(lines[0]);
  const headers = parseCSVLine(lines[0], delim);
  const rows: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i], delim);
    const row: Record<string, any> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] ?? '';
    }
    rows.push(row);
  }
  return rows;
}

function detectDelimiter(line: string): string {
  const counts: Record<string, number> = { ',': 0, ';': 0, '\t': 0, '|': 0 };
  for (const ch of Object.keys(counts)) {
    counts[ch] = line.split(ch).length - 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] || ',';
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result.map(s => s.trim());
}

export async function parseJSON(buffer: ArrayBuffer, fileName: string): Promise<Dataset[]> {
  const text = decodeBuffer(buffer);
  const data = JSON.parse(text);
  return parseJSONData(data, fileName);
}

export async function parseJSONL(buffer: ArrayBuffer, fileName: string): Promise<Dataset[]> {
  const text = decodeBuffer(buffer);
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  const rows = lines.map(l => JSON.parse(l));
  if (rows.length === 0) return [];
  const ds = await buildDataset(rows, fileName, fileName);
  return [ds];
}

function parseJSONData(data: any, fileName: string, path = ''): Dataset[] {
  const datasets: Dataset[] = [];

  if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === 'object') {
      const ds = buildDataset(data, path || fileName, fileName).then(d => d);
      datasets.push(ds as any);
    }
  } else if (typeof data === 'object' && data !== null) {
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
        const subPath = path ? `${path} → ${key}` : key;
        datasets.push(buildDataset(value, subPath, fileName, key) as any);
      }
    }
    if (datasets.length === 0) {
      const ds = buildDataset([data], path || fileName, fileName).then(d => d);
      datasets.push(ds as any);
    }
  }

  return datasets;
}
