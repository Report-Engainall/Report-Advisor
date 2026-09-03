import fs from 'node:fs';
import path from 'node:path';
import * as ts from 'typescript';

function assertCanonicalRuntimeAdapter(source) {
  const file = ts.createSourceFile('phase-kl-supabase-runtime.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  let runtimeClass = null;
  file.forEachChild((node) => {
    if (ts.isClassDeclaration(node) && node.name?.text === 'PhaseKLSupabaseRuntime') runtimeClass = node;
  });
  if (!runtimeClass) throw new Error('Canonical autonomy runtime adapter class missing: PhaseKLSupabaseRuntime');

  const method = runtimeClass.members.find((member) =>
    ts.isMethodDeclaration(member) && member.name && ts.isIdentifier(member.name) && member.name.text === 'autonomyGate',
  );
  if (!method || !ts.isMethodDeclaration(method)) throw new Error('Canonical autonomy runtime adapter method missing: autonomyGate');
  if (method.parameters.length !== 1) throw new Error('Canonical autonomyGate signature mismatch');

  const parameter = method.parameters[0];
  if (!ts.isIdentifier(parameter.name) || parameter.name.text !== 'domainKey') {
    throw new Error('Canonical autonomyGate parameter mismatch: domainKey');
  }
  if (!parameter.type || parameter.type.kind !== ts.SyntaxKind.StringKeyword) {
    throw new Error('Canonical autonomyGate parameter type mismatch: string');
  }

  let canonicalRpcCall = false;
  const visit = (node) => {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'rpc') {
      const receiver = node.expression.expression;
      const receiverIsClient = ts.isPropertyAccessExpression(receiver) && receiver.name.text === 'client'
        && ts.isThis(receiver.expression);
      const [rpcName, rpcArgs] = node.arguments;
      if (receiverIsClient && rpcName && ts.isStringLiteral(rpcName) && rpcName.text === 'autonomy_runtime_gate' && rpcArgs && ts.isObjectLiteralExpression(rpcArgs)) {
        const domainProperty = rpcArgs.properties.some((property) => {
          if (!ts.isPropertyAssignment(property) || !ts.isIdentifier(property.name) || property.name.text !== 'p_domain_key') return false;
          return ts.isIdentifier(property.initializer) && property.initializer.text === 'domainKey';
        });
        canonicalRpcCall = domainProperty;
      }
    }
    ts.forEachChild(node, visit);
  };
  if (method.body) visit(method.body);
  if (!canonicalRpcCall) throw new Error("Canonical autonomyGate must call rpc('autonomy_runtime_gate', { p_domain_key: domainKey })");
}

function extractFunctionBody(sql, functionName) {
  const escaped = functionName.replaceAll('.', '\\.');
  const match = sql.match(new RegExp(`CREATE OR REPLACE FUNCTION ${escaped}\\([\\s\\S]*?\\)\\s+RETURNS[\\s\\S]*?AS \\\\$\\\\$([\\s\\S]*?)\\$\\\\$;`, 'm'));
  if (!match) throw new Error(`Canonical function definition missing: ${functionName}`);
  return match[1];
}

function assertOrdered(body, tokens, message) {
  let offset = 0;
  for (const token of tokens) {
    const index = body.indexOf(token, offset);
    if (index < 0) throw new Error(`${message}: ${token}`);
    offset = index + token.length;
  }
}

export function validateAutonomySafetyChain({ runtime, supabase, cockpit, closure, repair, executeLockdown, cert }) {
  const requiredRuntime = ['trustHealthy', 'evidenceQuality', 'confidence', 'riskBudgetValid', 'criticalDrift', 'rollbackVerified', 'isolationVerified'];
  for (const token of requiredRuntime) if (!runtime.includes(token)) throw new Error(`Autonomy gate missing: ${token}`);

  const allSources = [runtime, supabase, cockpit, closure, repair, executeLockdown, cert].join('\n');
  for (const stale of ['canAutonomouslyExecute', 'can_run_phase_l_autonomy']) {
    if (allSources.includes(stale)) throw new Error(`Stale non-canonical autonomy gate reference: ${stale}`);
  }

  assertCanonicalRuntimeAdapter(supabase);

  const cockpitGate = extractFunctionBody(cockpit, 'public.can_enter_phase_l_autonomy');
  assertOrdered(cockpitGate, [
    'public.can_certify_autonomous_domain(p_domain_key)',
    'public.compute_control_plane_health() >= .9',
    'public.current_company_id()',
  ], 'Canonical autonomy gate relation is not intact');
  if (!cockpitGate.includes("severity IN ('high','critical')") || !cockpitGate.includes("status IN ('open','blocked')")) {
    throw new Error('Canonical autonomy gate critical-drift guard is not intact');
  }

  const runtimeGate = extractFunctionBody(closure, 'public.autonomy_runtime_gate');
  assertOrdered(runtimeGate, [
    'public.can_enter_phase_l_autonomy(p_domain_key)',
    "public.is_continuous_trust_healthy('production')",
    'critical_drift',
  ], 'Autonomy runtime closure relation is not intact');

  for (const token of [
    'CREATE TABLE IF NOT EXISTS public.control_plane_health_snapshots',
    'CREATE TABLE IF NOT EXISTS public.executive_evidence_graph',
    'CREATE TABLE IF NOT EXISTS public.autonomy_certification_evidence',
    'CREATE OR REPLACE FUNCTION public.compute_control_plane_health',
    'CREATE OR REPLACE FUNCTION public.can_enter_phase_l_autonomy',
    'CREATE OR REPLACE FUNCTION public.autonomy_runtime_gate',
  ]) if (!repair.includes(token)) throw new Error(`Autonomy runtime reconciliation missing: ${token}`);

  for (const fn of [
    'public.compute_control_plane_health()',
    'public.can_enter_phase_l_autonomy(text)',
    'public.autonomy_runtime_gate(text)',
  ]) {
    if (!executeLockdown.includes(`REVOKE ALL ON FUNCTION ${fn} FROM PUBLIC`)) throw new Error(`Autonomy execute lockdown missing: ${fn}`);
    if (!executeLockdown.includes(`GRANT EXECUTE ON FUNCTION ${fn} TO authenticated`)) throw new Error(`Autonomy authenticated execute grant missing: ${fn}`);
  }

  for (const token of ['can_release_production_certification', 'rollback_passed', 'security_audit_passed', 'artifact_integrity_passed']) {
    if (!cert.includes(token)) throw new Error(`Production certification safety link missing: ${token}`);
  }
  if (cert.includes('GRANT ALL TO anon')) throw new Error('Unsafe certification grant detected');
}

const root = process.cwd();
validateAutonomySafetyChain({
  runtime: fs.readFileSync(path.join(root, 'src/lib/production-intelligence.ts'), 'utf8'),
  supabase: fs.readFileSync(path.join(root, 'src/lib/phase-kl-supabase-runtime.ts'), 'utf8'),
  cockpit: fs.readFileSync(path.join(root, 'supabase/migrations/20260825140000_phase_l_runtime_cockpit.sql'), 'utf8'),
  closure: fs.readFileSync(path.join(root, 'supabase/migrations/20260825142000_phase_kl_runtime_closure.sql'), 'utf8'),
  repair: fs.readFileSync(path.join(root, 'supabase/migrations/20260903033000_reconcile_phase_l_autonomy_runtime_boundary.sql'), 'utf8'),
  executeLockdown: fs.readFileSync(path.join(root, 'supabase/migrations/20260903034000_lockdown_autonomy_runtime_execute.sql'), 'utf8'),
  cert: fs.readFileSync(path.join(root, 'supabase/migrations/20260825150000_phase_m_certification_bundle.sql'), 'utf8'),
});

console.log('Autonomy safety chain: PASS');
