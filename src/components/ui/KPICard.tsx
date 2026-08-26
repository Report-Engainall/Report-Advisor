import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent, formatCompact } from '@/lib/format';
import type { DataStatus } from '@/lib/types';
interface KPICardProps { label:string; value:number|null; format:'currency'|'number'|'percent'|'compact'; change?:number; changeLabel?:string; icon?:ReactNode; status?:DataStatus; hint?:string; }
export function KPICard({label,value,format,change,changeLabel,icon,status='CALCULATED',hint}:KPICardProps){
 const formatted=value===null?'—':format==='currency'?formatCurrency(value):format==='percent'?`${value.toFixed(1)}%`:format==='compact'?formatCompact(value):formatNumber(value);
 const isPositive=change!==undefined&&change>0,isNegative=change!==undefined&&change<0,isNeutral=change===0;
 const statusColors:Record<string,string>={CONFIRMED:'text-success-600',CALCULATED:'text-primary-600',ESTIMATED:'text-warning-600',FORECAST:'text-accent-600',INSUFFICIENT_DATA:'text-ink-400',UNAVAILABLE:'text-ink-400'};
 void statusColors;
 return <div className="card card-hover p-5 group"><div className="flex items-start justify-between mb-3"><div className="flex items-center gap-2">{icon&&<div className="text-ink-400 group-hover:text-primary-500 transition-colors">{icon}</div>}<span className="text-sm font-medium text-ink-500">{label}</span></div>{status==='INSUFFICIENT_DATA'&&<span className="badge-neutral text-[10px]">بيانات غير كافية</span>}</div><div className="text-2xl font-bold text-ink-900 tabular-nums tracking-tight">{formatted}</div><div className="flex items-center gap-2 mt-2">{change!==undefined&&<span className={`flex items-center gap-1 text-xs font-medium ${isPositive?'text-success-600':isNegative?'text-danger-600':'text-ink-400'}`}>{isPositive&&<TrendingUp size={14}/>} {isNegative&&<TrendingDown size={14}/>} {isNeutral&&<Minus size={14}/>} {formatPercent(change)}</span>}{changeLabel&&<span className="text-xs text-ink-400">{changeLabel}</span>}</div>{hint&&<p className="text-[11px] text-ink-400 mt-2">{hint}</p>}</div>;
}
