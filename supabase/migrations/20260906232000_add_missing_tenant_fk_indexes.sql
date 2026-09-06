-- Cover composite tenant-scoped foreign keys to keep referential checks and joins bounded by company.
create index if not exists idx_categories_company_parent on public.categories(company_id,parent_id);
create index if not exists idx_inventory_balances_company_warehouse on public.inventory_balances(company_id,warehouse_id);
create index if not exists idx_inventory_movements_company_product on public.inventory_movements(company_id,product_id);
create index if not exists idx_inventory_movements_company_warehouse on public.inventory_movements(company_id,warehouse_id);
create index if not exists idx_payments_company_customer on public.payments(company_id,customer_id);
create index if not exists idx_payments_company_invoice on public.payments(company_id,invoice_id);
create index if not exists idx_payments_company_supplier on public.payments(company_id,supplier_id);
create index if not exists idx_products_company_category on public.products(company_id,category_id);
create index if not exists idx_purchase_invoices_company_supplier on public.purchase_invoices(company_id,supplier_id);
create index if not exists idx_sales_invoices_company_branch on public.sales_invoices(company_id,branch_id);
create index if not exists idx_sales_invoices_company_customer on public.sales_invoices(company_id,customer_id);
