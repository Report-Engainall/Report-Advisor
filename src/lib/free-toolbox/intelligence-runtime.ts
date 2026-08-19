import {runAnalytics,type OrchestrationInput} from './analytics-orchestrator';
import {planActions,type ActionSignal} from './action-planner';
import {evaluateAlerts,type AlertRule,AlertInput} from './alert-engine';
import {createReport,type ExecutiveReport} from './report-contract';
import {buildRenderModel,type RenderModel} from './report-render-model';
export interface IntelligenceRuntimeInput extends OrchestrationInput{signals?:ActionSignal[];alertRules?:AlertRule[];alertInputs?:AlertInput;alertInputsList?:AlertInput[];title?:string;healthScore?:number}
export interface IntelligenceRuntimeResult{analytics:ReturnType<typeof runAnalytics>;actions:ReturnType<typeof planActions>;alerts:ReturnType<typeof evaluateAlerts>;report:ExecutiveReport;renderModel:RenderModel}
export function runIntelligenceRuntime(input:IntelligenceRuntimeInput):IntelligenceRuntimeResult{const analytics=runAnalytics(input);const actions=planActions(input.signals??[],Math.max(50,analytics.quality-25));const alerts=evaluateAlerts(input.alertRules??[],input.alertInputsList??(input.alertInputs?[input.alertInputs]:[]));const report=createReport(input.title??'التقرير الذكي التنفيذي',input.healthScore??analytics.quality,[],actions.map(a=>({id:`action-${a.title}`,title:a.title,reason:a.reason,priority:a.priority,impact:a.impact,confidence:a.confidence,evidenceIds:a.evidenceIds})),[...analytics.warnings,...alerts.map(a=>a.message)],analytics.quality);return{analytics,actions,alerts,report,renderModel:buildRenderModel(report,actions,alerts)}}
