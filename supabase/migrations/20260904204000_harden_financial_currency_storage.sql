-- Financial source-of-truth contract: invoice currencies cannot be missing or malformed.
alter table public.sales_invoices alter column currency set default 'SAR';
alter table public.sales_invoices alter column currency set not null;
alter table public.sales_invoices drop constraint if exists sales_invoices_currency_format;
alter table public.sales_invoices add constraint sales_invoices_currency_format check (currency = upper(btrim(currency)) and length(btrim(currency)) = 3);

alter table public.purchase_invoices alter column currency set default 'SAR';
alter table public.purchase_invoices alter column currency set not null;
alter table public.purchase_invoices drop constraint if exists purchase_invoices_currency_format;
alter table public.purchase_invoices add constraint purchase_invoices_currency_format check (currency = upper(btrim(currency)) and length(btrim(currency)) = 3);