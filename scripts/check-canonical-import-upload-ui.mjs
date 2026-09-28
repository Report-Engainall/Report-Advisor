import fs from 'node:fs';

const source = fs.readFileSync('src/pages/CanonicalImportPage.tsx', 'utf8');
const required = [
  [/const \[dragActive, setDragActive\]/, 'drag state'],
  [/const handleDrop = useCallback\(\(event: DragEvent<HTMLDivElement>\)/, 'drop handler'],
  [/event\.preventDefault\(\)/, 'drop default prevention'],
  [/event\.dataTransfer\.files\?\.\[0\]/, 'dropped-file extraction'],
  [/onDragEnter=\{/, 'drag-enter handling'],
  [/onDragOver=\{/, 'drag-over handling'],
  [/onDragLeave=\{/, 'drag-leave handling'],
  [/onDrop=\{handleDrop\}/, 'drop binding'],
  [/role="button"/, 'keyboard-accessible dropzone semantics'],
  [/tabIndex=\{0\}/, 'keyboard focusability'],
  [/onKeyDown=\{\(event\) => \{ if \(event\.key === 'Enter' \|\| event\.key === ' '\)/, 'keyboard activation'],
];
for (const [pattern, label] of required) {
  if (!pattern.test(source)) throw new Error('Canonical import upload UI contract missing: ' + label);
}
if (!/dragActive \? 'border-primary-500 bg-primary-50\/40 ring-2 ring-primary-200'/.test(source)) {
  throw new Error('Canonical import dropzone must expose an explicit active-drag visual state');
}
console.log('Canonical import upload UI contract: PASS');
