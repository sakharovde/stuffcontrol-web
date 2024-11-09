import User from '../models/user.ts';

export default interface UserRepository {
  findById(id: User['id']): Promise<User | null>;
  findByEmail(email: User['email']): Promise<User | null>;
  save(user: User): Promise<User>;
}
