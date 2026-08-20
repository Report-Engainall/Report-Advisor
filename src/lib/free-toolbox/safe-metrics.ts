export function finiteNonNegative(value:unknown,fallback=0):number{const n=typeof value==='number'?value:Number(value);return Number.isFinite(n)&&n>=0?n:fallback}
export function finitePercent(value:unknown,fallback=0):number{return Math.max(0,Math.min(100,finiteNonNegative(value,fallback)))}
export function safeRatio(numerator:unknown,denominator:unknown,fallback=0):number{const n=finiteNonNegative(numerator),d=finiteNonNegative(denominator);return d>0?n/d:fallback}
export function safeDays(stock:unknown,dailyDemand:unknown):number{const d=finiteNonNegative(dailyDemand);return d>0?finiteNonNegative(stock)/d:Number.POSITIVE_INFINITY}
