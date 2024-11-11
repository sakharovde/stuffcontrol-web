import UserRepositoryImpl from './user';
import User from '../../domain/models/user';
import generateUser from '../../domain/models/__test__/generateUser.ts';

describe('UserRepositoryImpl', () => {
  let userRepository: UserRepositoryImpl;

  beforeEach(() => {
    userRepository = new UserRepositoryImpl();
  });

  it('findById returns user when user exists', async () => {
    const user: User = generateUser();
    await userRepository.save(user);

    const result = await userRepository.findById(user.id);
    expect(result).toEqual(user);
  });

  it('findById returns null when user does not exist', async () => {
    const result = await userRepository.findById('2');
    expect(result).toBeNull();
  });

  it('findByEmail returns user when user exists', async () => {
    const user: User = generateUser();
    await userRepository.save(user);

    const result = await userRepository.findByEmail(user.email);
    expect(result).toEqual(user);
  });

  it('findByEmail returns null when user does not exist', async () => {
    const result = await userRepository.findByEmail('nonexistent@example.com');
    expect(result).toBeNull();
  });

  it('save stores the user', async () => {
    const user: User = generateUser();
    await userRepository.save(user);

    const result = await userRepository.findById(user.id);
    expect(result).toEqual(user);
  });

  it('getAllUsers returns all users', async () => {
    const user1: User = generateUser();
    const user2: User = generateUser();
    await userRepository.save(user1);
    await userRepository.save(user2);

    const result = await userRepository['getAllUsers']();
    expect(result).toEqual([user1, user2]);
  });
});
