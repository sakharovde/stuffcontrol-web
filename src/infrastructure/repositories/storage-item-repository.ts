import { StorageItem, StorageItemRepository } from '../../domain';
import LocalForageFactory from '../factories/localforage-factory.ts';

export default class StorageItemRepositoryImpl implements StorageItemRepository {
  private readonly client = LocalForageFactory.createInstance({
    name: 'storage-items',
    storeName: 'v1',
    description: 'Database for storage items',
  });

  async findById(id: StorageItem['id']): Promise<StorageItem | null> {
    const storageItem = await this.client.getItem(id);

    if (!storageItem) {
      return null;
    }

    return this.fromJSON(storageItem);
  }

  async findAllByStorageId(storageId: StorageItem['id']): Promise<StorageItem[]> {
    const storageItems = await this.getAll();
    return storageItems.filter((storageItem) => storageItem.storageId === storageId);
  }

  async save(storageItem: StorageItem): Promise<StorageItem> {
    await this.client.setItem(storageItem.id, this.toJSON(storageItem));

    return storageItem;
  }

  async delete(storageItem: StorageItem): Promise<void> {
    return this.client.removeItem(storageItem.id);
  }

  async getAll(): Promise<StorageItem[]> {
    const storageItems: StorageItem[] = [];
    await this.client.iterate((value) => {
      storageItems.push(this.fromJSON(value));
    });
    return storageItems;
  }

  private toJSON(storageItem: StorageItem): unknown {
    return {
      id: storageItem.id,
      storageId: storageItem.storageId,
      name: storageItem.name,
      quantity: storageItem.quantity,
      createdAt: storageItem.createdAt.toString(),
    };
  }

  private fromJSON(data: unknown): StorageItem {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data');
    }

    if (
      !('id' in data) ||
      typeof data.id !== 'string' ||
      !('storageId' in data) ||
      typeof data.storageId !== 'string' ||
      !('quantity' in data) ||
      typeof data.quantity !== 'number' ||
      !('name' in data) ||
      typeof data.name !== 'string' ||
      !('createdAt' in data) ||
      typeof data.createdAt !== 'string'
    ) {
      throw new Error('Invalid data');
    }

    return new StorageItem(data.id, data.storageId, data.name, data.quantity, new Date(data.createdAt));
  }
}
