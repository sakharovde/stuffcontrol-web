import {
  BatchProductRepositoryImpl,
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
import GetStoragesQueryHandler from './queries/storage/get-storages.ts';
import CreateStorageCommandHandler from './commands/storage/create-storage.ts';
import AddNewProductsToStorageCommandHandler from './commands/product/add-new-products-to-storage.ts';
import ChangeBatchQuantityCommandHandler from './commands/batch/change-batch-quantity-command.ts';
import RemoveStorageCommandHandler from './commands/storage/remove-storage.ts';
import RemoveProductCommandHandler from './commands/product/remove-product.ts';
import UpdateStorageCommandHandler from './commands/storage/update-storage.ts';
import RegisterUserCommandHandler from './commands/user/register-user.ts';
import BatchRepositoryImpl from '../infrastructure/localforage/repositories/batch-repository.ts';
import { GetBatchesByStorageQueryHandler } from './queries/batch/get-by-storage.ts';
import BatchEventEmitter from './events/batch-event-emitter.ts';
import ProductEventEmitter from './events/product-event-emitter.ts';
import { GetStorageByIdQueryHandler } from './queries/storage/get-by-id.ts';

export default class Application {
  public readonly events = {
    batch: new BatchEventEmitter(),
    product: new ProductEventEmitter(),
    storage: new StorageEventEmitter(),
  };

  private readonly repositories = {
    storage: new StorageRepositoryImpl(),
    product: new ProductRepositoryImpl(),
    storageTransaction: new StorageTransactionRepositoryImpl(),
    user: new UserRepositoryImpl(),
    batch: new BatchRepositoryImpl(),
    batchProduct: new BatchProductRepositoryImpl(),
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

  private readonly queryHandlers = {
    // batch
    getBatchesByStorage: new GetBatchesByStorageQueryHandler(this.repositories.batch),
    // storage
    getStoragesWithProducts: new GetStoragesQueryHandler(this.repositories.storage),
    getStorageById: new GetStorageByIdQueryHandler(this.repositories.storage),
  };

  private readonly commandHandlers = {
    // batch
    changeStorageProductQuantity: new ChangeBatchQuantityCommandHandler(
      this.events.batch,
      this.repositories.batch,
      this.repositories.product,
      this.repositories.storageTransaction,
      this.repositories.batchProduct
    ),
    // product
    addNewProductsToStorage: new AddNewProductsToStorageCommandHandler(
      this.repositories.product,
      this.specifications.product.nameEmpty,
      this.repositories.batch,
      this.repositories.storageTransaction,
      this.events.product,
      this.events.batch,
      this.repositories.batchProduct
    ),
    // storage
    createStorage: new CreateStorageCommandHandler(
      this.repositories.storage,
      this.specifications.storage.nameEmpty,
      this.events.storage
    ),
    removeStorage: new RemoveStorageCommandHandler(this.repositories.storage, this.events.storage),
    removeProduct: new RemoveProductCommandHandler(this.repositories.product, this.events.storage),
    updateStorage: new UpdateStorageCommandHandler(this.repositories.storage, this.events.storage),
    // user
    registerUser: new RegisterUserCommandHandler(
      this.repositories.user,
      this.specifications.user.usernameUnique,
      this.specifications.user.usernameEmpty,
      this.specifications.user.passwordEmpty
    ),
  };

  public readonly queries = {
    batch: {
      getByStorage: this.queryHandlers.getBatchesByStorage.execute,
    },
    storage: {
      getAllWithProducts: this.queryHandlers.getStoragesWithProducts.execute,
      getById: this.queryHandlers.getStorageById.execute,
    },
  };

  public readonly commands = {
    batch: {
      changeQuantity: this.commandHandlers.changeStorageProductQuantity.execute,
    },
    product: {
      addNewProducts: this.commandHandlers.addNewProductsToStorage.execute,
      removeProduct: this.commandHandlers.removeProduct.execute,
    },
    storage: {
      create: this.commandHandlers.createStorage.execute,
      remove: this.commandHandlers.removeStorage.execute,
      update: this.commandHandlers.updateStorage.execute,
    },
    user: {
      register: this.commandHandlers.registerUser.execute,
    },
  };
}
