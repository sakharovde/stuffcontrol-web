import {
  ProductRepositoryImpl,
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
import StorageEventEmitter from './events/storage-event-emitter.ts';
import StorageService from './services/storage-service.ts';
import UserService from './services/user-service.ts';
import GetStoragesWithProducts from './queries/storage/get-storages-with-products.ts';
import GetChangedProducts from './queries/storage/get-changed-products.ts';
import CreateStorage from './commands/storage/create-storage.ts';
import AddNewProductToStorage from './commands/storage/add-new-product-to-storage.ts';
import ChangeStorageProductQuantity from './commands/storage/change-storage-product-quantity.ts';
import RemoveStorage from './commands/storage/remove-storage.ts';
import RemoveProduct from './commands/storage/remove-product.ts';
import UpdateStorage from './commands/storage/update-storage.ts';
import SaveStorageProductsChanges from './commands/storage/save-storage-products-changes.ts';
import RegisterUser from './commands/user/register-user.ts';

export default class Application {
  public readonly eventEmitters = {
    storage: new StorageEventEmitter(),
  };

  private readonly repositories = {
    storage: new StorageRepositoryImpl(),
    storageItem: new ProductRepositoryImpl(),
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
      getChangedProducts: new GetChangedProducts(this.services.storage),
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
