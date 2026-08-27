-- F44b: the caller-shaped executive metrics RPC has no runtime consumers.
-- Remove the exact historical signature rather than leaving a parallel truth path.
-- This is intentionally an exact-signature DROP; do not broaden it to overloads.
DROP FUNCTION IF EXISTS public.get_executive_metrics(uuid, date, date);
