import { BCRYPT_SALT_ROUNDS } from './constants';

describe('auth contract', () => {
  it('uses bcrypt salt rounds 10 for password hashing', () => expect(BCRYPT_SALT_ROUNDS).toBe(10));
});
