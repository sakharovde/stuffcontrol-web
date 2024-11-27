import LocalForageFactory from '../factories/localforage-factory.ts';
import StorageItem from '../../domain/models/storage-item.ts';
import StorageItemRepository from '../../domain/repositories/storage-item-repository.ts';

export default class StorageItemRepositoryImpl implements StorageItemRepository {
  private readonly client = LocalForageFactory.createInstance({
    name: 'storage-items',
    storeName: 'v1',
    description: 'Database for storage items',
  });

  async findById(id: StorageItem['id']): Promise<StorageItem | null> {
    return (await this.client.getItem(id)) || null;
  }

  async findByStorageIdAndProductId(
    storageId: StorageItem['storageId'],
    productId: StorageItem['productId']
  ): Promise<StorageItem | null> {
    const storageItems = await this.getAll();
    return (
      storageItems.find((storageItem) => storageItem.storageId === storageId && storageItem.productId === productId) ||
      null
    );
  }

  async findAllByStorageId(storageId: StorageItem['id']): Promise<StorageItem[]> {
    const storageItems = await this.getAll();
    return storageItems.filter((storageItem) => storageItem.storageId === storageId);
  }

  async save(storageItem: StorageItem): Promise<StorageItem> {
    return this.client.setItem(storageItem.id, storageItem);
  }

  async delete(storageItem: StorageItem): Promise<void> {
    return this.client.removeItem(storageItem.id);
  }

  async getAll(): Promise<StorageItem[]> {
    const storageItems: StorageItem[] = [];
    await this.client.iterate((value) => {
      storageItems.push(value as StorageItem);
    });
    return storageItems;
  }
}
