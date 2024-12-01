import { StorageDto, StorageService } from '../../index.ts';
import StorageEventEmitter from '../../events/storage-event-emitter.ts';

export interface CreateStorageCommand {
  name: StorageDto['name'];
}

export default class CreateStorageCommandHandler {
  constructor(
    private readonly storageService: StorageService,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (command: CreateStorageCommand): Promise<StorageDto> => {
    const result = await this.storageService.create(command.name);
    this.storageEventEmitter.emit('storageCreated');
    return result;
  };
}
