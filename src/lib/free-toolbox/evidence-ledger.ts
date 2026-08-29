export interface Evidence { id?: string; sourceId: string; sourceDocumentId?: string; sourceHash?: string; page?: number; location?: string; method: 'native' | 'table' | 'ocr' | 'derived'; field?: string; raw?: string; normalized?: unknown; confidence?: number; note?: string }
export type EvidenceEntry=Evidence;
export interface EvidenceLedger{items:Evidence[]}
export interface DecisionEvidence{decisionId:string;claim:string;refs:Evidence[];confidence:number;status:'verified'|'partial'|'insufficient'}
export function addEvidence(ledger:EvidenceLedger,evidence:Evidence):EvidenceLedger{return{items:[...ledger.items,evidence]}}
export function evidenceFor(ledger:EvidenceLedger,field:string){return ledger.items.filter(x=>x.field===field)}
export function bestEvidence(ledger:EvidenceLedger,field:string){return evidenceFor(ledger,field).sort((a,b)=>(b.confidence??0)-(a.confidence??0))[0]??null}
export function explainDecision(decisionId:string,claim:string,refs:Evidence[]):DecisionEvidence{const usable=refs.filter(r=>Boolean(r.sourceId));const confidence=usable.length?usable.reduce((s,r)=>s+(r.confidence??1),0)/usable.length:0;return{decisionId,claim,refs:usable,confidence,status:confidence>=.8?'verified':confidence>0?'partial':'insufficient'}}
