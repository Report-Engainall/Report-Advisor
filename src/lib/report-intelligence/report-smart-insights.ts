  }) ?? null;
}

function dataKey(column: Record<string, unknown> | null | undefined): string {
  const mapped = text(column?.mappedField);
  return mapped || text(column?.name);
}

function makePriority(severity: ReportSignalSeverity): ReportRecommendation['priority'] {
  if (severity === 'critical') return 'urgent';
  if (severity === 'high') return 'high';
  if (severity === 'medium') return 'medium';
  return 'low';
}

function addSignal(
  signals: ReportSignal[],
  id: string,
  severity: ReportSignalSeverity,
  title: string,
  message: string,
  evidence: string[],
  affectedRows?: number,
  drivers?: ReportSignalDriver[],
): void {
  if (signals.some((item) => item.id === id)) return;
  signals.push({
    id,
    severity,
    title,
    message,
    evidence,
    ...(affectedRows == null ? {} : { affectedRows }),
    ...(drivers?.length ? { drivers } : {}),
    soWhat: '',
    impact: '',
    ownerHint: '',
    priority: 'P3',
    priorityReason: [],
  });
}

function deriveSignals(report: ReportInput): ReportSignal[] {
  const signals: ReportSignal[] = [];
  const columns = columnsOf(report);
  const rows = report.canonicalRows ?? [];
  const renderedMetrics = report.renderedOutput?.sourceMetrics;
  const sourceMetrics = renderedMetrics && typeof renderedMetrics === 'object' ? renderedMetrics as Record<string, unknown> : {};
  const inventory = sourceMetrics.inventory && typeof sourceMetrics.inventory === 'object' ? sourceMetrics.inventory as Record<string, unknown> : {};
  const total = numeric(report.rowCount);

  for (const column of columns) {
    const nullCount = numeric(column.nullCount);
    if (nullCount != null && total != null && total > 0 && nullCount / total >= 0.2) {
      addSignal(
        signals,
        'missing:' + text(column.name ?? column.mappedField ?? 'field'),
        'medium',
        'نقص متكرر في حقل ' + text(column.name ?? column.mappedField ?? 'غير مسمى'),
        'الحقل يحتوي على ' + Math.round((nullCount / total) * 100) + '% من القيم غير المكتملة.',
        ['nullCount=' + nullCount, 'rowCount=' + total],
        nullCount,
      );