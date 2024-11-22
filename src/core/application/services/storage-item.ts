import StorageItemRepository from '../../domain/repositories/storage-item.ts';
import StorageItem from '../../domain/models/storage-item.ts';
import Storage from '../../domain/models/storage.ts';
import Product from '../../domain/models/product.ts';
import { v4 as uuidv4 } from 'uuid';
import StorageTransactionRepository from '../../domain/repositories/storage-transaction.ts';
import StorageTransaction from '../../domain/models/storage-transaction.ts';

export default class StorageItemService {
  constructor(
    private storageItemRepository: StorageItemRepository,
    private readonly storageTransactionRepository: StorageTransactionRepository
  ) {}

  async create(
    storageId: Storage['id'],
    productId: Product['id'],
    quantity: StorageItem['quantity']
  ): Promise<StorageItem> {
    const storageItem = new StorageItem(uuidv4(), storageId, productId, quantity);
    return this.storageItemRepository.save(storageItem);
  }

  async getAll(storageId: Storage['id']): Promise<StorageItem[]> {
    return this.storageItemRepository.findAllByStorageId(storageId);
  }

  async changeQuantity(
    storageId: Storage['id'],
    productId: Product['id'],
    quantity: StorageItem['quantity']
  ): Promise<StorageItem> {
    let storageItem = await this.storageItemRepository.findByStorageIdAndProductId(storageId, productId);

    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    if (quantity !== 0) {
      const quantityDelta = quantity - (storageItem?.quantity || 0);
      const transactionType: StorageTransaction['transactionType'] = quantityDelta > 0 ? 'ADD' : 'REMOVE';
      await this.storageTransactionRepository.save(
        new StorageTransaction(uuidv4(), storageId, productId, quantityDelta, transactionType)
      );
    }

    if (!storageItem) {
      storageItem = await this.create(storageId, productId, quantity);
    }

    storageItem.quantity = quantity;

    return this.storageItemRepository.save(storageItem);
  }
}
