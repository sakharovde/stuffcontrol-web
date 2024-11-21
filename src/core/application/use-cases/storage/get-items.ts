import StorageItemService from '../../services/storage-item.ts';
import StorageItem from '../../../domain/models/storage-item.ts';

export default class GetStorageItemsUseCase {
  constructor(private readonly storageItemService: StorageItemService) {}

  async execute(storageId: Storage['id']): Promise<StorageItem[]> {
    return this.storageItemService.getAll(storageId);
  }
}
