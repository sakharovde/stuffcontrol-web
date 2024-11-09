import UserRepository from '../../repositories/user.ts';

export default class UniqueEmailSpecification {
  constructor(private userRepository: UserRepository) {}

  async isSatisfiedBy(email: string): Promise<boolean> {
    const user = await this.userRepository.findByEmail(email);
    return user === null;
  }
}
