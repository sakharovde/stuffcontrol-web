import {
  UserPasswordEmptySpecification,
  UserRepository,
  UserUniqueUsernameSpecification,
  UserUsernameEmptySpecification,
} from '../../domain';
import UserService from './user-service.ts';
import { UserRepositoryImpl } from '../../infrastructure';
import generateUser from '../../domain/models/__test__/generateUser.ts';

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
