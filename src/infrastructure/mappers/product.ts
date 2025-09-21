import Product from '../../domain/entities/product.ts';

export default class ProductMapper {
  public static toDomain(data: unknown): Product {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data');
    }

    let expirationDate: Product['expirationDate'] = null;

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
      !('name' in data) ||
      typeof data.name !== 'string' ||
      !('storageId' in data) ||
      typeof data.storageId !== 'string' ||
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

    return new Product(
      data.id,
      data.storageId,
      data.name,
      expirationDate,
      data.removedAt ? new Date(data.removedAt) : null,
      new Date(data.createdAt),
      new Date(data.createdAt)
    );
  }

  public static toPersistence(item: Product) {
    return {
      id: item.id,
      storageId: item.storageId,
      name: item.name,
      expirationDate: item.expirationDate?.toISOString().toString() || null,
      addedAt: item.addedAt.toISOString().toString(),
      removedAt: item.removedAt?.toISOString().toString() || null,
      createdAt: item.createdAt.toISOString(),
    };
  }
}
