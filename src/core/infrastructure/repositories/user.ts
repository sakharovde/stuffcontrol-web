import UserRepository from '../../domain/repositories/user.ts';
import User from '../../domain/models/user.ts';

export default class UserRepositoryImpl implements UserRepository {
  constructor(private readonly storage: LocalForage) {}

  async findById(id: User['id']): Promise<User | null> {
    const users: User[] = await this.getAllUsers();
    return users.find((user) => user.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const users: User[] = await this.getAllUsers();
    return users.find((user) => user.email === email) || null;
  }

  save(user: User): Promise<User> {
    return this.storage.setItem(user.id, user);
  }

  private async getAllUsers(): Promise<User[]> {
    const users: User[] = [];
    await this.storage.iterate((value) => {
      users.push(value as User);
    });
    return users;
  }
}
