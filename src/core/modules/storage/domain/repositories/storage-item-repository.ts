import StorageItem from '../models/storage-item.ts';
import Product from '../../../product/domain/models/product.ts';
import Storage from '../models/storage.ts';

export default interface StorageItemRepository {
  findById(id: string): Promise<StorageItem | null>;
  findByStorageIdAndProductId(storageId: Storage['id'], productId: Product['id']): Promise<StorageItem | null>;
  findAllByStorageId(storageId: string): Promise<StorageItem[]>;
  getAll(): Promise<StorageItem[]>;
  save(storageItem: StorageItem): Promise<StorageItem>;
  delete(storageItem: StorageItem): Promise<void>;
}
