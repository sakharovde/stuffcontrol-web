import RegisterUser from './register-user.ts';
import UserService from '../../services/user-service.ts';
import UserRepository from '../../../domain/repositories/user-repository.ts';
import UserUniqueUsernameSpecification from '../../../domain/specifications/user-username-unique-specification.ts';
import UserRepositoryImpl from '../../../infrastructure/repositories/user-repository.ts';
import generateUser from '../../../domain/models/__test__/generateUser.ts';
import UserUsernameEmptySpecification from '../../../domain/specifications/user-username-empty-specification.ts';
import UserPasswordEmptySpecification from '../../../domain/specifications/user-password-empty-specification.ts';

describe('RegisterUser', () => {
  let userRepository: UserRepository;
  let uniqueUsernameSpec: UserUniqueUsernameSpecification;
  let usernameEmptySpec: UserUsernameEmptySpecification;
  let passwordEmptySpec: UserPasswordEmptySpecification;
  let userService: UserService;
  let registerUserUseCase: RegisterUser;

  beforeEach(() => {
    userRepository = new UserRepositoryImpl();
    uniqueUsernameSpec = new UserUniqueUsernameSpecification(userRepository);
    usernameEmptySpec = new UserUsernameEmptySpecification();
    passwordEmptySpec = new UserPasswordEmptySpecification();
    userService = new UserService(userRepository, uniqueUsernameSpec, usernameEmptySpec, passwordEmptySpec);
    registerUserUseCase = new RegisterUser(userService);
  });

  it('executes successfully with valid username and password', async () => {
    const result = await registerUserUseCase.execute('testuser', 'password');
    expect(result).toEqual(
      expect.objectContaining({
        username: 'testuser',
      })
    );
  });

  it('throws an error when username is already taken', async () => {
    const user = generateUser();
    await userRepository.save(user);

    await expect(registerUserUseCase.execute(user.username, 'password')).rejects.toThrow('Username is already taken');
  });

  it('throws an error when username is empty', async () => {
    await expect(registerUserUseCase.execute('', 'password')).rejects.toThrow('Username cannot be empty');
  });

  it('throws an error when password is empty', async () => {
    await expect(registerUserUseCase.execute('testuser', '')).rejects.toThrow('Password cannot be empty');
  });
});
