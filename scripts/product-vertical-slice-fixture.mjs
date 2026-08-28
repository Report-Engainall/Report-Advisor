import { fixtures } from './golden-realistic-fixtures.mjs';

const inventory = fixtures.inventory_ar.rows[0];

/** Explicit product-slice benchmark fixture: source identity/quantity/cost are taken from the existing canonical inventory fixture. */
export const productVerticalSliceFixture = {
  datasetId: 'golden.inventory_ar',
  sourceKind: 'canonical-fixture' as const,
  rows: 1,
  asOf: '2026-08-01',
  sku: String(inventory[0]),
  quantity: Number(String(inventory[4]).replace('٠', '0').replace('١', '1').replace('٢', '2').replace('٣', '3').replace('٤', '4').replace('٥', '5').replace('٦', '6').replace('٧', '7').replace('٨', '8').replace('٩', '9')),
  unitCost: Number(inventory[5]),
  dailyDemand: 4,
  leadTimeDays: 7,
  safetyDays: 2,
  netSales: 15000,
  cogs: 9000,
  purchaseCommitment: 5000,
  actualOutcome: null,
  evidenceId: 'evidence.golden.inventory_ar.1001',
};
