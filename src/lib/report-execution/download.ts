import { renderArtifact, type ReportRow } from './renderers';
import type { ReportOutputFormat } from './report-execution-contract';

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function downloadReportArtifact(
  reportId: string,
  title: string,
  columns: string[],
  rows: ReportRow[],
  format: ReportOutputFormat = 'xlsx',
): void {
  const artifact = renderArtifact(format, {
    reportId,
    title,
    columns,
    rows,
    generatedAt: new Date().toISOString(),
  });
  const blob = new Blob([base64ToBytes(artifact.contentBase64)], { type: artifact.mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = artifact.fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
