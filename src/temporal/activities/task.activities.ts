import { AppDataSource } from '../../database/data-source';
import { Task, TaskApproval, ActivityLog } from '../../entities';
import { TaskStatus, ApprovalStatus } from '../../common/enums/task.enum';
const flaky = () => process.env.DEMO_FLAKY_ACTIVITIES === 'true' && Math.random() < 0.2;
export async function notifyApprover(approverId: string, taskId: string) { if (flaky()) throw new Error('simulated transient notification failure'); console.log(`notify approver ${approverId} for task ${taskId}`); }
export async function notifyAssignee(taskId: string, message: string) { if (flaky()) throw new Error('simulated transient notification failure'); console.log(`notify assignee for ${taskId}: ${message}`); }
export async function recordApprovalDecision(taskId: string, approverId: string, decision: string, comment?: string) { const repo = AppDataSource.getRepository(TaskApproval); const row = await repo.findOne({ where: { taskId, approverId, status: ApprovalStatus.PENDING } }); if (row) { row.status = decision as ApprovalStatus; row.comment = comment ?? null; row.decidedAt = new Date(); await repo.save(row); } }
export async function updateTaskStatus(taskId: string, status: string) { const repo = AppDataSource.getRepository(Task); await repo.update(taskId, { status: status as TaskStatus }); await AppDataSource.getRepository(ActivityLog).save({ taskId, userId: null, action: 'workflow.task_status_changed', oldValue: null, newValue: status }); }
export async function getTaskStatus(taskId: string) { const task = await AppDataSource.getRepository(Task).findOneBy({ id: taskId }); return task?.status ?? 'UNKNOWN'; }
export async function escalateToManager(taskId: string) { await AppDataSource.getRepository(ActivityLog).save({ taskId, userId: null, action: 'workflow.deadline_escalated', oldValue: null, newValue: 'manager_notified' }); }
