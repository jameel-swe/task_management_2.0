import { TaskPriority, TaskStatus } from '../common/enums/task.enum';

/**
 * JSON schemas are strict on purpose. Optional values are represented as null
 * so the model cannot invent an extra property that bypasses DTO validation.
 */
export const TASK_ASSISTANT_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'createTask',
      description: 'Create one task in a project. The caller must be a project member.',
      strict: true,
      parameters: { type: 'object', additionalProperties: false, properties: { title: { type: 'string' }, description: { type: ['string', 'null'] }, projectId: { type: 'string' }, assignee: { type: ['string', 'null'], description: 'User name, email, or UUID.' }, priority: { type: ['string', 'null'], enum: [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH, TaskPriority.URGENT, null] }, dueDate: { type: ['string', 'null'], description: 'ISO-8601 timestamp.' } }, required: ['title', 'description', 'projectId', 'assignee', 'priority', 'dueDate'] }
    }
  },
  {
    type: 'function',
    function: {
      name: 'updateTaskStatus', description: 'Update the status of an existing task.', strict: true,
      parameters: { type: 'object', additionalProperties: false, properties: { taskId: { type: 'string' }, status: { type: 'string', enum: Object.values(TaskStatus) } }, required: ['taskId', 'status'] }
    }
  },
  {
    type: 'function',
    function: {
      name: 'assignTask', description: 'Assign an existing task to a project member.', strict: true,
      parameters: { type: 'object', additionalProperties: false, properties: { taskId: { type: 'string' }, assignee: { type: 'string', description: 'User name, email, or UUID.' } }, required: ['taskId', 'assignee'] }
    }
  },
  {
    type: 'function',
    function: {
      name: 'listTasks', description: 'List tasks visible to the logged-in user with filters.', strict: true,
      parameters: { type: 'object', additionalProperties: false, properties: { status: { type: ['string', 'null'], enum: [...Object.values(TaskStatus), null] }, priority: { type: ['string', 'null'], enum: [...Object.values(TaskPriority), null] }, projectId: { type: ['string', 'null'] }, assigneeId: { type: ['string', 'null'] }, search: { type: ['string', 'null'] }, dueBefore: { type: ['string', 'null'] }, dueAfter: { type: ['string', 'null'] } }, required: ['status', 'priority', 'projectId', 'assigneeId', 'search', 'dueBefore', 'dueAfter'] }
    }
  },
  {
    type: 'function',
    function: {
      name: 'submitForApproval', description: 'Submit an existing task to a sequential approval chain.', strict: true,
      parameters: { type: 'object', additionalProperties: false, properties: { taskId: { type: 'string' }, approvers: { type: 'array', items: { type: 'string' }, minItems: 1 } }, required: ['taskId', 'approvers'] }
    }
  }
] as const;
