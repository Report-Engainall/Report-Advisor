# Fresh-environment grant reconciliation

Live Staging version `20260907234117` (`grant_current_company_id_authenticated_execute`) was absent from the current repository migration path at `d0ddda19a21a341bc77931d14c2358545c6fd328`.

The companion migration restores the explicit privilege boundary:
- PUBLIC: revoked
- anon: revoked
- authenticated: EXECUTE granted

No production alias or historical migration was changed.
