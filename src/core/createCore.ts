import User from './domain/models/user.ts';
import UserRepositoryImpl from './infrastructure/repositories/user.ts';
import LocalForageFactory from './infrastructure/factories/localforage.ts';
import UserService from './application/services/user.ts';
import UniqueEmailSpecification from './domain/specifications/user/unique-email.ts';
import RegisterUserUseCase from './application/use-cases/register-user.ts';

const createCore = () => {
  const models = {
    User,
  };

  const storages = {
    userStorage: LocalForageFactory.createInstance({
      name: 'users',
      storeName: 'users',
      description: 'Database for users',
    }),
  };

  const repositories = {
    userRepository: new UserRepositoryImpl(storages.userStorage),
  };

  const specifications = {
    user: {
      uniqueEmail: new UniqueEmailSpecification(repositories.userRepository),
    },
  };

  const services = {
    userService: new UserService(
      repositories.userRepository,
      specifications.user.uniqueEmail
    ),
  };

  const useCases = {
    registerUser: new RegisterUserUseCase(services.userService),
  };

  return { models, repositories, specifications, services, useCases };
};

export default createCore;
