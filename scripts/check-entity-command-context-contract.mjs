import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const page=fs.readFileSync(path.join(root,'src/pages/EntityPages.tsx'),'utf8');
const component=fs.readFileSync(path.join(root,'src/components/EntityCommandContext.tsx'),'utf8');
for(const token of ['fetchDashboardSnapshot','EntityCommandContext','commandEntity','commandRank'])if(!page.includes(token))throw new Error('ENTITY_COMMAND_WIRING_MISSING:'+token);
for(const token of ['ENTITY COMMAND CONTEXT','\u0627\u0644\u0642\u064a\u0645\u0629 \u0641\u064a \u0627\u0644\u0641\u062a\u0631\u0629','\u062d\u0635\u0629 \u0645\u0646 \u0645\u0628\u064a\u0639\u0627\u062a \u0627\u0644\u0641\u062a\u0631\u0629','\u0627\u0644\u062a\u0631\u062a\u064a\u0628 \u0627\u0644\u0645\u0631\u0626\u064a','\u0644\u0627 \u064a\u062a\u0645 \u0627\u0639\u062a\u0628\u0627\u0631\u0647 \u0635\u0641\u0631\u064b\u0627','\u0627\u0644\u0645\u0635\u062f\u0631:'])if(!component.includes(token))throw new Error('ENTITY_COMMAND_UI_MISSING');
console.log('ENTITY_COMMAND_CONTEXT_CONTRACT: PASS');
