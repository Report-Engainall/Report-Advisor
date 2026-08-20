import assert from 'node:assert/strict';
const clamp=(days,min=1,max=730)=>!Number.isFinite(days)?180:Math.min(max,Math.max(min,Math.floor(days)));
assert.equal(clamp(0),1);assert.equal(clamp(999),730);assert.equal(clamp(NaN),180);
const points=[{date:'2026-08-01T10:00:00Z',quantity:10,sales:100},{date:'2026-08-01T12:00:00Z',quantity:5,sales:50},{date:'2026-08-02',quantity:20,sales:200}];
const byDay=new Map();for(const p of points){const d=p.date.slice(0,10);const x=byDay.get(d)||{date:d,quantity:0,sales:0};x.quantity+=p.quantity;x.sales+=p.sales;byDay.set(d,x)}
assert.deepEqual([...byDay.values()],[{date:'2026-08-01',quantity:15,sales:150},{date:'2026-08-02',quantity:20,sales:200}]);console.log('demand series utilities: PASS');
