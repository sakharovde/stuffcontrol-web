import UserService from './application/services/user.ts';
import UserRepositoryImpl from './infrastructure/repositories/user.ts';
import UniqueUsernameSpecification from './domain/specifications/user/username-unique.ts';
import RegisterUserUseCase from './application/use-cases/user/register-user.ts';
import UsernameEmptySpecification from './domain/specifications/user/username-empty.ts';
import PasswordEmptySpecification from './domain/specifications/user/password-empty.ts';

export default class Core {
  private readonly repositories = {
    user: new UserRepositoryImpl(),
  };

  private readonly specifications = {
    user: {
      usernameUnique: new UniqueUsernameSpecification(this.repositories.user),
      usernameEmpty: new UsernameEmptySpecification(),
      passwordEmpty: new PasswordEmptySpecification(),
    },
  };

  private readonly services = {
    user: new UserService(
      this.repositories.user,
      this.specifications.user.usernameUnique,
      this.specifications.user.usernameEmpty,
      this.specifications.user.passwordEmpty
    ),
  };

  private readonly useCases = {
    registerUser: new RegisterUserUseCase(this.services.user),
  };

  public readonly registerUser = this.useCases.registerUser.execute;
}
