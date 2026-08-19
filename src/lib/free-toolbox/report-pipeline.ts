import type {CanonicalDataset} from './canonical-dataset';
import {assessDataset} from './document-quality';
import {rankDecisions, type DecisionSignal} from './decision-priority';
import type {EvidenceLedger} from './evidence-ledger';
export interface PipelineResult{quality:ReturnType<typeof assessDataset>;decisions:ReturnType<typeof rankDecisions>;ready:boolean;blockingIssues:string[];summary:string;}
export function executeReportPipeline(dataset:CanonicalDataset,signals:DecisionSignal[],ledger:EvidenceLedger):PipelineResult{const quality=assessDataset(dataset.rows);const blockingIssues=[...dataset.warnings,...quality.issues.filter(i=>i.severity==='error').map(i=>i.message)];const decisions=rankDecisions(signals);const ready=blockingIssues.length===0;const summary=ready?`Dataset validated: ${dataset.rows.length} rows, quality ${quality.score}/100, ${decisions.length} prioritized decisions, ${ledger.items.length} evidence records.`:`Dataset requires review before report generation: ${blockingIssues.join('; ')}`;return{quality,decisions,ready,blockingIssues,summary};}
