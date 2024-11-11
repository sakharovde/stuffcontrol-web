import UserRepository from '../../domain/repositories/user.ts';
import User from '../../domain/models/user.ts';
import LocalForageFactory from '../factories/localforage.ts';

export default class UserRepositoryImpl implements UserRepository {
  private readonly client = LocalForageFactory.createInstance({
    name: 'users',
    storeName: 'users',
    description: 'Database for users',
  });

  async findById(id: User['id']): Promise<User | null> {
    const users: User[] = await this.getAllUsers();
    return users.find((user) => user.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const users: User[] = await this.getAllUsers();
    return users.find((user) => user.email === email) || null;
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
