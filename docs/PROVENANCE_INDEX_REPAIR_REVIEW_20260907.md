# Review notes

The repair uses `create index if not exists` and partial predicates matching the nullable FK references. This keeps migration replay idempotent and avoids indexing null references that cannot participate in the FK relationship.
