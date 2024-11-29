import { UserService } from '../../index.ts';
import { User } from '../../../domain';

export default class RegisterUser {
  constructor(private userService: UserService) {}

  execute(username: string, password: string): Promise<User> {
    return this.userService.registerUser(username, password);
  }
}
