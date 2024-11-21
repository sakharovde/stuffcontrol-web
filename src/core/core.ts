import UserService from './application/services/user.ts';
import UserRepositoryImpl from './infrastructure/repositories/user.ts';
import UniqueUsernameSpecification from './domain/specifications/user/username-unique.ts';
import RegisterUserUseCase from './application/use-cases/user/register-user.ts';
import UsernameEmptySpecification from './domain/specifications/user/username-empty.ts';
import PasswordEmptySpecification from './domain/specifications/user/password-empty.ts';
import StorageRepositoryImpl from './infrastructure/repositories/storage.ts';
import StorageService from './application/services/storage.ts';
import CreateStorageUseCase from './application/use-cases/storage/create.ts';

export default class Core {
  private readonly repositories = {
    storage: new StorageRepositoryImpl(),
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
    storage: new StorageService(this.repositories.storage),
    user: new UserService(
      this.repositories.user,
      this.specifications.user.usernameUnique,
      this.specifications.user.usernameEmpty,
      this.specifications.user.passwordEmpty
    ),
  };

  private readonly useCases = {
    storage: {
      create: new CreateStorageUseCase(this.services.storage),
    },
    user: {
      register: new RegisterUserUseCase(this.services.user),
    },
  };

  // storage
  public readonly createStorage = this.useCases.storage.create.execute;
  // user
  public readonly registerUser = this.useCases.user.register.execute;
}
