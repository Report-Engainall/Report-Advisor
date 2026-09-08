create unique index if not exists uq_sales_invoices_company_normalized_invoice_number
on public.sales_invoices (company_id, public.normalize_import_key(invoice_number))
where invoice_number is not null and btrim(invoice_number) <> '';
