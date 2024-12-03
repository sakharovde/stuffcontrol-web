import { StorageDto } from '../../index.ts';
import StorageEventEmitter from '../../events/storage-event-emitter.ts';
import { StorageRepository } from '../../../domain';

export interface UpdateStorageCommand {
  storage: StorageDto;
}

export default class UpdateStorageCommandHandler {
  constructor(
    private readonly storageRepository: StorageRepository,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (command: UpdateStorageCommand): Promise<void> => {
    await this.storageRepository.save(command.storage);

    this.storageEventEmitter.emit('storageUpdated');
  };
}
