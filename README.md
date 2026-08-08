# Task Management API + Temporal Workflow Engine

NestJS + PostgreSQL + TypeORM + JWT + Temporal task/project API.

## Build and run

Copy `.env.example` to `.env`, then run `npm install`, `npm run migration:run`, `npm run seed`, `npm run start:dev`, and `npm run worker` in separate terminals. Docker uses `npm install` in the build stages because this repository intentionally does not commit a lockfile yet; generate and commit one with Node/npm before production deployment.

## Hardening notes

- Global validation rejects non-whitelisted request fields.
- Task mutation routes use `TaskAccessGuard`; approval decisions verify the assigned `approverId` and reject duplicate decisions.
- Assignees and approvers must already be members of the project.
- Workflow status checks enforce project membership.
- The Temporal worker initializes the TypeORM DataSource before registering activities.
- Empty approval chains and arbitrary decision strings are rejected.
