import { StorageService } from '../../../application';
import { StorageEventBus } from '../../../events';

export default class SaveStorageProductsChanges {
  constructor(
    private readonly storageService: StorageService,
    private readonly storageEventBus: StorageEventBus
  ) {}

  execute = async (storageId: Storage['id']): Promise<void> => {
    const result = await this.storageService.saveProductsChanges(storageId);
    this.storageEventBus.emit('storageUpdated');

    return result;
  };
}
