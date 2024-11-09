import RegisterUserUseCase from './register-user';
import generateUser from '../../domain/models/__test__/generateUser';
import createCore from '../../createCore';

describe('RegisterUserUseCase', () => {
  let core: ReturnType<typeof createCore>;
  let registerUserUseCase: RegisterUserUseCase;

  beforeEach(() => {
    core = createCore();
    registerUserUseCase = core.useCases.registerUser;
  });

  it('executes successfully with valid data', async () => {
    const email = 'unique@example.com';
    const password = 'password123';
    const name = 'John Doe';
    const user = await registerUserUseCase.execute(email, password, name);
    const savedUser = await core.repositories.userRepository.findById(user.id);
    expect(savedUser).toEqual(user);
  });

  it('throws error if email is already taken', async () => {
    const existingUser = generateUser();
    await core.repositories.userRepository.save(existingUser);
    await expect(
      registerUserUseCase.execute(existingUser.email, 'password123', 'John Doe')
    ).rejects.toThrow('Email is already taken');
  });
});
