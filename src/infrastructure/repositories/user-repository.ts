import UserRepository from '../../domain/repositories/user-repository.ts';
import User from '../../domain/models/user.ts';
import LocalForageFactory from '../factories/localforage-factory.ts';

export default class UserRepositoryImpl implements UserRepository {
  private readonly client = LocalForageFactory.createInstance({
    name: 'users',
    storeName: 'v1',
    description: 'Database for users',
  });

  async findById(id: User['id']): Promise<User | null> {
    const users: User[] = await this.getAllUsers();
    return users.find((user) => user.id === id) || null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const users: User[] = await this.getAllUsers();
    return users.find((user) => user.username === username) || null;
  }

  save(user: User): Promise<User> {
    return this.client.setItem(user.id, user);
  }

  private async getAllUsers(): Promise<User[]> {
    const users: User[] = [];
    await this.client.iterate((value) => {
      users.push(value as User);
    });
    return users;
  }
}
