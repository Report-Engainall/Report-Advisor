import {runAnalytics,type OrchestrationInput} from './analytics-orchestrator';
import {planActions,type ActionSignal} from './action-planner';
import {evaluateAlerts,type AlertRule,AlertInput} from './alert-engine';
import {createReport,type ExecutiveReport, type ReportMetric} from './report-contract';
import {buildRenderModel,type RenderModel} from './report-render-model';

export interface IntelligenceRuntimeInput extends OrchestrationInput{signals?:ActionSignal[];alertRules?:AlertRule[];alertInputs?:AlertInput;alertInputsList?:AlertInput[];title?:string;healthScore?:number;period?:string}
export interface IntelligenceRuntimeResult{analytics:ReturnType<typeof runAnalytics>;actions:ReturnType<typeof planActions>;alerts:ReturnType<typeof evaluateAlerts>;report:ExecutiveReport;renderModel:RenderModel}

function buildMetrics(analytics:ReturnType<typeof runAnalytics>):ReportMetric[]{
 const metrics:ReportMetric[]=[
  {key:'inventory.reorderItems',label:'أصناف تحتاج إعادة طلب',value:analytics.reorder.filter(x=>x.reorderNow).length,unit:'صنف'},
  {key:'inventory.coverage',label:'متوسط أيام التغطية',value:analytics.reorder.length?Number((analytics.reorder.reduce((s,x)=>s+x.coverageDays,0)/analytics.reorder.length).toFixed(1)):null,unit:'يوم'},
  {key:'cash.forecastPoints',label:'نقاط توقع السيولة',value:analytics.cash?.forecast?.length??0,unit:'نقطة'},
  {key:'data.quality',label:'جودة البيانات',value:analytics.quality,unit:'%'}
 ];
 if(analytics.cash){metrics.push({key:'cash.minimumBalance',label:'أدنى رصيد متوقع',value:analytics.cash.minimumBalance,unit:'عملة'});}
 if(analytics.scenario){metrics.push({key:'cash.scenarioRisk',label:'مخاطر السيناريو',value:analytics.scenario.riskScore,unit:'%'});}
 return metrics;
}

export function runIntelligenceRuntime(input:IntelligenceRuntimeInput):IntelligenceRuntimeResult{
 const analytics=runAnalytics(input);
 const actions=planActions(input.signals??[],Math.max(50,analytics.quality-25));
 const alerts=evaluateAlerts(input.alertRules??[],input.alertInputsList??(input.alertInputs?[input.alertInputs]:[]));
 const metrics=buildMetrics(analytics);
 const report=createReport(input.title??'التقرير الذكي التنفيذي',input.healthScore??analytics.quality,metrics,actions.map(a=>({id:`action-${a.title}`,title:a.title,reason:a.reason,priority:a.priority,impact:a.impact,confidence:a.confidence,evidenceIds:a.evidenceIds})),[...analytics.warnings,...alerts.map(a=>a.message)],analytics.quality,input.period);
 return{analytics,actions,alerts,report,renderModel:buildRenderModel(report,actions,alerts)}
}
