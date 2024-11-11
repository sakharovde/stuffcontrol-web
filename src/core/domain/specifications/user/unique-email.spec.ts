import UniqueEmailSpecification from './unique-email';
import User from '../../models/user';
import UserRepositoryImpl from '../../../infrastructure/repositories/user';
import generateUser from '../../models/__test__/generateUser.ts';
import UserRepository from '../../repositories/user.ts';

describe('UniqueEmailSpecification', () => {
  let userRepository: UserRepository;
  let uniqueEmailSpec: UniqueEmailSpecification;

  beforeEach(() => {
    userRepository = new UserRepositoryImpl();
    uniqueEmailSpec = new UniqueEmailSpecification(userRepository);
  });

  it('returns true when email is unique', async () => {
    const result = await uniqueEmailSpec.isSatisfiedBy('unique@example.com');
    expect(result).toBe(true);
  });

  it('returns false when email is not unique', async () => {
    const user: User = generateUser();
    await userRepository.save(user);

    const result = await uniqueEmailSpec.isSatisfiedBy(user.email);
    expect(result).toBe(false);
  });

  it('handles repository errors gracefully', async () => {
    vi.spyOn(userRepository, 'findByEmail').mockRejectedValue(
      new Error('Repository error')
    );

    await expect(
      uniqueEmailSpec.isSatisfiedBy('error@example.com')
    ).rejects.toThrow('Repository error');
  });
});
