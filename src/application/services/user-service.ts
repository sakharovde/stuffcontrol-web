import { v4 as uuidv4 } from 'uuid';
import {
  User,
  UserPasswordEmptySpecification,
  UserRepository,
  UserUniqueUsernameSpecification,
  UserUsernameEmptySpecification,
} from '../../domain';
// import * as bcrypt from 'bcrypt';

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
