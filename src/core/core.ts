import UserService from './application/services/user.ts';
import UserRepositoryImpl from './infrastructure/repositories/user.ts';
import UserUniqueUsernameSpecification from './domain/specifications/user/username-unique.ts';
import RegisterUserUseCase from './application/use-cases/user/register-user.ts';
import UserUsernameEmptySpecification from './domain/specifications/user/username-empty.ts';
import UserPasswordEmptySpecification from './domain/specifications/user/password-empty.ts';
import StorageRepositoryImpl from './infrastructure/repositories/storage.ts';
import StorageService from './application/services/storage.ts';
import CreateStorageUseCase from './application/use-cases/storage/create.ts';
import StorageNameEmptySpecification from './domain/specifications/storage/name-empty.ts';

export default class Core {
  private readonly repositories = {
    storage: new StorageRepositoryImpl(),
    user: new UserRepositoryImpl(),
  };

  private readonly specifications = {
    storage: {
      nameEmpty: new StorageNameEmptySpecification(),
    },
    user: {
      usernameUnique: new UserUniqueUsernameSpecification(
        this.repositories.user
      ),
      usernameEmpty: new UserUsernameEmptySpecification(),
      passwordEmpty: new UserPasswordEmptySpecification(),
    },
  };

  private readonly services = {
    storage: new StorageService(
      this.repositories.storage,
      this.specifications.storage.nameEmpty
    ),
    user: new UserService(
      this.repositories.user,
      this.specifications.user.usernameUnique,
      this.specifications.user.usernameEmpty,
      this.specifications.user.passwordEmpty
    ),
  };

  public readonly useCases = {
    storage: {
      create: new CreateStorageUseCase(this.services.storage),
    },
    user: {
      register: new RegisterUserUseCase(this.services.user),
    },
  };
}
