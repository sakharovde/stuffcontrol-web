import UserService from '../services/user.ts';
import RegisterUserUseCase from './register-user.ts';
import User from '../../domain/models/user.ts';
import generateUser from '../../domain/models/__test__/generateUser.ts';
import UserRepositoryImpl from '../../infrastructure/repositories/user.ts';
import UniqueEmailSpecification from '../../domain/specifications/user/unique-email.ts';
import UserRepository from '../../domain/repositories/user.ts';

describe('RegisterUserUseCase', () => {
  let userRepository: UserRepository;
  let userService: UserService;
  let registerUserUseCase: RegisterUserUseCase;

  beforeEach(() => {
    userRepository = new UserRepositoryImpl();
    userService = new UserService(
      userRepository,
      new UniqueEmailSpecification(userRepository)
    );
    registerUserUseCase = new RegisterUserUseCase(userService);
  });

  it('registers a user successfully', async () => {
    const user: User = generateUser();
    vi.spyOn(userService, 'registerUser').mockResolvedValue(user);

    const result = await registerUserUseCase.execute(
      'test@example.com',
      'password',
      'Test User'
    );
    expect(result).toEqual(user);
  });

  it('throws an error when email is already taken', async () => {
    vi.spyOn(userService, 'registerUser').mockRejectedValue(
      new Error('Email already taken')
    );

    await expect(
      registerUserUseCase.execute('test@example.com', 'password', 'Test User')
    ).rejects.toThrow('Email already taken');
  });

  it('throws an error when password is too weak', async () => {
    vi.spyOn(userService, 'registerUser').mockRejectedValue(
      new Error('Password too weak')
    );

    await expect(
      registerUserUseCase.execute('test@example.com', '123', 'Test User')
    ).rejects.toThrow('Password too weak');
  });

  it('throws an error when name is empty', async () => {
    vi.spyOn(userService, 'registerUser').mockRejectedValue(
      new Error('Name cannot be empty')
    );

    await expect(
      registerUserUseCase.execute('test@example.com', 'password', '')
    ).rejects.toThrow('Name cannot be empty');
  });
});
