import { readFileSync } from 'node:fs';
const fixtures=['fixtures/golden/ar/products-ar.json','fixtures/golden/en/products-en.json','fixtures/golden/onyx/onyx-items.json','fixtures/golden/headerless/headerless-sales.json'];
for(const f of fixtures){const raw=readFileSync(new URL(`../${f}`,import.meta.url),'utf8');const data=JSON.parse(raw);if(!Array.isArray(data.rows)||data.rows.length===0)throw new Error(`Golden fixture invalid: ${f}`);if(!Array.isArray(data.expectedCanonical))throw new Error(`Expected schema missing: ${f}`);}
const required=['src/lib/import-pipeline/onyx-pro-adapter.ts','src/lib/import-pipeline/entity-resolution.ts','src/lib/import-pipeline/reconciliation-hardening.ts','src/lib/import-pipeline/governed-route-plan.ts'];
for(const f of required)if(!readFileSync(new URL(`../${f}`,import.meta.url),'utf8').length)throw new Error(`Missing production gate source: ${f}`);
console.log('Golden intelligence fixture integrity gate: PASS');
