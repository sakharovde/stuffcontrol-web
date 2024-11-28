import StorageService from '../../../application/services/storage-service.ts';
import Storage from '../../../domain/models/storage.ts';
import StorageEventBus from '../../../events/storage-event-bus.ts';

export default class UpdateStorage {
  constructor(
    private readonly storageService: StorageService,
    private readonly storageEventBus: StorageEventBus
  ) {}

  execute = async (storage: Storage): Promise<Storage> => {
    const result = await this.storageService.update(storage);

    this.storageEventBus.emit('storageUpdated');

    return result;
  };
}
