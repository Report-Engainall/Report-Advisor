import fs from 'node:fs';
const source=fs.readFileSync('src/lib/productExperience.ts','utf8');
const required=['EXPERIENCE_COMMANDS','rankExperienceCommands','VIEW_MODES','dashboard','cockpit','import','data-quality','finance','decisions'];
for (const token of required) if (!source.includes(token)) throw new Error(`Missing product experience capability: ${token}`);
const palette=fs.readFileSync('src/components/CommandPalette.tsx','utf8');
for (const token of ['ArrowDown','ArrowUp','Enter','Escape','navigate']) if (!palette.includes(token)) throw new Error(`Missing command palette behavior: ${token}`);
console.log('Product experience contract: PASS');
