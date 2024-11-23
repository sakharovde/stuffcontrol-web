import StorageItemService from '../services/storage-item-service.ts';
import StorageItem from '../../domain/models/storage-item.ts';

export default class GetStorageItemsUseCase {
  constructor(private readonly storageItemService: StorageItemService) {}

  execute = async (storageId: Storage['id']): Promise<StorageItem[]> => {
    return this.storageItemService.getAll(storageId);
  };
}
