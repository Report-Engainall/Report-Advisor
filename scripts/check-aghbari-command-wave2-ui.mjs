#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const recommendations = read('src/pages/IntelligencePage.tsx');
const scenario = read('src/pages/CanonicalScenarioPage.tsx');
const files = read('src/pages/ExternalFileAnalysisPage.tsx');
const companySettings = read('src/pages/CompanySettingsPage.tsx');
const profile = read('src/pages/ProfileSettingsPage.tsx');
const savedViews = read('src/components/ui/SavedViewMenu.tsx');
const header = read('src/components/Header.tsx');
const app = read('src/App.tsx');
const commandPalette = read('src/components/CommandPalette.tsx');
const sidebar = read('src/components/Sidebar.tsx');

const checks = [
  [recommendations.includes('إشارات مصدرية تنتظر قرارًا بشريًا'), 'Recommendations must state human decision ownership.'],
  [recommendations.includes('مصدر → دليل → قرار'), 'Recommendations must expose evidence flow.'],
  [recommendations.includes("aria-pressed={filter === 'all'}"), 'Recommendation filters need semantic pressed state.'],
  [scenario.includes('محاكاة مرجعية حتمية'), 'Scenario must be explicit deterministic simulation.'],
  [scenario.includes('ليست Forecast ولا إثباتًا لنتيجة تشغيلية'), 'Scenario must not present simulation as forecast/truth.'],
  [files.includes('focus-visible:ring-2 focus-visible:ring-primary-500'), 'File drop zone must be keyboard accessible.'],
  [files.includes('05 · جاهزية التحليل'), 'File analysis must expose staged progression.'],
  [files.includes('بصمة SHA-256'), 'File analysis must preserve source fingerprint visibility.'],
  [companySettings.includes("aria-pressed={workspaceMode === 'essential'}"), 'Workspace mode must expose pressed state.'],
  [companySettings.includes("aria-pressed={workspaceMode === 'advanced'}"), 'Advanced workspace mode must expose pressed state.'],
  [companySettings.includes("aria-pressed={workspaceMode === 'expert'}"), 'Expert workspace mode must expose pressed state.'],
  [profile.includes('<LoadingState message="جارٍ تحميل بيانات الحساب..." />'), 'Profile settings must use the shared loading state.'],
  [savedViews.includes('const popupId = `saved-view-${generatedId.replace(/:/g, \'\')}`;'), 'Saved views must use a unique popup id.'],
  [savedViews.includes('aria-haspopup="dialog"') && savedViews.includes('role="dialog"'), 'Saved view popover must use dialog semantics.'],
  [savedViews.includes("event.key !== 'Escape'") && savedViews.includes('triggerRef.current?.focus()'), 'Escape must return focus to the trigger.'],
  [savedViews.includes('focus-visible:ring-2 focus-visible:ring-primary-500'), 'Saved view actions need visible keyboard focus.'],
  [header.includes('aria-expanded={mobileMenuOpen}') && header.includes('aria-controls="mobile-sidebar"'), 'Mobile menu trigger must expose open state.'],
  [header.includes('aria-haspopup="dialog"') && header.includes('aria-controls="alerts-popover"'), 'Alerts trigger must expose dialog relationship.'],
  [app.includes('id="mobile-sidebar"') && app.includes('role="dialog"'), 'Mobile sidebar must expose dialog semantics.'],
  [commandPalette.includes('role="combobox"') && commandPalette.includes('aria-activedescendant={activeItemId}'), 'Command palette input must expose active result.'],
  [commandPalette.includes('role="listbox"') && commandPalette.includes('role="option"'), 'Command palette results must expose option semantics.'],
  [commandPalette.includes('aria-selected={index === active}'), 'Command palette active result must be announced.'],
  [app.includes('id="mobile-sidebar"') && app.includes('aria-modal="true"'), 'Mobile sidebar dialog must be modal.'],
  [sidebar.includes("aria-controls={section.id+'-navigation-panel'}") && sidebar.includes("id={section.id+'-navigation-panel'}"), 'Sidebar sections must expose button-to-panel relationship.'],
  [sidebar.includes('focus-visible:ring-2 focus-visible:ring-primary-500'), 'Sidebar controls need visible keyboard focus.'],
];

const failed = checks.filter(([ok]) => !ok);
if (failed.length) {
  for (const [, message] of failed) console.error('FAIL:', message);
  process.exit(1);
}
console.log('PASS: Aghbari command wave 2 UI contract');
