import {
  User,
  UserPasswordEmptySpecification,
  UserRepository,
  UserUniqueUsernameSpecification,
  UserUsernameEmptySpecification,
} from '../../../domain';
import { v4 as uuidv4 } from 'uuid';

export interface RegisterUserCommand {
  username: string;
  password: string;
}

export default class RegisterUserCommandHandler {
  constructor(
    private userRepository: UserRepository,
    private uniqueUsernameSpec: UserUniqueUsernameSpecification,
    private usernameEmptySpec: UserUsernameEmptySpecification,
    private passwordEmptySpec: UserPasswordEmptySpecification
  ) {}

  execute = async (command: RegisterUserCommand): Promise<void> => {
    const isUsernameEmpty = await this.usernameEmptySpec.isSatisfiedBy(command.username);
    if (isUsernameEmpty) {
      throw new Error('Username cannot be empty');
    }

    const isPasswordEmpty = await this.passwordEmptySpec.isSatisfiedBy(command.password);
    if (isPasswordEmpty) {
      throw new Error('Password cannot be empty');
    }

    const isUnique = await this.uniqueUsernameSpec.isSatisfiedBy(command.username);
    if (!isUnique) {
      throw new Error('Username is already taken');
    }

    const passwordHash = await Buffer.from(command.password).toString('base64');
    const user = new User(uuidv4(), command.username, passwordHash);

    await this.userRepository.save(user);
  };
}
