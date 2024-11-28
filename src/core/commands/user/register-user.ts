import UserService from '../../../application/services/user-service.ts';
import User from '../../../domain/models/user.ts';

export default class RegisterUser {
  constructor(private userService: UserService) {}

  execute(username: string, password: string): Promise<User> {
    return this.userService.registerUser(username, password);
  }
}
