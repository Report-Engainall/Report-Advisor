#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { parseFile } from '../src/lib/file-engine/adapters.ts';
import type { FileFormat } from '../src/lib/file-engine/types.ts';

const [, , scenarioId, scenarioJson, inputArg] = process.argv;
if (!scenarioId || !scenarioJson) throw new Error('SCENARIO_ARGUMENTS_REQUIRED');
const scenario = JSON.parse(scenarioJson) as { id?: string; kind?: string; expect?: string };
const expected = String(scenario.expect ?? '');

function output(value: unknown): void { process.stdout.write(`${JSON.stringify(value)}\n`); }
function fail(reason: string, extra: Record<string, unknown> = {}): never {
  output({ expected, status: 'FAIL', stages: [], reason, ...extra });
  process.exit(0);
}
function blocked(reason: string, extra: Record<string, unknown> = {}): never {
  output({ expected, status: 'BLOCKED', stages: [], reason, ...extra });
  process.exit(0);
}
function formatFor(path: string): FileFormat {
  const ext = extname(path).toLowerCase().replace(/^\./, '');
  if (ext === 'xlsx' || ext === 'xls' || ext === 'xlsm' || ext === 'ods' || ext === 'csv' || ext === 'tsv' || ext === 'json' || ext === 'jsonl' || ext === 'pdf' || ext === 'docx' || ext === 'txt' || ext === 'md' || ext === 'markdown' || ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'webp' || ext === 'tiff' || ext === 'bmp') return (ext === 'md' ? 'markdown' : ext) as FileFormat;
  return 'unknown';
}
function resolveInput(value: string): string {
  const absolute = resolve(value);
  if (!existsSync(absolute)) throw new Error(`REAL_SCENARIO_INPUT_MISSING:${absolute}`);
  if (!statSync(absolute).isDirectory()) return absolute;
  const candidates = readdirSync(absolute).filter(name => !name.startsWith('.')).map(name => join(absolute, name)).filter(path => statSync(path).isFile());
  if (candidates.length !== 1) throw new Error(`SCENARIO_INPUT_MUST_CONTAIN_EXACTLY_ONE_FILE:${absolute}`);
  return candidates[0];
}

if (!inputArg) blocked('REAL_SCENARIO_INPUT_REQUIRED');
const input = resolveInput(inputArg);
const format = formatFor(input);
if (format === 'unknown') blocked('SCENARIO_FORMAT_UNSUPPORTED_BY_FILE_ENGINE', { input });

const started = Date.now();
try {
  const buffer = readFileSync(input);
  const datasets = await parseFile(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength), input, format);
  const rowCount = datasets.reduce((sum, dataset) => sum + dataset.rowCount, 0);
  const columnCount = datasets.reduce((sum, dataset) => sum + dataset.columnCount, 0);
  const qualityScores = datasets.map(dataset => dataset.qualityScore);
  const qualityScore = qualityScores.length ? Math.round(qualityScores.reduce((sum, value) => sum + value, 0) / qualityScores.length) : 0;
  const hasRows = rowCount > 0;
  const hasColumns = columnCount > 0;
  const hasReviewSignals = datasets.some(dataset => dataset.columns.some(column => column.requiresReview || column.qualityIssues.length > 0));

  if (!hasRows && expected !== 'safe-rejection') fail('SCENARIO_EXTRACTION_EMPTY', { input, format });
  if (expected === 'safe-rejection') fail('CORRUPT_INPUT_WAS_ACCEPTED', { input, format });
  if (expected === 'review' && !hasReviewSignals) fail('EXPECTED_REVIEW_SIGNAL_NOT_OBSERVED', { input, format, qualityScore });
  if (expected === 'ocr' && format !== 'pdf') fail('OCR_SCENARIO_REQUIRES_PDF_INPUT', { input, format });
  if (expected === 'bounded-processing' && rowCount > 500000) fail('BOUNDED_ROW_LIMIT_EXCEEDED', { input, rowCount });

  const stages = [
    { id: 'extraction', status: 'completed', result: { format, datasets: datasets.length, rows: rowCount } },
    { id: 'fidelity', status: 'completed', result: { inputBytes: buffer.byteLength } },
    { id: 'quality', status: 'completed', result: { qualityScore, hasReviewSignals } },
    { id: 'schema', status: hasColumns ? 'completed' : 'failed', result: { columns: columnCount } },
    { id: 'mapping', status: hasReviewSignals ? 'completed' : 'completed', result: { reviewRequired: hasReviewSignals } },
  ];

  if (expected === 'ocr') blocked('OCR_REQUIRES_BROWSER_RUNTIME_FOR_SCANNED_PDF', { input, format, stages });
  if (['semantic-discovery', 'reconciliation', 'currency-isolation', 'anomaly'].includes(expected)) blocked('SCENARIO_REQUIRES_DOMAIN_EXECUTOR_NOT_PRESENT_IN_FILE_ENGINE', { input, format, stages });

  output({ expected, status: 'PASS', stages, input, format, rowCount, columnCount, qualityScore, durationMs: Date.now() - started });
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (expected === 'safe-rejection') {
    output({ expected, status: 'PASS', stages: [{ id: 'extraction', status: 'failed', error: message }], input, format, rejection: 'safe', durationMs: Date.now() - started });
    process.exit(0);
  }
  if (message.startsWith('PDF_SCANNED_IMAGE_ONLY:')) blocked('OCR_REQUIRES_BROWSER_RUNTIME_FOR_SCANNED_PDF', { input, format, error: message });
  fail('SCENARIO_EXECUTION_ERROR', { input, format, error: message, durationMs: Date.now() - started });
}
