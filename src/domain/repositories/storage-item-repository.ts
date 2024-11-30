import StorageItem from '../models/storage-item.ts';

export default interface StorageItemRepository {
  findById(id: string): Promise<StorageItem | null>;
  findAllByStorageId(storageId: string): Promise<StorageItem[]>;
  getAll(): Promise<StorageItem[]>;
  save(storageItem: StorageItem): Promise<StorageItem>;
  delete(storageItem: StorageItem): Promise<void>;
}
