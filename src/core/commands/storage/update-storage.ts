import { StorageService } from '../../../application';
import { StorageEventEmitter } from '../../../events';
import { Storage } from '../../../domain';

export default class UpdateStorage {
  constructor(
    private readonly storageService: StorageService,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (storage: Storage): Promise<Storage> => {
    const result = await this.storageService.update(storage);

    this.storageEventEmitter.emit('storageUpdated');

    return result;
  };
}
