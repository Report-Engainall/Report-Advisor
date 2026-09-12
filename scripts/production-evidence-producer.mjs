import fs from 'node:fs';
import path from 'node:path';
import { scenarios } from './production-scenario-matrix.mjs';
import { baseline, compareScenarioResult } from './production-regression-baseline.mjs';

function fail(message) { throw new Error(`Production evidence producer: ${message}`); }

export function produceProductionEvidence(runtimeCapture, exactHead) {
  if (!exactHead || !/^[0-9a-f]{40}$/i.test(exactHead)) fail('exact HEAD is required');
  if (!runtimeCapture || typeof runtimeCapture !== 'object' || Array.isArray(runtimeCapture)) fail('runtime capture must be an object');
  if (runtimeCapture.exactHead !== exactHead) fail(`runtime capture HEAD mismatch: expected ${exactHead}, got ${runtimeCapture.exactHead ?? 'missing'}`);
  const runtimeScenarios = runtimeCapture.scenarios;
  if (!runtimeScenarios || typeof runtimeScenarios !== 'object' || Array.isArray(runtimeScenarios)) fail('runtime capture scenarios are required');
  const expectedIds = scenarios.map((scenario) => scenario.id);
  const actualIds = Object.keys(runtimeScenarios).sort();
  if (actualIds.length !== expectedIds.length || actualIds.join('|') !== [...expectedIds].sort().join('|')) fail('runtime capture must contain exactly the locked 12 scenario ids');

  const results = {};
  for (const id of expectedIds) {
    const result = runtimeScenarios[id];
    if (!result || typeof result !== 'object' || Array.isArray(result)) fail(`missing runtime result for ${id}`);
    const comparison = compareScenarioResult(id, result);
    if (!comparison.ok) fail(`scenario ${id} does not match the locked runtime evidence contract`);
    results[id] = result;
  }

  return {
    metadata: {
      schema_version: 1,
      exactHead,
      source: 'runtime-capture',
      scenarioCount: expectedIds.length,
      generatedAt: new Date().toISOString(),
    },
    ...results,
  };
}

if (process.argv[1]?.endsWith('production-evidence-producer.mjs')) {
  const inputPath = process.argv[2] ?? path.join(process.cwd(), 'release-evidence', 'runtime-capture.json');
  const outputPath = process.argv[3] ?? path.join(process.cwd(), 'release-evidence', 'production-regression-results.json');
  const exactHead = process.argv[4] ?? process.env.GITHUB_SHA;
  if (!fs.existsSync(inputPath)) fail(`real runtime capture is required: ${inputPath}`);
  const runtimeCapture = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const evidence = produceProductionEvidence(runtimeCapture, exactHead);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(evidence, null, 2) + '\n');
  console.log(JSON.stringify({ source: inputPath, output: outputPath, exactHead, scenarioCount: scenarios.length }));
}
