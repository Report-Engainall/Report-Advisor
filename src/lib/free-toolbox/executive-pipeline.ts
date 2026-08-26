import {runAnalysis,type AnalysisInput} from './analysis-orchestrator';
import {evaluateKPIs,type KPIInput} from './kpi-registry';
import {buildExecutiveSummary} from './executive-summary';
import {buildDashboardModel} from './dashboard-model';
import {createReportSnapshot} from './report-contract';
import {summarizeDecisions} from './decision-metrics';
import {createDecision} from './decision-log';

export type ExecutiveFinancialTruth = {
 revenue:number|null;
 cost:number|null;
 grossProfit:number|null;
 quantity:number|null;
 status:'CALCULATED'|'INSUFFICIENT_DATA'|'UNSUPPORTED';
};
export interface ExecutivePipelineInput extends AnalysisInput{kpis:KPIInput[]}

function preserveFinancialTruth(kpis:KPIInput[]):ExecutiveFinancialTruth{
 const revenue=kpis.find(k=>k.id==='revenue')?.value??null;
 const grossProfit=kpis.find(k=>k.id==='gross_profit')?.value??null;
 const cost=revenue===null||grossProfit===null?null:revenue-grossProfit;
 return {revenue,cost,grossProfit,quantity:null,status:revenue===null||grossProfit===null?'INSUFFICIENT_DATA':'CALCULATED'};
}

export function runExecutivePipeline(input:ExecutivePipelineInput){
 const analysis=runAnalysis(input);const kpis=evaluateKPIs(input.kpis);const summary=buildExecutiveSummary(kpis,analysis.alerts,analysis.actions);const dashboard=buildDashboardModel(summary,kpis,analysis.alerts);const decisions=analysis.actions.slice(0,5).map(a=>createDecision({title:a.title,reason:`Priority ${a.rank}: impact=${a.impact}, urgency=${a.urgency}, confidence=${a.confidence}`,status:'proposed',priority:a.rank,expectedImpact:a.impact,evidenceIds:[],action:a.title}));const snapshot=createReportSnapshot({kpis,alerts:analysis.alerts,decisions,quality:analysis.quality});
 return{analysis,kpis,summary,dashboard,decisions,decisionMetrics:summarizeDecisions(decisions),snapshot,financialTruth:preserveFinancialTruth(input.kpis),valid:snapshot.schemaVersion===1&&!snapshot.quality.blocking};
}
