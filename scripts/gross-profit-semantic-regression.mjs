import { calculateGrossProfitTruth } from '../src/lib/grossProfitTruthCore.ts';

const rows = [
  { invoice_id:'INV-1', company_id:'A', invoice_date:'2026-01-01', status:'confirmed', total:90, quantity:2, cost_price:20 },
  { invoice_id:'INV-1', company_id:'A', invoice_date:'2026-01-01', status:'confirmed', total:90, quantity:1, cost_price:10 },
  { invoice_id:'INV-2', company_id:'A', invoice_date:'2026-01-31', status:'confirmed', total:150, quantity:3, cost_price:30 },
  { invoice_id:'INV-DRAFT', company_id:'A', invoice_date:'2026-02-01', status:'draft', total:999, quantity:9, cost_price:1 },
  { invoice_id:'INV-NULL', company_id:'A', invoice_date:'2026-02-02', status:'confirmed', total:80, quantity:2, cost_price:null },
];
const full=calculateGrossProfitTruth(rows);if(full.revenue!==320)throw new Error(`revenue mismatch: ${full.revenue}`);if(full.cost!==null||full.grossProfit!==null)throw new Error('NULL cost must propagate to gross profit');
const bounded=calculateGrossProfitTruth(rows,{startDate:'2026-01-01',endDate:'2026-01-31'});if(bounded.revenue!==240)throw new Error(`inclusive boundary mismatch: ${bounded.revenue}`);
const startOnly=calculateGrossProfitTruth(rows,{startDate:'2026-01-31'});if(startOnly.revenue!==230)throw new Error(`start boundary mismatch: ${startOnly.revenue}`);
const endOnly=calculateGrossProfitTruth(rows,{endDate:'2026-01-01'});if(endOnly.revenue!==90)throw new Error(`end boundary mismatch: ${endOnly.revenue}`);
const complete=calculateGrossProfitTruth(rows.slice(0,3));if(complete.revenue!==240||complete.cost!==100||complete.grossProfit!==140)throw new Error(`complete truth mismatch: ${JSON.stringify(complete)}`);
const nullRevenue=calculateGrossProfitTruth([{invoice_id:'NULL',company_id:'A',invoice_date:'2026-01-01',status:'confirmed',total:null,quantity:1,cost_price:10}]);if(nullRevenue.revenue!==null||nullRevenue.grossProfit!==null)throw new Error('NULL revenue must never become zero');
console.log('GROSS PROFIT SEMANTIC REGRESSION: PASS');
