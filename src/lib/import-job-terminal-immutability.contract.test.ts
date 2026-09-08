import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const migration = fs.readFileSync(
  path.join(process.cwd(), 'supabase/migrations/20260909000500_harden_import_job_terminal_immutability.sql'),
  'utf8',
);

describe('import job terminal immutability contract', () => {
  it('requires tenant immutability and terminal-state protection', () => {
    expect(migration).toContain("NEW.company_id IS DISTINCT FROM OLD.company_id");
    expect(migration).toContain("IMPORT_JOB_TENANT_IMMUTABLE");
    expect(migration).toContain("OLD.status IN ('completed','partial','failed','cancelled')");
    expect(migration).toContain("IMPORT_JOB_TERMINAL_IMMUTABLE");
    expect(migration).toContain('trg_import_jobs_lifecycle_guard');
    expect(migration).toContain('SECURITY INVOKER');
    expect(migration).toContain('REVOKE ALL ON FUNCTION public.guard_import_job_lifecycle_update() FROM PUBLIC, anon');
    expect(migration).toContain('GRANT EXECUTE ON FUNCTION public.guard_import_job_lifecycle_update() TO authenticated');
  });

  it('rejects a weakened implementation without terminal protection', () => {
    const weakened = migration.replace("RAISE EXCEPTION 'IMPORT_JOB_TERMINAL_IMMUTABLE';", 'NULL;');
    expect(weakened).not.toContain("RAISE EXCEPTION 'IMPORT_JOB_TERMINAL_IMMUTABLE';");
  });
});
