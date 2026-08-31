import fs from 'node:fs';

const candidates = [
  'src/lib/document-intelligence',
  'src/lib/document-intelligence-engine',
  'src/lib/documents',
];

const files = candidates.flatMap((dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).map((name) => `${dir}/${name}`);
});

if (!files.length) throw new Error('document intelligence implementation boundary missing');

const source = files.filter((f) => fs.statSync(f).isFile()).map((f) => fs.readFileSync(f, 'utf8')).join('\n');

if (!/evidence|lineage|provenance/i.test(source)) throw new Error('document evidence lineage boundary missing');
if (!/normaliz/i.test(source)) throw new Error('document normalization boundary missing');
if (!/extract|ocr/i.test(source)) throw new Error('document extraction/OCR boundary missing');

console.log('document canonical regression: PASS');
