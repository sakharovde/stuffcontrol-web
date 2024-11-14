import UserService from './user.ts';
import UserRepository from '../../domain/repositories/user.ts';
import UniqueUsernameSpecification from '../../domain/specifications/user/username-unique.ts';
import UserRepositoryImpl from '../../infrastructure/repositories/user.ts';
import generateUser from '../../domain/models/__test__/generateUser.ts';
import UsernameEmptySpecification from '../../domain/specifications/user/username-empty.ts';
import PasswordEmptySpecification from '../../domain/specifications/user/password-empty.ts';

describe('UserService', () => {
  let userRepository: UserRepository;
  let uniqueUsernameSpec: UniqueUsernameSpecification;
  let usernameEmptySpec: UsernameEmptySpecification;
  let passwordEmptySpec: PasswordEmptySpecification;
  let userService: UserService;

  beforeEach(() => {
    userRepository = new UserRepositoryImpl();
    uniqueUsernameSpec = new UniqueUsernameSpecification(userRepository);
    usernameEmptySpec = new UsernameEmptySpecification();
    passwordEmptySpec = new PasswordEmptySpecification();
    userService = new UserService(
      userRepository,
      uniqueUsernameSpec,
      usernameEmptySpec,
      passwordEmptySpec
    );
  });

  it('registers a user successfully', async () => {
    const result = await userService.registerUser(
      'test@example.com',
      'password'
    );
    expect(result).toEqual(
      expect.objectContaining({
        username: 'test@example.com',
      })
    );
  });

  it('throws an error when email is already taken', async () => {
    const user = generateUser();
    await userRepository.save(user);

    await expect(
      userService.registerUser(user.username, 'password')
    ).rejects.toThrow('Username is already taken');
  });

  it('throws an error when name is empty', async () => {
    await expect(userService.registerUser('', 'password')).rejects.toThrow(
      'Username cannot be empty'
    );
  });
});
