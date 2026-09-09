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

  it('rejects a customer without a canonical code before canonical write', () => {
    const missing = missingRequiredFields('customers', {
      name: 'Customer Without Code',
      segment: 'regular',
      credit_limit: 0,
      payment_terms_days: 30,
    });

    expect(missing).toContain('code');
  });

  it('accepts a customer when a canonical code is supplied', () => {
    const missing = missingRequiredFields('customers', {
      name: 'Customer 1',
      code: 'C-001',
      segment: 'regular',
      credit_limit: 0,
      payment_terms_days: 30,
    });

    expect(missing).not.toContain('code');
  });
});
