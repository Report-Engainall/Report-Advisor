#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const prefs = read('src/lib/workspace-preferences.ts');
const settings = read('src/pages/CompanySettingsPage.tsx');
const sidebar = read('src/components/Sidebar.tsx');
const app = read('src/App.tsx');
const dashboard = read('src/pages/DashboardPage.tsx');

const checks = [
  [prefs.includes('report-advisor.workspace-preferences'), 'Preference storage key must exist.'],
  [prefs.includes('storageKey(companyId)'), 'Workspace preferences must be tenant-scoped by company ID.'],
  [prefs.includes('preferencesForRole'), 'Role presets must remain canonical in one preference module.'],
  [prefs.includes('moveSection'), 'Section ordering must be persisted through one preference path.'],
  [prefs.includes('isDashboardWidgetVisible'), 'Dashboard widget visibility helper must remain available.'],
  [settings.includes('writeWorkspacePreferences(company.id,next)'), 'Settings must persist workspace preferences for the current company.'],
  [settings.includes('readWorkspacePreferences(companyId)'), 'Settings must load preferences for the resolved current company.'],
  [settings.includes("aria-pressed={workspaceMode === 'essential'}"), 'Essential workspace mode must expose pressed state.'],
  [settings.includes("aria-pressed={workspaceMode === 'advanced'}"), 'Advanced workspace mode must expose pressed state.'],
  [settings.includes("aria-pressed={workspaceMode === 'expert'}"), 'Expert workspace mode must expose pressed state.'],
  [settings.includes('toggleFavorite'), 'Settings must expose favorites controls.'],
  [settings.includes('defaultLanding'), 'Settings must expose default landing configuration.'],
  [settings.includes('shiftSection'), 'Settings must expose navigation ordering.'],
  [settings.includes('setWidget'), 'Settings must expose dashboard widget controls.'],
  [sidebar.includes('readWorkspacePreferences'), 'Sidebar must consume persisted workspace preferences.'],
  [sidebar.includes('workspacePreferences.hiddenPaths'), 'Sidebar must honor hidden navigation paths.'],
  [sidebar.includes('workspacePreferences.favoritePaths'), 'Sidebar must surface favorites.'],
  [sidebar.includes('workspacePreferences.sectionOrder'), 'Sidebar must honor section order.'],
  [app.includes('readWorkspacePreferences(companyId).defaultLanding'), 'App shell must honor default landing.'],
  [dashboard.includes('readWorkspacePreferences(companyId).dashboardWidgets'), 'Dashboard must consume persisted widget visibility.'],
  [dashboard.includes("widgetVisible('signals')") && dashboard.includes("widgetVisible('workpaths')"), 'Dashboard must gate persisted widget groups.'],
];

const failed = checks.filter(([ok]) => !ok);
if (failed.length) {
  for (const [, message] of failed) console.error('FAIL:', message);
  process.exit(1);
}
console.log('PASS: workspace personalization contract');
