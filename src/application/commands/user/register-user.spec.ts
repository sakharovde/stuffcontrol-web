import {
  UserPasswordEmptySpecification,
  UserRepository,
  UserUniqueUsernameSpecification,
  UserUsernameEmptySpecification,
} from '../../../domain';
import { UserRepositoryImpl } from '../../../infrastructure';
import generateUser from '../../../domain/models/__test__/generateUser.ts';
import UserService from '../../services/user-service.ts';
import RegisterUserCommandHandler from './register-user.ts';

describe('RegisterUserCommandHandler', () => {
  let userRepository: UserRepository;
  let uniqueUsernameSpec: UserUniqueUsernameSpecification;
  let usernameEmptySpec: UserUsernameEmptySpecification;
  let passwordEmptySpec: UserPasswordEmptySpecification;
  let userService: UserService;
  let registerUserCommandHandler: RegisterUserCommandHandler;

  beforeEach(() => {
    userRepository = new UserRepositoryImpl();
    uniqueUsernameSpec = new UserUniqueUsernameSpecification(userRepository);
    usernameEmptySpec = new UserUsernameEmptySpecification();
    passwordEmptySpec = new UserPasswordEmptySpecification();
    userService = new UserService(userRepository, uniqueUsernameSpec, usernameEmptySpec, passwordEmptySpec);
    registerUserCommandHandler = new RegisterUserCommandHandler(userService);
  });

  it('executes successfully with valid username and password', async () => {
    const result = await registerUserCommandHandler.execute({ username: 'testuser', password: 'password' });
    expect(result).toEqual(
      expect.objectContaining({
        username: 'testuser',
      })
    );
  });

  it('throws an error when username is already taken', async () => {
    const user = generateUser();
    await userRepository.save(user);

    await expect(registerUserCommandHandler.execute({ username: user.username, password: 'password' })).rejects.toThrow(
      'Username is already taken'
    );
  });

  it('throws an error when username is empty', async () => {
    await expect(registerUserCommandHandler.execute({ username: '', password: 'password' })).rejects.toThrow(
      'Username cannot be empty'
    );
  });

  it('throws an error when password is empty', async () => {
    await expect(registerUserCommandHandler.execute({ username: 'testuser', password: '' })).rejects.toThrow(
      'Password cannot be empty'
    );
  });
});
