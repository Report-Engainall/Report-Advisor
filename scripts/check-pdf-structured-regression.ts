import { createServer, type ViteDevServer } from 'vite';
import { readFile } from 'node:fs/promises';

if (!('DOMMatrix' in globalThis)) Object.defineProperty(globalThis, 'DOMMatrix', { configurable: true, value: class DOMMatrix {} });
// PDF.js Node-runtime compatibility is exercised through the production adapter path.

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Structured PDF/OCR regression failed: ${message}`);
}

async function main(): Promise<void> {
  if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
    throw new Error('PDF regression requires the real Supabase test configuration; no fake environment is accepted.');
  }

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

    async function assertStructuredPdf(fileName: string, expectedInvoiceNumber: string): Promise<void> {
      const pdf = await readFile(new URL('./fixtures/' + fileName, import.meta.url));
      const arrayBuffer = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength);
      const datasets = await parseFile(arrayBuffer, 'structured-regression.pdf', 'pdf');
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
      'structured-invoice-colon.pdf',
      'INV-123',
    );
    await assertStructuredPdf(
      'structured-invoice-legacy.pdf',
      'INV-LEGACY',
    );
    await assertStructuredPdf(
      'structured-invoice-arabic-digits.pdf',
      'INV-AR',
    );

    console.log('Structured PDF/OCR behavioral regression: PASS');
  } finally {
    await vite.close();
  }
}

await main();
