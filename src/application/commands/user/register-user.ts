import { User } from '../../../domain';
import UserService from '../../services/user-service.ts';

export default class RegisterUser {
  constructor(private userService: UserService) {}

  execute = (username: string, password: string): Promise<User> => {
    return this.userService.registerUser(username, password);
  };
}
