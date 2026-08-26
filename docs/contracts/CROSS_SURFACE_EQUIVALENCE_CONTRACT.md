# Cross-Surface Equivalence Contract

## Status

**ENFORCED AS A CONTRACT SKELETON; DOMAIN-WIDE EQUIVALENCE IS NOT PROVEN YET.**

The purpose of this contract is to prevent each surface from independently calculating business truth.

## Scope

Surfaces under comparison:

- Dashboard
- Reports
- Analytics
- BI
- Decision
- Export

The comparison key is the tuple:

`tenant + as_of/date boundary + filters + status scope + dataset identity + aggregation semantics`

## MUST BE EQUAL

For identical comparison keys, these business-truth fields must resolve from the same canonical source:

- record population
- included/excluded status semantics
- count of qualifying records
- additive totals
- null/unknown/insufficient-data classification
- tenant scope
- date boundary

## ALLOWED TRANSFORMATION

Only presentation/domain transformations are allowed, including:

- formatting
- ordering
- chart binning that does not change source truth
- currency/number display formatting
- labels derived from the canonical semantic state

Any transformation that changes a business metric must be explicitly classified and tested.

## MUST NOT DIFFER

The following are business truth and cannot be independently recomputed on a paginated browser dataset:

- financial totals
- inventory totals
- receivables totals
- qualifying record counts
- tenant membership
- inclusion/exclusion status
- export population when export is classified FULL_DATASET

## Evidence rule

A surface is not certified by code inspection alone. Certification requires:

1. canonical source identified;
2. consumer mapping identified;
3. regression covering the same comparison key;
4. large-dataset case where pagination is active;
5. null/unknown/insufficient-data case;
6. exact-head CI evidence;
7. runtime evidence where the behavior depends on a deployed environment.

## Current certification

| Surface | Canonical source mapped | Equivalence regression | Runtime evidence | Certification |
|---|---|---|---|---|
| Dashboard | NOT PROVEN | NOT PROVEN | LIVE REQUIRED | NOT PROVEN |
| Reports | PARTIAL | PARTIAL | LIVE REQUIRED | NOT PROVEN |
| Analytics | NOT PROVEN | NOT PROVEN | LIVE REQUIRED | NOT PROVEN |
| BI | NOT PROVEN | NOT PROVEN | LIVE REQUIRED | NOT PROVEN |
| Decision | PARTIAL | PARTIAL | LIVE REQUIRED | NOT PROVEN |
| Export | PARTIAL | NOT PROVEN | LIVE REQUIRED | NOT PROVEN |

No row is upgraded merely because CI is green.
