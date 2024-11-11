import UserService from './user.ts';
import UserRepository from '../../domain/repositories/user.ts';
import UniqueEmailSpecification from '../../domain/specifications/user/unique-email.ts';
import UserRepositoryImpl from '../../infrastructure/repositories/user.ts';
import generateUser from '../../domain/models/__test__/generateUser.ts';

describe('UserService', () => {
  let userRepository: UserRepository;
  let uniqueEmailSpec: UniqueEmailSpecification;
  let userService: UserService;

  beforeEach(() => {
    userRepository = new UserRepositoryImpl();
    uniqueEmailSpec = new UniqueEmailSpecification(userRepository);
    userService = new UserService(userRepository, uniqueEmailSpec);
  });

  it('registers a user successfully', async () => {
    const result = await userService.registerUser(
      'test@example.com',
      'password',
      'Test User'
    );
    expect(result).toEqual(
      expect.objectContaining({
        email: 'test@example.com',
        name: 'Test User',
      })
    );
  });

  it('throws an error when email is already taken', async () => {
    const user = generateUser();
    await userRepository.save(user);

    await expect(
      userService.registerUser(user.email, 'password', 'Test User')
    ).rejects.toThrow('Email is already taken');
  });

  it('throws an error when name is empty', async () => {
    await expect(
      userService.registerUser('test@example.com', 'password', '')
    ).rejects.toThrow('Name cannot be empty');
  });
});
