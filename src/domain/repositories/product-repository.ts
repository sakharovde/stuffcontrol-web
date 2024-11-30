import Product from '../models/product.ts';

export default interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findAllByStorageId(storageId: string): Promise<Product[]>;
  getAll(): Promise<Product[]>;
  save(storageItem: Product): Promise<Product>;
  delete(storageItem: Product): Promise<void>;
}
