import fs from 'node:fs/promises';
import path from 'node:path';
import { createServer, type ViteDevServer } from 'vite';

if (!('DOMMatrix' in globalThis)) Object.defineProperty(globalThis, 'DOMMatrix', { configurable: true, value: class DOMMatrix {} });
type PromiseConstructorWithTry = PromiseConstructor & { try?: (fn: (...args: unknown[]) => unknown, ...args: unknown[]) => Promise<unknown> };
const promiseConstructor = Promise as PromiseConstructorWithTry;
if (!('toHex' in Uint8Array.prototype)) {
  Object.defineProperty(Uint8Array.prototype, 'toHex', {
    configurable: true,
    value: function toHex(this: Uint8Array): string {
      return Array.from(this, (byte) => byte.toString(16).padStart(2, '0')).join('');
    },
  });
}

if (typeof promiseConstructor.try !== 'function') {
  Object.defineProperty(Promise, 'try', {
    configurable: true,
    writable: true,
    value: (fn: (...args: unknown[]) => unknown, ...args: unknown[]) =>
      new Promise((resolve, reject) => { try { resolve(fn(...args)); } catch (error) { reject(error); } }),
  });
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Structured PDF/OCR regression failed: ${message}`);
}

function pdfWithText(text: string): ArrayBuffer {
  const uniqueUnits = [...new Set(Array.from(text).flatMap((char) => {
    const units: number[] = [];
    for (const unit of char.split('').map((entry) => entry.charCodeAt(0))) units.push(unit);
    return units;
  }))];

  const cmap = [
    '/CIDInit /ProcSet findresource begin',
    '12 dict begin',
    'begincmap',
    '/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def',
    '/CMapName /Adobe-Identity-UCS def',
    '/CMapType 2 def',
    '1 begincodespacerange',
    '<0000> <FFFF>',
    'endcodespacerange',
    `${uniqueUnits.length} beginbfchar`,
    ...uniqueUnits.map((unit) => `<${unit.toString(16).padStart(4, '0')}> <${unit.toString(16).padStart(4, '0')}>`),
    'endbfchar',
    'endcmap',
    'CMapName currentdict /CMap defineresource pop',
    'end',
    'end',
  ].join('\n');

  const hex = Array.from(text)
    .flatMap((char) => char.split('').map((unit) => unit.charCodeAt(0)))
    .map((unit) => unit.toString(16).padStart(4, '0'))
    .join('');
  const chunks = hex.match(/.{1,160}/g) ?? [];
  const stream = `BT /F1 12 Tf 40 760 Td ${chunks.map((chunk) => `<${chunk}> Tj`).join(" 0 -16 Td ")} ET`;

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type0 /BaseFont /DejaVuSans /Encoding /Identity-H /DescendantFonts [6 0 R] /ToUnicode 8 0 R >>',
    `<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /CIDFontType2 /BaseFont /DejaVuSans /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor 7 0 R /DW 1000 >>',
    '<< /Type /FontDescriptor /FontName /DejaVuSans /Flags 4 /FontBBox [0 -200 1000 900] /ItalicAngle 0 /Ascent 800 /Descent -200 /CapHeight 700 /StemV 80 >>',
    `<< /Length ${Buffer.byteLength(cmap, 'utf8')} >>\nstream\n${cmap}\nendstream`,
  ];

  const header = '%PDF-1.4\n';
  let body = '';
  const offsets: number[] = [0];
  let position = Buffer.byteLength(header, 'utf8');

  objects.forEach((object, index) => {
    offsets.push(position);
    const rendered = `${index + 1} 0 obj\n${object}\nendobj\n`;
    body += rendered;
    position += Buffer.byteLength(rendered, 'utf8');
  });

  const xrefOffset = Buffer.byteLength(header + body, 'utf8');
  const xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `).join('\n')}\n`;
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return new TextEncoder().encode(header + body + xref + trailer).buffer;
}

async function main(): Promise<void> {
  if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
    throw new Error('PDF regression requires the real Supabase test configuration; no fake environment is accepted.');
  }

  const vite: ViteDevServer = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { parseFile, classifyOcrConfidence, isPdfBusinessTableRow, tryParseSupplierOpeningBalanceText } = await vite.ssrLoadModule('/src/lib/file-engine/adapters.ts') as {
      parseFile: (input: ArrayBuffer, fileName: string, format: 'pdf') => Promise<Array<{ rows: Array<Record<string, unknown>>; qualityScore: number }>>;
      classifyOcrConfidence: (score: number) => 'REJECT' | 'REVIEW' | 'TRUSTED';
      isPdfBusinessTableRow: (row: Record<string, unknown>) => boolean;
      tryParseSupplierOpeningBalanceText: (text: string) => Array<Record<string, unknown>> | null;
    };

    assert(classifyOcrConfidence(49) === 'REJECT', 'OCR confidence below 50 must reject');
    assert(classifyOcrConfidence(50) === 'REVIEW', 'OCR confidence 50 must require review');
    assert(classifyOcrConfidence(74.99) === 'REVIEW', 'OCR confidence below 75 must require review');
    assert(classifyOcrConfidence(75) === 'TRUSTED', 'OCR confidence 75 must be trusted');
    assert(classifyOcrConfidence(100) === 'TRUSTED', 'OCR confidence 100 must be trusted');
    assert(isPdfBusinessTableRow({ 'رقم الفاتورة': '1242', 'التاريخ': '15/08/2026', 'اسم العميل': 'عميل فعلي', 'اجمالي الفاتورة': '49670' }), 'invoice row accepted');
    assert(!isPdfBusinessTableRow({ 'رقم الفاتورة': '', 'التاريخ': '', 'اسم العميل': 'الإجمالي :', 'اجمالي الفاتورة': '471807450' }), 'summary row rejected');
    assert(!isPdfBusinessTableRow({ 'رقم الفاتورة': '', 'التاريخ': '', 'اسم العميل': '', 'اجمالي الفاتورة': '', 'مبلغ صافي': '471807450' }), 'footer row rejected');

    // Real-report canary: use the actual fixture instead of a synthetic PDF generator.
    const supplierOpeningFixture = path.join(process.cwd(), 'tests/fixtures/realistic-reports/تقارير الأرصدة الإفتتاحية - ارصدة نهائية للموردين.pdf');
    const supplierOpeningBytes = await fs.readFile(supplierOpeningFixture);
    const supplierOpeningBuffer = supplierOpeningBytes.buffer.slice(supplierOpeningBytes.byteOffset, supplierOpeningBytes.byteOffset + supplierOpeningBytes.byteLength);
    const rawPdfjs = await import('pdfjs-dist');
    const rawPdfDocument = await rawPdfjs.getDocument({ data: new Uint8Array(supplierOpeningBuffer), useSystemFonts: true }).promise;
    const rawPageTexts: string[] = [];
    for (let pageNumber = 1; pageNumber <= rawPdfDocument.numPages; pageNumber += 1) {
      const page = await rawPdfDocument.getPage(pageNumber);
      const content = await page.getTextContent({ disableCombineTextItems: true });
      rawPageTexts.push(content.items.map((item: { str?: string }) => item.str ?? '').filter(Boolean).join(' '));
    }
    const rawNormalizedSupplierText = rawPageTexts.join(' ').normalize('NFKC').replace(/\s+/g, ' ').trim();
    const rawSupplierRowStartMatches = [...rawNormalizedSupplierText.matchAll(/(?<!\d)(-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:[.,]\d+)?)\s+(\d{4,8})\s+(YER|SAR|USD|EUR|ر\.س)(?=\s)/gi)];
    console.log('RAW_PDFJS_SUPPLIER_SHAPE', JSON.stringify({
      chars: rawNormalizedSupplierText.length,
      header: /(رقم المورد|رقم الحساب|الرصيد الافتتاحي|العملة|الاسم)/.test(rawNormalizedSupplierText),
      rowStarts: rawSupplierRowStartMatches.length,
      yerTokens: (rawNormalizedSupplierText.match(/\bYER\b/gi) ?? []).length,
      sarTokens: (rawNormalizedSupplierText.match(/ر\.س/gi) ?? []).length,
      accountTokens: (rawNormalizedSupplierText.match(/(?<!\d)\d{8,12}(?!\d)/g) ?? []).length,
      numericTokens: (rawNormalizedSupplierText.match(/-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:[.,]\d+)?/g) ?? []).length,
    }));
    const rawSupplierRows = tryParseSupplierOpeningBalanceText(rawPageTexts.join(' '));
    console.log('RAW_PDFJS_SUPPLIER_ROWS', JSON.stringify({
      rows: rawSupplierRows?.length ?? 0,
      firstRowKeys: rawSupplierRows?.[0] ? Object.keys(rawSupplierRows[0]) : [],
    }));
    assert(rawSupplierRows != null && rawSupplierRows.length >= 5, 'raw PDF.js supplier parser must produce business rows');
    const supplierDatasets = await parseFile(supplierOpeningBuffer, path.basename(supplierOpeningFixture), 'pdf');
    assert(supplierDatasets.length === 1, 'supplier opening-balance PDF must produce one dataset');
    const nodeRuntimeAdapters = await import('../src/lib/file-engine/adapters.ts');
    const nodeRuntimeDatasets = await nodeRuntimeAdapters.parseFile(supplierOpeningBuffer, path.basename(supplierOpeningFixture), 'pdf');
    assert(nodeRuntimeDatasets.length === 1, 'node runtime supplier opening parser must produce one dataset');
    const { understandCanonicalSource } = await import('../src/lib/import/canonical-source-understanding.ts');
    const nodeUnderstanding = understandCanonicalSource(nodeRuntimeDatasets as never);
    console.log('NODE_RUNTIME_SUPPLIER_UNDERSTANDING', JSON.stringify({
      datasetCount: nodeRuntimeDatasets.length,
      rows: nodeRuntimeDatasets[0]?.rows?.length ?? 0,
      datasetQuality: nodeRuntimeDatasets[0]?.qualityScore ?? null,
      canonicalQuality: nodeUnderstanding.qualityScore,
      specialty: nodeUnderstanding.specialty,
      entityType: nodeUnderstanding.entityType,
    }));
    assert(nodeUnderstanding.qualityScore >= 75, 'node runtime canonical understanding must retain trusted supplier-opening quality, got ' + nodeUnderstanding.qualityScore);
    const [supplierDataset] = supplierDatasets;
    assert(supplierDataset.rows.length >= 5, 'supplier opening-balance PDF must produce business rows; extracted=' + supplierDataset.rows.length);
    assert(supplierDataset.qualityScore >= 75, 'supplier opening-balance PDF quality must be trusted, got ' + supplierDataset.qualityScore);
    assert(supplierDataset.rows.some((row) => row.supplier_id != null && row.supplier_name && row.opening_balance != null && row.currency), 'supplier opening-balance PDF must expose supplier identity, opening balance and currency');
    assert(supplierDataset.rows.some((row) => row.account_number), 'supplier opening-balance PDF must preserve account number provenance');

    console.log('Structured PDF/OCR behavioral regression: PASS');
  } finally {
    await vite.close();
  }
}

await main();
