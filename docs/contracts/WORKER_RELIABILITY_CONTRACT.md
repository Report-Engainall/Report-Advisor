# Worker State Machine and Durable Side-Effect Contract

## Certification state

**NOT PROVEN** until every worker family is mapped and exercised under concurrency/recovery tests.

## Required state model

`queued → processing → completed | failed → dead_letter`

`processing → reconciliation` is permitted for recovery paths where the final side effect cannot be proven from the worker checkpoint alone.

## Transition evidence

For every transition record:

- current state;
- requested transition;
- authorization/invariant;
- atomicity boundary;
- failure behavior;
- retry behavior;
- recovery behavior.

## Concurrency cases

Every worker family must be checked for:

- concurrent start;
- duplicate delivery;
- lease expiration;
- stale worker after lease loss;
- worker crash after side effect but before checkpoint;
- checkpoint failure;
- completion failure;
- retry after partial progress;
- process restart;
- dead-letter handling;
- manual reconciliation.

## Durable side-effect rule

For any external mutation, database mutation, file mutation, queue publication, notification, email, or webhook:

`side effect + checkpoint + completion + retry`

must be analyzed as one reliability boundary.

An idempotency key alone is not sufficient evidence of state-transition safety or recovery correctness.

## Certification

No worker is production-certified from static presence of idempotency alone. Runtime crash/restart evidence is `LIVE REQUIRED` where it cannot be reproduced deterministically in CI.
