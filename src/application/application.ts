import {
  ProductItemRepositoryImpl,
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
import GetStoragesWithProductsQueryHandler from './queries/storage/get-storages-with-products.ts';
import GetChangedProductsQueryHandler from './queries/storage/get-changed-products.ts';
import CreateStorageCommandHandler from './commands/storage/create-storage.ts';
import AddNewProductToStorageCommandHandler from './commands/storage/add-new-product-to-storage.ts';
import ChangeStorageProductQuantityCommandHandler from './commands/storage/change-storage-product-quantity.ts';
import RemoveStorageCommandHandler from './commands/storage/remove-storage.ts';
import RemoveProductCommandHandler from './commands/storage/remove-product.ts';
import UpdateStorageCommandHandler from './commands/storage/update-storage.ts';
import SaveStorageProductsChangesCommandHandler from './commands/storage/save-storage-products-changes.ts';
import RegisterUserCommandHandler from './commands/user/register-user.ts';

export default class Application {
  public readonly events = {
    storage: new StorageEventEmitter(),
  };

  private readonly repositories = {
    storage: new StorageRepositoryImpl(),
    product: new ProductRepositoryImpl(),
    productItem: new ProductItemRepositoryImpl(),
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
      this.repositories.product,
      this.specifications.storage.nameEmpty,
      this.repositories.storageTransaction,
      this.specifications.product.nameEmpty,
      this.repositories.productItem
    ),
    user: new UserService(
      this.repositories.user,
      this.specifications.user.usernameUnique,
      this.specifications.user.usernameEmpty,
      this.specifications.user.passwordEmpty
    ),
  };

  private readonly queryHandlers = {
    getStoragesWithProducts: new GetStoragesWithProductsQueryHandler(this.services.storage),
    getChangedProducts: new GetChangedProductsQueryHandler(this.services.storage),
  };

  private readonly commandHandlers = {
    createStorage: new CreateStorageCommandHandler(this.services.storage, this.events.storage),
    addNewProductToStorage: new AddNewProductToStorageCommandHandler(this.services.storage, this.events.storage),
    changeStorageProductQuantity: new ChangeStorageProductQuantityCommandHandler(
      this.services.storage,
      this.events.storage
    ),
    removeStorage: new RemoveStorageCommandHandler(this.services.storage, this.events.storage),
    removeProduct: new RemoveProductCommandHandler(this.services.storage, this.events.storage),
    updateStorage: new UpdateStorageCommandHandler(this.services.storage, this.events.storage),
    saveStorageProductsChanges: new SaveStorageProductsChangesCommandHandler(
      this.services.storage,
      this.events.storage
    ),
    registerUser: new RegisterUserCommandHandler(this.services.user),
  };

  public readonly queries = {
    storage: {
      getAllWithProducts: this.queryHandlers.getStoragesWithProducts.execute,
      getChangedProducts: this.queryHandlers.getChangedProducts.execute,
    },
  };

  public readonly commands = {
    storage: {
      create: this.commandHandlers.createStorage.execute,
      addNewProduct: this.commandHandlers.addNewProductToStorage.execute,
      changeProductQuantity: this.commandHandlers.changeStorageProductQuantity.execute,
      remove: this.commandHandlers.removeStorage.execute,
      removeProduct: this.commandHandlers.removeProduct.execute,
      update: this.commandHandlers.updateStorage.execute,
      saveProductsChanges: this.commandHandlers.saveStorageProductsChanges.execute,
    },
    user: {
      register: this.commandHandlers.registerUser.execute,
    },
  };
}
