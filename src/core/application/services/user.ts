import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import UserRepository from '../../domain/repositories/user.ts';
import UniqueEmailSpecification from '../../domain/specifications/user/unique-email.ts';
import User from '../../domain/models/user.ts';

export default class UserService {
  constructor(
    private userRepository: UserRepository,
    private uniqueEmailSpec: UniqueEmailSpecification
  ) {}

  async registerUser(email: string, password: string): Promise<User> {
    const isUnique = await this.uniqueEmailSpec.isSatisfiedBy(email);
    if (!isUnique) {
      throw new Error('Email is already taken');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User(uuidv4(), email, passwordHash);

    await this.userRepository.save(user);
    return user;
  }
}
