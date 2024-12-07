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
    const product = await this.client.getItem(id);

    if (!product) {
      return null;
    }

    return ProductMapper.toDomain(product);
  }

  async findAllByStorageId(storageId: Product['id']): Promise<Product[]> {
    const products = await this.getAll();
    return products.filter((product) => product.storageId === storageId);
  }

  async save(product: Product): Promise<Product> {
    await this.client.setItem(product.id, ProductMapper.toPersistence(product));

    return product;
  }

  async delete(id: Product['id']): Promise<void> {
    return this.client.removeItem(id);
  }

  async getAll(): Promise<Product[]> {
    const products: Product[] = [];
    await this.client.iterate((value) => {
      products.push(ProductMapper.toDomain(value));
    });
    return products;
  }
}
