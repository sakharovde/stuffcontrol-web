import StorageTransaction from '../models/storage-transaction.ts';
import Storage from '../models/storage.ts';
import StorageItem from '../models/storage-item.ts';

export default interface StorageTransactionRepository {
  findUnappliedByProductId(productId: StorageItem['id']): Promise<StorageTransaction | null>;
  findAllUnappliedByStorageId(storageId: Storage['id']): Promise<StorageTransaction[]>;
  save(storageTransaction: StorageTransaction): Promise<StorageTransaction>;
  remove(storageTransaction: StorageTransaction): Promise<void>;
}
