import {finitePercent,safeDays} from './safe-metrics.ts'
export interface BatchDecisionRow{groupId:string;stock:number;forecastDaily:number;targetDays:number;lostUnits:number;liquidityScore:number;continuityRisk:number;seasonalityScore:number;confidence:number}
export interface BatchDecisionSummary{rows:number;reorder:number;critical:number;averagePriority:number;elapsedMs:number}

function requireDecisionNumber(value: unknown, field: string, groupId: string, options: {min?: number; max?: number} = {}): number {
  const n = value
  if (typeof n !== 'number' || !Number.isFinite(n) || (options.min != null && n < options.min) || (options.max != null && n > options.max)) {
    throw new Error(`INSUFFICIENT_DECISION_DATA:${groupId}:${field}`)
  }
  return n
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value))
}

export function evaluateDecisionBatch(rows:BatchDecisionRow[]):BatchDecisionSummary{
  if(!Array.isArray(rows)) throw new Error('INSUFFICIENT_DECISION_DATA:batch:rows')
  const started=typeof performance!=='undefined'?performance.now():Date.now()
  let reorder=0,critical=0,total=0
  for(const r of rows){
    if(!r || typeof r!=='object') throw new Error('INSUFFICIENT_DECISION_DATA:batch:row')
    const groupId=typeof r.groupId==='string'?r.groupId.trim():''
    if(!groupId) throw new Error('INSUFFICIENT_DECISION_DATA:batch:groupId')
    const stock=requireDecisionNumber(r.stock,'stock',groupId,{min:0})
    const demand=requireDecisionNumber(r.forecastDaily,'forecastDaily',groupId,{min:0})
    const targetDays=requireDecisionNumber(r.targetDays,'targetDays',groupId,{min:Number.EPSILON})
    const lostUnits=requireDecisionNumber(r.lostUnits,'lostUnits',groupId,{min:0})
    const liquidityScore=requireDecisionNumber(r.liquidityScore,'liquidityScore',groupId,{min:0,max:100})
    const continuityRisk=requireDecisionNumber(r.continuityRisk,'continuityRisk',groupId,{min:0,max:100})
    const seasonalityScore=requireDecisionNumber(r.seasonalityScore,'seasonalityScore',groupId,{min:0,max:100})
    requireDecisionNumber(r.confidence,'confidence',groupId,{min:0,max:100})

    const coverage=safeDays(stock,demand)
    const coverageRisk=finitePercent(clampPercent(100-(coverage/targetDays)*100))
    const lostRisk=finitePercent(clampPercent(lostUnits/Math.max(1,demand*7)*100))
    const priority=Math.round(finitePercent(clampPercent(coverageRisk*.3+lostRisk*.2+liquidityScore*.15+continuityRisk*.2+seasonalityScore*.15)))
    total+=priority
    if(priority>=75)reorder++
    if(priority>=85)critical++
  }
  const ended=typeof performance!=='undefined'?performance.now():Date.now()
  return{rows:rows.length,reorder,critical,averagePriority:rows.length?Math.round(total/rows.length):0,elapsedMs:Math.max(0,ended-started)}
}