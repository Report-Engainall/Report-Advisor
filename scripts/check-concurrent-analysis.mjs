import assert from 'node:assert/strict';
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
class Registry{constructor(){this.latest=new Map();this.inflight=new Map()}key(r){return `${r.tenantId}:${r.key}`}async run(e){const k=this.key(e.revision),requested=e.revision.revision,current=this.latest.get(k)??0;if(requested<current)return{accepted:false,reason:'superseded'};const existing=this.inflight.get(k);if(existing?.revision===requested)return{accepted:true,value:await existing.promise,reason:'coalesced'};this.latest.set(k,requested);const promise=e.compute();this.inflight.set(k,{revision:requested,promise});try{const value=await promise;if((this.latest.get(k)??0)!==requested)return{accepted:false,reason:'superseded'};return{accepted:true,value,reason:'accepted'}}finally{if(this.inflight.get(k)?.promise===promise)this.inflight.delete(k)}}invalidate(t,k,r){const key=`${t}:${k}`;this.latest.set(key,Math.max(r,this.latest.get(key)??0))}}
const registry=new Registry();let computes=0;
const first=registry.run({revision:{tenantId:'t1',key:'group:A',revision:1},compute:async()=>{computes++;await delay(25);return 'old'}});
const coalesced=registry.run({revision:{tenantId:'t1',key:'group:A',revision:1},compute:async()=>{computes++;return 'duplicate'}});
await delay(2);registry.invalidate('t1','group:A',2);
const newer=registry.run({revision:{tenantId:'t1',key:'group:A',revision:2},compute:async()=>{computes++;await delay(5);return 'new'}});
const [oldResult,coalescedResult,newResult]=await Promise.all([first,coalesced,newer]);
assert.equal(oldResult.accepted,false);assert.equal(oldResult.reason,'superseded');assert.equal(coalescedResult.accepted,false);assert.equal(coalescedResult.reason,'superseded');assert.equal(newResult.accepted,true);assert.equal(newResult.value,'new');assert.equal(computes,2);
const olderAfter=await registry.run({revision:{tenantId:'t1',key:'group:A',revision:1},compute:async()=>{computes++;return 'too-old'}});assert.equal(olderAfter.accepted,false);assert.equal(olderAfter.reason,'superseded');
console.log('concurrent analysis fixtures: PASS (coalescing, supersession, revision isolation)');
