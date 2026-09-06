import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/pages/CanonicalImportPage.tsx', import.meta.url), 'utf8');

if (!source.includes("alternatives?: string[][]")) throw new Error('Import preview alternative-required contract missing');
if (!source.includes("alternatives: [['customer_id', 'customer_name']]")) throw new Error('Invoice customer identity alternative is not declared');
if (!source.includes("const alternativeMissing = (config.alternatives ?? [])")) throw new Error('Import preview does not validate alternative-required groups');
if (!source.includes("const allMissing = [...missing, ...alternativeMissing]")) throw new Error('Import preview does not combine canonical required and alternative fields');

console.log('Import preview canonical required-field contract: PASS');
