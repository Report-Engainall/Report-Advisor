import { createServer, type ViteDevServer } from 'vite';

if (!('DOMMatrix' in globalThis)) Object.defineProperty(globalThis, 'DOMMatrix', { configurable: true, value: class DOMMatrix {} });
// PDF.js Node-runtime compatibility is exercised through the production adapter path.

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Structured PDF/OCR regression failed: ${message}`);
}

function pdfWithText(text: string): ArrayBuffer {
  const chunks = text.match(/.{1,90}(?:\s|$)/g)?.map((chunk) => chunk.trim()).filter(Boolean) ?? [text];
  const streamParts = ['BT /F1 12 Tf 40 760 Td'];
  for (let index = 0; index < chunks.length; index += 1) {
    const bytes = Array.from(new TextEncoder().encode(chunks[index]));
    const hex = bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('');
    streamParts.push(`<${hex}> Tj`);
    if (index < chunks.length - 1) streamParts.push('0 -18 Td');
  }
  streamParts.push('ET');
  const stream = streamParts.join(' ');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    `<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`,
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
      '{"invoice_number":"INV-AR", "invoice_date":"\\u0662\\u0660\\u0662\\u0666-\\u0660\\u0669-\\u0661\\u0665", "customer_name":"Test Customer", "subtotal":"\\u0661\\u0662", "tax_amount":"\\u0663", "total":"\\u0661\\u0665", "currency":"YER"}',
      'INV-AR',
    );

    console.log('Structured PDF/OCR behavioral regression: PASS');
  } finally {
    await vite.close();
  }
}

await main();
