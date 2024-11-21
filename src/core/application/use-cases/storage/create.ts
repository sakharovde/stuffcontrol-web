import Storage from '../../../domain/models/storage.ts';
import StorageService from '../../services/storage.ts';

export default class CreateStorage {
  constructor(private readonly storageService: StorageService) {}

  async execute(name: Storage['name']): Promise<Storage> {
    return this.storageService.create(name);
  }
}
