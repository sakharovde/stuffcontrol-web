import Storage from '../../domain/models/storage.ts';
import StorageService from '../services/storage-service.ts';

export default class RemoveStorageUseCase {
  constructor(private storageService: StorageService) {}

  execute = (id: Storage['id']): Promise<void> => {
    return this.storageService.remove(id);
  };
}
