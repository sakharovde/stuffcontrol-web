import { Storage } from '../../../domain';

export default class StorageMapper {
  static toPersistence(storage: Storage): unknown {
    return {
      id: storage.id,
      name: storage.name,
    };
  }

  static toDomain(data: unknown): Storage {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data');
    }

    if (!('id' in data) || typeof data.id !== 'string') {
      throw new Error('Invalid id');
    }

    if (!('name' in data) || typeof data.name !== 'string') {
      throw new Error('Invalid name');
    }

    return new Storage(data.id, data.name);
  }
}
