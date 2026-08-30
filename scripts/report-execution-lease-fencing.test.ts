import assert from 'node:assert/strict';
import { InMemoryReportQueue } from '../src/lib/report-execution/queue.ts';
import type { ReportExecutionRequest } from '../src/lib/report-execution/report-execution-contract.ts';
const request={tenantId:'tenant-a',idempotencyKey:'lease-fencing-regression',sourceSnapshotId:'snapshot-1'} as ReportExecutionRequest;
const queue=new InMemoryReportQueue();queue.enqueue(request,'run-1',3);
const first=queue.claim('worker-a',60_000);assert.ok(first?.leaseToken);const staleToken=first.leaseToken;
assert.throws(()=>queue.heartbeat('run-1','worker-a','stale-token'),/fencing token is stale/);
const realNow=Date.now;try{Date.now=()=> (first.leaseExpiresAt??realNow())+1;assert.throws(()=>queue.heartbeat('run-1','worker-a',staleToken),/lease has expired/);}finally{Date.now=realNow;}
queue.fail('run-1','worker-a',staleToken,'simulated crash');const second=queue.claim('worker-b',60_000);assert.ok(second?.leaseToken);assert.notEqual(second.leaseToken,staleToken);assert.throws(()=>queue.complete('run-1','worker-a',staleToken),/fencing token is stale/);queue.complete('run-1','worker-b',second.leaseToken);assert.equal(queue.get('run-1')?.status,'succeeded');assert.equal(queue.get('run-1')?.leaseToken,undefined);console.log('report-execution lease fencing regression: PASS');
