## LIVE UI CLOSURE — 2026-09-26 / TRUST EVIDENCE + WORK CENTER

- Trust Evidence severity tiles now render malformed/unavailable counts explicitly as `غير متاح` rather than an empty numeric slot.
- Work Center invalid active progress is visible and actionable rather than silently normalized.
- Data Quality presents a weighted source-derived diagnostic score and no longer treats overlapping issue occurrences as unique affected records.

## LIVE UI CLOSURE — 2026-09-26 / DATA QUALITY SCORE SEMANTICS

- Data Quality no longer derives a “remaining records” number by subtracting issue occurrences from record counts.
- The displayed overall diagnostic score is a weighted score from the authoritative per-entity scores already present in the snapshot.
- The UI keeps the diagnostic score distinct from absolute trust/evidence and preserves unavailable state when source scores are invalid.
- This keeps overlapping issue occurrences from being misread as unique affected records.

## LIVE UI CLOSURE — 2026-09-26 / QUALITY OCCURRENCE SEMANTICS + OPERATIONS

- Data Quality distinguishes issue-occurrence pressure from record counts; when subtraction would imply a misleading “remaining records” value, the derived score/remaining count is shown as unavailable.
- Work Center makes out-of-range persisted progress actionable as an invalid operational state.
- Dashboard truth surfaces require actual non-empty evidence shape before displaying CONFIRMED semantics.

## LIVE UI/CONTRACT CLOSURE — 2026-09-26

- Data Quality now exposes snapshot-counter consistency as a first-class UI state and never clamps contradictory derived counts into zero.
- Work Center now exposes persisted progress outside `0..100` as explicit unavailable state.
- Product-WOW contract was structurally repaired so its bindings are unique and executable; the Data Quality assertion now tracks the fail-closed next-action contract.

## LIVE UI CLOSURE — 2026-09-26 / WORK CENTER TRUTH STATES

- Work Center progress now treats persisted values outside the canonical `0..100` interval as unavailable rather than clipping them into a plausible range.
- The unavailable progress state is explicitly visible and machine-addressable, preserving the product rule that malformed operational state must remain visible as REVIEW/UNAVAILABLE rather than be normalized into false certainty.
- Product-WOW regression guards both the numeric range and the unavailable presentation hook.

## LIVE UI CLOSURE — 2026-09-26 / COMMAND CENTER METRIC TRUTH

- Executive Command Center money metrics now expose an explicit `available` / `unavailable` state hook.
- Unavailable financial values receive a distinct visual treatment while retaining the literal `غير متاح` semantic, so the UI cannot visually imply a numeric zero.
- Product-WOW regression now guards both the canonical NEXT ACTION route and metric availability state.

## COMPREHENSIVE UI CLOSURE — 2026-09-26

- Executive Command Center now has a canonical `NEXT ACTION` surface derived from real truth state: unresolved source quality routes to Data Quality, open attention routes to Intelligence, reviewable recommendations route to Decision Experience, and a quiet state routes to the Executive Report.
- The next action is not decorative: `data-next-action` exposes the canonical route for regression checks and the visual rail changes by semantic state.
- The surface follows the shared Aghbari visual constitution: emerald/near-black/brass hierarchy, restrained depth, explicit REVIEW/ATTENTION/READY state, mobile-safe controls and reduced-motion compatibility.
- The UI contract now guards that the next-action logic exists and responds to quality/attention state rather than rendering a static CTA.

## COMPREHENSIVE UI + CORE BOUNDARY — 2026-09-26

- Canonical import result integrity is now reflected at the UI/decision boundary as a stronger trust contract: duplicate server IDs and malformed replay flags are treated as invalid rather than coerced.
- No new navigation taxonomy or duplicate workflow was introduced.

## SHARED-SURFACE CLOSURE — 2026-09-26

- Shared DataTable now exposes keyboard-focusable scroll context, explicit row focus visibility, touch-safe pagination, and mobile overflow behavior without changing its data contract.
- TrustBadge renders evidence counts only when they are validated non-negative integers.
- Decision Experience recommendations expose explicit selection/focus hooks; blocked decision messaging uses a blocking icon and the shared visual system.
- Trust Evidence center rejects internally inconsistent severity totals rather than clamping the residual bucket to zero; unavailable breakdowns are visible as unavailable.
## DEEP-FINISH FOLLOW-THROUGH — 2026-09-26

- TruthContextStrip now treats quality issue counts as valid only when they are finite non-negative integers; invalid values remain visibly unavailable and cannot unlock decision-ready language.
- Chart surfaces expose explicit `ready` / `empty` state hooks and use component-unique SVG gradient IDs, preventing visual collisions when multiple TrendChart instances render together.
- Chart tooltips and truth surfaces use the same executive emerald/brass visual hierarchy while preserving canonical truth semantics.
- Shared surfaces remain mobile-safe and reduced-motion safe; visual transitions never alter eligibility or data values.

## DEEP-FINISH UI WAVE — 2026-09-26

- The shared Aghbari shell now uses a restrained emerald/near-black/brass visual hierarchy with stronger surface depth, micro-motion, sticky data-table headers, touch-safe controls and low-bandwidth fallbacks.
- KPI surfaces expose the canonical trust state as a visual rail without converting missing values into zero or inventing confidence.
- Shared loading, empty, unavailable, review, blocked, insufficient-data and error surfaces expose stable `data-surface-state` hooks so visual polish cannot alter business semantics.
- Motion remains progressive-enhancement only: mobile reduces transforms and `prefers-reduced-motion` disables animation/transition effects.
- Context-rail health styling must bind the emitted health state token from Header; no new navigation taxonomy was introduced.

# MASTER UI/UX REFERENCE — الأغبري / Report-Advisor
Status: CANONICAL DOMAIN REFERENCE
Owner: Product surface completeness

## 1. Purpose
This file owns the complete customer-facing surface model. It defines what a complete screen means, how the product is navigated, which states must exist, and how UI work is prioritized. It does not authorize new backend routes merely to satisfy the visual map.

## 2. Product shell
Every authenticated experience inherits one shared shell:
- Arabic RTL workspace
- company / period / As Of / freshness / trust context
- right-side primary navigation
- Command Palette
- persistent Aghbari Advisor drawer
- notifications/account
- responsive/mobile/PWA behavior
- shared typography, spacing, surfaces and controls

No page may ship as a visually isolated mini-product.

## 3. Canonical information architecture
### 01 مركز القرار / Decision Center
- Business pulse
- Decision queue
- Signals & exceptions
- Opportunities / Money Recovery
- Decision Coverage
- Decision ROI
- Business Replay
- Outcome follow-up

### 02 البيانات والتشغيل / Data Operations
- Work Center
- Unified Import / Upload
- Document Intelligence
- Extraction / OCR
- Validation / Review
- Reconciliation / Deduplication
- Data Quality
- Sources / Connectors
- Watched Reports / Folder Processing
- Operational Jobs

### 03 التحليل التجاري / Business Analytics
- Analytics home
- Sales
- Purchases
- Profitability
- Receivables / Collections
- Liquidity / Cash
- Inventory
- Demand / Movement
- Customer / Supplier analysis
- RFM / ABC / XYZ / FSN
- Aging
- concentration / anomalies / trends

### 04 الذكاء والقرار / Intelligence & Decision
- Signals
- drivers / early warnings
- recommendations
- forecasts and backtests where gates pass
- scenarios
- AI advisory
- Decision Experience
- Decision Playbooks

### 05 الثقة والأدلة / Trust & Evidence
- Evidence Center
- Evidence Passport
- provenance / lineage
- Metric Inspector
- snapshots
- confidence / quality
- decision evidence
- benchmark governance / trust health

### 06 التقارير والمخرجات / Reports & Outputs
- Executive report
- domain reports
- Report Builder
- review
- export / print

### 07 البيانات المرجعية / Master Data
- Customers
- Products
- Suppliers
- Warehouses
- inventory entities
- business keys / synonyms / units / packaging
- semantic dictionary

### 08 الإعدادات / Settings
- Company
- users / roles / permissions
- profile
- language / currency
- sources / connectors
- notifications
- security
- integrations
- system health

## 4. Screen completeness contract
Every canonical surface must contain:
1. meaningful title/context
2. primary business question
3. real data source
4. evidence/trust state where relevant
5. loading state
6. empty state
7. error state
8. review/blocked/insufficient-data state where relevant
9. primary next action
10. secondary discovery actions
11. responsive layout
12. accessible focus/keyboard behavior
13. canonical route
14. no fake metrics
15. coherent interaction with the shell
16. real links into evidence/detail workflows

A page is not complete because the default populated state looks good.

## 5. Import UX contract
One user-facing ingestion entry:
Any Source -> Read -> Understand -> Structure & Meaning -> Quality -> Evidence -> Review -> Canonical Approval/Commit -> Business Understanding

UI must not ask the customer to choose a target table/entity before source understanding.

Visible lifecycle:
queued -> fingerprinted -> extracted -> canonicalized -> validated -> analyzed -> decisioned -> committed -> rendered

Committed must never be visually claimed before authoritative DB commit succeeds.

## 6. Truth-state design
Use explicit states:
VERIFIED, TRUSTED, PARTIAL, REVIEW, BLOCKED, INSUFFICIENT DATA

Never hide uncertainty through friendly copy.

## 7. Product-value UI rules
Prefer UI that:
- shortens a decision path
- exposes why a result exists
- shows evidence next to important claims
- gives a concrete next action
- reveals opportunity/risk
- reduces steps
- improves trust
- works under low bandwidth

Do not add visual elements merely to make screens look fuller.

## 8. Visual constitution
Aghbari:
- dark ink foundation
- teal/emerald primary analytical language
- restrained warm-gold emphasis
- high information density with whitespace hierarchy
- progressive disclosure
- semantic color only
- Arabic-first typography
- no copied vendor UI
- no generic template sections
- no duplicated navigation trees

## 9. 50% UI execution objective
UI lane must drive each canonical route toward:
Route -> Surface -> Components -> Data Binding -> States -> Actions -> Evidence -> Responsive -> Accessibility -> Regression

A polished shell without real state/data/action coverage is incomplete.

## 10. Completion audit
At each UI wave, audit:
- route completeness
- sidebar/navigation parity
- component reuse
- visual consistency
- state completeness
- real data wiring
- actionability
- evidence disclosure
- responsive behavior
- accessibility
- performance
- no duplicate import or evidence path

## 11. Absorbed visual-system and interaction rules

### Business-first hierarchy
Every screen should answer:
1. what is happening?
2. what needs attention?
3. why?
4. what should I do?
5. what happened after the action?

Priority:
Today / Money / Exceptions / Decision -> Truth / Evidence -> Advanced Analysis -> Administration

### Interaction density and responsive rules
- enterprise density without clutter
- business body text around 12–14px where the established system uses it
- table text around 11–13px where density requires it
- mobile input text >=16px to avoid platform zoom problems
- mobile touch targets >=44px
- restrained 8–14px radius system
- 1px borders where useful; shadows mainly for floating layers

These are design-system defaults, not excuses to violate accessibility.

### Navigation
Use:
Today -> Command/Search -> contextual navigation -> favorites/recents where supported.

Advanced capabilities should be progressively disclosed instead of promoted into top-level taxonomy.

### Overlay semantics
- Toast for quick-result feedback
- inline alert for content-local problems
- modal for confirmation/critical tasks
- drawer/sheet for contextual work without losing page state
- tooltip for concise help

Do not use a modal where a drawer preserves context better.

### Reports and printing
Every report surface exposes company, period, currency, As Of/freshness and evidence state.
A4 is the default print target where relevant; print output removes application chrome and avoids visual fragmentation.
Summary versus itemized presentation must be explicit for financial/operational reports.

### Accessibility
- keyboard access throughout
- visible focus
- icon buttons have accessible names
- native semantics before ARIA
- correctly ordered headings
- do not trap or obscure focus with sticky overlays
- semantic status meaning must not rely on color alone

### UI quality gate
Hierarchy -> Density -> Evidence -> Action -> Accessibility -> Mobile -> Print -> Empty/Loading/Error

A surface is complete only when the quality gate is satisfied, not merely when the populated screenshot looks polished.

## IMPORT QUALITY TRUST SURFACE — 2026-09-26

- Canonical Import quality is a semantic state, not decorative text: trusted for >=75, review for 50–74, blocked below 50.
- Invalid, non-finite or out-of-range source quality is rejected before the preview state instead of being normalized into a plausible value.
- The source passport exposes the state through data-quality-state so visual regression guards can verify the trust meaning without coupling to color alone.
- This remains consistent with the Import UX contract: evidence and quality gates determine readiness; visual polish does not create eligibility.
