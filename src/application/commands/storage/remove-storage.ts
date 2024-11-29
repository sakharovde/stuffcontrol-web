import { StorageDto, StorageService } from '../../index.ts';
import StorageEventEmitter from '../../events/storage-event-emitter.ts';

export default class RemoveStorage {
  constructor(
    private storageService: StorageService,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (id: StorageDto['id']): Promise<void> => {
    const result = await this.storageService.remove(id);
    this.storageEventEmitter.emit('storageDeleted');
    return result;
  };
}
