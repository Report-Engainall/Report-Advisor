import fs from 'node:fs';

const files = {
  normalizer: fs.readFileSync('src/lib/file-engine/normalizer.ts', 'utf8'),
  types: fs.readFileSync('src/lib/file-engine/types.ts', 'utf8'),
  synonyms: fs.readFileSync('src/lib/file-engine/synonyms.ts', 'utf8'),
  adapters: fs.readFileSync('src/lib/file-engine/adapters.ts', 'utf8'),
  dataTypes: fs.readFileSync('src/lib/file-engine/data-types.ts', 'utf8'),
};

const required = [
  ['normalizer', 'export function normalizeArabicDigits'],
  ['normalizer', 'export function normalizeHeader'],
  ['normalizer', 'export function parseNumber'],
  ['normalizer', 'export function parseDate'],
  ['synonyms', 'BUILTIN_SYNONYMS'],
  ['synonyms', 'export async function mapColumns'],
  ['adapters', 'const mappings = await mapColumns(columns)'],
  ['adapters', 'mappingEvidence:'],
  ['dataTypes', 'export function detectColumnDataType'],
  ['types', 'interface MappingEvidence'],
  ['types', 'requiresReview?: boolean'],
];

for (const [file, token] of required) {
  if (!files[file].includes(token)) throw new Error(`File-engine contract missing: ${file} -> ${token}`);
}

if (/console\.log\(/.test(files.adapters)) throw new Error('File-engine adapter must not contain debug logging');
if (!files.normalizer.includes("replace(/[\\u064B-\\u065F\\u0670]/g, '')")) throw new Error('Arabic diacritic normalization is missing');
if (!files.normalizer.includes("replace(/[٬]/g, ',')")) throw new Error('Arabic thousands separator normalization is missing');
if (!files.normalizer.includes("replace(/[٫]/g, '.')")) throw new Error('Arabic decimal separator normalization is missing');

console.log('File-engine architecture contract: PASS');
