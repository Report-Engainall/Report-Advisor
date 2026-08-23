import fs from 'node:fs';

const adapters = fs.readFileSync('src/lib/file-engine/adapters.ts', 'utf8');
const types = fs.readFileSync('src/lib/file-engine/types.ts', 'utf8');

const requiredExports = ['parseSpreadsheet', 'parseCSV', 'parseJSON', 'parseJSONL', 'parseFile'];
for (const name of requiredExports) {
  if (!new RegExp(`export\\s+(?:async\\s+)?function\\s+${name}\\b`).test(adapters)) {
    throw new Error(`Missing canonical file-engine adapter: ${name}`);
  }
}

if (!/case 'csv':\s*return parseCSV\(buffer, fileName\);/.test(adapters)) {
  throw new Error('CSV must use automatic delimiter detection in the canonical parseFile adapter.');
}

if (!/function detectDelimiter\(line: string\)/.test(adapters)) {
  throw new Error('CSV delimiter detection is missing.');
}

if (!/export type FileFormat/.test(types) || !/export interface FileDetectionResult/.test(types) || !/export interface Dataset/.test(types)) {
  throw new Error('File-engine canonical types are incomplete.');
}

const supportedMatch = types.match(/SUPPORTED_FORMATS[\s\S]*?= \[([\s\S]*?)\];/m);
const supported = supportedMatch?.[1] ?? '';
if (!supportedMatch) {
  throw new Error('SUPPORTED_FORMATS declaration is missing or malformed.');
}

for (const format of ['xlsx', 'csv', 'tsv', 'json', 'jsonl']) {
  if (!new RegExp(`['"]${format}['"]`).test(supported)) {
    throw new Error(`Required production format is missing from SUPPORTED_FORMATS: ${format}`);
  }
}

console.log('file-engine capability contract: PASS');
