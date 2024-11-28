import StorageTransaction from '../models/storage-transaction.ts';
import Storage from '../models/storage.ts';
import Product from '../models/product.ts';

export default interface StorageTransactionRepository {
  findUnappliedByStorageIdAndProductId(
    storageId: Storage['id'],
    productId: Product['id']
  ): Promise<StorageTransaction | null>;
  findAllUnappliedByStorageId(storageId: Storage['id']): Promise<StorageTransaction[]>;
  save(storageTransaction: StorageTransaction): Promise<StorageTransaction>;
  remove(storageTransaction: StorageTransaction): Promise<void>;
}
