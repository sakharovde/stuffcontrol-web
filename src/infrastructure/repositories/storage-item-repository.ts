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
      productId: storageItem.productId,
      quantity: storageItem.quantity,
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
      !('productId' in data) ||
      typeof data.productId !== 'string' ||
      !('quantity' in data) ||
      typeof data.quantity !== 'number'
    ) {
      throw new Error('Invalid data');
    }

    return data as StorageItem;
  }
}
