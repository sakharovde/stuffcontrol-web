import Product from '../models/product.ts';

export default interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findByName(name: string): Promise<Product | null>;
  getAll(): Promise<Product[]>;
  save(product: Product): Promise<Product>;
  delete(product: Product): Promise<void>;
}
