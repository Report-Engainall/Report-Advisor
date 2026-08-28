export type NotificationState = 'NEW' | 'ACKNOWLEDGED' | 'ACTIONED' | 'RESOLVED' | 'REOPENED';
export type NotificationTrigger =
  | 'state_change' | 'severity_escalation' | 'new_evidence' | 'new_impact' | 'sla_breach' | 'initial';

export interface NotificationContract {
  id: string;
  rootIssueId: string;
  evidenceFingerprint: string;
  state: NotificationState;
  severity: number;
  priority: number;
  whatHappened: string;
  whyItMatters: string;
  evidenceIds: string[];
  recommendedAction: string;
  owner: string;
  dueAt?: string;
}

export interface NotificationEvent {
  rootIssueId: string;
  evidenceFingerprint: string;
  previousState?: NotificationState;
  nextState: NotificationState;
  previousSeverity?: number;
  nextSeverity: number;
  trigger: NotificationTrigger;
}

export function shouldNotify(event: NotificationEvent): boolean {
  if (!event.previousState) return true;
  if (event.previousState !== event.nextState) return true;
  if ((event.previousSeverity ?? event.nextSeverity) < event.nextSeverity) return true;
  return ['new_evidence', 'new_impact', 'sla_breach'].includes(event.trigger);
}

export function dedupeKey(
  rootIssueId: string,
  evidenceFingerprint: string,
  state: NotificationState,
): string {
  return 'issue:' + rootIssueId + '|evidence:' + evidenceFingerprint + '|state:' + state;
}
