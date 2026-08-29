-- Financial truth guardrails: reject impossible negative quantity/monetary values at the database boundary.
-- Returns/refunds must be represented by an explicit business transaction/state, not by corrupting base invoice/item amounts.

alter table public.sales_invoices
  add constraint sales_invoices_subtotal_nonnegative check (subtotal >= 0),
  add constraint sales_invoices_discount_nonnegative check (discount_amount >= 0),
  add constraint sales_invoices_tax_nonnegative check (tax_amount >= 0),
  add constraint sales_invoices_total_nonnegative check (total >= 0),
  add constraint sales_invoices_paid_nonnegative check (paid_amount >= 0);

alter table public.sale_items
  add constraint sale_items_quantity_nonnegative check (quantity >= 0),
  add constraint sale_items_unit_price_nonnegative check (unit_price >= 0),
  add constraint sale_items_discount_nonnegative check (discount_amount >= 0),
  add constraint sale_items_tax_nonnegative check (tax_amount >= 0),
  add constraint sale_items_line_total_nonnegative check (line_total >= 0),
  add constraint sale_items_cost_price_nonnegative check (cost_price >= 0);

alter table public.purchase_invoices
  add constraint purchase_invoices_subtotal_nonnegative check (subtotal >= 0),
  add constraint purchase_invoices_discount_nonnegative check (discount_amount >= 0),
  add constraint purchase_invoices_tax_nonnegative check (tax_amount >= 0),
  add constraint purchase_invoices_total_nonnegative check (total >= 0),
  add constraint purchase_invoices_paid_nonnegative check (paid_amount >= 0);

alter table public.purchase_items
  add constraint purchase_items_quantity_nonnegative check (quantity >= 0),
  add constraint purchase_items_unit_price_nonnegative check (unit_price >= 0),
  add constraint purchase_items_discount_nonnegative check (discount_amount >= 0),
  add constraint purchase_items_tax_nonnegative check (tax_amount >= 0),
  add constraint purchase_items_line_total_nonnegative check (line_total >= 0);

alter table public.inventory_balances
  add constraint inventory_balances_quantity_nonnegative check (quantity >= 0),
  add constraint inventory_balances_unit_cost_nonnegative check (unit_cost >= 0);

alter table public.inventory_movements
  add constraint inventory_movements_quantity_nonnegative check (quantity >= 0),
  add constraint inventory_movements_unit_cost_nonnegative check (unit_cost >= 0);

alter table public.payments
  add constraint payments_amount_nonnegative check (amount >= 0);
