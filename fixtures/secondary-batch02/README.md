# Secondary Batch 02 Golden Corpus

Safe, deterministic, synthetic fixtures only. No customer/business secrets.

These fixtures are intentionally text/CSV representations so they can be reviewed and versioned through GitHub without introducing a binary spreadsheet dependency. Runtime adapters may consume them as fixtures for parser/document tests.

Cases:
- `arabic-excel.csv`
- `english-excel.csv`
- `arabic-ocr.txt`
- `english-ocr.txt`
- `headerless-table.csv`
- `bad-headers.csv`
- `duplicate-records.csv`
- `missing-fields.csv`
- `merged-cells.txt`
- `multi-table-document.txt`
- `reconciliation-mismatch.json`
- `unknown-evidence.json`

All values are synthetic and non-sensitive.
