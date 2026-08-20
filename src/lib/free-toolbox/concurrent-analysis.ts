export interface AnalysisRevision{tenantId:string;key:string;revision:number}
export interface AnalysisExecution<T>{revision:AnalysisRevision;compute:()=>Promise<T>}
export interface AnalysisOutcome<T>{accepted:boolean;value?:T;reason:'accepted'|'superseded'}
export class ConcurrentAnalysisRegistry<T>{private latest=new Map<string,number>();private inflight=new Map<string,Promise<T>>();private token(r:AnalysisRevision){return `${r.tenantId}:${r.key}`}
 async run(execution:AnalysisExecution<T>):Promise<AnalysisOutcome<T>>{const k=this.token(execution.revision);const current=this.latest.get(k)??0;if(execution.revision.revision<current)return{accepted:false,reason:'superseded'};this.latest.set(k,execution.revision.revision);const existing=this.inflight.get(k);if(existing)return{accepted:true,value:await existing,reason:'accepted'};const task=execution.compute();this.inflight.set(k,task);try{const value=await task;const latest=this.latest.get(k)??0;if(latest!==execution.revision.revision)return{accepted:false,reason:'superseded'};return{accepted:true,value,reason:'accepted'}}finally{this.inflight.delete(k)}}
 invalidate(tenantId:string,key:string,revision:number){const k=`${tenantId}:${key}`;this.latest.set(k,Math.max(revision,this.latest.get(k)??0))}
 clear(){this.latest.clear();this.inflight.clear()}}
