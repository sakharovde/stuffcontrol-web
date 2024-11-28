import { Product, ProductRepository } from '../../domain';
import { LocalForageFactory } from '../index.ts';

export default class ProductRepositoryImpl implements ProductRepository {
  private readonly client = LocalForageFactory.createInstance({
    name: 'products',
    storeName: 'v1',
    description: 'Database for products',
  });

  async findById(id: string): Promise<Product | null> {
    return (await this.client.getItem(id)) || null;
  }

  async findByName(name: string): Promise<Product | null> {
    const products = await this.getAll();
    return products.find((product: Product) => product.name === name) || null;
  }

  async save(product: Product): Promise<Product> {
    return this.client.setItem(product.id, product);
  }

  async delete(product: Product): Promise<void> {
    return this.client.removeItem(product.id);
  }

  async getAll(): Promise<Product[]> {
    const users: Product[] = [];
    await this.client.iterate((value) => {
      users.push(value as Product);
    });
    return users;
  }
}
