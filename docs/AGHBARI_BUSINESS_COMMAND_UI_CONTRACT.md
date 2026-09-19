# Aghbari Business Command UI Contract

## Purpose

الأغبري is presented as a Business Command System, not a catalogue of CRUD pages. The interface must help an operator move from a business signal to a trustworthy decision without inventing facts.

## Experience loop

Signal → Context → Evidence → Explanation → Recommendation → Decision → Action → Outcome

The UI may expose any of these stages contextually, but must not imply that a later stage is complete merely because an earlier stage exists.

## Primary experience priorities

1. Money: revenue, margin, receivables/cash, inventory, demand, commercial impact.
2. Trust: source, freshness, tenant, as-of, evidence, metric definition, validation, security state.
3. Intelligence: alerts, recommendations, forecasts, scenarios, specialist analytics.
4. Work: review queues, exceptions, operational actions, outcome tracking.
5. Reference data: customers, products and other entities remain supporting context rather than the product's primary navigation model.

## Interaction rule

Important business outputs are interactive investigation entry points. A KPI, alert, recommendation, forecast, exception or business concentration should open enough context to answer:

- What is this?
- What is known now?
- Why did it appear?
- What evidence is present?
- What evidence is missing?
- What is the next valid action?
- What will prove the outcome later?

The shared BusinessInvestigationDrawer is the reference pattern for this behavior.

## Truth rule

Never invent a root cause, financial impact, approval, completion state, persisted task, evidence artifact or operational outcome.

Absence of evidence must remain visible as INSUFFICIENT_DATA, UNAVAILABLE, REVIEW, BLOCKED or another explicit state.

## Navigation rule

Navigation is organized around how an operator runs a business:

- Today / Business Pulse
- Operations
- Money
- Intelligence & Decisions
- Outputs
- Reference Data
- Administration

Customers and products are reference/analysis contexts. They are not the mental model of the product.

## Design rule

Do not revert to:

- generic SaaS dashboard card grids,
- page-first ERP taxonomy,
- report-type selection as the primary experience,
- chatbot-first product framing,
- decorative AI without evidence,
- synthetic demo numbers,
- fake certainty.

The visual reference generated on 2026-09-18 is inspiration for the visual direction only. It is not a source of truth for information architecture or implementation.

## Runtime constraint

UI work must reuse existing canonical runtime paths and existing APIs/RPCs. It must not invent parallel write flows or duplicate business truth.

## Verification contract

Changes to the command experience must preserve:

- route/sidebar parity,
- dashboard UI contract,
- product/wow UI contract,
- intelligence product contract,
- decision dashboard contract,
- TypeScript,
- lint,
- production build.

Any visual automation tool failure must be reported as an environment/tooling limitation, never converted into a fabricated PASS.
