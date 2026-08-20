import assert from 'node:assert/strict';
const limit=4;let active=0,maxActive=0;const tasks=Array.from({length:20},()=>new Promise(r=>{active++;maxActive=Math.max(maxActive,active);setTimeout(()=>{active--;r()},1)}));await Promise.all(tasks);assert.equal(maxActive,20);console.log('fixture baseline complete');
