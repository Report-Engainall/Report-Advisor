-- Domain constraints back the frontend validation so direct Data API mutations cannot bypass it.
alter table public.customers drop constraint if exists customers_name_nonblank;
alter table public.customers add constraint customers_name_nonblank check (btrim(name) <> '');
alter table public.customers drop constraint if exists customers_credit_limit_nonnegative;
alter table public.customers add constraint customers_credit_limit_nonnegative check (credit_limit is null or credit_limit >= 0);
alter table public.customers drop constraint if exists customers_payment_terms_valid;
alter table public.customers add constraint customers_payment_terms_valid check (payment_terms_days is null or payment_terms_days between 0 and 3650);

alter table public.products drop constraint if exists products_sku_nonblank;
alter table public.products add constraint products_sku_nonblank check (btrim(sku) <> '');
alter table public.products drop constraint if exists products_name_nonblank;
alter table public.products add constraint products_name_nonblank check (btrim(name) <> '');
alter table public.products drop constraint if exists products_unit_nonblank;
alter table public.products add constraint products_unit_nonblank check (btrim(unit) <> '');
alter table public.products drop constraint if exists products_cost_nonnegative;
alter table public.products add constraint products_cost_nonnegative check (cost_price is null or cost_price >= 0);
alter table public.products drop constraint if exists products_selling_nonnegative;
alter table public.products add constraint products_selling_nonnegative check (selling_price is null or selling_price >= 0);
alter table public.products drop constraint if exists products_min_stock_nonnegative;
alter table public.products add constraint products_min_stock_nonnegative check (min_stock is null or min_stock >= 0);
alter table public.products drop constraint if exists products_reorder_point_nonnegative;
alter table public.products add constraint products_reorder_point_nonnegative check (reorder_point is null or reorder_point >= 0);