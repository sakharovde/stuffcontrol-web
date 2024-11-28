import UserRepository from '../repositories/user-repository.ts';

export default class UserUniqueUsernameSpecification {
  constructor(private userRepository: UserRepository) {}

  async isSatisfiedBy(username: string): Promise<boolean> {
    const user = await this.userRepository.findByUsername(username);
    return user === null;
  }
}
