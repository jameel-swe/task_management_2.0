import { proxyActivities, defineSignal, setHandler, sleep, condition } from '@temporalio/workflow';
import type * as activities from '../activities/task.activities';
const { notifyAssignee, getTaskStatus, escalateToManager, updateTaskStatus } = proxyActivities<typeof activities>({ startToCloseTimeout: '30 seconds', retry: { maximumAttempts: 3, backoffCoefficient: 2, initialInterval: '1 second' } });
export const cancelEscalationSignal = defineSignal('cancelEscalation');
export async function deadlineEscalationWorkflow(taskId: string, dueDateIso: string) {
  let cancelled = false; setHandler(cancelEscalationSignal, () => { cancelled = true; });
  const due = new Date(dueDateIso).getTime(); const reminder = due - Date.now() - 24 * 60 * 60 * 1000;
  if (reminder > 0) await sleep(reminder); if (cancelled) return { status: 'CANCELLED' };
  await notifyAssignee(taskId, '24h remaining');
  const remaining = due - Date.now(); if (remaining > 0) await sleep(remaining); if (cancelled) return { status: 'CANCELLED' };
  if (await getTaskStatus(taskId) !== 'DONE') { await escalateToManager(taskId); await updateTaskStatus(taskId, 'ESCALATED'); return { status: 'ESCALATED' }; }
  return { status: 'DONE' };
}
