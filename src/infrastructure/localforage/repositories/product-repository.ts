import { Product, ProductRepository } from '../../../domain';
import LocalForageFactory from '../localforage-factory.ts';
import ProductMapper from '../mappers/product.ts';

export default class ProductRepositoryImpl implements ProductRepository {
  private readonly client = LocalForageFactory.createInstance({
    name: 'products',
    storeName: 'v1',
    description: 'Database for storage items',
  });

  async findById(id: Product['id']): Promise<Product | null> {
    const storageItem = await this.client.getItem(id);

    if (!storageItem) {
      return null;
    }

    return ProductMapper.toDomain(storageItem);
  }

  async findAllByStorageId(storageId: Product['id']): Promise<Product[]> {
    const storageItems = await this.getAll();
    return storageItems.filter((storageItem) => storageItem.storageId === storageId);
  }

  async save(storageItem: Product): Promise<Product> {
    await this.client.setItem(storageItem.id, ProductMapper.toPersistence(storageItem));

    return storageItem;
  }

  async delete(storageItem: Product): Promise<void> {
    return this.client.removeItem(storageItem.id);
  }

  async getAll(): Promise<Product[]> {
    const storageItems: Product[] = [];
    await this.client.iterate((value) => {
      storageItems.push(ProductMapper.toDomain(value));
    });
    return storageItems;
  }
}
