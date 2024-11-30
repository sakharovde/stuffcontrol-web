import { Product, StorageTransaction, StorageTransactionRepository } from '../../domain';
import LocalForageFactory from '../factories/localforage-factory.ts';

export default class StorageTransactionRepositoryImpl implements StorageTransactionRepository {
  private readonly client = LocalForageFactory.createInstance({
    name: 'storage-transactions',
    storeName: 'v1',
    description: 'Database for storage items',
  });

  async findUnappliedByProductId(productId: Product['id']): Promise<StorageTransaction | null> {
    const storageTransactions: StorageTransaction[] = await this.getAll();

    return (
      storageTransactions
        .filter((storageTransaction) => storageTransaction.productId === productId)
        .find((storageTransaction) => storageTransaction.state === 'pending') || null
    );
  }

  async findAllUnappliedByStorageId(storageId: Storage['id']): Promise<StorageTransaction[]> {
    const storageTransactions: StorageTransaction[] = await this.getAll();

    return storageTransactions.filter(
      (storageTransaction) => storageTransaction.storageId === storageId && storageTransaction.state === 'pending'
    );
  }

  async save(storageTransaction: StorageTransaction): Promise<StorageTransaction> {
    await this.client.setItem(storageTransaction.id, this.toJSON(storageTransaction));

    return storageTransaction;
  }

  remove(storageTransaction: StorageTransaction): Promise<void> {
    return this.client.removeItem(storageTransaction.id);
  }

  async getAll(): Promise<StorageTransaction[]> {
    const storageTransactions: StorageTransaction[] = [];

    await this.client.iterate((value) => {
      storageTransactions.push(this.fromJSON(value));
    });

    return storageTransactions;
  }

  private toJSON(storageTransaction: StorageTransaction): unknown {
    return {
      id: storageTransaction.id,
      storageId: storageTransaction.storageId,
      productId: storageTransaction.productId,
      quantityChange: storageTransaction.quantityChange,
      state: storageTransaction.state,
      createdAt: storageTransaction.createdAt.toString(),
    };
  }

  private fromJSON(data: unknown): StorageTransaction {
    if (typeof data !== 'object' || data === null) throw new Error('Invalid data');

    const { id, storageId, productId, quantityChange, state, createdAt } = data as Record<string, unknown>;

    if (typeof id !== 'string') throw new Error('Invalid id');
    if (typeof storageId !== 'string') throw new Error('Invalid storageId');
    if (typeof productId !== 'string') throw new Error('Invalid productId');
    if (typeof quantityChange !== 'number') throw new Error('Invalid quantityChange');
    if (typeof state !== 'string' || !['pending', 'applied'].includes(state)) throw new Error('Invalid state');
    if (typeof createdAt !== 'string' || isNaN(new Date(createdAt).getTime())) throw new Error('Invalid createdAt');

    return {
      id,
      storageId,
      productId,
      quantityChange,
      state: state as 'pending' | 'applied',
      createdAt: new Date(createdAt),
    };
  }
}
