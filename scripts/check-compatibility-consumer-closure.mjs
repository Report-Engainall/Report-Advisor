import fs from 'node:fs';

const file = 'src/lib/queries-compat.ts';
const text = fs.readFileSync(file, 'utf8');
const requiredDelegations = [
  ['fetchMonthlyTrend', 'canonicalFetchMonthlyTrend'],
  ['fetchTopCustomers', 'canonicalFetchTopCustomers'],
  ['fetchTopProducts', 'canonicalFetchTopProducts'],
  ['fetchCategoryBreakdown', 'canonicalFetchCategoryBreakdown'],
  ['fetchAgingBuckets', 'canonicalFetchAgingBuckets'],
  ['fetchForecasts', 'canonicalFetchForecasts'],
  ['fetchCustomers', 'canonicalFetchCustomers'],
  ['fetchProducts', 'canonicalFetchProducts'],
];
for (const [name, canonical] of requiredDelegations) {
  const re = new RegExp(`export async function ${name}[^\\n]*return ${canonical}\\(`);
  if (!re.test(text)) throw new Error(`Compatibility function is not a pure canonical delegate: ${name}`);
}
if (!text.includes("/** Compatibility boundary only: preserve legacy imports without owning business truth. */")) throw new Error('Compatibility boundary declaration missing');
if (!text.includes('p_max_rows: 10000')) throw new Error('Canonical export row bound missing');
for (const forbidden of ['.reduce(', '.sort(', '.filter(']) {
  if (text.includes(forbidden)) throw new Error(`Business aggregation leaked into compatibility boundary: ${forbidden}`);
}
console.log('COMPATIBILITY_CONSUMER_CLOSURE_PASS');
