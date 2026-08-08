import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@temporalio/client';
import { taskApprovalWorkflow, submitApprovalSignal, getApprovalStatusQuery } from './workflows/approval.workflow';
import { deadlineEscalationWorkflow, cancelEscalationSignal } from './workflows/deadline.workflow';

@Injectable()
export class TemporalService {
  private readonly taskQueue: string;
  constructor(@Inject('TEMPORAL_CLIENT') private readonly client: Client, config: ConfigService) {
    this.taskQueue = config.get<string>('temporal.taskQueue') ?? 'task-management';
  }
  async startApproval(taskId: string, approverIds: string[]) {
    const workflowId = `task-approval-${taskId}`;
    await this.client.workflow.start(taskApprovalWorkflow, { taskQueue: this.taskQueue, workflowId, args: [taskId, approverIds] });
    return workflowId;
  }
  async signalApproval(workflowId: string, decision: string, comment?: string) { return this.client.workflow.getHandle(workflowId).signal(submitApprovalSignal, decision, comment); }
  async queryApproval(workflowId: string) { return this.client.workflow.getHandle(workflowId).query(getApprovalStatusQuery); }
  async startDeadline(taskId: string, dueDate: Date) {
    const workflowId = `task-deadline-${taskId}`;
    await this.client.workflow.start(deadlineEscalationWorkflow, { taskQueue: this.taskQueue, workflowId, args: [taskId, dueDate.toISOString()] });
    return workflowId;
  }
  async cancelDeadline(workflowId: string) { return this.client.workflow.getHandle(workflowId).signal(cancelEscalationSignal); }
}
