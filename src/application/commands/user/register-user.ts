import { User } from '../../../domain';
import UserService from '../../services/user-service.ts';

export interface RegisterUserCommand {
  username: string;
  password: string;
}

export default class RegisterUserCommandHandler {
  constructor(private userService: UserService) {}

  execute = (command: RegisterUserCommand): Promise<User> => {
    return this.userService.registerUser(command.username, command.password);
  };
}
