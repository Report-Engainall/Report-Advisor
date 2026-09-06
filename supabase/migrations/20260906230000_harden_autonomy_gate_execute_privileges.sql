-- Harden internal autonomy/certification gate RPCs.
-- These SECURITY DEFINER functions are internal control-plane reads; callers should not
-- execute them directly as authenticated users. service_role retains execution.
REVOKE EXECUTE ON FUNCTION public.autonomy_runtime_gate(text) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_enter_phase_l_autonomy(text) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.compute_control_plane_health() FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.autonomy_runtime_gate(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.can_enter_phase_l_autonomy(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.compute_control_plane_health() TO service_role;
