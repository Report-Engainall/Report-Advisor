import fs from 'node:fs';
import assert from 'node:assert/strict';
const engine = fs.readFileSync('src/lib/financialDecisionEngines.ts', 'utf8');
const canonical = fs.readFileSync('src/lib/canonicalIntelligence.ts', 'utf8');
for (const token of ['prioritizeReceivables','prioritizeSupplierPayments','protectCashReserve','HOLD_PAYMENT','COLLECT_NOW']) assert.match(engine, new RegExp(token), `missing ${token}`);
for (const token of ['prioritizeReceivables','prioritizeSupplierPayments','protectCashReserve','collections','supplierPayments','reserveProtection']) assert.match(canonical, new RegExp(token), `canonical finance integration missing ${token}`);
console.log('Financial decision engine contract: PASS');
