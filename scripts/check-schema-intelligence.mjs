import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/lib/file-engine/schema-intelligence.ts', import.meta.url), 'utf8');
const required = ['inferSchemaField', 'inferSchema', 'ambiguous', 'valueEvidence', 'SYNONYMS'];
for (const token of required) {
  if (!source.includes(token)) throw new Error(`Schema intelligence contract missing: ${token}`);
}
const requiredSynonyms = ['رقم الصنف', 'السعر', 'الكمية', 'رقم العميل', 'رقم الفاتورة'];
const specialtySchemaFields = ['supplier_id','supplier_name','supplier_code','invoice_date','warehouse_id','purchase_amount','subtotal','tax_amount','total','paid_amount','discount_amount','due_date','currency','payment_id','payment_date','payment_amount','payment_method','reference','direction','product_id','unit_cost','last_movement_date','segment','credit_limit','payment_terms_days','min_stock','reorder_point','is_active'];
for (const token of specialtySchemaFields) {
  if (!source.includes("'" + token + "'")) throw new Error('Specialty schema field missing: ' + token);
}

for (const token of requiredSynonyms) {
  if (!source.includes(token)) throw new Error(`Required Arabic synonym missing: ${token}`);
}
if (!source.includes('value-shape evidence')) throw new Error('Value-shape evidence is required');
if (!source.includes('best.confidence - second.confidence < 15')) throw new Error('Ambiguity threshold contract missing');
console.log('Schema intelligence contract: PASS');
