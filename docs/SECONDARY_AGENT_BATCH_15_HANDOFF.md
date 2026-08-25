# Secondary Agent Batch 15 — Free-First Provider Governance

## Scope
Document and enforce governance expectations for provider/model routing without introducing a paid dependency or replacing the project's local AI path.

## Rules
- Provider selection must be capability-based and explicit.
- Local/offline providers are preferred when available.
- No silent paid fallback.
- No API key is required by the core product path.
- Provider failures must surface as UNKNOWN/UNAVAILABLE, not fabricated output.
- Deterministic calculations remain outside LLM responsibility.
- Provider metadata must never bypass tenant/RLS boundaries.
- Model/version provenance should be recorded where runtime already supports it.

## Non-goals
No new paid provider, billing integration, autonomous action, or external SaaS requirement was added.

## Integration
Mainline should map these governance rules onto the existing local Ollama/provider abstraction rather than creating a second AI gateway.

## Status
FOUNDATION / MAINLINE RUNTIME REQUIRED.
