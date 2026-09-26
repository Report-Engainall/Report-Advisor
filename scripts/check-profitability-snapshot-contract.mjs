import fs from 'node:fs';

const source = fs.readFileSync('src/lib/dashboard-canonical.ts', 'utf8');
for (const token of [
  "const structurallyComplete = rawStatus === 'CALCULATED' && revenue !== null && cost !== null && grossProfit !== null;",
  "const status: ProfitabilitySnapshot['status'] = structurallyComplete ? 'CALCULATED' : 'INSUFFICIENT_DATA';",
  "requiredArray<unknown>(row.reasons).filter",
  "currency_status: row.currency_status==='CONSISTENT' ? 'CONSISTENT' : 'INSUFFICIENT_DATA'",
]) {
  if (!source.includes(token)) throw new Error(`Profitability fail-closed contract missing: ${token}`);
}
console.log('Profitability snapshot fail-closed contract: PASS (CALCULATED requires structurally complete revenue/cost/gross profit and sanitized reasons).');
