import StorageRepository from '../../domain/repositories/storage-repository.ts';
import Storage from '../../domain/models/storage.ts';
import { v4 as uuidv4 } from 'uuid';
import StorageNameEmptySpecification from '../../domain/specifications/storage-name-empty-specification.ts';
import StorageWithProductsDto, { StorageWithProductsDtoFactory } from '../dto/storage-with-products-dto.ts';
import StorageItemRepository from '../../domain/repositories/storage-item-repository.ts';
import ProductRepository from '../../domain/repositories/product-repository.ts';
import StorageItem from '../../domain/models/storage-item.ts';
import StorageTransactionRepository from '../../domain/repositories/storage-transaction-repository.ts';
import StorageProductDto from '../dto/storage-product-dto.ts';

export default class StorageService {
  constructor(
    private readonly storageRepository: StorageRepository,
    private readonly storageItemRepository: StorageItemRepository,
    private readonly productRepository: ProductRepository,
    private readonly nameEmptySpecification: StorageNameEmptySpecification,
    private readonly storageTransactionRepository: StorageTransactionRepository
  ) {}

  async create(name: Storage['name']): Promise<Storage> {
    const isNameEmpty = await this.nameEmptySpecification.isSatisfiedBy(name);
    if (isNameEmpty) {
      throw new Error('Storage name cannot be empty');
    }

    const storage = new Storage(uuidv4(), name);

    return this.storageRepository.save(storage);
  }

  getAll(): Promise<Storage[]> {
    return this.storageRepository.getAll();
  }

  getAllWithProducts = async (): Promise<StorageWithProductsDto[]> => {
    const storages = await this.storageRepository.getAll();
    const storageItems = await this.storageItemRepository.getAll();
    const products = await this.productRepository.getAll();

    return storages.map((storage) => StorageWithProductsDtoFactory.create(storage, storageItems, products));
  };

  getAllChangedProducts = async (storageId: Storage['id']): Promise<StorageProductDto[]> => {
    const storage = await this.storageRepository.findById(storageId);
    if (!storage) {
      throw new Error('Storage not found');
    }

    const storageItems = await this.storageItemRepository.findAllByStorageId(storageId);
    const unappliedTransactions = await this.storageTransactionRepository.findAllUnappliedByStorageId(storageId);
    const products = await this.productRepository.getAll();

    const changedStorageItems = storageItems.reduce((acc, storageItem) => {
      const unappliedTransaction = unappliedTransactions.find(
        (transaction) => transaction.productId === storageItem.productId
      );

      if (!unappliedTransaction) {
        return acc;
      }

      storageItem.quantity += unappliedTransaction.quantityChange;

      return [...acc, storageItem];
    }, [] as StorageItem[]);

    return StorageWithProductsDtoFactory.create(storage, changedStorageItems, products).products;
  };

  update(storage: Storage): Promise<Storage> {
    return this.storageRepository.save(storage);
  }

  remove(id: Storage['id']): Promise<void> {
    return this.storageRepository.remove(id);
  }
}
