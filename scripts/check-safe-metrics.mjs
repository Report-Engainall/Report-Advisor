import assert from 'node:assert/strict';
const finiteNonNegative=(value,fallback=0)=>{const n=typeof value==='number'?value:Number(value);return Number.isFinite(n)&&n>=0?n:fallback};
const finitePercent=(value,fallback=0)=>Math.max(0,Math.min(100,finiteNonNegative(value,fallback)));
const safeRatio=(n,d,f=0)=>{const a=finiteNonNegative(n),b=finiteNonNegative(d);return b>0?a/b:f};
assert.equal(finiteNonNegative(-5),0);assert.equal(finiteNonNegative(Number.NaN),0);assert.equal(finitePercent(130),100);assert.equal(finitePercent(-10),0);assert.equal(safeRatio(10,0),0);assert.equal(safeRatio(10,2),5);console.log('safe metrics fixture: PASS');
