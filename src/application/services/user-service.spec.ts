import UserService from './user-service.ts';
import UserRepository from '../../domain/repositories/user-repository.ts';
import UserUniqueUsernameSpecification from '../../domain/specifications/user-username-unique-specification.ts';
import UserRepositoryImpl from '../../infrastructure/repositories/user-repository.ts';
import generateUser from '../../domain/models/__test__/generateUser.ts';
import UserUsernameEmptySpecification from '../../domain/specifications/user-username-empty-specification.ts';
import UserPasswordEmptySpecification from '../../domain/specifications/user-password-empty-specification.ts';

describe('UserService', () => {
  let userRepository: UserRepository;
  let uniqueUsernameSpec: UserUniqueUsernameSpecification;
  let usernameEmptySpec: UserUsernameEmptySpecification;
  let passwordEmptySpec: UserPasswordEmptySpecification;
  let userService: UserService;

  beforeEach(() => {
    userRepository = new UserRepositoryImpl();
    uniqueUsernameSpec = new UserUniqueUsernameSpecification(userRepository);
    usernameEmptySpec = new UserUsernameEmptySpecification();
    passwordEmptySpec = new UserPasswordEmptySpecification();
    userService = new UserService(userRepository, uniqueUsernameSpec, usernameEmptySpec, passwordEmptySpec);
  });

  it('registers a user successfully', async () => {
    const result = await userService.registerUser('test@example.com', 'password');
    expect(result).toEqual(
      expect.objectContaining({
        username: 'test@example.com',
      })
    );
  });

  it('throws an error when email is already taken', async () => {
    const user = generateUser();
    await userRepository.save(user);

    await expect(userService.registerUser(user.username, 'password')).rejects.toThrow('Username is already taken');
  });

  it('throws an error when name is empty', async () => {
    await expect(userService.registerUser('', 'password')).rejects.toThrow('Username cannot be empty');
  });
});
