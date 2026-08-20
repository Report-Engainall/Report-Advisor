import assert from 'node:assert/strict';
const members=[{sku:'A',factor:1,dailyUnits:100,stock:500},{sku:'B',factor:2,dailyUnits:50,stock:200}];
const demand=members.reduce((s,m)=>s+m.dailyUnits*m.factor,0);
const stock=members.reduce((s,m)=>s+m.stock*m.factor,0);
assert.equal(demand,200);
assert.equal(stock,900);
assert.equal(stock/demand,4.5);
assert.equal(new Set(members.map(m=>m.sku)).size,members.length);
console.log('group-demand normalization fixture: PASS');
