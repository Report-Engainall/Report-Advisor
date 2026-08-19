import * as XLSX from 'xlsx';
import type { FileFormat, Dataset, ColumnProfile } from './types';
import { normalizeRows, normalizeArabicDigits } from './normalizer';
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

    let stats: any = { count: values.length };
    if (dataType === 'integer' || dataType === 'decimal' || dataType === 'currency' || dataType === 'percentage') {
      const nums = values.map(v => Number(String(v).replace(/[^\d.\-]/g, ''))).filter(n => !isNaN(n));
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
      mappingConfidence: mapping?.confidence || 0,
      dataType,
      nullCount,
      uniqueCount,
      uniqueRatio,
      sampleValues: values.slice(0, 5),
      statistics: stats,
      qualityIssues: [] as string[],
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
  try {
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return new TextDecoder('windows-1256').decode(bytes);
  }
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
      row[headers[j]] = values[j] || '';
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
      const flattened = [flattenObject(data)];
      datasets.push(buildDataset(flattened, fileName, fileName) as any);
    }
  }

  return datasets as any;
}

function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

export async function parseXML(buffer: ArrayBuffer, fileName: string): Promise<Dataset[]> {
  const text = decodeBuffer(buffer);
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');
  const root = doc.documentElement;
  if (!root) return [];

  const childNodes = Array.from(root.children);
  if (childNodes.length === 0) return [];

  const firstChild = childNodes[0];
  const repeatingTag = firstChild.tagName;
  const repeatingNodes = childNodes.filter(n => n.tagName === repeatingTag);

  if (repeatingNodes.length > 1) {
    const rows = repeatingNodes.map(node => xmlNodeToObject(node));
    const ds = await buildDataset(rows, `${fileName} — ${repeatingTag}`, fileName, repeatingTag);
    return [ds];
  }

  const rows = childNodes.map(node => xmlNodeToObject(node));
  const ds = await buildDataset(rows, fileName, fileName);
  return [ds];
}

function xmlNodeToObject(node: Element): Record<string, any> {
  const result: Record<string, any> = {};
  for (const attr of Array.from(node.attributes)) {
    result[`@${attr.name}`] = attr.value;
  }
  for (const child of Array.from(node.children)) {
    if (child.children.length === 0) {
      result[child.tagName] = child.textContent;
    } else {
      result[child.tagName] = xmlNodeToObject(child);
    }
  }
  return result;
}

export async function parseTXT(buffer: ArrayBuffer, fileName: string): Promise<Dataset[]> {
  const text = decodeBuffer(buffer);
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return [];

  const delimiter = detectDelimiter(lines[0]);
  if (lines[0].split(delimiter).length > 1) {
    return parseCSV(buffer, fileName, delimiter);
  }

  const rows = lines.map((line, i) => ({ line_number: i + 1, content: line.trim() }));
  const ds = await buildDataset(rows, fileName, fileName);
  return [ds];
}

export async function parsePDF(buffer: ArrayBuffer, fileName: string): Promise<Dataset[]> {
  try {
    const pdfjs = await import('pdfjs-dist');
    const pdf = await pdfjs.getDocument({ data: buffer }).promise;
    const allText: string[] = [];
    const tableRows: Record<string, any>[] = [];
    let detectedHeaders: string[] | null = null;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      const items = textContent.items as any[];
      const lines = groupTextItemsIntoLines(items);

      for (const line of lines) {
        const text = line.map((i: any) => i.str).join(' ').trim();
        if (text) allText.push(text);

        const cells = line.map((i: any) => i.str.trim()).filter(s => s);
        if (cells.length >= 2) {
          if (!detectedHeaders && isLikelyHeader(cells)) {
            detectedHeaders = cells;
          } else if (detectedHeaders && cells.length >= detectedHeaders.length - 1) {
            const row: Record<string, any> = {};
            for (let i = 0; i < detectedHeaders.length; i++) {
              row[detectedHeaders[i]] = cells[i] || '';
            }
            tableRows.push(row);
          }
        }
      }
    }

    if (tableRows.length > 0 && detectedHeaders) {
      const ds = await buildDataset(tableRows, `${fileName} — جدول`, fileName);
      return [ds];
    }

    const textRows = allText.map((line, i) => ({ line_number: i + 1, content: line }));
    const ds = await buildDataset(textRows, `${fileName} — نص`, fileName);
    return [ds];
  } catch (e: any) {
    throw new Error(`فشل قراءة PDF: ${e.message}`);
  }
}

function groupTextItemsIntoLines(items: any[]): any[][] {
  const lines: any[][] = [];
  let currentLine: any[] = [];
  let lastY: number | null = null;

  const sorted = items.sort((a, b) => {
    if (Math.abs(a.transform[5] - b.transform[5]) > 3) {
      return b.transform[5] - a.transform[5];
    }
    return a.transform[4] - b.transform[4];
  });

  for (const item of sorted) {
    const y = item.transform[5];
    if (lastY !== null && Math.abs(y - lastY) > 3) {
      lines.push(currentLine);
      currentLine = [];
    }
    currentLine.push(item);
    lastY = y;
  }
  if (currentLine.length > 0) lines.push(currentLine);
  return lines;
}

function isLikelyHeader(cells: string[]): boolean {
  const headerKeywords = /sku|code|name|price|qty|quantity|date|total|amount|cost|product|customer|invoice|كود|اسم|سعر|كمية|تاريخ|إجمالي|مبلغ|تكلفة|العميل|الفاتورة/i;
  return cells.filter(c => headerKeywords.test(c)).length >= 2;
}

export async function parseDOCX(buffer: ArrayBuffer, fileName: string): Promise<Dataset[]> {
  try {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    const text = result.value;
    const lines = text.split(/\r?\n/).filter(l => l.trim());

    if (lines.length === 0) return [];

    const delimiter = detectDelimiter(lines[0]);
    if (lines[0].split(delimiter).length >= 3) {
      const rows: Record<string, any>[] = [];
      const headers = parseCSVLine(lines[0], delimiter);
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i], delimiter);
        const row: Record<string, any> = {};
        for (let j = 0; j < headers.length; j++) {
          row[headers[j]] = values[j] || '';
        }
        rows.push(row);
      }
      if (rows.length > 0) {
        const ds = await buildDataset(rows, `${fileName} — جدول`, fileName);
        return [ds];
      }
    }

    const textRows = lines.map((line, i) => ({ line_number: i + 1, content: line }));
    const ds = await buildDataset(textRows, `${fileName} — نص`, fileName);
    return [ds];
  } catch (e: any) {
    throw new Error(`فشل قراءة DOCX: ${e.message}`);
  }
}

export async function parseImage(buffer: ArrayBuffer, fileName: string): Promise<Dataset[]> {
  try {
    const Tesseract = await import('tesseract.js');
    const { data } = await Tesseract.recognize(new Uint8Array(buffer) as any, 'ara+eng', {
      logger: (m: any) => {
        if (m.status === 'recognizing text') {
          // Progress tracking handled by caller
        }
      },
    });

    const text = data.text;
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length === 0) return [];

    const delimiter = detectDelimiter(lines[0]);
    if (lines[0].split(delimiter).length >= 3) {
      const rows: Record<string, any>[] = [];
      const headers = parseCSVLine(lines[0], delimiter);
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i], delimiter);
        const row: Record<string, any> = {};
        for (let j = 0; j < headers.length; j++) {
          row[headers[j]] = values[j] || '';
        }
        rows.push(row);
      }
      if (rows.length > 0) {
        const ds = await buildDataset(rows, `${fileName} — OCR`, fileName);
        return [ds];
      }
    }

    const textRows = lines.map((line, i) => ({ line_number: i + 1, content: line, confidence: data.confidence }));
    const ds = await buildDataset(textRows, `${fileName} — OCR`, fileName);
    return [ds];
  } catch (e: any) {
    throw new Error(`فشل OCR للصورة: ${e.message}`);
  }
}

export async function parseFile(buffer: ArrayBuffer, fileName: string, format: FileFormat): Promise<Dataset[]> {
  switch (format) {
    case 'xlsx':
    case 'xls':
    case 'xlsm':
    case 'ods':
      return parseSpreadsheet(buffer, fileName, format);
    case 'csv':
      return parseCSV(buffer, fileName);
    case 'tsv':
      return parseCSV(buffer, fileName, '\t');
    case 'json':
      return parseJSON(buffer, fileName);
    case 'jsonl':
      return parseJSONL(buffer, fileName);
    case 'xml':
      return parseXML(buffer, fileName);
    case 'txt':
    case 'markdown':
      return parseTXT(buffer, fileName);
    case 'pdf':
      return parsePDF(buffer, fileName);
    case 'docx':
      return parseDOCX(buffer, fileName);
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'webp':
    case 'tiff':
    case 'bmp':
      return parseImage(buffer, fileName);
    default:
      throw new Error(`صيغة ${format} غير مدعومة`);
  }
}
