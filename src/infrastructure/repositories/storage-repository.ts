import { Storage, StorageRepository } from '../../domain';
import LocalForageFactory from '../factories/localforage-factory.ts';

export default class StorageRepositoryImpl implements StorageRepository {
  private readonly client = LocalForageFactory.createInstance({
    name: 'storages',
    storeName: 'v1',
    description: 'Database for storages',
  });

  async findById(id: string): Promise<Storage | null> {
    const storage = await this.client.getItem(id);

    if (!storage) {
      return null;
    }

    return this.fromJSON(storage);
  }

  async save(storage: Storage): Promise<Storage> {
    await this.client.setItem(storage.id, this.toJSON(storage));

    return storage;
  }

  async getAll(): Promise<Storage[]> {
    const storageItems: Storage[] = [];
    await this.client.iterate((value) => {
      storageItems.push(this.fromJSON(value));
    });
    return storageItems;
  }

  remove(id: Storage['id']): Promise<void> {
    return this.client.removeItem(id);
  }

  private toJSON(storage: Storage): unknown {
    return {
      id: storage.id,
      name: storage.name,
    };
  }

  private fromJSON(data: unknown): Storage {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data');
    }

    if (!('id' in data) || typeof data.id !== 'string') {
      throw new Error('Invalid id');
    }

    if (!('name' in data) || typeof data.name !== 'string') {
      throw new Error('Invalid name');
    }

    return data as Storage;
  }
}
