import type { ReportOutputFormat } from './report-execution-contract';

export interface ReportRow { [key: string]: unknown }
export interface RenderInput { reportId: string; title: string; columns: string[]; rows: ReportRow[]; generatedAt: string; }
export interface RenderedArtifact { format: ReportOutputFormat; mimeType: string; fileName: string; content: string; }

function escapeHtml(value: unknown): string { return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function escapeCsv(value: unknown): string { const text = String(value ?? ''); return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text; }

export function renderWeb(input: RenderInput): RenderedArtifact {
  const head = input.columns.map(c => `<th>${escapeHtml(c)}</th>`).join('');
  const body = input.rows.map(row => `<tr>${input.columns.map(c => `<td>${escapeHtml(row[c])}</td>`).join('')}</tr>`).join('');
  return { format: 'web', mimeType: 'text/html', fileName: `${input.reportId}.html`, content: `<!doctype html><html dir="rtl"><meta charset="utf-8"><title>${escapeHtml(input.title)}</title><body><h1>${escapeHtml(input.title)}</h1><p>${escapeHtml(input.generatedAt)}</p><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>` };
}

export function renderXlsxCompatibleCsv(input: RenderInput): RenderedArtifact {
  const lines = [input.columns.map(escapeCsv).join(','), ...input.rows.map(row => input.columns.map(c => escapeCsv(row[c])).join(','))];
  return { format: 'xlsx', mimeType: 'text/csv; charset=utf-8', fileName: `${input.reportId}.csv`, content: '\ufeff' + lines.join('\n') };
}

export function renderPdfPlaceholder(input: RenderInput): RenderedArtifact {
  const text = [input.title, input.generatedAt, ...input.rows.map(row => input.columns.map(c => `${c}: ${row[c] ?? ''}`).join(' | '))].join('\n');
  return { format: 'pdf', mimeType: 'text/plain; charset=utf-8', fileName: `${input.reportId}.txt`, content: text };
}

export function renderArtifact(format: ReportOutputFormat, input: RenderInput): RenderedArtifact {
  if (format === 'web') return renderWeb(input);
  if (format === 'xlsx') return renderXlsxCompatibleCsv(input);
  return renderPdfPlaceholder(input);
}
