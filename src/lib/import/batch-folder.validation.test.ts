import { describe, expect, it } from 'vitest';
import { missingRequiredFields } from './batch-validation';

describe('batch import required-field contract', () => {
  it('requires a customer id or customer name for sales invoices', () => {
    const missing = missingRequiredFields('sales_invoices', {
      invoice_number: 'INV-1',
      invoice_date: '2026-09-09',
      subtotal: 10,
      tax_amount: 1,
      total: 11,
      paid_amount: 0,
      status: 'unpaid',
    });

    expect(missing).toContain('customer_id_or_customer_name');
  });

  it('accepts a sales invoice when customer name is supplied', () => {
    const missing = missingRequiredFields('sales_invoices', {
      invoice_number: 'INV-1',
      invoice_date: '2026-09-09',
      customer_name: 'Customer 1',
      subtotal: 10,
      tax_amount: 1,
      total: 11,
      paid_amount: 0,
      status: 'unpaid',
    });

    expect(missing).not.toContain('customer_id_or_customer_name');
  });
});
