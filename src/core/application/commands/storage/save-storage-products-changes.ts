import StorageService from '../../services/storage-service.ts';
import Storage from '../../../domain/models/storage.ts';

export default class SaveStorageProductsChanges {
  constructor(private readonly storageService: StorageService) {}

  execute = async (storageId: Storage['id']): Promise<void> => {
    return this.storageService.saveProductsChanges(storageId);
  };
}
