import UserService from './application/services/user-service.ts';
import UserRepositoryImpl from './infrastructure/repositories/user-repository.ts';
import UserUniqueUsernameSpecification from './domain/specifications/user-username-unique-specification.ts';
import RegisterUser from './application/commands/user/register-user.ts';
import UserUsernameEmptySpecification from './domain/specifications/user-username-empty-specification.ts';
import UserPasswordEmptySpecification from './domain/specifications/user-password-empty-specification.ts';
import StorageRepositoryImpl from './infrastructure/repositories/storage-repository.ts';
import StorageService from './application/services/storage-service.ts';
import CreateStorage from './application/commands/storage/create-storage.ts';
import StorageNameEmptySpecification from './domain/specifications/storage-name-empty-specification.ts';
import AddNewProductToStorage from './application/commands/storage/add-new-product-to-storage.ts';
import ProductRepositoryImpl from './infrastructure/repositories/product-repository.ts';
import ProductService from './application/services/product-service.ts';
import StorageItemService from './application/services/storage-item-service.ts';
import StorageItemRepositoryImpl from './infrastructure/repositories/storage-item-repository.ts';
import { StorageTransactionRepositoryImpl } from './infrastructure/repositories/storage-transaction-repository.ts';
import ProductNameEmptySpecification from './domain/specifications/product-name-empty-specification.ts';
import ChangeStorageProductQuantity from './application/commands/storage/change-storage-product-quantity.ts';
import RemoveStorage from './application/commands/storage/remove-storage.ts';
import UpdateStorage from './application/commands/storage/update-storage.ts';
import GetStoragesWithProducts from './application/queries/storage/get-storages-with-products.ts';
import RemoveProduct from './application/commands/storage/remove-product.ts';
import GetChangedStorageProducts from './application/queries/storage/get-changed-storage-products.ts';
import SaveStorageProductsChanges from './application/commands/storage/save-storage-products-changes.ts';
import StorageEventBus from './application/events/storage-event-bus.ts';

export default class Core {
  public readonly eventBus = {
    storage: new StorageEventBus(),
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
    product: new ProductService(this.repositories.product, this.specifications.product.nameEmpty),
    storage: new StorageService(
      this.repositories.storage,
      this.repositories.storageItem,
      this.repositories.product,
      this.specifications.storage.nameEmpty,
      this.repositories.storageTransaction
    ),
    storageItem: new StorageItemService(this.repositories.storageItem, this.repositories.storageTransaction),
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
      create: new CreateStorage(this.services.storage, this.eventBus.storage),
      addNewProduct: new AddNewProductToStorage(
        this.services.product,
        this.services.storageItem,
        this.eventBus.storage
      ),
      changeProductQuantity: new ChangeStorageProductQuantity(this.services.storageItem, this.eventBus.storage),
      remove: new RemoveStorage(this.services.storage, this.eventBus.storage),
      removeProduct: new RemoveProduct(this.services.storageItem, this.eventBus.storage),
      update: new UpdateStorage(this.services.storage, this.eventBus.storage),
      saveProductsChanges: new SaveStorageProductsChanges(this.services.storage, this.eventBus.storage),
    },
    user: {
      register: new RegisterUser(this.services.user),
    },
  };
}
