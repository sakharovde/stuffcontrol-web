import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import UserRepository from '../../domain/repositories/user.ts';
import UniqueUsernameSpecification from '../../domain/specifications/user/username-unique.ts';
import User from '../../domain/models/user.ts';
import UsernameEmptySpecification from '../../domain/specifications/user/username-empty.ts';

export default class UserService {
  constructor(
    private userRepository: UserRepository,
    private uniqueUsernameSpec: UniqueUsernameSpecification,
    private usernameEmptySpec: UsernameEmptySpecification
  ) {}

  async registerUser(username: string, password: string): Promise<User> {
    const isUsernameEmpty =
      await this.usernameEmptySpec.isSatisfiedBy(username);
    if (isUsernameEmpty) {
      throw new Error('Username cannot be empty');
    }

    const isUnique = await this.uniqueUsernameSpec.isSatisfiedBy(username);
    if (!isUnique) {
      throw new Error('Username is already taken');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User(uuidv4(), username, passwordHash);

    await this.userRepository.save(user);
    return user;
  }
}
