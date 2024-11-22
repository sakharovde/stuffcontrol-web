import StorageService from '../../services/storage.ts';
import Storage from '../../../domain/models/storage.ts';

export default class UpdateStorageUseCase {
  constructor(private readonly storageService: StorageService) {}

  execute = async (storage: Storage): Promise<Storage> => {
    return this.storageService.update(storage);
  };
}
