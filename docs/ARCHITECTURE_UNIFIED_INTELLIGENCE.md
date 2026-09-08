# Unified Report Intelligence Architecture

## المنتج الذي نبنيه

Report-Advisor ليس مستورد Excel ولا مجموعة تقارير منفصلة. هو **محرك فهم مصادر** يحول أي ملف/مجلد/صورة/تقرير إلى مصدر قابل للفهم ثم يربطه بالبيانات والتحليلات والقرار.

## الخط الموحد

```text
Any Source
  ↓
Security Scan
  ↓
Fingerprint / Duplicate Policy
  ↓
Format + Encoding Detection
  ↓
Extraction / OCR / Visual Understanding
  ↓
Header & Column Discovery
  ↓
Type + Semantic Detection
  ↓
Report-Type Classifier
  ├─ Sales
  ├─ Purchases
  ├─ Inventory
  ├─ Customers
  ├─ Products
  ├─ Receivables
  └─ General Report (safe fallback)
  ↓
Mapping + Confidence + Evidence
  ↓
Raw Source + Canonical Projection + Lineage
  ↓
Cross-Source Relations
  ↓
Quality / Duplicate / Conflict / Drift
  ↓
Authoritative Read Model
  ↓
Smart Dashboard
  ↓
Smart Report + Findings
  ↓
Forecasts
  ↓
Recommendations
  ↓
Decision / Action
  ↓
Outcome Measurement
```

## سياسة التكرار

- **File duplicate:** SHA-256 exact match → `skipped`, no second write.
- **Row duplicate:** fingerprint over normalized business identity + stable value fields → candidate duplicate.
- **Entity collision:** same business key with changed values → update/conflict policy; never silent destructive overwrite.
- Every duplicate decision records source hash, row/entity identity and decision reason.

## سياسة التعرف على التقرير

Classification combines:

1. column mappings;
2. data types and value patterns;
3. required/strong business signals;
4. dataset/sheet structure;
5. extracted/OCR text;
6. confidence threshold.

If confidence is below the configured threshold, route to **General Report**. General Report is a first-class product surface, not an error bucket.

## سياسة كشف الأعمدة

1. normalize header;
2. exact synonym;
3. partial/fuzzy synonym;
4. language aliases;
5. value-pattern compatibility;
6. semantic review threshold;
7. preserve unknown columns verbatim.

Each mapping has confidence and evidence. No unknown field is silently dropped.

## الصور

A visual source is treated as data. OCR is attempted for supported image/scanned-PDF sources. Vision semantics may be enabled through a configured vision backend. Until that backend is configured, the system must not invent a classification from pixels; it stores the visual asset and confidence/review state.

## Intelligence contract

All dashboard KPIs, smart findings, forecasts and recommendations must reference authoritative source-backed data and carry provenance. Empty/insufficient data is explicitly shown as such.

## Assistant contract

The assistant is not a generic chatbot. It answers against the tenant's authoritative read models and evidence, returns source references, states uncertainty, and must never cross tenant boundaries.
