import { StorageDto, StorageService } from '../../index.ts';
import StorageEventEmitter from '../../events/storage-event-emitter.ts';

export default class UpdateStorage {
  constructor(
    private readonly storageService: StorageService,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (storage: StorageDto): Promise<StorageDto> => {
    const result = await this.storageService.update(storage);

    this.storageEventEmitter.emit('storageUpdated');

    return result;
  };
}
