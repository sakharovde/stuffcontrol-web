import UserUniqueUsernameSpecification from './user-username-unique-specification.ts';
import User from '../models/user.ts';
import UserRepositoryImpl from '../../infrastructure/repositories/user-repository.ts';
import generateUser from '../models/__test__/generateUser.ts';
import UserRepository from '../repositories/user-repository.ts';

describe('UniqueUsernameSpecification', () => {
  let userRepository: UserRepository;
  let uniqueEmailSpec: UserUniqueUsernameSpecification;

  beforeEach(() => {
    userRepository = new UserRepositoryImpl();
    uniqueEmailSpec = new UserUniqueUsernameSpecification(userRepository);
  });

  it('returns true when email is unique', async () => {
    const result = await uniqueEmailSpec.isSatisfiedBy('unique@example.com');
    expect(result).toBe(true);
  });

  it('returns false when email is not unique', async () => {
    const user: User = generateUser();
    await userRepository.save(user);

    const result = await uniqueEmailSpec.isSatisfiedBy(user.username);
    expect(result).toBe(false);
  });

  it('handles repository errors gracefully', async () => {
    vi.spyOn(userRepository, 'findByUsername').mockRejectedValue(new Error('Repository error'));

    await expect(uniqueEmailSpec.isSatisfiedBy('error@example.com')).rejects.toThrow('Repository error');
  });
});
