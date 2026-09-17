import { createServer, type ViteDevServer } from 'vite';

if (!('DOMMatrix' in globalThis)) Object.defineProperty(globalThis, 'DOMMatrix', { configurable: true, value: class DOMMatrix {} });
type PromiseConstructorWithTry = PromiseConstructor & { try?: (fn: (...args: unknown[]) => unknown, ...args: unknown[]) => Promise<unknown> };
const promiseConstructor = Promise as PromiseConstructorWithTry;
if (typeof promiseConstructor.try !== 'function') Object.defineProperty(Promise, 'try', { configurable: true, writable: true, value: (fn: (...args: unknown[]) => unknown, ...args: unknown[]) => new Promise((resolve, reject) => { try { resolve(fn(...args)); } catch (error) { reject(error); } }) });

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Structured PDF regression failed: ${message}`);
}

function pdfWithText(text: string): ArrayBuffer {
  const escaped = text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const stream = `BT /F1 12 Tf 40 760 Td (${escaped}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];
  const header = '%PDF-1.4\n';
  let body = '';
  const offsets: number[] = [0];
  let position = header.length;
  objects.forEach((object, index) => {
    offsets.push(position);
    const rendered = `${index + 1} 0 obj\n${object}\nendobj\n`;
    body += rendered;
    position += rendered.length;
  });
  const xrefOffset = header.length + body.length;
  const xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `).join('\n')}\n`;
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return new TextEncoder().encode(header + body + xref + trailer).buffer;
}

async function main(): Promise<void> {
  const vite: ViteDevServer = await createServer({
    logLevel: 'error',
    server: { middlewareMode: true },
    appType: 'custom',
  });
  try {
    const { parseFile } = await vite.ssrLoadModule('/src/lib/file-engine/adapters.ts') as {
      parseFile: (input: ArrayBuffer, fileName: string, format: 'pdf') => Promise<Array<{ rows: Array<Record<string, unknown>>; qualityScore: number }>>;
    };

    async function assertStructuredPdf(text: string, expectedInvoiceNumber: string): Promise<void> {
      const datasets = await parseFile(pdfWithText(text), 'structured-regression.pdf', 'pdf');
      assert(datasets.length === 1, 'PDF must produce one structured dataset');
      const [dataset] = datasets;
      assert(dataset.rows.length === 1, 'structured PDF must produce one business row');
      assert(dataset.rows[0]?.invoice_number === expectedInvoiceNumber, 'invoice_number must terminate before date label');
      assert(dataset.rows[0]?.invoice_date === '2026-09-15', 'date must be extracted from structured PDF');
      assert(dataset.rows[0]?.customer_name === 'Test Customer', 'customer_name must remain structured');
      assert(dataset.rows[0]?.total === 15, 'total must remain structured');
      assert(dataset.qualityScore >= 75, `structured PDF quality must stay above commit threshold, got ${dataset.qualityScore}`);
      assert(!('line_number' in dataset.rows[0]! || 'text' in dataset.rows[0]!), 'structured PDF must not fall back to generic text rows');
    }

    await assertStructuredPdf('Invoice Number: INV-123 Date: 2026-09-15 Customer Name: Test Customer Total: 15', 'INV-123');
    await assertStructuredPdf('Invoice Number: INV-LEGACY Date 2026-09-15 Customer Name: Test Customer Total: 15', 'INV-LEGACY');
    console.log('Structured PDF behavioral regression: PASS');
  } finally {
    await vite.close();
  }
}

await main();
