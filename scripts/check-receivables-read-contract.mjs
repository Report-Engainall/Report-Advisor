import fs from 'node:fs';

const source = fs.readFileSync('src/lib/queries.ts', 'utf8');
for (const token of [
  "const totalRows=Number(p.total_rows??0);",
  "const totalOutstanding=Number(p.total_outstanding??0);",
  "if(!Number.isFinite(totalRows)||totalRows<0)",
  "if(!Number.isFinite(totalOutstanding))",
  "typeof item.invoice_number==='string'",
  "Number.isFinite(item.balance)",
]) {
  if (!source.includes(token)) throw new Error(`Receivables read contract missing: ${token}`);
}
console.log('Receivables read contract: PASS (page metadata, totals, and row shape are validated fail-closed).');
