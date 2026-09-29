import { createServer, type ViteDevServer } from 'vite';
import fs from 'node:fs/promises';
import path from 'node:path';

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
  const vite: ViteDevServer = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { parseFile, classifyOcrConfidence } = await vite.ssrLoadModule('/src/lib/file-engine/adapters.ts') as {
      parseFile: (input: ArrayBuffer, fileName: string, format: 'pdf') => Promise<Array<{ rows: Array<Record<string, unknown>>; qualityScore: number }>>;
      classifyOcrConfidence: (score: number) => 'REJECT' | 'REVIEW' | 'TRUSTED';
    };

    assert(classifyOcrConfidence(49) === 'REJECT', 'OCR confidence below 50 must reject');
    assert(classifyOcrConfidence(50) === 'REVIEW', 'OCR confidence 50 must require review');
    assert(classifyOcrConfidence(74.99) === 'REVIEW', 'OCR confidence below 75 must require review');
    assert(classifyOcrConfidence(75) === 'TRUSTED', 'OCR confidence 75 must be trusted');
    assert(classifyOcrConfidence(100) === 'TRUSTED', 'OCR confidence 100 must be trusted');

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

    const realPdfPath = path.join(process.cwd(), 'tests', 'fixtures', 'realistic-reports', 'اعمار الديون للعملا.pdf');
    const realPdfBytes = await fs.readFile(realPdfPath);
    const realBuffer = realPdfBytes.buffer.slice(realPdfBytes.byteOffset, realPdfBytes.byteOffset + realPdfBytes.byteLength);
    const realDatasets = await parseFile(realBuffer, realPdfPath, 'pdf');
    assert(realDatasets.length === 1, 'real receivables PDF must produce one dataset');
    const [realDataset] = realDatasets;
    assert(realDataset.rowCount === 27, `real receivables PDF row count must be 27, got ${realDataset.rowCount}`);
    assert(realDataset.qualityScore >= 75, `real receivables PDF quality must meet trusted import threshold, got ${realDataset.qualityScore}`);
    assert(realDataset.columns.filter((column) => column.mappedField).length >= 6, 'real receivables PDF must expose canonical mapped fields');
    assert(realDataset.rows.every((row) => row.customer_id && row.customer_name && row.currency === 'YER'), 'real receivables PDF must retain customer identity and currency');
    assert(realDataset.rows.every((row) => typeof row.outstanding_balance === 'number'), 'real receivables PDF must retain deterministic outstanding balance');
    const { detectImportedSpecialty } = await vite.ssrLoadModule('/src/lib/file-engine/schema-hardening.ts') as {
      detectImportedSpecialty: (dataset: typeof realDataset) => { specialty: string; confidence: number; canonicalEntityType: string };
    };
    const specialty = detectImportedSpecialty(realDataset);
    assert(specialty.specialty === 'receivables', `real receivables PDF specialty must be receivables, got ${specialty.specialty}`);
    assert(specialty.confidence >= 90, `real receivables specialty confidence must be >=90, got ${specialty.confidence}`);
    console.log(`Real receivables PDF regression: PASS (rows=${realDataset.rowCount}, quality=${realDataset.qualityScore}, specialty=${specialty.specialty})`);

    console.log('Structured PDF/OCR behavioral regression: PASS');
  } finally {
    await vite.close();
  }
}

await main();
