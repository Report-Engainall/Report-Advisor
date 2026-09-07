# PR body

This PR carries a verified live Staging Performance Advisor repair into replayable source history. It adds two partial composite indexes matching the tenant-bound canonical-text provenance foreign keys, plus deterministic contract coverage and a CI gate.

The change is additive and does not alter tenant isolation or production. Fresh replay remains a separate certification gate.
