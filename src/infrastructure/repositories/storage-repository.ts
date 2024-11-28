import { Storage, StorageRepository } from '../../domain';
import LocalForageFactory from '../factories/localforage-factory.ts';

export default class StorageRepositoryImpl implements StorageRepository {
  private readonly client = LocalForageFactory.createInstance({
    name: 'storages',
    storeName: 'v1',
    description: 'Database for storages',
  });

  async findById(id: string): Promise<Storage | null> {
    return (await this.client.getItem(id)) || null;
  }

  save(storage: Storage): Promise<Storage> {
    return this.client.setItem(storage.id, storage);
  }

  async getAll(): Promise<Storage[]> {
    const storageItems: Storage[] = [];
    await this.client.iterate((value) => {
      storageItems.push(value as Storage);
    });
    return storageItems;
  }

  remove(id: Storage['id']): Promise<void> {
    return this.client.removeItem(id);
  }
}
