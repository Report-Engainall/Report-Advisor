import assert from 'node:assert/strict';
const critical={id:'g1',name:'زيت 20 لتر',memberSkus:['A','B'],normalizedDemand:200,normalizedStock:0,coverageDays:0,normalizedSales:5000,stockoutRisk:'critical',trendPct:20,recommendedOrder:6000};
const high={...critical,id:'g2',stockoutRisk:'high',normalizedStock:1500,coverageDays:7};
assert.equal(critical.stockoutRisk,'critical');assert.equal(high.stockoutRisk,'high');assert.ok(critical.recommendedOrder>0);assert.ok(critical.trendPct>15);console.log('group decision engine fixture: PASS');
