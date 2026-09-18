import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/components/BusinessInvestigationDrawer.tsx', 'utf8');

for (const token of [
  'useId',
  'useRef',
  'drawerRef',
  'previousFocusRef',
  'aria-labelledby={titleId}',
  'data-investigation-close="true"',
  "event.key === 'Escape'",
  "event.key !== 'Tab'",
  'previousFocus?.isConnected',
]) {
  assert.ok(source.includes(token), 'missing investigation drawer accessibility token: ' + token);
}

assert.match(source, /focusable = Array.from/);
assert.match(source, /event.shiftKey/);
assert.match(source, /first.focus()/);
assert.match(source, /last.focus()/);

console.log('Business investigation drawer accessibility contract: PASS');
