import fs from 'node:fs';

const path = 'docs/MASTER_PRODUCT_REFERENCE.md';
const text = fs.readFileSync(path, 'utf8');

const required = [
  'Authoritative reference',
  'Power BI',
  'Tableau',
  'Looker',
  'ThoughtSpot',
  'Metabase',
  'Apache Superset',
  'Linear',
  'Notion',
  'DuckDB',
  'Apache Arrow',
  'Polars',
  'Apache Tika',
  'Tesseract OCR',
  'Docling',
  'PaddleOCR',
  'LangGraph',
  'Selection rule',
  'Hard rejection rules',
  'Update protocol',
];

for (const token of required) {
  if (!text.includes(token)) throw new Error(`Master reference is missing: ${token}`);
}

if (text.includes('mandatory paid AI usage') === false) throw new Error('Paid-AI rejection policy missing');
if (text.includes('mandatory local installation') === false) throw new Error('Local-install rejection policy missing');

console.log('Master product/open-source reference registry: PASS');
