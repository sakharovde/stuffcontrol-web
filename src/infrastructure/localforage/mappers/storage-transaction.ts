import { StorageTransaction } from '../../../domain';

export default class StorageTransactionMapper {
  static toPersistence(storageTransaction: StorageTransaction): unknown {
    return {
      id: storageTransaction.id,
      storageId: storageTransaction.storageId,
      productId: storageTransaction.productId,
      quantityChange: storageTransaction.quantityChange,
      state: storageTransaction.state,
      createdAt: storageTransaction.createdAt.toISOString(),
    };
  }

  static toDomain(data: unknown): StorageTransaction {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data');
    }

    if (
      !('id' in data) ||
      typeof data.id !== 'string' ||
      !('storageId' in data) ||
      typeof data.storageId !== 'string' ||
      !('productId' in data) ||
      typeof data.productId !== 'string' ||
      !('quantityChange' in data) ||
      typeof data.quantityChange !== 'number' ||
      !('state' in data) ||
      typeof data.state !== 'string' ||
      !['pending', 'applied'].includes(data.state) ||
      !('createdAt' in data) ||
      typeof data.createdAt !== 'string'
    ) {
      throw new Error('Invalid data');
    }

    return new StorageTransaction(
      data.id,
      data.storageId,
      data.productId,
      data.quantityChange,
      data.state as 'pending' | 'applied',
      new Date(data.createdAt)
    );
  }
}
