import generateUser from '../../domain/models/__test__/generateUser.ts';
import UserRepositoryImpl from './user-repository.ts';
import { User } from '../../domain';

describe('UserRepositoryImpl', () => {
  let userRepository: UserRepositoryImpl;
  let user: User;

  beforeEach(() => {
    userRepository = new UserRepositoryImpl();
    user = generateUser();
  });

  it('saves a user successfully', async () => {
    const result = await userRepository.save(user);
    expect(result).toEqual(user);
  });

  it('finds a user by id', async () => {
    await userRepository.save(user);
    const result = await userRepository.findById(user.id);
    expect(result).toEqual(user);
  });

  it('returns null when user id is not found', async () => {
    const result = await userRepository.findById('2');
    expect(result).toBeNull();
  });

  it('finds a user by username', async () => {
    await userRepository.save(user);
    const result = await userRepository.findByUsername(user.username);
    expect(result).toEqual(user);
  });

  it('returns null when username is not found', async () => {
    const result = await userRepository.findByUsername('nonexistentuser');
    expect(result).toBeNull();
  });

  it('returns all users', async () => {
    const user2 = generateUser();
    await userRepository.save(user);
    await userRepository.save(user2);
    const result = await userRepository['getAllUsers']();
    expect(result).toEqual([user, user2]);
  });
});
