import { StorageDto } from '../../index.ts';
import StorageEventEmitter from '../../events/storage-event-emitter.ts';
import { Storage, StorageNameEmptySpecification, StorageRepository } from '../../../domain';
import { v4 as uuidv4 } from 'uuid';

export interface CreateStorageCommand {
  name: StorageDto['name'];
}

export default class CreateStorageCommandHandler {
  constructor(
    private readonly storageRepository: StorageRepository,
    private readonly nameEmptySpecification: StorageNameEmptySpecification,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (command: CreateStorageCommand): Promise<void> => {
    const isNameEmpty = await this.nameEmptySpecification.isSatisfiedBy(command.name);
    if (isNameEmpty) {
      throw new Error('Storage name cannot be empty');
    }

    await this.storageRepository.save(new Storage(uuidv4(), command.name));
    this.storageEventEmitter.emit('storageCreated');
  };
}
