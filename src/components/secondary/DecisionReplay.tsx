import { useMemo } from 'react';
import type { DecisionReplayModel, ReportSnapshotModel, SnapshotDiffItem } from '@/lib/secondary-evidence-ux';
import { EvidenceWorkspace, StatePanel, TrustDimensions } from '@/components/secondary/EvidenceWorkspace';

export function DecisionReplay({ model }: { model: DecisionReplayModel }) {
  return <section dir="rtl" className="space-y-4"><header><p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Decision Replay</p><h2 className="mt-1 text-xl font-bold text-ink-900">إعادة تشغيل القرار</h2><p className="mt-1 text-sm text-ink-500">عرض قراءة فقط للـSnapshot والأدلة والإصدارات والنتيجة.</p></header><StatePanel state={model.state} />{model.state === 'READY' && <><div className="grid gap-4 lg:grid-cols-3"><Info title="Decision ID" value={model.decisionId}/><Info title="Snapshot" value={model.snapshot}/><Info title="Rules / Model" value={[model.rulesVersion, model.modelVersion].filter(Boolean).join(' / ') || 'UNKNOWN'}/></div><div className="card p-5"><h3 className="font-bold text-ink-900">الثقة متعددة الأبعاد</h3><div className="mt-4"><TrustDimensions values={{Data:model.trust.data,Extraction:model.trust.extraction,Mapping:model.trust.mapping,'Entity Resolution':model.trust.entityResolution,Validation:model.trust.validation,Calculation:model.trust.calculation,Forecast:model.trust.forecast,Decision:model.trust.decision,Overall:model.trust.overall}}/></div>{model.trust.explanation && <p className="mt-4 text-sm text-ink-500">{model.trust.explanation}</p>}</div><div className="grid gap-4 lg:grid-cols-2"><Info title="Recommendation" value={model.recommendation}/><Info title="Approval" value={model.approval}/><Info title="Action" value={model.action}/><Info title="Expected Impact" value={model.expectedImpact}/><Info title="Actual Outcome" value={model.actualOutcome}/></div>{model.evidence.length > 0 && <EvidenceWorkspace trail={{nodes:model.evidence,status:'READY'}}/>}</>}</section>;
}

function Info({title,value}:{title:string;value?:string}) { return <div className="rounded-xl border border-ink-100 bg-white p-4"><div className="text-xs text-ink-400">{title}</div><div className="mt-1 text-sm font-semibold text-ink-800 break-words">{value || 'UNKNOWN'}</div></div>; }

export function DecisionDiff({ items, state = 'READY' }: { items: SnapshotDiffItem[]; state?: 'READY' | 'LOADING' | 'EMPTY' | 'ERROR' | 'UNKNOWN' | 'BLOCKED' }) {
  return <section dir="rtl" className="space-y-4"><header><p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Decision Diff</p><h2 className="mt-1 text-xl font-bold text-ink-900">مقارنة قرارين</h2></header><StatePanel state={state}/>{state === 'READY' && <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-ink-50"><tr><th className="p-3 text-right">العنصر</th><th className="p-3 text-right">قبل</th><th className="p-3 text-right">بعد</th><th className="p-3 text-right">الحالة</th></tr></thead><tbody>{items.map(item=><tr key={item.key} className="border-t border-ink-100"><td className="p-3 font-medium">{item.label}</td><td className="p-3">{item.before ?? 'UNKNOWN'}</td><td className="p-3">{item.after ?? 'UNKNOWN'}</td><td className="p-3">{item.status === 'changed' ? 'CHANGED' : item.status === 'unchanged' ? 'UNCHANGED' : 'UNKNOWN'}</td></tr>)}</tbody></table></div></div>}</section>;
}

export function ReportSnapshotDiff({ before, after }: { before: ReportSnapshotModel; after: ReportSnapshotModel }) {
  const items = useMemo(() => [
    ['Report ID','Report ID',before.reportId,after.reportId],
    ['Snapshot ID','Snapshot ID',before.snapshotId,after.snapshotId],
    ['Data As Of','Data As Of',before.dataAsOf,after.dataAsOf],
    ['Metric Version','Metric Version',before.metricVersion,after.metricVersion],
    ['Rules Version','Rules Version',before.rulesVersion,after.rulesVersion],
    ['Mapping Version','Mapping Version',before.mappingVersion,after.mappingVersion],
    ['Generated Time','Generated Time',before.generatedAt,after.generatedAt],
  ].map(([key,label,b,a])=>({key:String(key),label:String(label),before:b as string|undefined,after:a as string|undefined,status:b===undefined||a===undefined?'unknown':b===a?'unchanged':'changed'} as SnapshotDiffItem)), [before,after]);
  return <DecisionDiff items={items} />;
}
