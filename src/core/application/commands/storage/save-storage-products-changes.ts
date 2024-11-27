import StorageService from '../../services/storage-service.ts';
import Storage from '../../../domain/models/storage.ts';
import StorageEventBus from '../../events/storage-event-bus.ts';

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
