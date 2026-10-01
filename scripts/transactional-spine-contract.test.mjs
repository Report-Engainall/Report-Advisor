import fs from 'node:fs';
import assert from 'node:assert/strict';

const page = fs.readFileSync('src/pages/OperationsPage.tsx', 'utf8');
const lib = fs.readFileSync('src/lib/transactional-spine.ts', 'utf8');
const migration = fs.readFileSync('supabase/migrations/20261002010000_transactional_spine_staff_read_boundary.sql', 'utf8');
const auditBoundary = fs.readFileSync('supabase/migrations/20261002014500_restore_audit_logs_append_only_policy_boundary.sql', 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');
const nav = fs.readFileSync('src/lib/navigation-registry.ts', 'utf8');
const auditMigration = fs.readFileSync('supabase/migrations/20261002013000_operational_transaction_audit.sql', 'utf8');
const repeatabilityMigration = fs.readFileSync('supabase/migrations/20261002022000_e2e_order_repeatability_reset.sql', 'utf8');
const repeatabilityHardening = fs.readFileSync('supabase/migrations/20261002022100_e2e_order_repeatability_reset_no_inventory_mutation.sql', 'utf8');

for (const marker of ['transition_order','create_invoice_from_order','record_sales_payment','fetchOperationalAuditTrace','audit_logs','customer_price_tiers','orders','warehouses']) {
  assert.ok(lib.includes(marker), 'transactional lib missing canonical contract: ' + marker);
}
for (const marker of ['orders_staff_select','order_items_staff_select','price_tiers_staff_select','public.current_company_id()','auth.uid()']) {
  assert.ok(migration.includes(marker), 'transactional migration missing security boundary: ' + marker);
}
for (const marker of ['audit_operational_change','trg_orders_operational_audit','trg_sales_invoices_operational_audit','trg_payments_operational_audit','operations-runtime','AUDIT_TENANT_CONTEXT_MISMATCH']) {
  assert.ok(auditMigration.includes(marker), 'operational audit migration missing: ' + marker);
}
assert.match(page, /ORDER → FULFILLMENT/);
assert.match(page, /INVOICE → PAYMENT/);
assert.match(page, /PRICING TRUTH/);
assert.match(page, /SUPPLIER OPERATIONS/);
assert.match(page, /FULFILLMENT \/ WAREHOUSE/);
assert.match(page, /AUDIT \/ TRACE/);
assert.match(page, /READBACK CONTRACT/);
assert.match(page, /READ-ONLY/);
assert.match(page, /NOT IMPLEMENTED/);
assert.match(page, /PERMISSION_DENIED/);
for (const marker of ['drop policy if exists tenant_update','drop policy if exists tenant_delete','revoke update, delete, truncate on table public.audit_logs from authenticated']) {
  assert.ok(auditBoundary.includes(marker), 'audit append-only boundary missing: ' + marker);
}
for (const marker of ['prepare_e2e_order','E2E-ORDER-%','E2E_RESET_ADMIN_REQUIRED','E2E_ORDER_TAG_REQUIRED','e2e_order_reset']) {
  assert.ok(repeatabilityMigration.includes(marker), 'E2E repeatability contract missing: ' + marker);
}
const normalizedRepeatabilityMigration = repeatabilityMigration.toLowerCase().replace(/\s+/g, ' ');
assert.ok(normalizedRepeatabilityMigration.includes('revoke all on function public.prepare_e2e_order(uuid) from public, anon'));
assert.ok(normalizedRepeatabilityMigration.includes('grant execute on function public.prepare_e2e_order(uuid) to authenticated'));
for (const marker of ['prepare_e2e_order','delete from public.payments','delete from public.sales_invoices','order.e2e_reset','e2e_order_reset']) {
  assert.ok(repeatabilityHardening.includes(marker), 'E2E reset hardening missing: ' + marker);
}
assert.match(app, /path="\/operations"/);
assert.match(nav, /path: '\/operations'/);
console.log('PASS: transactional spine surface + canonical RPC + tenant/RLS contract.');
