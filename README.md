# Task Management API + Temporal Workflow Engine

Production-grade task/project management API built with NestJS, PostgreSQL, TypeORM, JWT, Docker, Swagger, and Temporal.

## Status

Implementation is pushed phase by phase. Migrations are mandatory: TypeORM `synchronize` is disabled.

## Local setup

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL and Temporal (`temporal server start-dev` exposes the UI on `:8233`).
3. Run `npm install`, `npm run migration:run`, `npm run seed`.
4. Run the API with `npm run start:dev` and the worker with `npm run worker`.
5. Open Swagger at `http://localhost:3000/docs`.
