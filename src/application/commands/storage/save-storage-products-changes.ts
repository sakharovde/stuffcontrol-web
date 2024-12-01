import { StorageDto, StorageService } from '../../index.ts';
import StorageEventEmitter from '../../events/storage-event-emitter.ts';

export interface SaveStorageProductsChangesCommand {
  storageId: StorageDto['id'];
}

export default class SaveStorageProductsChangesCommandHandler {
  constructor(
    private readonly storageService: StorageService,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (command: SaveStorageProductsChangesCommand): Promise<void> => {
    await this.storageService.saveProductsChanges(command.storageId);
    this.storageEventEmitter.emit('storageUpdated');
  };
}
