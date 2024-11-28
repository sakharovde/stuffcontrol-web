import Storage from '../../../domain/models/storage.ts';
import StorageService from '../../../application/services/storage-service.ts';
import StorageEventBus from '../../../events/storage-event-bus.ts';

export default class CreateStorage {
  constructor(
    private readonly storageService: StorageService,
    private readonly storageEventBus: StorageEventBus
  ) {}

  execute = async (name: Storage['name']): Promise<Storage> => {
    const result = await this.storageService.create(name);
    this.storageEventBus.emit('storageCreated');
    return result;
  };
}
