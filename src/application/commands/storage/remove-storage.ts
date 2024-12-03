import { StorageDto } from '../../index.ts';
import StorageEventEmitter from '../../events/storage-event-emitter.ts';
import { StorageRepository } from '../../../domain';

export interface RemoveStorageCommand {
  id: StorageDto['id'];
}

export default class RemoveStorageCommandHandler {
  constructor(
    private readonly storageRepository: StorageRepository,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (command: RemoveStorageCommand): Promise<void> => {
    await this.storageRepository.remove(command.id);
    this.storageEventEmitter.emit('storageDeleted');
  };
}
