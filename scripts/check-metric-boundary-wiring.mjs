import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const workflow = readFileSync('.github/workflows/metric-boundary-contract.yml', 'utf8');
const expectedRunner = 'scripts/check-metric-boundary-contract.mjs';
const expectedTest = 'src/lib/metricEngine.boundary.test.ts';

const command = packageJson.scripts?.['test:metric-boundary'];
if (command !== `node ${expectedRunner}`) {
  throw new Error(`METRIC_WIRING_PACKAGE_INVALID: ${String(command)}`);
}
if (!workflow.includes('npm run test:metric-boundary')) {
  throw new Error('METRIC_WIRING_WORKFLOW_MUST_USE_PACKAGE_COMMAND');
}
if (!workflow.includes(expectedRunner)) {
  throw new Error('METRIC_WIRING_WORKFLOW_MISSING_RUNNER_PATH');
}
if (!workflow.includes(expectedTest)) {
  throw new Error('METRIC_WIRING_WORKFLOW_MISSING_TEST_PATH');
}
if (!workflow.includes("persist-credentials: false")) {
  throw new Error('METRIC_WIRING_WORKFLOW_CREDENTIAL_PERSISTENCE_NOT_DISABLED');
}
if (!workflow.includes('timeout-minutes: 5')) {
  throw new Error('METRIC_WIRING_WORKFLOW_TIMEOUT_MISSING');
}

console.log('METRIC_BOUNDARY_WIRING=PASS');
console.log(`PACKAGE_COMMAND=${command}`);
console.log(`RUNNER=${expectedRunner}`);
console.log(`TEST=${expectedTest}`);
