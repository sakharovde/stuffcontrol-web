import UniqueEmailSpecification from './unique-email';
import UserRepository from '../../repositories/user';
import UserRepositoryImpl from '../../../infrastructure/repositories/user.ts';
import generateUser from '../../models/__test__/generateUser.ts';
import createCore from '../../../createCore.ts';

describe('UniqueEmailSpecification', () => {
  let core: ReturnType<typeof createCore>;
  let userRepository: UserRepository;
  let uniqueEmailSpecification: UniqueEmailSpecification;

  beforeEach(async () => {
    core = createCore();
    userRepository = core.repositories.userRepository;
    uniqueEmailSpecification = core.specifications.user.uniqueEmail;
  });

  it('returns true if email is unique', async () => {
    const result =
      await uniqueEmailSpecification.isSatisfiedBy('unique@example.com');
    expect(result).toBe(true);
  });

  it('returns false if email is not unique', async () => {
    const user = generateUser();
    await userRepository.save(user);
    const result = await uniqueEmailSpecification.isSatisfiedBy(user.email);
    expect(result).toBe(false);
  });

  it('handles repository errors gracefully', async () => {
    // Simulate an error by using an invalid storage instance
    const invalidUserRepository = new UserRepositoryImpl(null as never);
    const invalidUniqueEmailSpecification = new UniqueEmailSpecification(
      invalidUserRepository
    );
    await expect(
      invalidUniqueEmailSpecification.isSatisfiedBy('error@example.com')
    ).rejects.toThrow();
  });
});
