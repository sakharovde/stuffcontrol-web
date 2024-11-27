import UserService from './application/services/user-service.ts';
import UserRepositoryImpl from './infrastructure/repositories/user-repository.ts';
import UserUniqueUsernameSpecification from './domain/specifications/user-username-unique-specification.ts';
import RegisterUserUseCase from './application/use-cases/register-user-use-case.ts';
import UserUsernameEmptySpecification from './domain/specifications/user-username-empty-specification.ts';
import UserPasswordEmptySpecification from './domain/specifications/user-password-empty-specification.ts';
import StorageRepositoryImpl from './infrastructure/repositories/storage-repository.ts';
import StorageService from './application/services/storage-service.ts';
import CreateStorageUseCase from './application/use-cases/create-storage-use-case.ts';
import StorageNameEmptySpecification from './domain/specifications/storage-name-empty-specification.ts';
import AddNewProductToStorageUseCase from './application/use-cases/add-new-product-to-storage-use-case.ts';
import ProductRepositoryImpl from './infrastructure/repositories/product-repository.ts';
import ProductService from './application/services/product-service.ts';
import StorageItemService from './application/services/storage-item-service.ts';
import StorageItemRepositoryImpl from './infrastructure/repositories/storage-item-repository.ts';
import { StorageTransactionRepositoryImpl } from './infrastructure/repositories/storage-transaction-repository.ts';
import ProductNameEmptySpecification from './domain/specifications/product-name-empty-specification.ts';
import ChangeStorageProductQuantityUseCase from './application/use-cases/change-storage-product-quantity-use-case.ts';
import RemoveStorageUseCase from './application/use-cases/remove-storage-use-case.ts';
import UpdateStorageUseCase from './application/use-cases/update-storage-use-case.ts';
import GetStoragesWithProductsUseCase from './application/use-cases/get-storages-with-products-use-case.ts';
import RemoveProductUseCase from './application/use-cases/remove-product-use-case.ts';
import GetChangedStorageProductsUseCase from './application/use-cases/get-changed-storage-products-use-case.ts';
import SaveStorageProductsChangesUseCase from './application/use-cases/save-storage-products-changes-use-case.ts';

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

  public readonly useCases = {
    storage: {
      create: new CreateStorageUseCase(this.services.storage),
      addNewProduct: new AddNewProductToStorageUseCase(this.services.product, this.services.storageItem),
      changeProductQuantity: new ChangeStorageProductQuantityUseCase(this.services.storageItem),
      getAllWithProducts: new GetStoragesWithProductsUseCase(this.services.storage),
      getChangedProducts: new GetChangedStorageProductsUseCase(this.services.storage),
      remove: new RemoveStorageUseCase(this.services.storage),
      removeProduct: new RemoveProductUseCase(this.services.storageItem),
      update: new UpdateStorageUseCase(this.services.storage),
      saveProductsChanges: new SaveStorageProductsChangesUseCase(this.services.storage),
    },
    user: {
      register: new RegisterUserUseCase(this.services.user),
    },
  };
}
