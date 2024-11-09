import UserRepositoryImpl from './user';
import User from '../../domain/models/user';
import generateUser from '../../domain/models/__test__/generateUser.ts';
import createCore from '../../createCore.ts';

describe('UserRepositoryImpl', () => {
  let core: ReturnType<typeof createCore>;
  let userRepository: UserRepositoryImpl;

  beforeEach(() => {
    core = createCore();
    userRepository = core.repositories.userRepository;
  });

  it('saves user successfully', async () => {
    const user: User = generateUser();
    await userRepository.save(user);
    const savedUser = await userRepository.findById(user.id);
    expect(savedUser).toEqual(user);
  });

  it('finds user by email', async () => {
    const user: User = generateUser();
    await userRepository.save(user);
    const result = await userRepository.findByEmail(user.email);
    expect(result).toEqual(user);
  });

  it('returns null if user not found by email', async () => {
    const result = await userRepository.findByEmail('nonexistent@example.com');
    expect(result).toBeNull();
  });

  it('retrieves all users', async () => {
    const user1: User = generateUser();
    const user2: User = generateUser();
    await userRepository.save(user1);
    await userRepository.save(user2);
    const result = await userRepository['getAllUsers']();
    expect(result).toEqual([user1, user2]);
  });

  it('returns an empty array if no users are stored', async () => {
    const result = await userRepository['getAllUsers']();
    expect(result).toEqual([]);
  });
});
