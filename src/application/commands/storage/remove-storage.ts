import { StorageDto, StorageService } from '../../index.ts';
import StorageEventEmitter from '../../events/storage-event-emitter.ts';

export interface RemoveStorageCommand {
  id: StorageDto['id'];
}

export default class RemoveStorageCommandHandler {
  constructor(
    private storageService: StorageService,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (command: RemoveStorageCommand): Promise<void> => {
    const result = await this.storageService.remove(command.id);
    this.storageEventEmitter.emit('storageDeleted');
    return result;
  };
}
