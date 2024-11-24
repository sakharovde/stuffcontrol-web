import UserService from './modules/user/application/services/user-service.ts';
import UserRepositoryImpl from './modules/user/infrastructure/repositories/user-repository.ts';
import UserUniqueUsernameSpecification from './modules/user/domain/specifications/user-username-unique-specification.ts';
import RegisterUserUseCase from './modules/user/application/use-cases/register-user-use-case.ts';
import UserUsernameEmptySpecification from './modules/user/domain/specifications/user-username-empty-specification.ts';
import UserPasswordEmptySpecification from './modules/user/domain/specifications/user-password-empty-specification.ts';
import StorageRepositoryImpl from './modules/storage/infrastructure/repositories/storage-repository.ts';
import StorageService from './modules/storage/application/services/storage-service.ts';
import CreateStorageUseCase from './modules/storage/application/use-cases/create-storage-use-case.ts';
import StorageNameEmptySpecification from './modules/storage/domain/specifications/storage-name-empty-specification.ts';
import AddNewProductToStorageUseCase from './modules/storage/application/use-cases/add-new-product-to-storage-use-case.ts';
import ProductRepositoryImpl from './modules/storage/infrastructure/repositories/product-repository.ts';
import ProductService from './modules/storage/application/services/product-service.ts';
import StorageItemService from './modules/storage/application/services/storage-item-service.ts';
import StorageItemRepositoryImpl from './modules/storage/infrastructure/repositories/storage-item-repository.ts';
import { StorageTransactionRepositoryImpl } from './modules/storage/infrastructure/repositories/storage-transaction-repository.ts';
import ProductNameEmptySpecification from './modules/storage/domain/specifications/product-name-empty-specification.ts';
import ChangeStorageProductQuantityUseCase from './modules/storage/application/use-cases/change-storage-product-quantity-use-case.ts';
import RemoveStorageUseCase from './modules/storage/application/use-cases/remove-storage-use-case.ts';
import UpdateStorageUseCase from './modules/storage/application/use-cases/update-storage-use-case.ts';
import GetStoragesWithProductsUseCase from './modules/storage/application/use-cases/get-storages-with-products-use-case.ts';
import RemoveProductUseCase from './modules/storage/application/use-cases/remove-product-use-case.ts';
import GetChangedStorageProductsUseCase from './modules/storage/application/use-cases/get-changed-storage-products-use-case.ts';
import SaveStorageProductsChangesUseCase from './modules/storage/application/use-cases/save-storage-products-changes-use-case.ts';

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
