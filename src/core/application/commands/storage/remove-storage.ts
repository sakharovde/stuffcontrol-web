import Storage from '../../../domain/models/storage.ts';
import StorageService from '../../services/storage-service.ts';
import StorageEventBus from '../../events/storage-event-bus.ts';

export default class RemoveStorage {
  constructor(
    private storageService: StorageService,
    private readonly storageEventBus: StorageEventBus
  ) {}

  execute = async (id: Storage['id']): Promise<void> => {
    const result = await this.storageService.remove(id);
    this.storageEventBus.emit('storageDeleted');
    return result;
  };
}
