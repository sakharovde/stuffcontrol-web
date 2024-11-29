import StorageEventEmitter from './events/storage-event-emitter.ts';
import {
  ProductRepositoryImpl,
  StorageItemRepositoryImpl,
  StorageRepositoryImpl,
  StorageTransactionRepositoryImpl,
  UserRepositoryImpl,
} from '../infrastructure';
import {
  ProductNameEmptySpecification,
  StorageNameEmptySpecification,
  UserPasswordEmptySpecification,
  UserUniqueUsernameSpecification,
  UserUsernameEmptySpecification,
} from '../domain';
import { StorageService, UserService } from '../application';
import { GetChangedStorageProducts, GetStoragesWithProducts } from './queries';
import {
  AddNewProductToStorage,
  ChangeStorageProductQuantity,
  CreateStorage,
  RegisterUser,
  RemoveProduct,
  RemoveStorage,
  SaveStorageProductsChanges,
  UpdateStorage,
} from './commands';

export default class Application {
  public readonly eventEmitters = {
    storage: new StorageEventEmitter(),
  };

  private readonly repositories = {
    product: new ProductRepositoryImpl(),
    storage: new StorageRepositoryImpl(),
    storageItem: new StorageItemRepositoryImpl(),
    storageTransaction: new StorageTransactionRepositoryImpl(),
    user: new UserRepositoryImpl(),
  };

  private readonly specifications = {
    product: {
      nameEmpty: new ProductNameEmptySpecification(),
    },
    storage: {
      nameEmpty: new StorageNameEmptySpecification(),
    },
    user: {
      usernameUnique: new UserUniqueUsernameSpecification(this.repositories.user),
      usernameEmpty: new UserUsernameEmptySpecification(),
      passwordEmpty: new UserPasswordEmptySpecification(),
    },
  };

  private readonly services = {
    storage: new StorageService(
      this.repositories.storage,
      this.repositories.storageItem,
      this.repositories.product,
      this.specifications.storage.nameEmpty,
      this.repositories.storageTransaction,
      this.specifications.product.nameEmpty
    ),
    user: new UserService(
      this.repositories.user,
      this.specifications.user.usernameUnique,
      this.specifications.user.usernameEmpty,
      this.specifications.user.passwordEmpty
    ),
  };

  public readonly queries = {
    storage: {
      getAllWithProducts: new GetStoragesWithProducts(this.services.storage),
      getChangedProducts: new GetChangedStorageProducts(this.services.storage),
    },
  };

  public readonly commands = {
    storage: {
      create: new CreateStorage(this.services.storage, this.eventEmitters.storage),
      addNewProduct: new AddNewProductToStorage(this.services.storage, this.eventEmitters.storage),
      changeProductQuantity: new ChangeStorageProductQuantity(this.services.storage, this.eventEmitters.storage),
      remove: new RemoveStorage(this.services.storage, this.eventEmitters.storage),
      removeProduct: new RemoveProduct(this.services.storage, this.eventEmitters.storage),
      update: new UpdateStorage(this.services.storage, this.eventEmitters.storage),
      saveProductsChanges: new SaveStorageProductsChanges(this.services.storage, this.eventEmitters.storage),
    },
    user: {
      register: new RegisterUser(this.services.user),
    },
  };
}
