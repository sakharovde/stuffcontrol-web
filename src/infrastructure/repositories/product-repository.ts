import { Product, ProductRepository } from '../../domain';
import LocalForageFactory from '../factories/localforage-factory.ts';

export default class ProductRepositoryImpl implements ProductRepository {
  private readonly client = LocalForageFactory.createInstance({
    name: 'storage-items',
    storeName: 'v1',
    description: 'Database for storage items',
  });

  async findById(id: Product['id']): Promise<Product | null> {
    const storageItem = await this.client.getItem(id);

    if (!storageItem) {
      return null;
    }

    return this.fromJSON(storageItem);
  }

  async findAllByStorageId(storageId: Product['id']): Promise<Product[]> {
    const storageItems = await this.getAll();
    return storageItems.filter((storageItem) => storageItem.storageId === storageId);
  }

  async save(storageItem: Product): Promise<Product> {
    await this.client.setItem(storageItem.id, this.toJSON(storageItem));

    return storageItem;
  }

  async delete(storageItem: Product): Promise<void> {
    return this.client.removeItem(storageItem.id);
  }

  async getAll(): Promise<Product[]> {
    const storageItems: Product[] = [];
    await this.client.iterate((value) => {
      storageItems.push(this.fromJSON(value));
    });
    return storageItems;
  }

  private toJSON(storageItem: Product): unknown {
    return {
      id: storageItem.id,
      storageId: storageItem.storageId,
      name: storageItem.name,
      quantity: storageItem.quantity,
      createdAt: storageItem.createdAt.toString(),
    };
  }

  private fromJSON(data: unknown): Product {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data');
    }

    if (
      !('id' in data) ||
      typeof data.id !== 'string' ||
      !('storageId' in data) ||
      typeof data.storageId !== 'string' ||
      !('quantity' in data) ||
      typeof data.quantity !== 'number' ||
      !('name' in data) ||
      typeof data.name !== 'string' ||
      !('createdAt' in data) ||
      typeof data.createdAt !== 'string'
    ) {
      throw new Error('Invalid data');
    }

    return new Product(data.id, data.storageId, data.name, data.quantity, new Date(data.createdAt));
  }
}
