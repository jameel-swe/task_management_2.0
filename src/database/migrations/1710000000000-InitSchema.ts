import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1710000000000 implements MigrationInterface {
  name = 'InitSchema1710000000000';
  async up(q: QueryRunner): Promise<void> {
    await q.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await q.query(`CREATE TYPE "users_role_enum" AS ENUM ('ADMIN','PROJECT_MANAGER','DEVELOPER','VIEWER')`);
    await q.query(`CREATE TYPE "project_members_role_in_project_enum" AS ENUM ('OWNER','MANAGER','CONTRIBUTOR','VIEWER')`);
    await q.query(`CREATE TYPE "tasks_status_enum" AS ENUM ('TODO','IN_PROGRESS','IN_REVIEW','APPROVED','DONE','ESCALATED')`);
    await q.query(`CREATE TYPE "tasks_priority_enum" AS ENUM ('LOW','MEDIUM','HIGH','URGENT')`);
    await q.query(`CREATE TYPE "task_approvals_status_enum" AS ENUM ('PENDING','APPROVED','REJECTED')`);
    await q.query(`CREATE TABLE "users" ("id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(), "email" varchar(255) UNIQUE NOT NULL, "password_hash" varchar(255) NOT NULL, "name" varchar(120) NOT NULL, "role" "users_role_enum" NOT NULL DEFAULT 'DEVELOPER', "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now())`);
    await q.query(`CREATE TABLE "projects" ("id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(), "name" varchar(160) NOT NULL, "description" text, "owner_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT, "created_at" timestamptz NOT NULL DEFAULT now(), "deleted_at" timestamptz)`);
    await q.query(`CREATE TABLE "project_members" ("id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(), "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE, "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE, "role_in_project" "project_members_role_in_project_enum" NOT NULL DEFAULT 'CONTRIBUTOR', "created_at" timestamptz NOT NULL DEFAULT now(), UNIQUE("project_id","user_id"))`);
    await q.query(`CREATE TABLE "tasks" ("id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(), "title" varchar(200) NOT NULL, "description" text, "status" "tasks_status_enum" NOT NULL DEFAULT 'TODO', "priority" "tasks_priority_enum" NOT NULL DEFAULT 'MEDIUM', "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE, "assignee_id" uuid REFERENCES "users"("id") ON DELETE SET NULL, "due_date" timestamptz, "approval_workflow_id" varchar(255), "escalation_workflow_id" varchar(255), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "deleted_at" timestamptz)`);
    await q.query(`CREATE INDEX "idx_tasks_status_priority" ON "tasks"("status","priority")`);
    await q.query(`CREATE INDEX "idx_tasks_project_id" ON "tasks"("project_id")`);
    await q.query(`CREATE INDEX "idx_tasks_assignee_id" ON "tasks"("assignee_id")`);
    await q.query(`CREATE INDEX "idx_tasks_due_date" ON "tasks"("due_date")`);
    await q.query(`CREATE INDEX "idx_tasks_search_tsv" ON "tasks" USING GIN (to_tsvector('english', coalesce("title",'') || ' ' || coalesce("description",'')))`);
    await q.query(`CREATE TABLE "task_approvals" ("id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(), "task_id" uuid NOT NULL REFERENCES "tasks"("id") ON DELETE CASCADE, "approver_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE, "status" "task_approvals_status_enum" NOT NULL DEFAULT 'PENDING', "step_order" int NOT NULL DEFAULT 0, "comment" text, "decided_at" timestamptz, "created_at" timestamptz NOT NULL DEFAULT now())`);
    await q.query(`CREATE INDEX "idx_task_approvals_task_id" ON "task_approvals"("task_id")`);
    await q.query(`CREATE TABLE "activity_logs" ("id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(), "task_id" uuid NOT NULL REFERENCES "tasks"("id") ON DELETE CASCADE, "user_id" uuid, "action" varchar(80) NOT NULL, "old_value" text, "new_value" text, "created_at" timestamptz NOT NULL DEFAULT now())`);
    await q.query(`CREATE INDEX "idx_activity_logs_task_id_created_at" ON "activity_logs"("task_id","created_at")`);
    await q.query(`CREATE TABLE "refresh_tokens" ("id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE, "token_hash" varchar(128) NOT NULL, "expires_at" timestamptz NOT NULL, "revoked" boolean NOT NULL DEFAULT false, "created_at" timestamptz NOT NULL DEFAULT now())`);
    await q.query(`CREATE INDEX "idx_refresh_tokens_token_hash" ON "refresh_tokens"("token_hash")`);
  }
  async down(q: QueryRunner): Promise<void> {
    for (const table of ['refresh_tokens','activity_logs','task_approvals','tasks','project_members','projects','users']) await q.query(`DROP TABLE "${table}"`);
    for (const type of ['task_approvals_status_enum','tasks_priority_enum','tasks_status_enum','project_members_role_in_project_enum','users_role_enum']) await q.query(`DROP TYPE "${type}"`);
  }
}
