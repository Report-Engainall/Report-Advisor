import assert from 'node:assert/strict';
const members=[{sku:'A',factor:1,dailyDemand:100,stock:500,netSales:1000},{sku:'B',factor:2,dailyDemand:50,stock:200,netSales:600}];
const demand=members.reduce((s,m)=>s+m.dailyDemand*m.factor,0);const stock=members.reduce((s,m)=>s+m.stock*m.factor,0);const sales=members.reduce((s,m)=>s+m.netSales,0);const coverage=stock/demand;
assert.equal(demand,200);assert.equal(stock,900);assert.equal(sales,1600);assert.equal(coverage,4.5);
const duplicate=[...members,{...members[0]}];assert.equal(new Set(duplicate.map(m=>m.sku)).size,2);
assert.equal(Math.ceil(Math.max(0,demand*30-stock)),5100);
console.log('alternative-group engine fixture: PASS');
