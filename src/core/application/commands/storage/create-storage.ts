import Storage from '../../../domain/models/storage.ts';
import StorageService from '../../services/storage-service.ts';

export default class CreateStorage {
  constructor(private readonly storageService: StorageService) {}

  execute = (name: Storage['name']): Promise<Storage> => {
    return this.storageService.create(name);
  };
}
