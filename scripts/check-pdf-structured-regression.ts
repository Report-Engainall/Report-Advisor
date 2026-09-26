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

type PositionedPdfText = { text: string; x: number; y: number };

function pdfWithPositionedText(items: PositionedPdfText[]): ArrayBuffer {
  const uniqueUnits = [...new Set(items.flatMap(({ text }) => Array.from(text).flatMap((char) => [char.charCodeAt(0)])))];
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
  ].join('\\n');

  const positioned = items.map(({ text, x, y }) => {
    const hex = Array.from(text).map((char) => char.charCodeAt(0).toString(16).padStart(4, '0')).join('');
    return `1 0 0 1 ${x} ${y} Tm <${hex}> Tj`;
  }).join(' ');
  const stream = `BT /F1 12 Tf ${positioned} ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type0 /BaseFont /DejaVuSans /Encoding /Identity-H /DescendantFonts [6 0 R] /ToUnicode 8 0 R >>',
    `<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\\nstream\\n${stream}\\nendstream`,
    '<< /Type /Font /Subtype /CIDFontType2 /BaseFont /DejaVuSans /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor 7 0 R /DW 1000 >>',
    '<< /Type /FontDescriptor /FontName /DejaVuSans /Flags 4 /FontBBox [0 -200 1000 900] /ItalicAngle 0 /Ascent 800 /Descent -200 /CapHeight 700 /StemV 80 >>',
    `<< /Length ${Buffer.byteLength(cmap, 'utf8')} >>\\nstream\\n${cmap}\\nendstream`,
  ];
  const header = '%PDF-1.4\\n';
  let body = '';
  const offsets: number[] = [0];
  let position = Buffer.byteLength(header, 'utf8');
  objects.forEach((object, index) => {
    offsets.push(position);
    const rendered = `${index + 1} 0 obj\\n${object}\\nendobj\\n`;
    body += rendered;
    position += Buffer.byteLength(rendered, 'utf8');
  });
  const xrefOffset = Buffer.byteLength(header + body, 'utf8');
  const xref = `xref\\n0 ${objects.length + 1}\\n0000000000 65535 f \\n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `).join('\\n')}\\n`;
  const trailer = `trailer\\n<< /Size ${objects.length + 1} /Root 1 0 R >>\\nstartxref\\n${xrefOffset}\\n%%EOF\\n`;
  return new TextEncoder().encode(header + body + xref + trailer).buffer;
}


function pdfWithPositionedPages(pages: PositionedPdfText[][]): ArrayBuffer {
  const uniqueUnits = [...new Set(pages.flatMap(items => items.flatMap(({ text }) => Array.from(text).map(char => char.charCodeAt(0)))))] ;
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
  ].join('\\n');

  const contentStreams = pages.map(items => {
    const positioned = items.map(({ text, x, y }) => {
      const hex = Array.from(text).map((char) => char.charCodeAt(0).toString(16).padStart(4, '0')).join('');
      return `1 0 0 1 ${x} ${y} Tm <${hex}> Tj`;
    }).join(' ');
    return `BT /F1 12 Tf ${positioned} ET`;
  });

  const pageCount = pages.length;
  const firstPageObject = 3;
  const firstContentObject = firstPageObject + pageCount;
  const fontObject = firstContentObject + pageCount;
  const descendantObject = fontObject + 1;
  const descriptorObject = descendantObject + 1;
  const cmapObject = descriptorObject + 1;
  const pageRefs = pages.map((_, index) => `${firstPageObject + index} 0 R`).join(' ');
  const pageObjects = pages.map((_, index) =>
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObject} 0 R >> >> /Contents ${firstContentObject + index} 0 R >>`,
  );
  const contentObjects = contentStreams.map(stream =>
    `<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\\nstream\\n${stream}\\nendstream`,
  );

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${pageRefs}] /Count ${pageCount} >>`,
    ...pageObjects,
    ...contentObjects,
    `<< /Type /Font /Subtype /Type0 /BaseFont /DejaVuSans /Encoding /Identity-H /DescendantFonts [${descendantObject} 0 R] /ToUnicode ${cmapObject} 0 R >>`,
    `<< /Type /Font /Subtype /CIDFontType2 /BaseFont /DejaVuSans /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ${descriptorObject} 0 R /DW 1000 >>`,
    '<< /Type /FontDescriptor /FontName /DejaVuSans /Flags 4 /FontBBox [0 -200 1000 900] /ItalicAngle 0 /Ascent 800 /Descent -200 /CapHeight 700 /StemV 80 >>',
    `<< /Length ${Buffer.byteLength(cmap, 'utf8')} >>\\nstream\\n${cmap}\\nendstream`,
  ];

  const header = '%PDF-1.4\\n';
  let body = '';
  const offsets: number[] = [0];
  let position = Buffer.byteLength(header, 'utf8');
  objects.forEach((object, index) => {
    offsets.push(position);
    const rendered = `${index + 1} 0 obj\\n${object}\\nendobj\\n`;
    body += rendered;
    position += Buffer.byteLength(rendered, 'utf8');
  });
  const xrefOffset = Buffer.byteLength(header + body, 'utf8');
  const xref = `xref\\n0 ${objects.length + 1}\\n0000000000 65535 f \\n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `).join('\\n')}\\n`;
  const trailer = `trailer\\n<< /Size ${objects.length + 1} /Root 1 0 R >>\\nstartxref\\n${xrefOffset}\\n%%EOF\\n`;
  return new TextEncoder().encode(header + body + xref + trailer).buffer;
}

async function main(): Promise<void> {
  if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
    throw new Error('PDF regression requires the real Supabase test configuration; no fake environment is accepted.');
  }

  const vite: ViteDevServer = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { mapColumns } = await vite.ssrLoadModule('/src/lib/file-engine/synonyms.ts') as {
      mapColumns: (columns: string[]) => Promise<Array<{ mappedField: string | null; confidence: number }>>;
    };

    const arabicBusinessMappings = await mapColumns([
      'رقم الفاتورة',
      'تاريخ الفاتورة',
      'المبلغ المدفوع',
      'تاريخ السداد',
      'طريقة الدفع',
      'المخزن',
      'الوارد',
      'صافي مبيعات مرحل',
      'صافي مبيعات لم يرحل',
      'الرصيد',
    ]);
    assert(arabicBusinessMappings.every(mapping => Boolean(mapping.mappedField) && mapping.confidence >= 96), 'Arabic sales/payment/inventory headings must map canonically');

    const { parseFile, classifyOcrConfidence } = await vite.ssrLoadModule('/src/lib/file-engine/adapters.ts') as {
      parseFile: (input: ArrayBuffer, fileName: string, format: 'pdf') => Promise<Array<{ rows: Array<Record<string, unknown>>; qualityScore: number }>>;
      classifyOcrConfidence: (score: number) => 'REJECT' | 'REVIEW' | 'TRUSTED';
    };

    assert(classifyOcrConfidence(49) === 'REJECT', 'OCR confidence below 50 must reject');
    assert(classifyOcrConfidence(50) === 'REVIEW', 'OCR confidence 50 must require review');
    assert(classifyOcrConfidence(74.99) === 'REVIEW', 'OCR confidence below 75 must require review');
    assert(classifyOcrConfidence(75) === 'TRUSTED', 'OCR confidence 75 must be trusted');
    assert(classifyOcrConfidence(100) === 'TRUSTED', 'OCR confidence 100 must be trusted');
    const tableDatasets = await parseFile(
      pdfWithPositionedText([
        { text: 'اسم الصنف', x: 560, y: 700 },
        { text: 'رقم الصنف', x: 470, y: 700 },
        { text: 'المخزن', x: 380, y: 700 },
        { text: 'الوارد', x: 290, y: 700 },
        { text: 'الرصيد', x: 200, y: 700 },
        { text: 'زيت شفاف الفخامة 4×5 لتر', x: 560, y: 680 },
        { text: '10801001', x: 470, y: 680 },
        { text: 'الرئيسي', x: 380, y: 680 },
        { text: '58', x: 290, y: 680 },
        { text: '56', x: 200, y: 680 },
        { text: 'تونة الفخامة صغير 48 علبة × 100 جم', x: 560, y: 660 },
        { text: '10802002', x: 470, y: 660 },
        { text: 'الرئيسي', x: 380, y: 660 },
        { text: '77', x: 290, y: 660 },
        { text: '56', x: 200, y: 660 },
      ]),
      'arabic-table-layout.pdf',
      'pdf',
    );
    assert(tableDatasets.length === 1, 'positioned PDF must produce one dataset');
    assert(tableDatasets[0].rows.length === 2, 'positioned PDF must produce two business rows');
    assert(tableDatasets[0].rows[0]?.['اسم الصنف'] === 'زيت شفاف الفخامة 4×5 لتر', 'positioned PDF must preserve the first Arabic item');
    assert(tableDatasets[0].rows[1]?.['رقم الصنف'] === '10802002', 'positioned PDF must preserve the second item code');
    assert(tableDatasets[0].rows[0]?.الوارد === 58, 'positioned PDF must normalize Arabic report quantities through the canonical dataset path');

    const inventoryReportDatasets = await parseFile(
      pdfWithPositionedText([
        { text: 'اسم الصنف', x: 610, y: 700 },
        { text: 'رقم الصنف', x: 545, y: 700 },
        { text: 'المخزن', x: 475, y: 700 },
        { text: 'الوارد', x: 410, y: 700 },
        { text: 'صافي مبيعات مرحل', x: 320, y: 700 },
        { text: 'صافي مبيعات لم يرحل', x: 235, y: 700 },
        { text: 'صافي المبيعات', x: 160, y: 700 },
        { text: 'الرصيد', x: 95, y: 700 },
        { text: 'الوحدة', x: 45, y: 700 },
        { text: 'العبوه', x: 10, y: 700 },
        { text: 'زيت شفاف الفخامة 4×5 لتر', x: 610, y: 680 },
        { text: '10801001', x: 545, y: 680 },
        { text: 'الرئيسي', x: 475, y: 680 },
        { text: '58', x: 410, y: 680 },
        { text: '50', x: 320, y: 680 },
        { text: '2', x: 235, y: 680 },
        { text: '52', x: 160, y: 680 },
        { text: '56', x: 95, y: 680 },
        { text: 'كرتون', x: 45, y: 680 },
        { text: '4', x: 10, y: 680 },
      ]),
      'arabic-inventory-report.pdf',
      'pdf',
    );
    assert(inventoryReportDatasets.length === 1, 'Arabic inventory report must produce one dataset');
    const [inventoryReport] = inventoryReportDatasets;
    assert(inventoryReport.rows.length === 1, 'Arabic inventory report must produce one business row');
    assert(inventoryReport.qualityScore >= 75, `Arabic inventory report quality must meet review threshold, got ${inventoryReport.qualityScore}`);
    assert(inventoryReport.rows[0]?.sku === '10801001', 'Arabic inventory report code must map to canonical sku');
    assert(inventoryReport.rows[0]?.received_quantity === 58, 'Arabic inventory report incoming quantity must map canonically');
    assert(inventoryReport.rows[0]?.posted_net_sales === 50, 'Arabic inventory report posted net sales must map canonically');
    assert(inventoryReport.rows[0]?.unposted_net_sales === 2, 'Arabic inventory report unposted net sales must map canonically');
    assert(inventoryReport.rows[0]?.net_sales === 52, 'Arabic inventory report net sales must map canonically');
    assert(inventoryReport.rows[0]?.stock_balance === 56, 'Arabic inventory report balance must map canonically');


    const repeatedHeaders = [
      { text: 'اسم الصنف', x: 610, y: 700 },
      { text: 'رقم الصنف', x: 545, y: 700 },
      { text: 'المخزن', x: 475, y: 700 },
      { text: 'الوارد', x: 410, y: 700 },
      { text: 'صافي مبيعات مرحل', x: 320, y: 700 },
      { text: 'صافي مبيعات لم يرحل', x: 235, y: 700 },
      { text: 'صافي المبيعات', x: 160, y: 700 },
      { text: 'الرصيد', x: 95, y: 700 },
      { text: 'الوحدة', x: 45, y: 700 },
      { text: 'العبوه', x: 10, y: 700 },
    ];
    const multiPageDatasets = await parseFile(
      pdfWithPositionedPages([
        [
          ...repeatedHeaders,
          { text: 'زيت شفاف الفخامة 4×5 لتر', x: 610, y: 680 },
          { text: '10801001', x: 545, y: 680 },
          { text: 'الرئيسي', x: 475, y: 680 },
          { text: '58', x: 410, y: 680 },
          { text: '50', x: 320, y: 680 },
          { text: '2', x: 235, y: 680 },
          { text: '52', x: 160, y: 680 },
          { text: '56', x: 95, y: 680 },
          { text: 'كرتون', x: 45, y: 680 },
          { text: '4', x: 10, y: 680 },
          { text: 'الرصيد الافتتاحي', x: 350, y: 640 },
        ],
        [
          ...repeatedHeaders,
          { text: 'ارز السحاب 4×10 ك', x: 610, y: 680 },
          { text: '10603010', x: 545, y: 680 },
          { text: 'الرئيسي', x: 475, y: 680 },
          { text: '10.125', x: 410, y: 680 },
          { text: '9', x: 320, y: 680 },
          { text: '1', x: 235, y: 680 },
          { text: '10', x: 160, y: 680 },
          { text: '2.25', x: 95, y: 680 },
          { text: 'كيس', x: 45, y: 680 },
          { text: '4', x: 10, y: 680 },
          { text: 'تحويل غير مستلم', x: 350, y: 640 },
        ],
      ]),
      'arabic-inventory-two-pages.pdf',
      'pdf',
    );
    assert(multiPageDatasets.length === 1, 'multi-page Arabic inventory PDF must produce one dataset');
    const [multiPageDataset] = multiPageDatasets;
    assert(multiPageDataset.rows.length === 2, 'multi-page Arabic inventory PDF must keep business rows and reject summary lines');
    assert(multiPageDataset.rows[0]?.sku === '10801001', 'multi-page PDF must preserve page-one code');
    assert(multiPageDataset.rows[1]?.sku === '10603010', 'multi-page PDF must preserve continuation-page code');
    assert(multiPageDataset.columns.some(column => column.qualityIssues.some(issue => issue.includes('جدول متعدد الصفحات'))), 'multi-page PDF must expose reconstruction provenance');
    assert(multiPageDataset.qualityScore >= 75, `multi-page Arabic inventory PDF quality must meet review threshold, got ${multiPageDataset.qualityScore}`);

    const { extractPdfPageTable } = await vite.ssrLoadModule('/src/lib/file-engine/pdf-layout.ts') as {
      extractPdfPageTable: (items: Array<{ str: string; transform: number[]; width: number; height: number }>, existingLayout?: unknown) => {
        layout: { headers: string[]; centers: number[] };
        rows: Array<Record<string, string>>;
        confidence: number;
      } | null;
    };

    const pdfTablePage = extractPdfPageTable([
      { str: 'اسم الصنف', transform: [1, 0, 0, 12, 560, 700], width: 60, height: 12 },
      { str: 'رقم الصنف', transform: [1, 0, 0, 12, 470, 700], width: 60, height: 12 },
      { str: 'المخزن', transform: [1, 0, 0, 12, 380, 700], width: 42, height: 12 },
      { str: 'الوارد', transform: [1, 0, 0, 12, 290, 700], width: 36, height: 12 },
      { str: 'الرصيد', transform: [1, 0, 0, 12, 200, 700], width: 36, height: 12 },
      { str: 'زيت شفاف الفخامة 4×5 لتر', transform: [1, 0, 0, 12, 560, 680], width: 100, height: 12 },
      { str: '10801001', transform: [1, 0, 0, 12, 470, 680], width: 55, height: 12 },
      { str: 'الرئيسي', transform: [1, 0, 0, 12, 380, 680], width: 42, height: 12 },
      { str: '58', transform: [1, 0, 0, 12, 290, 680], width: 14, height: 12 },
      { str: '56', transform: [1, 0, 0, 12, 200, 680], width: 14, height: 12 },
    ]);
    assert(pdfTablePage && pdfTablePage.rows.length === 1, 'PDF geometry must reconstruct one table row');
    assert(pdfTablePage?.rows[0]?.['اسم الصنف'] === 'زيت شفاف الفخامة 4×5 لتر', 'PDF table must preserve Arabic item text');
    assert(pdfTablePage?.rows[0]?.['رقم الصنف'] === '10801001', 'PDF table must preserve item code');
    assert(pdfTablePage?.rows[0]?.['الوارد'] === '58', 'PDF table must preserve numeric column alignment');

    const continuation = extractPdfPageTable([
      { str: 'ارز السحاب 4×10 ك', transform: [1, 0, 0, 12, 560, 690], width: 90, height: 12 },
      { str: '10603010', transform: [1, 0, 0, 12, 470, 690], width: 55, height: 12 },
      { str: 'الرئيسي', transform: [1, 0, 0, 12, 380, 690], width: 42, height: 12 },
      { str: '10.125', transform: [1, 0, 0, 12, 290, 690], width: 35, height: 12 },
      { str: '2.25', transform: [1, 0, 0, 12, 200, 690], width: 25, height: 12 },
    ], pdfTablePage?.layout);
    assert(continuation && continuation.rows[0]?.['رقم الصنف'] === '10603010', 'PDF continuation pages must reuse detected table geometry');


    async function assertStructuredPdf(text: string, expectedInvoiceNumber: string): Promise<void> {
      const datasets = await parseFile(pdfWithText(text), 'structured-regression.pdf', 'pdf');
      assert(datasets.length === 1, 'PDF must produce one structured dataset');
      const [dataset] = datasets;
      assert(dataset.rows.length === 1, `structured PDF must produce one business row; extracted=${JSON.stringify(dataset.rows)}`);
      assert(dataset.rows[0]?.invoice_number === expectedInvoiceNumber, 'invoice_number must terminate before date label');
      assert(dataset.rows[0]?.invoice_date === '2026-09-15', 'date must be extracted from structured PDF');
      assert(dataset.rows[0]?.customer_name === 'Test Customer', 'customer_name must remain structured');
      assert(dataset.rows[0]?.subtotal === 12, 'subtotal must remain structured');
      assert(dataset.rows[0]?.tax_amount === 3, 'tax_amount must remain structured');
      assert(dataset.rows[0]?.total === 15, 'total must remain structured');
      assert(dataset.qualityScore >= 75, `structured PDF quality must stay above commit threshold, got ${dataset.qualityScore}`);
      assert(!('line_number' in dataset.rows[0]! || 'text' in dataset.rows[0]!), 'structured PDF must not fall back to generic text rows');
    }

    await assertStructuredPdf(
      'Invoice Number: INV-123 Date: 2026-09-15 Customer Name: Test Customer Subtotal: 12 Tax: 3 Total: 15 Currency: YER',
      'INV-123',
    );
    await assertStructuredPdf(
      'Invoice Number: INV-LEGACY Date 2026-09-15 Customer Name: Test Customer Subtotal: 12 Tax: 3 Total: 15 Currency: YER',
      'INV-LEGACY',
    );
    await assertStructuredPdf(
      'Invoice Number: INV-AR Date: 2026-09-15 Customer Name: Test Customer Subtotal: ١٢ Tax: ٣ Total: ١٥ Currency: YER',
      'INV-AR',
    );

    console.log('Structured PDF/OCR behavioral regression: PASS');
  } finally {
    await vite.close();
  }
}

await main();
