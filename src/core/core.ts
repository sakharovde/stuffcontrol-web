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
import AddNewProductToStorageUseCase from './application/use-cases/storage/add-new-product.ts';
import ProductRepositoryImpl from './infrastructure/repositories/product.ts';
import ProductService from './application/services/product.ts';
import StorageItemService from './application/services/storage-item.ts';
import StorageItemRepositoryImpl from './infrastructure/repositories/storage-item.ts';
import { StorageTransactionRepositoryImpl } from './infrastructure/repositories/storage-transaction.ts';
import ProductNameEmptySpecification from './domain/specifications/product/name-empty.ts';
import ChangeStorageProductQuantityUseCase from './application/use-cases/storage/change-product-quantity.ts';
import GetAllStoragesUseCase from './application/use-cases/storage/get-all.ts';
import GetStorageItemsUseCase from './application/use-cases/storage/get-items.ts';
import RemoveStorageUseCase from './application/use-cases/storage/remove.ts';
import GetProductUseCase from './application/use-cases/product/get.ts';

export default class Core {
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
    storage: new StorageService(this.repositories.storage, this.specifications.storage.nameEmpty),
    storageItem: new StorageItemService(this.repositories.storageItem, this.repositories.storageTransaction),
    user: new UserService(
      this.repositories.user,
      this.specifications.user.usernameUnique,
      this.specifications.user.usernameEmpty,
      this.specifications.user.passwordEmpty
    ),
  };

  public readonly useCases = {
    product: {
      get: new GetProductUseCase(this.services.product),
    },
    storage: {
      create: new CreateStorageUseCase(this.services.storage),
      addNewProduct: new AddNewProductToStorageUseCase(this.services.product, this.services.storageItem),
      changeProductQuantity: new ChangeStorageProductQuantityUseCase(this.services.storageItem),
      getAll: new GetAllStoragesUseCase(this.services.storage),
      getItems: new GetStorageItemsUseCase(this.services.storageItem),
      remove: new RemoveStorageUseCase(this.services.storage),
    },
    user: {
      register: new RegisterUserUseCase(this.services.user),
    },
  };
}
