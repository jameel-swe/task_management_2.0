# Task Management API + Temporal Workflow Engine

NestJS + PostgreSQL + TypeORM + JWT + Temporal task/project API with an authenticated OpenAI function-calling assistant.

## Run

Copy `.env.example` to `.env`, set `OPENAI_API_KEY`, then run `npm install`, `npm run migration:run`, `npm run seed`, `npm run start:dev`, and `npm run worker` in separate terminals. The AI endpoint is `POST /api/ai/chat`.

## AI assistant backend

`AiModule` is deliberately a thin LLM client layer. It does not introduce CrewAI, an agent graph, or a second business-logic stack. OpenAI receives five strict function schemas: `createTask`, `updateTaskStatus`, `assignTask`, `listTasks`, and `submitForApproval`. The service invokes existing `TasksService` methods directly, so validation, project membership, task ownership, Temporal workflow starts, and audit logging remain in one place.

The global `JwtAuthGuard` protects `/api/ai/chat`. The assistant receives the authenticated user and uses the same authorization paths as REST. Name resolution queries the Users table and asks for clarification when a name is missing or ambiguous. Conversation context is intentionally bounded to the last 12 messages and kept in memory for this demo; move it to Redis or Conversation/Message tables for multi-instance production.

The system prompt restricts the assistant to task-management operations. There is no delete tool: destructive actions require an explicit confirmation turn and are not exposed through chat.

## Why function-calling instead of an agent framework?

This product has five deterministic operations, not an open-ended agent problem. Function calling is cheaper, easier to test, easier to observe, and easier to debug than adding a framework that owns planning, memory, retries, and tool routing. Temporal remains the durable execution layer for approvals and deadline timers; the LLM only selects a narrowly-scoped function.

## Security notes

Never expose `OPENAI_API_KEY` to the browser. The Next.js/Expo client should call this backend endpoint with the user's JWT. Treat tool arguments as untrusted input, keep strict DTO validation enabled, and log tool names and outcomes without logging secrets or raw prompts by default.
