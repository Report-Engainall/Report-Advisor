-- SECURITY DEFINER autonomy runtime helpers must never be callable anonymously.
REVOKE ALL ON FUNCTION public.compute_control_plane_health() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.compute_control_plane_health() TO authenticated;

REVOKE ALL ON FUNCTION public.can_enter_phase_l_autonomy(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_enter_phase_l_autonomy(text) TO authenticated;

REVOKE ALL ON FUNCTION public.autonomy_runtime_gate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.autonomy_runtime_gate(text) TO authenticated;
