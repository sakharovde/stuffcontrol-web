import UserService from '../services/user.ts';
import User from '../../domain/models/user.ts';

export default class RegisterUserUseCase {
  constructor(private userService: UserService) {}

  async execute(email: string, password: string): Promise<User> {
    return this.userService.registerUser(email, password);
  }
}
