import UserService from './user';
import UserRepositoryImpl from '../../infrastructure/repositories/user';
import generateUser from '../../domain/models/__test__/generateUser';
import createCore from '../../createCore';

describe('UserService', () => {
  let core: ReturnType<typeof createCore>;
  let userRepository: UserRepositoryImpl;
  let userService: UserService;

  beforeEach(() => {
    core = createCore();
    userRepository = core.repositories.userRepository;
    userService = core.services.userService;
  });

  it('registers user successfully', async () => {
    const email = 'unique@example.com';
    const password = 'password123';
    const name = 'John Doe';
    const user = await userService.registerUser(email, password, name);
    const savedUser = await userRepository.findById(user.id);
    expect(savedUser).toEqual(user);
  });

  it('throws error if email is already taken', async () => {
    const existingUser = generateUser();
    await userRepository.save(existingUser);
    await expect(
      userService.registerUser(existingUser.email, 'password123', 'John Doe')
    ).rejects.toThrow('Email is already taken');
  });
});
