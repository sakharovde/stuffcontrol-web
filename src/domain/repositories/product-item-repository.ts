import ProductItem from '../models/product-item.ts';

export default interface ProductItemRepository {
  findById(id: string): Promise<ProductItem | null>;
  findAllByProductId(productId: string): Promise<ProductItem[]>;
  getAll(): Promise<ProductItem[]>;
  save(storageItem: ProductItem): Promise<ProductItem>;
  delete(storageItem: ProductItem): Promise<void>;
}
