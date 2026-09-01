import { describe, expect, it } from 'vitest';
import { prioritizeSupplierPayments, protectCashReserve } from './financialDecisionEngines';

describe('financial decision reserve boundaries', () => {
  it.each([
    ['openingCash', { openingCash: Number.NaN, committedOutflow: 0, collectibleInflow: 0 }],
    ['committedOutflow', { openingCash: 1000, committedOutflow: Number.POSITIVE_INFINITY, collectibleInflow: 0 }],
    ['collectibleInflow', { openingCash: 1000, committedOutflow: 0, collectibleInflow: Number.NaN }],
    ['minimumReservePct', { openingCash: 1000, minimumReservePct: Number.POSITIVE_INFINITY, committedOutflow: 0, collectibleInflow: 0 }],
  ])('marks %s as invalid and blocks payment decisions', (_field, input) => {
    const reserve = protectCashReserve(input);
    expect(reserve.valid).toBe(false);
    expect(reserve.availableForPayments).toBe(0);
    expect(reserve.blockedAmount).toBeGreaterThan(0);

    const [decision] = prioritizeSupplierPayments(
      [{ id: 'supplier-1', amount: 10, overdueDays: 100 }],
      reserve,
    );
    expect(decision.priority).toBe('HOLD_PAYMENT');
  });

  it.each([
    ['negative openingCash', { openingCash: -1, committedOutflow: 0, collectibleInflow: 0 }],
    ['negative committedOutflow', { openingCash: 1000, committedOutflow: -1, collectibleInflow: 0 }],
    ['negative collectibleInflow', { openingCash: 1000, committedOutflow: 0, collectibleInflow: -1 }],
    ['negative minimumReservePct', { openingCash: 1000, minimumReservePct: -1, committedOutflow: 0, collectibleInflow: 0 }],
    ['over-100 minimumReservePct', { openingCash: 1000, minimumReservePct: 101, committedOutflow: 0, collectibleInflow: 0 }],
  ])('marks %s as invalid and blocks payment decisions', (_field, input) => {
    const reserve = protectCashReserve(input);
    expect(reserve.valid).toBe(false);
    expect(reserve.availableForPayments).toBe(0);
    expect(reserve.blockedAmount).toBeGreaterThan(0);

    const [decision] = prioritizeSupplierPayments(
      [{ id: 'supplier-invalid', amount: 10, overdueDays: 100 }],
      reserve,
    );
    expect(decision.priority).toBe('HOLD_PAYMENT');
  });

  it('retains valid reserve payment behavior', () => {
    const reserve = protectCashReserve({
      openingCash: 1000,
      minimumReservePct: 20,
      committedOutflow: 100,
      collectibleInflow: 0,
    });
    expect(reserve.valid).toBe(true);
    expect(reserve.availableForPayments).toBe(800);

    const [decision] = prioritizeSupplierPayments(
      [{ id: 'supplier-1', amount: 10, overdueDays: 0 }],
      reserve,
    );
    expect(decision.priority).toBe('MONITOR');
  });
});
