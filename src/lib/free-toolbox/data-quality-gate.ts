export interface QualityCheck{key:string;label:string;score:number;blocking:boolean;message:string}
export interface QualityGate{score:number;status:'pass'|'review'|'block';checks:QualityCheck[];warnings:string[]}
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
export function evaluateDataQuality(checks:QualityCheck[]):QualityGate{const normalized=checks.map(c=>({...c,score:clamp(c.score)}));const score=normalized.length?Math.round(normalized.reduce((s,c)=>s+c.score,0)/normalized.length):0;const blocking=normalized.some(c=>c.blocking&&c.score<60);const warnings=normalized.filter(c=>c.score<80).map(c=>c.message);return{score,status:blocking?'block':score<80?'review':'pass',checks:normalized,warnings};}
