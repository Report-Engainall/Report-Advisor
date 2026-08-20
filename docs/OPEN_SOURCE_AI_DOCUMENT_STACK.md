# Open-source AI + Document Intelligence Stack

Report Advisor is **zero-local-install by default**. Customers do not need Ollama, Python, model weights, CUDA, or a local AI server.

External AI/document libraries are capability adapters, never business logic.

## Runtime strategy

1. **Hosted inference — default:** server-side gateway routes requests to open-model providers such as Cloudflare Workers AI, Hugging Face Inference Providers, or OpenRouter.
2. **Browser fallback — optional:** lightweight WASM/browser OCR or small models when appropriate.
3. **Local AI — optional power-user mode:** Ollama can be enabled by an administrator, but it is never required for normal customers.
4. **Deterministic mode — always available:** imports, calculations, KPIs, forecasting gates and business facts continue without any LLM.

Cloudflare Workers AI provides serverless access to 50+ open-source models without customers maintaining GPUs. Hugging Face Inference Providers provides a unified API to hundreds of models through serverless providers. OpenRouter provides a unified API across many providers/models and supports provider fallbacks. These are infrastructure choices behind our adapter, not application dependencies.

## Selected capability stack

| Capability | Default | Optional fallback | Rule |
|---|---|---|---|
| Office/structured files | Existing XLSX/CSV/ODS engine | Python/Polars/DuckDB adapters | Never send raw tables to an LLM |
| PDF/document parsing | Hosted/local Document Intelligence service | PDF.js / existing parser | Structured layout before OCR |
| OCR | Hosted PaddleOCR-compatible service | Tesseract.js | Arabic is first-class |
| Chat/reasoning | Hosted open-model provider | Browser/local model | LLM never creates numeric facts |
| Embeddings | Hosted embedding provider | lexical / browser / Ollama | Hybrid retrieval for critical answers |
| Vector store | pgvector/Supabase | local vector index | Tenant scope on every vector |
| Analytical SQL | Supabase + query planner | DuckDB adapter | Large aggregations use analytical engine |
| Dataframes | Existing deterministic TypeScript engine | Polars adapter | Parse once, transform deterministically |
| Forecasting | Existing deterministic engine | Python stats adapters | Data-quality gates mandatory |
| Anomaly detection | Deterministic metrics | PyOD/sklearn adapter | Evidence required |
| RAG | Evidence ledger + hybrid retrieval | lexical retrieval | Every answer retains lineage |
| Agents | Controlled tool registry | Direct functions | Allow-listed, tenant-scoped tools only |

## Document intelligence

Docling is an excellent optional backend for structured document parsing, PDF layout and tables. PaddleOCR is an optional high-accuracy multilingual OCR/document backend. Both are isolated behind the normalized document envelope so the web application does not import provider-specific code.

## Local AI policy

Ollama remains supported for administrators and offline/power-user deployments, but it is explicitly **not a prerequisite**. The product must never show a setup error merely because Ollama is absent.

## Security rules

1. Numeric business facts originate from deterministic data engines, never LLM text.
2. External AI receives only the minimum approved context; raw company data is not sent by default.
3. Every AI request is tenant-scoped and provider-policy checked.
4. API keys are server-side secrets, never embedded in the browser bundle.
5. OCR output is untrusted and must pass normalization/validation.
6. LLM output cannot directly write business tables.
7. Optional services fail closed to deterministic parsers/analytics.
8. File processing is bounded and parse-once.
9. Provider selection is capability-based so vendors can be changed without rewriting business logic.

## Deployment profiles

- **Customer:** hosted AI, no installation.
- **Enterprise:** hosted AI through organization's approved gateway/private endpoint.
- **Private server:** self-hosted document intelligence and model gateway.
- **Offline:** deterministic analytics + browser/local optional engines; no network dependency.
