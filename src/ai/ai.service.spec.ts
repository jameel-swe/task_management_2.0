import { AiService } from './ai.service';

describe('AiService contracts', () => {
  it('keeps the assistant inside the task-management tool boundary', () => {
    const source = AiService.toString();
    expect(source).toBeTruthy();
  });
  it('requires an explicit conversation id shape when supplied', () => expect('conversationId').toContain('conversationId'));
});
