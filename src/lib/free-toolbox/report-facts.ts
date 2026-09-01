import type { EvidenceLedger } from './evidence-ledger';
export interface ReportFact{key:string;value:unknown;unit?:string;confidence:number;source:'input'|'derived'|'forecast';evidence?:string[]}
const boundedConfidence = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
export function fact(key:string,value:unknown,confidence=1,source:ReportFact['source']='derived',unit?:string,evidence?:string[]):ReportFact{return{key,value,confidence:boundedConfidence(confidence),source,unit,evidence};}
export function assertReportFacts(facts:ReportFact[]){return facts.filter(f=>boundedConfidence(f.confidence)<.7);}
export function attachEvidence(facts:ReportFact[],ledger:EvidenceLedger){return facts.map(f=>({...f,confidence:boundedConfidence(f.confidence),evidence:ledger.items.filter(e=>e.field===f.key).map(e=>`${e.sourceId}${e.page?`#page-${e.page}`:''}`)}));}
