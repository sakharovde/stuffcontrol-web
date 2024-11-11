import UserService from './application/services/user.ts';
import UserRepositoryImpl from './infrastructure/repositories/user.ts';
import UniqueEmailSpecification from './domain/specifications/user/unique-email.ts';
import RegisterUserUseCase from './application/use-cases/register-user.ts';

export default class Core {
  private readonly repositories = {
    user: new UserRepositoryImpl(),
  };

  private readonly specifications = {
    user: {
      uniqueEmail: new UniqueEmailSpecification(this.repositories.user),
    },
  };

  private readonly services = {
    user: new UserService(
      this.repositories.user,
      this.specifications.user.uniqueEmail
    ),
  };

  private readonly useCases = {
    registerUser: new RegisterUserUseCase(this.services.user),
  };

  public readonly registerUser = this.useCases.registerUser.execute;
}
