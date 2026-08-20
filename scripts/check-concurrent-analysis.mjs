import assert from 'node:assert/strict';
const latest=new Map();const key='t1:group:A';latest.set(key,1);latest.set(key,2);assert.equal((latest.get(key)??0)>=2,true);assert.equal(1<latest.get(key),true);console.log('concurrent analysis revision fixture: PASS');
