import { proxyActivities, defineSignal, defineQuery, setHandler, condition } from '@temporalio/workflow';
import type * as activities from '../activities/task.activities';
const { notifyApprover, recordApprovalDecision, updateTaskStatus } = proxyActivities<typeof activities>({ startToCloseTimeout: '30 seconds', retry: { maximumAttempts: 3, backoffCoefficient: 2, initialInterval: '1 second' } });
export const submitApprovalSignal = defineSignal<[string, string | undefined]>('submitApproval');
export const getApprovalStatusQuery = defineQuery<{ current: number; decisions: string[] }>('getApprovalStatus');
export async function taskApprovalWorkflow(taskId: string, approverIds: string[]) {
  let current = 0; const decisions: string[] = [];
  setHandler(getApprovalStatusQuery, () => ({ current, decisions }));
  for (const approverId of approverIds) {
    await notifyApprover(approverId, taskId);
    let decision: string | undefined; let comment: string | undefined;
    setHandler(submitApprovalSignal, (next, note) => { decision = next; comment = note; });
    await condition(() => Boolean(decision));
    decisions.push(decision!);
    await recordApprovalDecision(taskId, approverId, decision!, comment);
    if (decision === 'REJECTED') { await updateTaskStatus(taskId, 'IN_PROGRESS'); return { status: 'REJECTED', decisions }; }
    current++;
  }
  await updateTaskStatus(taskId, 'APPROVED'); return { status: 'APPROVED', decisions };
}
