import { BatchProduct } from '../../../domain';

export default class BatchProductMapper {
  static toPersistence(batchProduct: BatchProduct) {
    return {
      id: batchProduct.id,
      batchId: batchProduct.batchId,
      productId: batchProduct.productId,
      createdAt: batchProduct.createdAt.toISOString(),
    };
  }

  static toDomain(data: unknown): BatchProduct {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data');
    }

    if (
      !('id' in data) ||
      typeof data.id !== 'string' ||
      !('batchId' in data) ||
      typeof data.batchId !== 'string' ||
      !('productId' in data) ||
      typeof data.productId !== 'string' ||
      !('createdAt' in data) ||
      typeof data.createdAt !== 'string' ||
      isNaN(Date.parse(data.createdAt))
    ) {
      throw new Error('Invalid data');
    }

    return {
      id: data.id,
      batchId: data.batchId,
      productId: data.productId,
      createdAt: new Date(data.createdAt),
    };
  }
}
