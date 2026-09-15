-- Terminal recommendation outcomes must carry non-empty evidence.
-- Preserve pending outcomes as the only pre-evidence state and fail closed for terminal states.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname='recommendation_outcome_terminal_requires_evidence'
  ) THEN
    ALTER TABLE public.recommendation_outcomes
      ADD CONSTRAINT recommendation_outcome_terminal_requires_evidence
      CHECK (status = 'pending' OR evidence <> '{}'::jsonb);
  END IF;
END
$$;
