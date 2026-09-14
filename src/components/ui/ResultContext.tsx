import { Database, Clock3, ShieldCheck, AlertTriangle } from 'lucide-react';

export interface ResultContextProps {
  source?: string;
  formula?: string;
  period?: string;
  tenant?: string;
  asOf?: string;
  freshness?: string;
  evidence?: string;
  confidence?: string;
}

export function ResultContext({ source, formula, period, tenant, asOf, freshness, evidence, confidence }: ResultContextProps) {
  const complete = Boolean(source && evidence);
  if (!source && !formula && !period && !tenant && !asOf && !freshness && !evidence && !confidence) return null;
  return <div className="space-y-1 border-t border-ink-100 pt-3 text-[10px] text-ink-400" aria-label="سياق النتيجة">
    {period && <div className="flex items-center gap-1.5"><Clock3 size={11}/> الفترة: {period}</div>}
    {tenant && <div>النطاق: {tenant}</div>}
    {asOf && <div className="flex items-center gap-1.5"><Clock3 size={11}/> حتى: {asOf}</div>}
    {freshness && <div>الحداثة: {freshness}</div>}
    {source && <div className="flex items-center gap-1.5"><Database size={11}/> المصدر: {source}</div>}
    {formula && <div>الصيغة: {formula}</div>}
    {evidence && <div className="flex items-center gap-1.5"><ShieldCheck size={11}/> الدليل: {evidence}</div>}
    {confidence && <div>الثقة: {confidence}</div>}
    {!complete && <div className="flex items-center gap-1.5 font-semibold text-warning-600"><AlertTriangle size={11}/> INSUFFICIENT_EVIDENCE</div>}
  </div>;
}
