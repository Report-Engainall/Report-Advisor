import fs from 'node:fs';
const source = fs.readFileSync('src/pages/ExecutiveReportPage.tsx', 'utf8');
const required = ['fetchDashboardSnapshot','fetchDashboardIntelligence','Executive Summary','Evidence Boundary','Actual Outcome','Decision Workspace','window.print()'];
const missing = required.filter(token => !source.includes(token));
if (missing.length) { console.error('Executive report product contract: FAIL'); process.exit(1); }
console.log('Executive report product contract: PASS');
