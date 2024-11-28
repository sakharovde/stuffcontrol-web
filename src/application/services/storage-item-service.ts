import { v4 as uuidv4 } from 'uuid';
import {
  Product,
  Storage,
  StorageItem,
  StorageItemRepository,
  StorageTransaction,
  StorageTransactionRepository,
} from '../../domain';

export default class StorageItemService {
  constructor(
    private readonly storageItemRepository: StorageItemRepository,
    private readonly storageTransactionRepository: StorageTransactionRepository
  ) {}

  async create(
    storageId: Storage['id'],
    productId: Product['id'],
    quantity: StorageItem['quantity']
  ): Promise<StorageItem> {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    const storageItem = await this.storageItemRepository.save(new StorageItem(uuidv4(), storageId, productId, 0));

    await this.changeQuantity(storageId, productId, quantity);

    return storageItem;
  }

  async getAll(storageId: Storage['id']): Promise<StorageItem[]> {
    return this.storageItemRepository.findAllByStorageId(storageId);
  }

  async changeQuantity(
    storageId: Storage['id'],
    productId: Product['id'],
    quantity: StorageItem['quantity']
  ): Promise<StorageItem> {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    const storageItem =
      (await this.storageItemRepository.findByStorageIdAndProductId(storageId, productId)) ||
      (await this.create(storageId, productId, 0));
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

  async remove(storageId: Storage['id'], productId: Product['id']): Promise<void> {
    const storageItem = await this.storageItemRepository.findByStorageIdAndProductId(storageId, productId);
    if (storageItem) {
      return this.storageItemRepository.delete(storageItem);
    }
  }
}
