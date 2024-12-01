import { StorageTransaction } from '../../../domain';

export default class StorageTransactionMapper {
  static toPersistence(storageTransaction: StorageTransaction): unknown {
    return {
      id: storageTransaction.id,
      storageId: storageTransaction.storageId,
      productId: storageTransaction.productId,
      quantityChange: storageTransaction.quantityChange,
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
      new Date(data.createdAt)
    );
  }
}
