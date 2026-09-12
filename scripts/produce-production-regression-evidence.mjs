#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const matrixPath = resolve(root, 'scripts/production-scenario-matrix.mjs');
const outputPath = resolve(root, 'release-evidence/production-regression-results.json');
const executor = process.env.PRODUCTION_SCENARIO_EXECUTOR;
const inputDir = process.env.PRODUCTION_SCENARIO_INPUT_DIR ? resolve(process.env.PRODUCTION_SCENARIO_INPUT_DIR) : null;

if (!existsSync(matrixPath)) throw new Error(`SCENARIO_MATRIX_MISSING:${matrixPath}`);
if (!executor) throw new Error('PRODUCTION_SCENARIO_EXECUTOR_REQUIRED');
const executorPath = resolve(root, executor);
if (!existsSync(executorPath)) throw new Error(`PRODUCTION_SCENARIO_EXECUTOR_MISSING:${executorPath}`);
if (inputDir && !existsSync(inputDir)) throw new Error(`PRODUCTION_SCENARIO_INPUT_DIR_MISSING:${inputDir}`);

const matrixModule = await import(pathToFileURL(matrixPath).href);
const scenarios = matrixModule.default ?? matrixModule.PRODUCTION_SCENARIOS ?? matrixModule.scenarios ?? matrixModule.SCENARIO_MATRIX;
if (!Array.isArray(scenarios) || scenarios.length !== 12) {
  throw new Error(`PRODUCTION_SCENARIO_MATRIX_INVALID:${Array.isArray(scenarios) ? scenarios.length : 'not-array'}`);
}

function scenarioId(scenario, index) {
  return String(scenario.id ?? scenario.key ?? scenario.name ?? `scenario-${index + 1}`);
}

const results = {};
for (let index = 0; index < scenarios.length; index += 1) {
  const scenario = scenarios[index];
  const id = scenarioId(scenario, index);
  const expected = String(scenario.expect ?? '');
  const input = inputDir ? resolve(inputDir, id) : null;
  const startedAt = new Date().toISOString();
  const started = Date.now();

  if (inputDir && !existsSync(input)) {
    results[id] = {
      expected,
      stages: [],
      status: 'BLOCKED',
      reason: 'REAL_SCENARIO_INPUT_MISSING',
      input,
      startedAt,
      finishedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
    };
    continue;
  }

  const args = [executorPath, id, JSON.stringify(scenario)];
  if (input) args.push(input);
  const run = spawnSync(process.execPath, args, {
    cwd: root,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 10 * 1024 * 1024,
  });
  const finishedAt = new Date().toISOString();
  const stdout = String(run.stdout ?? '').trim();
  const stderr = String(run.stderr ?? '').trim();

  let observed = null;
  try {
    observed = stdout ? JSON.parse(stdout) : null;
  } catch {
    observed = null;
  }

  if (run.error) {
    results[id] = {
      expected,
      stages: [],
      status: 'FAIL',
      reason: 'SCENARIO_EXECUTION_ERROR',
      error: run.error.message,
      exitCode: run.status,
      startedAt,
      finishedAt,
      durationMs: Date.now() - started,
      stderr: stderr || undefined,
    };
    continue;
  }

  if (!observed || typeof observed !== 'object' || Array.isArray(observed)) {
    results[id] = {
      expected,
      stages: [],
      status: 'FAIL',
      reason: 'SCENARIO_EVIDENCE_INVALID_JSON',
      exitCode: run.status,
      startedAt,
      finishedAt,
      durationMs: Date.now() - started,
      stderr: stderr || undefined,
    };
    continue;
  }

  const observedExpected = observed.expected == null ? '' : String(observed.expected);
  if (observedExpected !== expected) {
    results[id] = {
      expected,
      stages: Array.isArray(observed.stages) ? observed.stages : [],
      status: 'FAIL',
      reason: 'SCENARIO_EXPECTATION_MISMATCH',
      observedExpected,
      exitCode: run.status,
      startedAt,
      finishedAt,
      durationMs: Date.now() - started,
      stderr: stderr || undefined,
    };
    continue;
  }

  const observedStatus = String(observed.status ?? '');
  if (!['PASS', 'FAIL', 'BLOCKED'].includes(observedStatus)) {
    results[id] = {
      expected,
      stages: Array.isArray(observed.stages) ? observed.stages : [],
      status: 'FAIL',
      reason: 'SCENARIO_STATUS_INVALID',
      observedStatus,
      exitCode: run.status,
      startedAt,
      finishedAt,
      durationMs: Date.now() - started,
      stderr: stderr || undefined,
    };
    continue;
  }

  results[id] = {
    ...observed,
    expected,
    status: run.status === 0 && observedStatus === 'PASS' ? 'PASS' : observedStatus === 'BLOCKED' ? 'BLOCKED' : 'FAIL',
    exitCode: run.status,
    startedAt,
    finishedAt,
    durationMs: Date.now() - started,
    stderr: stderr || undefined,
  };
}

const values = Object.values(results);
const output = {
  generatedAt: new Date().toISOString(),
  candidateSha: process.env.GITHUB_SHA ?? process.env.RELEASE_CANDIDATE_SHA ?? null,
  producer: 'scripts/produce-production-regression-evidence.mjs',
  source: 'real-scenario-execution',
  scenarioCount: values.length,
  passed: values.filter((result) => result.status === 'PASS').length,
  failed: values.filter((result) => result.status === 'FAIL').length,
  blocked: values.filter((result) => result.status === 'BLOCKED').length,
  ...results,
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ outputPath, candidateSha: output.candidateSha, passed: output.passed, failed: output.failed, blocked: output.blocked, scenarioCount: output.scenarioCount }));
