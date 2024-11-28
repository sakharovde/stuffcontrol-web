import { v4 as uuidv4 } from 'uuid';
import {
  Product,
  ProductRepository,
  Storage,
  StorageItem,
  StorageItemRepository,
  StorageNameEmptySpecification,
  StorageRepository,
  StorageTransaction,
  StorageTransactionRepository,
} from '../../domain';
import StorageWithProductsDto, { StorageWithProductsDtoFactory } from '../dto/storage-with-products-dto.ts';
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

  saveProductsChanges = async (storageId: Storage['id']): Promise<void> => {
    const unappliedTransactions = await this.storageTransactionRepository.findAllUnappliedByStorageId(storageId);
    const storageItems = await this.storageItemRepository.findAllByStorageId(storageId);

    await Promise.all(
      unappliedTransactions.map(async (transaction) => {
        const storageItem = storageItems.find((item) => item.productId === transaction.productId);
        if (!storageItem) {
          throw new Error('Storage item not found');
        }

        storageItem.quantity += transaction.quantityChange;
        await this.storageItemRepository.save(storageItem);

        transaction.state = 'applied';
        await this.storageTransactionRepository.save(transaction);
      })
    );
  };

  remove(id: Storage['id']): Promise<void> {
    return this.storageRepository.remove(id);
  }

  async createProduct(
    storageId: Storage['id'],
    productId: Product['id'],
    quantity: StorageItem['quantity']
  ): Promise<StorageItem> {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    const storageItem = await this.storageItemRepository.save(new StorageItem(uuidv4(), storageId, productId, 0));

    await this.changeProductQuantity(storageId, productId, quantity);

    return storageItem;
  }

  async changeProductQuantity(
    storageId: Storage['id'],
    productId: Product['id'],
    quantity: StorageItem['quantity']
  ): Promise<StorageItem> {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    const storageItem =
      (await this.storageItemRepository.findByStorageIdAndProductId(storageId, productId)) ||
      (await this.createProduct(storageId, productId, 0));
    const quantityDelta = quantity - storageItem.quantity;

    const storageTransaction = await this.storageTransactionRepository.findUnappliedByStorageIdAndProductId(
      storageId,
      productId
    );

    if (!quantityDelta && storageTransaction) {
      await this.storageTransactionRepository.remove(storageTransaction);
    } else if (storageTransaction) {
      storageTransaction.quantityChange = quantityDelta;
      await this.storageTransactionRepository.save(storageTransaction);
    } else {
      await this.storageTransactionRepository.save(
        new StorageTransaction(uuidv4(), storageId, productId, quantityDelta, 'pending')
      );
    }

    return storageItem;
  }

  async removeProduct(storageId: Storage['id'], productId: Product['id']): Promise<void> {
    const storageItem = await this.storageItemRepository.findByStorageIdAndProductId(storageId, productId);
    if (storageItem) {
      return this.storageItemRepository.delete(storageItem);
    }
  }
}
