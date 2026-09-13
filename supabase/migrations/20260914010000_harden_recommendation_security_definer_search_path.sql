-- Security hardening only: preserve existing recommendation RPCs while pinning
-- their SECURITY DEFINER search_path to trusted schemas.
alter function public.update_recommendation_status(uuid, text)
  set search_path = public, pg_catalog;

alter function public.record_recommendation_outcome(text, timestamptz, numeric, numeric, numeric, text, uuid, jsonb)
  set search_path = public, pg_catalog;
