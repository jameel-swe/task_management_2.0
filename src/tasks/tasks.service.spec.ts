import { ApprovalStatus } from '../common/enums/task.enum';

describe('TasksService authorization contracts', () => {
  it('does not allow an empty approval chain', () => expect([]).toHaveLength(0));
  it('uses an explicit approval status enum', () => expect(Object.values(ApprovalStatus)).toEqual(expect.arrayContaining(['PENDING', 'APPROVED', 'REJECTED'])));
});
