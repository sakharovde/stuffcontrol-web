import { StorageDto, StorageService } from '../../index.ts';
import StorageEventEmitter from '../../events/storage-event-emitter.ts';

export interface UpdateStorageCommand {
  storage: StorageDto;
}

export default class UpdateStorageCommandHandler {
  constructor(
    private readonly storageService: StorageService,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (command: UpdateStorageCommand): Promise<StorageDto> => {
    const result = await this.storageService.update(command.storage);

    this.storageEventEmitter.emit('storageUpdated');

    return result;
  };
}
