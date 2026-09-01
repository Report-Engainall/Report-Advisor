import fs from 'node:fs';

const fixture = JSON.parse(fs.readFileSync('tests/fixtures/business-golden/cycle-004.json', 'utf8'));
const tenantIds = new Set(fixture.tenants.map((row) => row.id));
const products = new Map(fixture.products.map((row) => [row.id, row]));
const customers = new Map(fixture.customers.map((row) => [row.id, row]));
const suppliers = new Map(fixture.suppliers.map((row) => [row.id, row]));
const productByTenantSku = new Map(fixture.products.map((row) => [`${row.tenant_id}:${row.sku}`, row]));
for (const row of [...fixture.products, ...fixture.customers, ...fixture.suppliers, ...fixture.inventory, ...fixture.payments, ...fixture.sales, ...fixture.purchases]) {
  if (!tenantIds.has(row.tenant_id)) throw new Error(`BUSINESS_GOLDEN_REFERENCE_MISSING_TENANT:${row.tenant_id}`);
}
for (const row of fixture.sales) {
  const customer = customers.get(row.customer_id);
  if (!customer || customer.tenant_id !== row.tenant_id) throw new Error(`BUSINESS_GOLDEN_REFERENCE_BAD_SALE_CUSTOMER:${row.id}`);
  if (!productByTenantSku.has(`${row.tenant_id}:${row.sku}`)) throw new Error(`BUSINESS_GOLDEN_REFERENCE_BAD_SALE_PRODUCT:${row.id}`);
}
for (const row of fixture.purchases) {
  const supplier = suppliers.get(row.supplier_id);
  if (!supplier || supplier.tenant_id !== row.tenant_id) throw new Error(`BUSINESS_GOLDEN_REFERENCE_BAD_PURCHASE_SUPPLIER:${row.id}`);
  if (!productByTenantSku.has(`${row.tenant_id}:${row.sku}`)) throw new Error(`BUSINESS_GOLDEN_REFERENCE_BAD_PURCHASE_PRODUCT:${row.id}`);
}
for (const row of fixture.inventory) {
  if (!productByTenantSku.has(`${row.tenant_id}:${row.sku}`)) throw new Error(`BUSINESS_GOLDEN_REFERENCE_BAD_INVENTORY_PRODUCT:${row.sku}`);
}
for (const row of fixture.payments) {
  const customer = customers.get(row.customer_id);
  if (!customer || customer.tenant_id !== row.tenant_id) throw new Error(`BUSINESS_GOLDEN_REFERENCE_BAD_PAYMENT_CUSTOMER:${row.id}`);
}
console.log('BUSINESS_GOLDEN_CORPUS_REFERENTIAL_INTEGRITY_PASS');
