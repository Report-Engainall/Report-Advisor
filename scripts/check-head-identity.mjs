import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const value = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : ''; };
const branch = value('--branch');
const sha = value('--sha').toLowerCase();
const role = value('--role');
const base = value('--base');
const candidate = value('--candidate').toUpperCase();

const fail = message => { console.error('HEAD IDENTITY FAIL:', message); process.exit(1); };
if (!branch || !sha || !role || !base || !candidate) fail('Branch, SHA, Role, Base, and Certification Candidate are mandatory.');
if (!/^[0-9a-f]{40}$/.test(sha)) fail('SHA must be the full 40-character commit SHA.');
if (!['YES', 'NO'].includes(candidate)) fail('Certification Candidate must be YES or NO.');

const kind = branch === 'main' ? 'MAIN HEAD' : branch.startsWith('ui/') ? 'UI HEAD' : branch.startsWith('integration/certification-') ? 'INTEGRATION HEAD' : '';
if (!kind) fail('Only main, ui/*, and integration/certification-* are governed report heads.');
if (kind === 'INTEGRATION HEAD' && candidate !== 'YES') fail('integration/certification-* must be Certification Candidate: YES.');
if (kind !== 'INTEGRATION HEAD' && candidate !== 'NO') fail('main and ui/* must be Certification Candidate: NO.');

const refs = ['refs/heads/main', 'refs/heads/ui/*', 'refs/heads/integration/certification-*'];
const result = spawnSync('git', ['ls-remote', 'origin', ...refs], { encoding: 'utf8' });
if (result.status !== 0) fail((result.stderr || 'git ls-remote failed').trim());
const remote = new Map(result.stdout.trim().split(/\r?\n/).filter(Boolean).map(line => { const [remoteSha, ref] = line.split(/\s+/); return [ref, remoteSha]; }));
const remoteRef = `refs/heads/${branch}`;
const remoteSha = remote.get(remoteRef);
if (!remoteSha) fail(`Remote ref not found: ${remoteRef}`);
if (remoteSha.toLowerCase() !== sha) fail(`SHA mismatch: report=${sha}, origin=${remoteSha}`);

console.log(`Branch: ${branch}`);
console.log(`SHA: ${sha}`);
console.log(`Role: ${role}`);
console.log(`Base: ${base}`);
console.log(`Certification Candidate: ${candidate}`);
console.log(`HEAD TYPE: ${kind}`);
console.log('Remote refs verified: main, ui/*, integration/certification-*');
console.log('HEAD IDENTITY PASS');
