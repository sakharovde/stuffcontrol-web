import { Storage, StorageRepository } from '../../../domain';
import LocalForageFactory from '../localforage-factory.ts';
import StorageMapper from '../mappers/storage.ts';

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

    return StorageMapper.toDomain(storage);
  }

  async save(storage: Storage): Promise<Storage> {
    await this.client.setItem(storage.id, StorageMapper.toPersistence(storage));

    return storage;
  }

  async getAll(): Promise<Storage[]> {
    const storageItems: Storage[] = [];
    await this.client.iterate((value) => {
      storageItems.push(StorageMapper.toDomain(value));
    });
    return storageItems;
  }

  remove(id: Storage['id']): Promise<void> {
    return this.client.removeItem(id);
  }
}
