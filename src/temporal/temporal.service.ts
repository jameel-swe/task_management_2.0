import { Inject, Injectable } from '@nestjs/common';
import { Client } from '@temporalio/client';
import { taskApprovalWorkflow, submitApprovalSignal, getApprovalStatusQuery } from './workflows/approval.workflow';
import { deadlineEscalationWorkflow, cancelEscalationSignal } from './workflows/deadline.workflow';
@Injectable()
export class TemporalService {
  constructor(@Inject('TEMPORAL_CLIENT') private readonly client: Client) {}
  async startApproval(taskId: string, approverIds: string[]) { const id = `task-approval-${taskId}`; await this.client.workflow.start(taskApprovalWorkflow, { taskQueue: 'task-management', workflowId: id, args: [taskId, approverIds] }); return id; }
  async signalApproval(id: string, decision: string, comment?: string) { await this.client.workflow.getHandle(id).signal(submitApprovalSignal, decision, comment); }
  async queryApproval(id: string) { return this.client.workflow.getHandle(id).query(getApprovalStatusQuery); }
  async startDeadline(taskId: string, dueDate: Date) { const id = `task-deadline-${taskId}`; await this.client.workflow.start(deadlineEscalationWorkflow, { taskQueue: 'task-management', workflowId: id, args: [taskId, dueDate.toISOString()] }); return id; }
  async cancelDeadline(id: string) { await this.client.workflow.getHandle(id).signal(cancelEscalationSignal); }
}
