import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { TaskPriority, TaskStatus } from '../common/enums/task.enum';
import { UsersService } from '../users/users.service';
import { TasksService } from '../tasks/tasks.service';
import { TASK_ASSISTANT_TOOLS } from './ai.tools';

type ChatMessage = { role: 'system' | 'user' | 'assistant' | 'tool'; content: string | null; tool_call_id?: string; tool_calls?: any[]; name?: string };
type Conversation = { messages: ChatMessage[]; updatedAt: number };

const SYSTEM_PROMPT = `You are TaskMate, an assistant for this task-management product. Stay strictly within task management: creating, updating status, assigning, listing, and submitting tasks for approval. If asked about anything else, say you can only help with task management. Never claim an action happened unless a tool result confirms it. Ask a concise clarification when required IDs or names are ambiguous. Never delete data through chat. Destructive actions require an explicit confirmation turn; this assistant exposes no delete tool. The logged-in user's permissions are enforced by the application, not by your judgment.`;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly conversations = new Map<string, Conversation>();
  private readonly maxMessages = 12;

  constructor(private readonly config: ConfigService, private readonly tasks: TasksService, private readonly users: UsersService) {}

  async chat(user: AuthenticatedUser, message: string, conversationId = randomUUID()) {
    const conversation = this.getConversation(conversationId);
    conversation.messages.push({ role: 'user', content: message });
    const first = await this.complete(conversation.messages);
    conversation.messages.push(first.message);

    if (!first.message.tool_calls?.length) return { conversationId, reply: first.message.content ?? 'I could not form a response.', actionTaken: null };

    const actions: unknown[] = [];
    for (const call of first.message.tool_calls) {
      let result: unknown;
      try {
        const args = JSON.parse(call.function.arguments);
        result = await this.execute(call.function.name, args, user);
        actions.push({ tool: call.function.name, result });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Action failed';
        result = { error: message };
        actions.push({ tool: call.function.name, error: message });
      }
      conversation.messages.push({ role: 'tool', tool_call_id: call.id, name: call.function.name, content: JSON.stringify(result) });
    }

    const final = await this.complete(conversation.messages);
    conversation.messages.push(final.message);
    return { conversationId, reply: final.message.content ?? 'Done.', actionTaken: actions };
  }

  private async complete(messages: ChatMessage[]) {
    const key = this.config.get<string>('OPENAI_API_KEY') ?? process.env.OPENAI_API_KEY;
    if (!key) throw new BadGatewayException('OPENAI_API_KEY is not configured');
    const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: this.config.get<string>('OPENAI_MODEL') ?? process.env.OPENAI_MODEL ?? 'gpt-4o-mini', temperature: 0.1, messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.slice(-this.maxMessages)], tools: TASK_ASSISTANT_TOOLS, tool_choice: 'auto' }) });
    if (!response.ok) { this.logger.error(`OpenAI returned ${response.status}`); throw new BadGatewayException('OpenAI request failed'); }
    const body = await response.json() as any;
    return body.choices[0].message as { message: ChatMessage };
  }

  private getConversation(id: string) { let conversation = this.conversations.get(id); if (!conversation) { conversation = { messages: [], updatedAt: Date.now() }; this.conversations.set(id, conversation); } conversation.updatedAt = Date.now(); return conversation; }

  private async execute(name: string, args: any, user: AuthenticatedUser) {
    switch (name) {
      case 'createTask': return this.tasks.create({ title: args.title, description: args.description, projectId: args.projectId, assigneeId: await this.resolveUserId(args.assignee), priority: args.priority ?? TaskPriority.MEDIUM, dueDate: args.dueDate ? new Date(args.dueDate) : null }, user);
      case 'updateTaskStatus': return this.tasks.update(args.taskId, { status: args.status as TaskStatus }, user);
      case 'assignTask': return this.tasks.assign(args.taskId, await this.resolveUserId(args.assignee), user);
      case 'listTasks': return this.tasks.list({ ...args, page: 1, limit: 20 }, user);
      case 'submitForApproval': return this.tasks.submitApproval(args.taskId, await this.resolveUserIds(args.approvers), user);
      default: throw new Error(`Unsupported assistant action: ${name}`);
    }
  }

  private async resolveUserId(value: string | null): Promise<string | null> { if (!value) return null; const candidates = await this.users.findCandidates(value); if (candidates.length === 0) throw new Error(`No user found matching “${value}”.`); if (candidates.length > 1) throw new Error(`“${value}” matches multiple users. Ask the user to provide an email.`); return candidates[0].id; }
  private async resolveUserIds(values: string[]) { const ids: string[] = []; for (const value of values) { const id = await this.resolveUserId(value); if (id) ids.push(id); } return ids; }
}
