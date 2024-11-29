import { StorageDto, StorageService } from '../../index.ts';
import StorageEventEmitter from '../../events/storage-event-emitter.ts';

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
