import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { createServer } from 'vite';
if (!('DOMMatrix' in globalThis)) globalThis.DOMMatrix = class DOMMatrix {};
if (!('toHex' in Uint8Array.prototype)) Object.defineProperty(Uint8Array.prototype, 'toHex', { configurable: true, value() { return Array.from(this, byte => byte.toString(16).padStart(2, '0')).join(''); } });
if (!Promise.try) Promise.try = (fn, ...args) => new Promise((resolve, reject) => { try { resolve(fn(...args)); } catch (error) { reject(error); } });

const repoRoot = process.cwd();
const corpusRoot = path.join(repoRoot, 'tests', 'fixtures', 'realistic-reports');
const outputPath = process.env.REPORT_CORPUS_QUALITY_OUTPUT || 'artifacts/real-report-corpus-quality.json';
const EXTENSIONS = /\.(pdf|xlsx|xls|xlsm|csv|tsv|ods|docx|doc|json|jsonl|xml|txt|md)$/i;

function bandForQuality(quality) {
  if (quality == null) return 'BLOCKED';
  if (quality >= 75) return 'TRUSTED';
  if (quality >= 50) return 'REVIEW';
  return 'REJECT';
}
function classifyRuntimeBlock(error) {
  const message = String(error?.message ?? error);
  if (/SERVER_AUTHORITY_UNAVAILABLE|OCR_|PARSER_UNAVAILABLE|Unsupported parser/i.test(message)) return 'RUNTIME_BLOCKED';
  return 'FAILED';
}

async function main() {
  const entries = (await fs.readdir(corpusRoot, { withFileTypes: true }))
    .filter(entry => entry.isFile() && entry.name !== 'README.md' && EXTENSIONS.test(entry.name))
    .map(entry => entry.name)
    .sort();
  if (!entries.length) throw new Error('REAL_REPORT_CORPUS_EMPTY');

  const vite = await createServer({ root: repoRoot, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { parseFile } = await vite.ssrLoadModule('/src/lib/file-engine/adapters.ts');
    const { detectImportedSpecialty } = await vite.ssrLoadModule('/src/lib/file-engine/schema-hardening.ts');
    const reports = [];
    for (const fileName of entries) {
      const absolutePath = path.join(corpusRoot, fileName);
      const bytes = await fs.readFile(absolutePath);
      const sourceHash = crypto.createHash('sha256').update(bytes).digest('hex');
      const format = path.extname(fileName).slice(1).toLowerCase();
      try {
        const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
        const datasets = await parseFile(buffer, fileName, format);
        const dataset = datasets[0] ?? null;
        const specialty = dataset ? detectImportedSpecialty(dataset) : null;
        const quality = dataset?.qualityScore ?? 0;
        reports.push({
          fileName, sourceHash, format, bytes: bytes.length, datasets: datasets.length,
          rows: dataset?.rowCount ?? 0, quality, qualityBand: bandForQuality(quality),
          specialty: specialty?.specialty ?? 'other', specialtyConfidence: specialty?.confidence ?? null,
          entityType: specialty?.canonicalEntityType ?? 'generic:source-data',
          mappedFields: dataset?.columns?.filter(column => column.mappedField).map(column => column.mappedField).filter(Boolean) ?? [],
          error: null,
        });
      } catch (error) {
        reports.push({
          fileName, sourceHash, format, bytes: bytes.length, datasets: 0, rows: 0, quality: null,
          qualityBand: classifyRuntimeBlock(error), specialty: 'unknown', specialtyConfidence: null,
          entityType: 'generic:source-data', mappedFields: [], error: String(error?.message ?? error),
        });
      }
    }
    const summary = {
      total: reports.length,
      trusted: reports.filter(report => report.qualityBand === 'TRUSTED').length,
      review: reports.filter(report => report.qualityBand === 'REVIEW').length,
      reject: reports.filter(report => report.qualityBand === 'REJECT').length,
      runtimeBlocked: reports.filter(report => report.qualityBand === 'RUNTIME_BLOCKED').length,
      failed: reports.filter(report => report.qualityBand === 'FAILED').length,
      specialties: Object.fromEntries(
        [...new Set(reports.map(report => report.specialty))].sort().map(specialty => [
          specialty, reports.filter(report => report.specialty === specialty).length,
        ]),
      ),
    };
    const payload = {
      generatedAt: new Date().toISOString(),
      corpusRoot: 'tests/fixtures/realistic-reports',
      deterministicOrder: 'normalized filename ascending',
      reports, summary,
      rule: 'Parser/readiness only; never substitutes for authenticated canonical import, authoritative commit, nine-stage execution, evidence, or rendered report closure.',
    };
    await fs.mkdir(path.dirname(path.resolve(outputPath)), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(payload, null, 2));
    console.log(JSON.stringify(payload, null, 2));
  } finally {
    await vite.close();
  }
}
await main();
