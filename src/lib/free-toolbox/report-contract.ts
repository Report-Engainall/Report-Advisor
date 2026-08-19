export type Severity='info'|'warning'|'critical';
export interface ReportMetric{key:string;label:string;value:number|string|null;unit?:string;trend?:number;severity?:Severity;evidenceIds?:string[]}
export interface ReportAction{id:string;title:string;reason:string;priority:number;impact:number;confidence:number;owner?:string;dueDate?:string;evidenceIds?:string[]}
export interface ExecutiveReport{title:string;generatedAt:string;period?:string;healthScore:number;metrics:ReportMetric[];actions:ReportAction[];warnings:string[];dataQuality:number}
export function createReport(title:string,healthScore:number,metrics:ReportMetric[],actions:ReportAction[],warnings:string[],dataQuality:number,period?:string):ExecutiveReport{return{title,generatedAt:new Date().toISOString(),period,healthScore,metrics,actions,warnings,dataQuality};}
