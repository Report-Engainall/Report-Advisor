import fs from 'node:fs/promises';

const originalPath = new URL('./production-scenario-runtime-e2e.mjs', import.meta.url);
const original = await fs.readFile(originalPath, 'utf8');

const pdfFixtureNeedle = "bytes:pdf(JSON.stringify(invoice(5)))";
const pdfFixtureReplacement = "bytes:pdf(`Invoice Number: ${invoice(5).invoice_number} Date: ${invoice(5).invoice_date} Customer Name: ${invoice(5).customer_name} Subtotal: 15 Tax: 0 Total: 15 Paid: 0 Currency: SAR`)";
if (!original.includes(pdfFixtureNeedle)) throw new Error('PDF_SCENARIO_FIXTURE_ANCHOR_MISSING');

let patched = original.replace(pdfFixtureNeedle, pdfFixtureReplacement);
patched = patched.replace('width:1200px;height:300px;', 'width:1400px;height:500px;').replace('font-size:30px', 'font-size:52px;line-height:1.8;text-align:center;');
patched = patched.replace(
  /<div>فاتورة مبيعات رقم SC-OCR-\$\{suffix\} التاريخ \$\{new Date\(\)\.toISOString\(\)\.slice\(0,10\)\} العميل عميل اختبار المجموع 15 الضريبة 0 الإجمالي 15 المدفوع 0 العملة SAR<\\\/div>/,
  '<div><div>فاتورة مبيعات</div><div>Invoice Number: SC-OCR-${suffix}</div><div>Date: ${new Date().toISOString().slice(0,10)}</div><div>Customer Name: Test Customer</div><div>Subtotal: 15 Tax: 0 Total: 15 Paid: 0 Currency: SAR</div></div>'
);

const tempPath = new URL('./.production-scenario-runtime-e2e-hardened.mjs', import.meta.url);
await fs.writeFile(tempPath, patched, 'utf8');
try {
  await import(tempPath.href);
} finally {
  await fs.rm(tempPath, { force: true });
}
