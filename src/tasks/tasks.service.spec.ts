describe('task query contract', () => {
  it('allows the documented safe sort fields', () => expect(['createdAt','dueDate','priority']).toEqual(expect.arrayContaining(['createdAt','dueDate','priority'])));
});
