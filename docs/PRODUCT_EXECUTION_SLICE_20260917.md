# Report-Advisor — Product Execution Slice

## 2026-09-17 — Application Shell foundation

This development branch contains the first executable product slice after the Core/RC certification track was isolated.

### Implemented

- Centralized `LanguageProvider` with `ar` / `en` support.
- Persistent language preference using browser storage.
- Automatic document `lang` and `dir` synchronization.
- RTL-first shell remains the default.
- LTR direction is explicitly supported at the document and CSS-token level.
- Sidebar language switch is accessible from the application shell.
- Existing command palette, navigation, tenant/session, alert, and health paths remain unchanged.

### Governance constraints

- No certification code was changed on the product branch.
- No new Runner, RPC, import engine, metric engine, or evidence engine was introduced.
- Product changes remain isolated from the certification candidate.
- Runtime business data semantics are unchanged.
