import { StorageDto, StorageService } from '../../../application';
import { StorageEventEmitter } from '../../../events';

export default class SaveStorageProductsChanges {
  constructor(
    private readonly storageService: StorageService,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (storageId: StorageDto['id']): Promise<void> => {
    await this.storageService.saveProductsChanges(storageId);
    this.storageEventEmitter.emit('storageUpdated');
  };
}
