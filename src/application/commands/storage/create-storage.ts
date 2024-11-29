import { StorageDto, StorageService } from '../../index.ts';
import StorageEventEmitter from '../../events/storage-event-emitter.ts';

export default class CreateStorage {
  constructor(
    private readonly storageService: StorageService,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (name: StorageDto['name']): Promise<StorageDto> => {
    const result = await this.storageService.create(name);
    this.storageEventEmitter.emit('storageCreated');
    return result;
  };
}
