import StorageRepository from '../../domain/repositories/storage.ts';
import Storage from '../../domain/models/storage.ts';
import { v4 as uuidv4 } from 'uuid';

export default class StorageService {
  constructor(private storageRepository: StorageRepository) {}

  async create(name: Storage['name']): Promise<Storage> {
    const storage = new Storage(uuidv4(), name);

    return this.storageRepository.save(storage);
  }
}
