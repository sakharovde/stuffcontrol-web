import { StorageService } from '../../../application';
import { StorageEventEmitter } from '../../../events';

export default class SaveStorageProductsChanges {
  constructor(
    private readonly storageService: StorageService,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (storageId: Storage['id']): Promise<void> => {
    const result = await this.storageService.saveProductsChanges(storageId);
    this.storageEventEmitter.emit('storageUpdated');

    return result;
  };
}
