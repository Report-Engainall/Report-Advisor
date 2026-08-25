# Report Advisor — Free/Local Product Policy

## Binding product requirement

Report-Advisor must remain a product whose **core capabilities can be used without paying any third party**. This is a product acceptance requirement and must be preserved through future development.

## Mandatory rules

1. No core feature may require a paid API, subscription, SaaS service, AI provider, OCR service, database tier, storage service, analytics platform, messaging provider, or automation platform.
2. Local, open-source, browser-native, self-hosted, or already-available free paths are preferred.
3. Paid external providers may exist only as optional adapters selected explicitly by the user.
4. Paid adapters must be visibly labeled and disabled by default.
5. The application must never silently switch from a free/local provider to a paid provider.
6. If the free/local provider is unavailable, preserve deterministic functionality and show `UNAVAILABLE` rather than charging the user.
7. Core business calculations must remain deterministic and provider-independent.
8. Local AI such as Ollama/open models may be used when appropriate, but the product must remain useful when AI is unavailable.
9. No API key or credit card is required for core operation.
10. New dependencies must pass a free/local, licensing, security, maintenance, and anti-bloat review.
11. Performance improvements must preserve all existing features.
12. Existing capabilities are never removed merely to reduce cost or complexity; they are repaired, optimized, or replaced only with an equal-or-better proven path.

## Acceptance test

A clean environment with no paid provider credentials must be able to exercise the core path:

`Import → Normalize → Validate → Store → Metrics → Report → Evidence → Recommendation`

and must be able to perform deterministic analysis without a paid AI service.

## Optional-provider boundary

Any external provider must implement an adapter boundary and declare:
- provider name;
- free/local availability;
- whether it can incur cost;
- credentials required;
- data sent;
- data retention implications;
- failure behavior;
- explicit enablement state.

No provider may bypass the central policy.
