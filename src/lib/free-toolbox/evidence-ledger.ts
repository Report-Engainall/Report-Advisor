export interface Evidence{sourceId:string;page?:number;method:'native'|'table'|'ocr'|'derived';field?:string;raw?:string;normalized?:unknown;confidence?:number;note?:string}
export interface EvidenceLedger{items:Evidence[]}
export function addEvidence(ledger:EvidenceLedger,evidence:Evidence):EvidenceLedger{return{items:[...ledger.items,evidence]};}
export function evidenceFor(ledger:EvidenceLedger,field:string){return ledger.items.filter(x=>x.field===field);}
export function bestEvidence(ledger:EvidenceLedger,field:string){return evidenceFor(ledger,field).sort((a,b)=>(b.confidence??0)-(a.confidence??0))[0]??null;}
