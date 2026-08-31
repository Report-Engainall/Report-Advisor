import assert from 'node:assert/strict';

function auth(ctx){assert(ctx?.authenticated===true,'AUTH_REQUIRED');assert(ctx.tenant_id,'TENANT_REQUIRED');return true;}
function storage(ctx,op,resource){auth(ctx);assert(resource.tenant_id===ctx.tenant_id,'STORAGE_TENANT_BOUNDARY');assert(['read','write','delete'].includes(op),'STORAGE_OPERATION_INVALID');return true;}
function realtime(ctx,channel){auth(ctx);assert(channel.tenant_id===ctx.tenant_id,'REALTIME_TENANT_BOUNDARY');return true;}
function ai(ctx,request){auth(ctx);assert(request.tenant_id===ctx.tenant_id,'AI_TENANT_BOUNDARY');assert(request.scope==='tenant','AI_SCOPE_REQUIRED');return true;}

const a={authenticated:true,tenant_id:'tenant-a'}, b={authenticated:true,tenant_id:'tenant-b'};
assert(storage(a,'read',{tenant_id:'tenant-a'})); assert(realtime(a,{tenant_id:'tenant-a'})); assert(ai(a,{tenant_id:'tenant-a',scope:'tenant'}));
for(const f of [()=>storage(b,'read',{tenant_id:'tenant-a'}),()=>realtime(b,{tenant_id:'tenant-a'}),()=>ai(b,{tenant_id:'tenant-a',scope:'tenant'}),()=>storage({...a,authenticated:false},'read',{tenant_id:'tenant-a'}),()=>ai(a,{tenant_id:'tenant-a',scope:'global'})]) assert.throws(f);
console.log('runtime storage/realtime/ai boundaries: PASS');