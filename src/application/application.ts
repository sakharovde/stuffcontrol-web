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
import GetStoragesWithProductsQueryHandler from './queries/storage/get-storages-with-products.ts';
import CreateStorageCommandHandler from './commands/storage/create-storage.ts';
import AddNewProductToStorageCommandHandler from './commands/product/add-new-product-to-storage.ts';
import ChangeBatchQuantityCommandHandler from './commands/batch/change-batch-quantity-command.ts';
import RemoveStorageCommandHandler from './commands/storage/remove-storage.ts';
import RemoveProductCommandHandler from './commands/product/remove-product.ts';
import UpdateStorageCommandHandler from './commands/storage/update-storage.ts';
import RegisterUserCommandHandler from './commands/user/register-user.ts';
import GetProductItemsByProductQueryHandler from './queries/product-item/get-by-product.ts';
import BatchRepositoryImpl from '../infrastructure/localforage/repositories/batch-repository.ts';
import { GetBatchesByProductQueryHandler } from './queries/batch/get-by-product.ts';
import BatchEventEmitter from './events/batch-event-emitter.ts';
import ProductEventEmitter from './events/product-event-emitter.ts';

export default class Application {
  public readonly events = {
    batch: new BatchEventEmitter(),
    product: new ProductEventEmitter(),
    storage: new StorageEventEmitter(),
  };

  private readonly repositories = {
    storage: new StorageRepositoryImpl(),
    product: new ProductRepositoryImpl(),
    productItem: new ProductItemRepositoryImpl(),
    storageTransaction: new StorageTransactionRepositoryImpl(),
    user: new UserRepositoryImpl(),
    batch: new BatchRepositoryImpl(),
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
    getStoragesWithProducts: new GetStoragesWithProductsQueryHandler(
      this.repositories.storage,
      this.repositories.batch,
      this.repositories.product
    ),
    getBatchesByProduct: new GetBatchesByProductQueryHandler(this.repositories.batch),
  };

  private readonly commandHandlers = {
    // batch
    changeStorageProductQuantity: new ChangeBatchQuantityCommandHandler(
      this.events.batch,
      this.repositories.batch,
      this.repositories.product,
      this.repositories.storageTransaction,
      this.repositories.productItem
    ),
    // product item
    getProductItemsByProduct: new GetProductItemsByProductQueryHandler(this.repositories.productItem),
    // product
    addNewProductToStorage: new AddNewProductToStorageCommandHandler(
      this.repositories.product,
      this.specifications.product.nameEmpty,
      this.repositories.batch,
      this.repositories.storageTransaction,
      this.events.product,
      this.events.batch,
      this.repositories.productItem
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
      getByProduct: this.queryHandlers.getBatchesByProduct.execute,
    },
    productItem: {
      getByProduct: this.commandHandlers.getProductItemsByProduct.execute,
    },
    storage: {
      getAllWithProducts: this.queryHandlers.getStoragesWithProducts.execute,
    },
  };

  public readonly commands = {
    batch: {
      changeQuantity: this.commandHandlers.changeStorageProductQuantity.execute,
    },
    product: {
      addNewProduct: this.commandHandlers.addNewProductToStorage.execute,
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
