import type {CanonicalDataset} from './canonical-dataset';
import {assessDataset} from './document-quality';
import {rankDecisions, type DecisionSignal} from './decision-priority';
import type {EvidenceLedger} from './evidence-ledger';

export interface PipelineResult {
  quality: ReturnType<typeof assessDataset>;
  decisions: ReturnType<typeof rankDecisions>;
  ready: boolean;
  blockingIssues: string[];
  summary: string;
  evidenceCount: number;
}

export function executeReportPipeline(dataset: CanonicalDataset, signals: DecisionSignal[], ledger: EvidenceLedger): PipelineResult {
  const quality = assessDataset(dataset.rows);
  const blockingIssues = [
    ...dataset.warnings,
    ...quality.issues.filter(issue => issue.severity === 'error').map(issue => issue.message),
  ];
  const decisions = rankDecisions(signals);
  const evidenceCount = ledger.items.length;

  if (evidenceCount === 0 && decisions.length > 0) {
    blockingIssues.push('لا يمكن اعتماد توصيات تقريرية بدون سجل أدلة قابل للتتبع.');
  }

  const ready = blockingIssues.length === 0 && quality.score >= 70;
  if (!ready && quality.score < 70 && !blockingIssues.some(issue => issue.includes('جودة'))) {
    blockingIssues.push(`جودة البيانات ${quality.score}/100 أقل من حد التقرير 70/100.`);
  }

  const summary = ready
    ? `Dataset validated: ${dataset.rows.length} rows, quality ${quality.score}/100, ${decisions.length} prioritized decisions, ${evidenceCount} evidence records.`
    : `Dataset requires review before report generation: ${blockingIssues.join('; ')}`;

  return { quality, decisions, ready, blockingIssues, summary, evidenceCount };
}
