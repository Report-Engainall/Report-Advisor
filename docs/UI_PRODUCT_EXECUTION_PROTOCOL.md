# UI Product Execution Protocol

## Purpose
This protocol governs the active product-interface work on the non-frozen UI branch. It exists to prevent incremental cosmetic patching from becoming the product architecture.

## Product law
1. The application is one coherent decision product, not a directory of pages.
2. Primary navigation exposes product domains only; deep analytical/reporting views are contextual destinations.
3. Arabic RTL and mobile-first behavior are first-class requirements.
4. The visual language is premium emerald / teal / champagne with warm neutral surfaces, restrained gradients, strong hierarchy, generous spacing, and purposeful motion.
5. Every visible action must either perform a real supported operation or clearly communicate why it is unavailable.
6. Never manufacture business metrics, evidence, confidence, availability, or operational success.
7. Preserve tenant isolation, authentication, RLS, canonical queries, and existing business semantics while improving presentation and composition.
8. Remove or replace interface sections that duplicate another product surface or do not serve a clear user job.
9. Optimize for slow/mobile networks: avoid decorative payloads, unnecessary requests, and heavy client-side dependencies.
10. A visual change is not complete until the surrounding information architecture remains coherent.

## Product hierarchy
- Leadership: dashboard and executive command center.
- Data: import/data operations and data trust.
- Understanding: reports and analytics.
- Intelligence: recommendations, forecasts, scenarios.
- Decision: decision workspace and evidence/outcome flow.
- Operations: customers, products, inventory.
- System: company/profile/settings.

## Contextual navigation rule
RFM, ABC, Aging, individual reports, recommendation lists, forecasts, scenarios, import analysis, alternative groups, and similar specialist views remain available when valid, but are not peers of the core product domains in the primary sidebar.

## Section quality gate
For each screen ask:
- What decision or job does this screen serve?
- What is the primary action?
- What evidence/data is actually available?
- What should happen when data is missing?
- Is the screen duplicating another screen?
- Is the hierarchy understandable within five seconds on mobile?
- Can a user reach the next meaningful step without hunting through navigation?

If a section fails these questions, redesign it or remove it from the primary experience. Do not delete valid backend capabilities merely because their current presentation is weak.

## Active visual primitives
Use the shared workspace primitives in `src/index.css`: `workspace-grid`, `workspace-panel`, `workspace-panel-dark`, `workspace-label`, `workspace-title`, `workspace-copy`, `workspace-action-*`, `workspace-stat`, `workspace-list-item`, and `workspace-icon` where appropriate.

## Completion rule
Completion means the interface has a coherent product hierarchy, truthful states, meaningful actions, responsive behavior, and a consistent visual system. A percentage estimate is not a completion criterion.

## Certification boundary
This protocol does not modify or certify the frozen release candidate, production aliases, production runtime, authenticated E2E, backup/restore, rollback, or other operational gates. Those require their own exact-HEAD evidence and remain governed by `docs/MASTER_EXECUTION_INDEX.md`.
