import { StorageTransaction, StorageTransactionRepository } from '../../../domain';
import LocalForageFactory from '../localforage-factory.ts';
import StorageTransactionMapper from '../mappers/storage-transaction.ts';

export default class StorageTransactionRepositoryImpl implements StorageTransactionRepository {
  private readonly client = LocalForageFactory.createInstance({
    name: 'storage-transactions',
    storeName: 'v1',
    description: 'Database for storage items',
  });

  async save(storageTransaction: StorageTransaction): Promise<StorageTransaction> {
    await this.client.setItem(storageTransaction.id, StorageTransactionMapper.toPersistence(storageTransaction));

    return storageTransaction;
  }

  remove(storageTransaction: StorageTransaction): Promise<void> {
    return this.client.removeItem(storageTransaction.id);
  }

  async getAll(): Promise<StorageTransaction[]> {
    const storageTransactions: StorageTransaction[] = [];

    await this.client.iterate((value) => {
      storageTransactions.push(StorageTransactionMapper.toDomain(value));
    });

    return storageTransactions;
  }
}
