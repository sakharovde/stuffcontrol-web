import { Product, ProductRepository } from '../../domain';
import { LocalForageFactory } from '../index.ts';

export default class ProductRepositoryImpl implements ProductRepository {
  private readonly client = LocalForageFactory.createInstance({
    name: 'products',
    storeName: 'v1',
    description: 'Database for products',
  });

  async findById(id: string): Promise<Product | null> {
    const product = await this.client.getItem(id);

    if (!product) {
      return null;
    }

    return this.fromJSON(product);
  }

  async findByName(name: string): Promise<Product | null> {
    const products = await this.getAll();
    return products.find((product: Product) => product.name === name) || null;
  }

  async save(product: Product): Promise<Product> {
    await this.client.setItem(product.id, this.toJSON(product));

    return product;
  }

  async delete(product: Product): Promise<void> {
    return this.client.removeItem(product.id);
  }

  async getAll(): Promise<Product[]> {
    const products: Product[] = [];
    await this.client.iterate((value) => {
      products.push(this.fromJSON(value));
    });
    return products;
  }

  private toJSON(product: Product): unknown {
    return {
      id: product.id,
      name: product.name,
    };
  }

  private fromJSON(data: unknown): Product {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data');
    }

    if (!('id' in data) || typeof data.id !== 'string') {
      throw new Error('Invalid id');
    }

    if (!('name' in data) || typeof data.name !== 'string') {
      throw new Error('Invalid name');
    }

    return new Product(data.id, data.name);
  }
}
