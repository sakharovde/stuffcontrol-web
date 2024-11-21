import { v4 as uuidv4 } from 'uuid';
// import * as bcrypt from 'bcrypt';
import UserRepository from '../../domain/repositories/user.ts';
import UserUniqueUsernameSpecification from '../../domain/specifications/user/username-unique.ts';
import User from '../../domain/models/user.ts';
import UserUsernameEmptySpecification from '../../domain/specifications/user/username-empty.ts';
import UserPasswordEmptySpecification from '../../domain/specifications/user/password-empty.ts';

export default class UserService {
  constructor(
    private userRepository: UserRepository,
    private uniqueUsernameSpec: UserUniqueUsernameSpecification,
    private usernameEmptySpec: UserUsernameEmptySpecification,
    private passwordEmptySpec: UserPasswordEmptySpecification
  ) {}

  async registerUser(username: string, password: string): Promise<User> {
    const isUsernameEmpty = await this.usernameEmptySpec.isSatisfiedBy(username);
    if (isUsernameEmpty) {
      throw new Error('Username cannot be empty');
    }

    const isPasswordEmpty = await this.passwordEmptySpec.isSatisfiedBy(password);
    if (isPasswordEmpty) {
      throw new Error('Password cannot be empty');
    }

    const isUnique = await this.uniqueUsernameSpec.isSatisfiedBy(username);
    if (!isUnique) {
      throw new Error('Username is already taken');
    }

    const passwordHash = await Buffer.from(password).toString('base64');
    const user = new User(uuidv4(), username, passwordHash);

    await this.userRepository.save(user);
    return user;
  }
}
