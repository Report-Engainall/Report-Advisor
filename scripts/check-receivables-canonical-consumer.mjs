import fs from 'node:fs';

const page=fs.readFileSync('src/pages/ReportsPage.tsx','utf8');
const truth=fs.readFileSync('src/lib/receivables-truth.ts','utf8');
const migration=fs.readFileSync('supabase/migrations/20260828210000_receivables_customer_canonical.sql','utf8');

const failures=[];
if(!page.includes("fetchReceivablesReportSnapshot")) failures.push('ReportsPage does not consume canonical receivables snapshot');
if(page.includes("fetchDashboardSnapshot(6),fetchSalesInvoices(0,50)")) failures.push('legacy dashboard + paginated invoice composition remains');
if(/inv\.data\.filter\(/.test(page)) failures.push('browser-side receivables filtering remains');
if(/aging\.reduce\(/.test(page)) failures.push('browser-side receivables total aggregation remains');
if(!page.includes("r.customer_name||'—'")) failures.push('consumer does not use canonical customer_name');
if(!truth.includes('customer_name: string | null')) failures.push('canonical row contract lacks customer_name');
if(!migration.includes('DROP FUNCTION IF EXISTS public.report_receivables_snapshot(integer, integer, date)')) failures.push('signature-safe replacement is missing');
if(!migration.includes('c.company_id = public.current_company_id()')) failures.push('customer join is not tenant constrained');
if(!migration.includes('si.company_id = public.current_company_id()')) failures.push('invoice scope is not tenant constrained');
if(!migration.includes('si.total IS NOT NULL') || !migration.includes('si.paid_amount IS NOT NULL')) failures.push('NULL financial inputs are not excluded from receivables truth');
if(failures.length){console.error('RECEIVABLES CANONICAL CONSUMER REGRESSION FAILED');failures.forEach(x=>console.error('- '+x));process.exit(1);}
console.log('RECEIVABLES CANONICAL CONSUMER REGRESSION PASS');
