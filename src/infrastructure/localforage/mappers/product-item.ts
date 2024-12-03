import ProductItem from '../../../domain/models/product-item.ts';

export default class ProductItemMapper {
  public static toDomain(data: unknown): ProductItem {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data');
    }

    let expirationDate: ProductItem['expirationDate'] = null;

    if (
      'expirationDate' in data &&
      data.expirationDate !== null &&
      typeof data.expirationDate === 'string' &&
      !isNaN(Date.parse(data.expirationDate))
    ) {
      expirationDate = new Date(data.expirationDate);
    }

    if (
      !('id' in data) ||
      typeof data.id !== 'string' ||
      !('productId' in data) ||
      typeof data.productId !== 'string' ||
      !('batchId' in data) ||
      typeof data.batchId !== 'string' ||
      !('addedAt' in data) ||
      typeof data.addedAt !== 'string' ||
      isNaN(Date.parse(data.addedAt)) ||
      !('removedAt' in data) ||
      (data.removedAt !== null && (typeof data.removedAt !== 'string' || isNaN(Date.parse(data.removedAt)))) ||
      !('createdAt' in data) ||
      typeof data.createdAt !== 'string' ||
      isNaN(Date.parse(data.createdAt))
    ) {
      throw new Error('Invalid data');
    }

    return new ProductItem(
      data.id,
      data.productId,
      data.batchId,
      expirationDate,
      data.removedAt ? new Date(data.removedAt) : null,
      new Date(data.createdAt),
      new Date(data.createdAt)
    );
  }

  public static toPersistence(item: ProductItem) {
    return {
      id: item.id,
      productId: item.productId,
      batchId: item.batchId,
      expirationDate: item.expirationDate?.toISOString().toString() || null,
      addedAt: item.addedAt.toISOString().toString(),
      removedAt: item.removedAt?.toISOString().toString() || null,
      createdAt: item.createdAt.toISOString(),
    };
  }
}
