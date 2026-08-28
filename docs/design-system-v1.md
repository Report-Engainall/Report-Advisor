# Report Advisor Design System v1

## Semantic tokens

The UI uses semantic meaning rather than component-specific colors:
- success / healthy
- info
- monitor
- action required
- risk / critical
- neutral
- disabled

Priority and risk MUST never rely on color alone. Every status uses icon + text label + visual treatment.

## Core primitives

Navigation, buttons, inputs, KPI, cards, tables, status, priority, risk, evidence, alerts, notifications, dialogs, drawers, forms, empty/loading/error states, command UI, reports and print.

## Interaction rules

- Focus first, detail second.
- One primary action per context.
- Progressive disclosure for deep evidence.
- Tables remain scannable on desktop and become stacked/detail views where necessary on mobile.
- Keyboard access is required for actionable controls.
- Loading and empty states explain what is happening and what the user can do next.

## Trust rules

Any important number should expose, when available:
definition, data-as-of, freshness, confidence/trust, evidence, and source path.

## Print

Print output follows the dedicated print design system and remains readable in grayscale.
