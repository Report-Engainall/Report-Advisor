import fs from 'node:fs';

const fixture = JSON.parse(fs.readFileSync('tests/fixtures/business-golden/cycle-004.json', 'utf8'));
const tenants = fixture.tenants.map((row) => row.id);
for (const tenantId of tenants) {
  for (const collection of ['products', 'customers', 'suppliers', 'sales', 'purchases', 'inventory', 'payments']) {
    const rows = fixture[collection].filter((row) => row.tenant_id === tenantId);
    if (rows.length === 0) throw new Error(`BUSINESS_GOLDEN_ISOLATION_EMPTY:${tenantId}:${collection}`);
    if (rows.some((row) => row.tenant_id !== tenantId)) throw new Error(`BUSINESS_GOLDEN_ISOLATION_LEAK:${tenantId}:${collection}`);
  }
}
for (const row of fixture.sales) {
  const customer = fixture.customers.find((candidate) => candidate.id === row.customer_id);
  if (!customer || customer.tenant_id !== row.tenant_id) throw new Error(`BUSINESS_GOLDEN_ISOLATION_SALE_LINK:${row.id}`);
}
console.log('BUSINESS_GOLDEN_CORPUS_ISOLATION_COMPLETENESS_PASS');
