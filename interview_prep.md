# Interview prep

I built this to go deeper on Temporal beyond what I use day-to-day at BootLabs: implemented signals, queries, and long-running timers for a deadline-escalation flow, and tested the workflow logic in isolation using Temporal's test environment.

## Why Temporal instead of cron/BullMQ?

Cron and queue consumers can trigger work, but they require custom persistence for timer state, retries, deduplication, cancellation, and recovery. Temporal persists workflow history, replays deterministic workflow code, retries activities, and lets approval chains wait for days without a process holding memory.

## Why a separate worker?

Workers execute workflow/activity code and need independent scaling and failure isolation from the API. The API handles HTTP and authorization; the worker handles durable execution.

## Production follow-ups

Use Temporal Cloud, a secrets manager, structured logs and tracing, real notification integrations, stricter DTOs, contract tests, automated migrations in deployment, and CI with Postgres/Temporal service containers.
