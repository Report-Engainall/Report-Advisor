# Open-source AI + Document Intelligence Stack

This project uses a capability-first, local-first architecture. External libraries are adapters, not business logic.

## Selected stack

| Capability | Primary | Fallback | Rule |
|---|---|---|---|
| Office/structured files | XLSX/CSV/ODS existing engine | Python adapters | Never send raw files to an LLM for tabular ingestion |
| PDF/document parsing | Docling | PDF.js / existing parser | Prefer structured layout + tables before OCR |
| OCR | PaddleOCR | Tesseract.js | Select by language/layout/device; Arabic is first-class |
| Local LLM | Ollama | deterministic rules / local-only parser | LLM never invents numeric facts |
| Embeddings | Ollama embedding models | lexical search | Hybrid retrieval is mandatory for critical answers |
| Vector store | pgvector/Supabase | local vector index | Keep tenant scope with every vector record |
| Analytical SQL | existing Supabase + query planner | DuckDB adapter | Push large aggregations to an analytical engine |
| Dataframes | existing TypeScript engine | Python/Polars adapter | Parse once, transform deterministically |
| Forecasting | existing deterministic forecast engine | Python stats adapters | Forecasts require data-quality gates |
| Anomaly detection | deterministic metrics | PyOD/sklearn adapter | Never turn anomalies into facts without evidence |
| RAG | evidence ledger + semantic retrieval | lexical retrieval | Every answer must retain source lineage |
| Agent protocol | controlled tool registry | direct function calls | Tools are allow-listed and tenant-scoped |

## Why Docling

Docling is MIT-licensed and supports PDF, DOCX, PPTX, XLSX, HTML, images and other document types, advanced PDF layout and table understanding, OCR, local/air-gapped execution and service/MCP modes. It is therefore an excellent **optional document-intelligence accelerator**, not a replacement for the deterministic import engine.

## Why PaddleOCR

PaddleOCR provides structured OCR/document parsing, multilingual support and document/table/formula/chart capabilities. It is an optional higher-accuracy OCR backend for scanned and difficult documents. Tesseract remains the lightweight browser/local fallback.

## Why Ollama

Ollama exposes a local HTTP API (default `http://localhost:11434/api`) and official JavaScript/Python libraries. The application should treat it as a provider behind a local AI adapter so models can change without changing business logic.

## Non-negotiable safety rules

1. Numeric business facts originate from deterministic data engines, never from LLM text.
2. Every AI answer carries tenant scope, source references and confidence.
3. LLM output cannot directly write business tables.
4. OCR output is untrusted input and must pass normalization/validation.
5. Optional Python services must fail closed to existing local parsers when unavailable.
6. File processing is parse-once and memory bounded.
7. No dependency is introduced solely because it is popular; each adapter must justify its operational cost.

## Runtime modes

- **Browser-only:** current lightweight parsers + Tesseract.js + local Ollama.
- **Local workstation:** add Docling/PaddleOCR/DuckDB/Polars adapters.
- **Server:** expose the same adapters through a controlled document-intelligence service.
- **Offline:** disable network providers; keep deterministic analytics, local LLM and local evidence store.
