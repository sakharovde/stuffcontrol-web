import ProductItem from '../../../domain/models/product-item.ts';

export default class ProductItemMapper {
  public static toDomain(data: unknown): ProductItem {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data');
    }

    if (
      !('id' in data) ||
      typeof data.id !== 'string' ||
      !('productId' in data) ||
      typeof data.productId !== 'string' ||
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
      data.removedAt ? new Date(data.removedAt) : null,
      new Date(data.createdAt),
      new Date(data.createdAt)
    );
  }

  public static toPersistence(item: ProductItem) {
    return {
      id: item.id,
      productId: item.productId,
      addedAt: item.addedAt.toISOString().toString(),
      removedAt: item.removedAt?.toISOString().toString() || null,
      createdAt: item.createdAt.toISOString(),
    };
  }
}
