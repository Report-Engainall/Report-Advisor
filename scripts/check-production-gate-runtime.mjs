import {spawnSync} from 'node:child_process';
import process from 'node:process';
function npmInvocation(scriptArgs) {
  if (process.platform === 'win32') {
    const shell = process.env.ComSpec ?? 'cmd.exe';
    return { command: shell, args: ['/d', '/s', '/c', ['npm', ...scriptArgs].join(' ')], shell: false };
  }
  return { command: 'npm', args: scriptArgs, shell: false };
}
const typecheck = npmInvocation(['run', 'typecheck', '--silent']);
const build = npmInvocation(['run', 'build', '--silent']);
const gates=[
  {label:'production-gate-integrity', command:process.execPath, args:['scripts/check-production-gate-integrity.mjs'], shell:false},
  {label:'typecheck', ...typecheck},
  {label:'build', ...build},
];
for(const gate of gates){
  const r=spawnSync(gate.command,gate.args,{stdio:'inherit',shell:gate.shell});
  if(r.status!==0){
    console.error(`Production gate runtime BLOCKED at: ${gate.label}`);
    process.exit(1);
  }
}
console.log('Production gate runtime PASS: integrity, typecheck and build completed.');
