#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.join(process.cwd(), 'src/pages/EntityPages.tsx'), 'utf8');
const checks = [
  [source.includes('role="dialog" aria-modal="true" aria-labelledby={titleId}'), 'Entity context dialog must expose a labelled modal relationship.'],
  [source.includes('const drawerId = `entity-context-'), 'Entity context dialog must use a unique id.'],
  [source.includes('previousFocusRef'), 'Entity context dialog must preserve the opener focus.'],
  [source.includes("event.key === 'Escape'"), 'Entity context dialog must close on Escape.'],
  [source.includes("event.key !== 'Tab'"), 'Entity context dialog must trap Tab navigation.'],
  [source.includes('focusable[focusable.length - 1]'), 'Entity context dialog must keep focus within its boundary.'],
  [source.includes('data-entity-close="true"'), 'Entity context dialog must expose a focused initial close action.'],
  [source.includes('previousFocus?.isConnected'), 'Entity context dialog must safely restore focus when closing.'],
];

const failed = checks.filter(([ok]) => !ok);
if (failed.length) {
  for (const [, message] of failed) console.error('FAIL:', message);
  process.exit(1);
}
console.log('PASS: entity context accessibility contract');
