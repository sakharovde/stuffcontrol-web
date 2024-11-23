import StorageTransaction from '../models/storage-transaction.ts';

export default interface StorageTransactionRepository {
  save(storageTransaction: StorageTransaction): Promise<StorageTransaction>;
}
