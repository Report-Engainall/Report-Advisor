import fs from 'node:fs';

const source = fs.readFileSync('src/lib/queries.ts', 'utf8');
for (const token of [
  "get_forecast_snapshot",
  "REPORT_DATA_UNAVAILABLE: forecast rows missing",
  "REPORT_DATA_UNAVAILABLE: forecast row shape invalid",
  "typeof item.id !== 'string' || !item.id.trim()",
  "typeof item.company_id !== 'string' || !item.company_id.trim()",
  "Number.isFinite(new Date(item.period).getTime())",
  "Number.isFinite(Number(item.forecast_value))",
  "Number.isFinite(Number(item.lower_bound))",
  "Number.isFinite(Number(item.upper_bound))",
  "Number.isInteger(Number(item.data_points))",
]) {
  if (!source.includes(token)) throw new Error('Forecast read contract missing: ' + token);
}
console.log('Forecast read contract: PASS');
